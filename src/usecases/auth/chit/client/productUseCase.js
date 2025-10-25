import mongoose, { isValidObjectId } from "mongoose";
import config from "../../../../config/chit/env.js";
import { calculateProductRate } from "../../../../services/calculateProductPrice.js";
import StoneDetailsRepository from "../../../../infrastructure/repositories/ecom/stoneDetailsRepository.js";
import moment from "moment-timezone";

class ProductUseCase {
  constructor(
    productRepository,
    branchRepository,
    metalRepository,
    categoryRepository,
    purityRepository,
    metalRateRepository,
    s3Service,
    s3rRepo
  ) {
    (this.productRepository = productRepository),
      (this.branchRepository = branchRepository),
      (this.metalRepository = metalRepository),
      (this.categoryRepository = categoryRepository),
      (this.purityRepository = purityRepository),
      (this.metalRateRepository = metalRateRepository),
      (this.s3Service = s3Service);
    this.s3Respo = s3rRepo;
    this.stoneDetailsRepo = new StoneDetailsRepository();
  }

  async s3Helper(id_branch) {
    try {
      const s3settings = await this.s3Respo.getSettingByBranch(id_branch);
      if (s3settings.length == 0) {
        return { success: false, message: "S3 configuration not found" };
      }

      const configuration = {
        s3key: s3settings[0].s3key,
        s3secret: s3settings[0].s3secret,
        s3bucket_name: s3settings[0].s3bucket_name,
        s3display_url: s3settings[0].s3display_url,
        region: s3settings[0].region,
      };

      return configuration;
    } catch (error) {
      console.error(error);
    }
  }

  validateObjectId(id, name) {
    if (id && !isValidObjectId(id)) {
      return { success: false, message: `Provide a valid ${name} ID` };
    }
    return null;
  }

  transformProductData(productData) {
    const transformed = { ...productData };

    if (transformed.makingCharges && transformed.makingCharges.mode) {
      transformed.makingCharges.mode =
        transformed.makingCharges.mode === "amount" ? 1 : 2;
    }

    if (transformed.wastageCharges && transformed.wastageCharges.mode) {
      transformed.wastageCharges.mode =
        transformed.wastageCharges.mode === "amount" ? 1 : 2;
    }

    const numberFields = [
      "gst",
      "quantity",
      "grossWt",
      "netWeight",
      "stonewt",
      "diamondwt",
      "price",
      "totalprice",
      "stonecost",
      "stoneprice",
      "diamondcost",
      "diamondprice",
      "totalstoneanddiamond",
      "currentMetalRate",
    ];

    numberFields.forEach((field) => {
      if (transformed[field] !== undefined && transformed[field] !== "") {
        transformed[field] = Number(transformed[field]);
      } else if (field === "netWeight" && transformed[field] === undefined) {
        transformed[field] = 0;
      }
    });

    if (
      transformed.netWeight === null ||
      transformed.netWeight === undefined ||
      transformed.netWeight === ""
    ) {
      transformed.netWeight = 0;
    } else if (typeof transformed.netWeight === "string") {
      transformed.netWeight = Number(transformed.netWeight) || 0;
    }

    const booleanFields = [
      "showprice",
      "stone",
      "diamond",
      "discountView",
      "mcView",
      "wastageView",
    ];
    booleanFields.forEach((field) => {
      if (transformed[field] !== undefined) {
        transformed[field] = transformed[field] === "true";
      }
    });

    if (transformed.availableSizes && transformed.availableSizes.values) {
      if (typeof transformed.availableSizes.values === "string") {
        try {
          if (
            transformed.availableSizes.values.startsWith("[") ||
            transformed.availableSizes.values.startsWith("{")
          ) {
            transformed.availableSizes.values = JSON.parse(
              transformed.availableSizes.values
            );
          } else {
            transformed.availableSizes.values = [
              {
                sizeValue: 0,
                quantity: 0,
              },
            ];
          }
        } catch (e) {
          console.warn(
            "Failed to parse availableSizes.values, using default:",
            e
          );
          transformed.availableSizes.values = [
            {
              sizeValue: 0,
              quantity: 0,
            },
          ];
        }
      }

      if (Array.isArray(transformed.availableSizes.values)) {
        transformed.availableSizes.values =
          transformed.availableSizes.values.map((item) => ({
            sizeValue: Number(item.sizeValue || 0),
            quantity: Number(item.quantity || 0),
          }));
      }
    }

    if (transformed.makingCharges) {
      const mc = transformed.makingCharges;
      mc.actualValue = Number(mc.actualValue || 0);
      mc.discountedValue = Number(mc.discountedValue || 0);
      mc.discountedPercentage = Number(mc.discountedPercentage || 0);
      mc.discountView = mc.discountView === "true";
      mc.mcView = mc.mcView === "true";
    }

    if (transformed.wastageCharges) {
      const wc = transformed.wastageCharges;
      wc.actualValue = Number(wc.actualValue || 0);
      wc.discountedValue = Number(wc.discountedValue || 0);
      wc.discountedPercentage = Number(wc.discountedPercentage || 0);
      wc.discountView = wc.discountView === "true";
      wc.wastageView = wc.wastageView === "true";
    }

    // Convert stone and diamond arrays
    if (Array.isArray(transformed.stones)) {
      transformed.stones = transformed.stones.map((stone) => ({
        ...stone,
        cost: Number(stone.cost || 0),
        weight: Number(stone.weight || 0),
        price: Number(stone.price || 0),
      }));
    }

    if (Array.isArray(transformed.diamonds)) {
      transformed.diamonds = transformed.diamonds.map((diamond) => ({
        ...diamond,
        stonecost: Number(diamond.stonecost || 0),
        stoneweight: Number(diamond.stoneweight || 0),
        price: Number(diamond.price || 0),
      }));
    }

    if (
      typeof transformed.netWeight !== "number" ||
      isNaN(transformed.netWeight)
    ) {
      transformed.netWeight = 0;
    }

    return transformed;
  }

  async addProduct(productData, product_image) {
    try {
      const objectIdValidationErrors = [
        this.validateObjectId(productData.id_branch, "Branch"),
        this.validateObjectId(productData.id_category, "Category"),
        this.validateObjectId(productData.id_purity, "Purity"),
        this.validateObjectId(productData.id_metal, "Metal"),
      ].filter(Boolean);

      if (objectIdValidationErrors.length) {
        return { success: false, message: objectIdValidationErrors[0].message };
      }

      const [checkBranchId, checkCategoryId, checkPurityId, checkMetalId] =
        await Promise.all([
          this.branchRepository.findById(productData.id_branch),
          this.categoryRepository.findById(productData.id_category),
          this.purityRepository.findById(productData.id_purity),
          this.metalRepository.findById(productData.id_metal),
        ]);

      if (!checkBranchId) {
        return { success: false, message: "Branch not found" };
      }
      if (!checkCategoryId) {
        return { success: false, message: "Category not found" };
      }
      if (!checkPurityId) {
        return { success: false, message: "Purity not found" };
      }
      if (!checkMetalId) {
        return { success: false, message: "Metal not found" };
      }

      const existingProduct = await this.productRepository.findByName(
        productData.product_name,
        productData.id_branch
      );

      if (existingProduct) {
        return { success: false, message: "Product already existing" };
      }

      const existingCode = await this.productRepository.findByCode(
        productData.code
      );
      if (existingCode) {
        return { success: false, message: "Product code already existing" };
      }

      const s3configs = await this.s3Helper(productData.id_branch);
      if (s3configs.success == false) return s3configs;

      const uploadPromises = product_image.map(async (image, index) => {
        if (!image.buffer || !image.mimetype || !image.originalname) {
          console.warn(`Skipping invalid image at index ${index}:`, image);
          return null;
        }

        return this.s3Service.uploadToS3(image, "products", s3configs);
      });

      const uploadedImages = (await Promise.all(uploadPromises)).filter(
        Boolean
      );
      productData.product_image = uploadedImages;

      // Parse stringified objects
      if (typeof productData.availableSizes === "string") {
        productData.availableSizes = JSON.parse(productData.availableSizes);
      }

      if (typeof productData.makingCharges === "string") {
        productData.makingCharges = JSON.parse(productData.makingCharges);
      }

      if (typeof productData.wastageCharges === "string") {
        productData.wastageCharges = JSON.parse(productData.wastageCharges);
      }

      // Parse collection
      if (
        productData.collection &&
        typeof productData.collection === "string"
      ) {
        try {
          productData.collection = JSON.parse(productData.collection);
        } catch (error) {
          if (productData.collection.includes(",")) {
            productData.collection = productData.collection
              .split(",")
              .map((id) => id.trim());
          } else if (
            productData.collection.startsWith("[") &&
            productData.collection.endsWith("]")
          ) {
            const cleanedString = productData.collection
              .replace(/'/g, '"')
              .replace(/\[|\]/g, "");
            productData.collection = JSON.parse(`[${cleanedString}]`);
          } else {
            productData.collection = [productData.collection];
          }
        }
      }

      if (Array.isArray(productData.collection)) {
        productData.collection = productData.collection.filter((id) => {
          const isValid = this.validateObjectId(id, "Collection item");
          return isValid === null;
        });
      }

      // DATA TRANSFORMATION - CRITICAL FIXES
      // Convert mode from string to number (1 for 'amount', 2 for 'percentage')
      if (productData.makingCharges && productData.makingCharges.mode) {
        productData.makingCharges.mode =
          productData.makingCharges.mode === "amount" ? 1 : 2;
      }

      if (productData.wastageCharges && productData.wastageCharges.mode) {
        productData.wastageCharges.mode =
          productData.wastageCharges.mode === "amount" ? 1 : 2;
      }

      // Convert string numbers to actual numbers in charges
      if (productData.makingCharges) {
        const mc = productData.makingCharges;
        mc.actualValue = Number(mc.actualValue || 0);
        mc.discountedValue = Number(mc.discountedValue || 0);
        mc.discountedPercentage = Number(mc.discountedPercentage || 0);
        mc.discountView = mc.discountView === "true";
        mc.mcView = mc.mcView === "true";
      }

      if (productData.wastageCharges) {
        const wc = productData.wastageCharges;
        wc.actualValue = Number(wc.actualValue || 0);
        wc.discountedValue = Number(wc.discountedValue || 0);
        wc.discountedPercentage = Number(wc.discountedPercentage || 0);
        wc.discountView = wc.discountView === "true";
        wc.wastageView = wc.wastageView === "true";
      }

      // Handle availableSizes.values - FIX FOR THE MAIN ERROR
      if (productData.availableSizes) {
        // Ensure values is properly formatted as an array
        if (typeof productData.availableSizes.values === "string") {
          try {
            // Try to parse if it's a JSON string
            if (
              productData.availableSizes.values.startsWith("[") ||
              productData.availableSizes.values.startsWith("{")
            ) {
              productData.availableSizes.values = JSON.parse(
                productData.availableSizes.values
              );
            } else {
              // If it's the problematic string "[object Object]", create default array
              productData.availableSizes.values = [
                {
                  sizeValue: 0,
                  quantity: 0,
                },
              ];
            }
          } catch (e) {
            console.warn(
              "Failed to parse availableSizes.values, using default:",
              e
            );
            productData.availableSizes.values = [
              {
                sizeValue: 0,
                quantity: 0,
              },
            ];
          }
        }

        // Ensure each value in the array has proper number types
        if (Array.isArray(productData.availableSizes.values)) {
          productData.availableSizes.values =
            productData.availableSizes.values.map((item) => ({
              sizeValue: Number(item.sizeValue || 0),
              quantity: Number(item.quantity || 0),
            }));
        }
      }

      // Convert other numeric fields from strings to numbers
      const numberFields = [
        "gst",
        "quantity",
        "grossWt",
        "netWeight",
        "stonewt",
        "diamondwt",
        "price",
        "totalprice",
        "stonecost",
        "stoneprice",
        "diamondcost",
        "diamondprice",
        "totalstoneanddiamond",
        "currentMetalRate",
      ];

      numberFields.forEach((field) => {
        if (productData[field] !== undefined && productData[field] !== "") {
          productData[field] = Number(productData[field]);
        }
      });

      // Convert boolean strings to actual booleans
      const booleanFields = ["showprice", "stone", "diamond"];
      booleanFields.forEach((field) => {
        if (productData[field] !== undefined) {
          productData[field] = productData[field] === "true";
        }
      });

      // Process stone and diamond data
      const stoneDiamondData = [];

      if (productData.stone && productData.stones) {
        productData.stones.forEach((stone) => {
          stoneDiamondData.push({
            type: "stone",
            itemId: stone.itemId || stone.stoneId,
            weight: Number(stone.weight || stone.stoneWeight || 0),
            cost: Number(stone.cost || stone.stoneCost || 0),
            price: Number(stone.price || stone.stonePrice || 0),
          });
        });
      }

      if (productData.diamond && productData.diamonds) {
        productData.diamonds.forEach((diamond) => {
          stoneDiamondData.push({
            type: "diamond",
            itemId: diamond.itemId || diamond.diamondId,
            weight: Number(diamond.weight || diamond.diamondWeight || 0),
            cost: Number(diamond.cost || diamond.diamondCost || 0),
            price: Number(diamond.price || diamond.diamondPrice || 0),
          });
        });
      }

      let savedDetails = [];
      if (stoneDiamondData.length > 0) {
        savedDetails = await this.stoneDetailsRepo.createMany(stoneDiamondData);
      }

      // Only set stoneDetails if we have valid details
      if (savedDetails.length > 0) {
        productData.stoneDetails = savedDetails.map((s) => s._id);
      } else {
        productData.stoneDetails = [];
      }

      const saveProduct = await this.productRepository.addProduct(productData);
      if (saveProduct) {
        return { success: true, message: "Product added successfully" };
      }
      return {
        success: false,
        message: "Failed to add product. Please try again later",
      };
    } catch (err) {
      console.error("Error in addProduct:", err);
      return {
        success: false,
        message: "An error occurred while adding Product.",
        error: err.message,
      };
    }
  }

  async editProduct(id, productData, images) {
    try {
      const idValidation = this.validateObjectId(id, "Product");
      if (idValidation) return idValidation;

      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        return { success: false, message: "Product not found" };
      }

      const objectIdValidationErrors = [
        this.validateObjectId(productData.id_branch, "Branch"),
        this.validateObjectId(productData.id_category, "Category"),
      ].filter(Boolean);

      if (objectIdValidationErrors.length) {
        return { success: false, message: objectIdValidationErrors[0].message };
      }

      const checkName = await this.productRepository.findByName(
        productData.product_name,
        productData.id_branch,
        id
      );
      if (checkName) {
        return { success: false, message: "Product already existing" };
      }

      if (
        productData.availableSizes &&
        typeof productData.availableSizes === "string"
      ) {
        productData.availableSizes = JSON.parse(productData.availableSizes);
      }

      if (
        productData.makingCharges &&
        typeof productData.makingCharges === "string"
      ) {
        productData.makingCharges = JSON.parse(productData.makingCharges);
      }

      if (
        productData.wastageCharges &&
        typeof productData.wastageCharges === "string"
      ) {
        productData.wastageCharges = JSON.parse(productData.wastageCharges);
      }

      if (
        productData.collection &&
        typeof productData.collection === "string"
      ) {
        try {
          productData.collection = JSON.parse(productData.collection);
        } catch (error) {
          if (productData.collection.includes(",")) {
            productData.collection = productData.collection
              .split(",")
              .map((id) => id.trim());
          } else if (
            productData.collection.startsWith("[") &&
            productData.collection.endsWith("]")
          ) {
            const cleanedString = productData.collection
              .replace(/'/g, '"')
              .replace(/\[|\]/g, "");
            productData.collection = JSON.parse(`[${cleanedString}]`);
          } else {
            productData.collection = [productData.collection];
          }
        }
      }

      if (Array.isArray(productData.collection)) {
        productData.collection = productData.collection.filter((id) => {
          const isValid = this.validateObjectId(id, "Collection item");
          return isValid === null;
        });
      }

      const updateFields = {};

      for (let key in productData) {
        if (key === "showprice" || key === "sell") {
          const newValue =
            productData[key] === "true" || productData[key] === true;
          updateFields[key] = newValue;
        } else if (
          key === "modified_by" ||
          key === "id_branch" ||
          key === "id_metal" ||
          key === "id_purity" ||
          key === "id_category"
        ) {
          updateFields[key] = productData[key];
        } else if (productData[key] !== undefined) {
          updateFields[key] = productData[key];
        }
      }

      if (
        updateFields.id_metal ||
        updateFields.id_branch ||
        updateFields.id_category ||
        updateFields.id_purity
      ) {
        const [checkBranchId, checkCategoryId] = await Promise.all([
          updateFields.id_branch
            ? this.branchRepository.findById(updateFields.id_branch)
            : null,
          updateFields.id_category
            ? this.categoryRepository.findById(updateFields.id_category)
            : null,
        ]);

        if (updateFields.id_branch && !checkBranchId) {
          return { success: false, message: "Branch not found" };
        }
        if (updateFields.id_category && !checkCategoryId) {
          return { success: false, message: "Category not found" };
        }
      }

      if (images.product_image || productData.existing_images) {
        const s3configs = await this.s3Helper(productData.id_branch);

        let existingImages = [];
        if (productData.existing_images) {
          try {
            existingImages = JSON.parse(productData.existing_images);
          } catch (error) {
            existingImages = Array.isArray(productData.existing_images)
              ? productData.existing_images
              : [productData.existing_images];
          }
        }

        const newImages = images.product_image || [];

        const allImages = [...existingImages];

        if (newImages.length > 0) {
          const uploadPromises = newImages.map((image) =>
            this.s3Service.uploadToS3(image, "products", s3configs)
          );
          const uploadedImages = await Promise.all(uploadPromises);
          allImages.push(...uploadedImages);
        }

        productData.product_image = allImages;
      }

      const updateProduct = await this.productRepository.editProduct(
        productData,
        id
      );
      if (updateProduct) {
        return { success: true, message: "Product edited successfully" };
      }
      return {
        success: false,
        message: "Failed to edit product. Please try again",
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while editing Product.",
        error: err.message,
      };
    }
  }

  async deleteProduct(id) {
    try {
      const idValidation = this.validateObjectId(id, "Product");
      if (idValidation) return idValidation;

      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        return { success: false, message: "Product not found" };
      }

      const result = await this.productRepository.deleteProduct(id);
      if (result) {
        return { success: true, message: "Product deleted successfully" };
      }
      return { success: false, message: "Failed to delete Product" };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while Deleting Product.",
        error: err.message,
      };
    }
  }

  async changeStatus(id) {
    try {
      const idValidation = this.validateObjectId(id, "Product");
      if (idValidation) return idValidation;
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        return { success: false, message: "Product not found" };
      }

      const updatedProduct = await this.productRepository.changeStatus(
        id,
        existingProduct.active
      );
      const message = updatedProduct
        ? existingProduct.active
          ? "Product successfully deactivated"
          : "Product successfully activated"
        : existingProduct.active
        ? "Failed to deactivate Product"
        : "Failed to activate Product";

      return { success: !!updatedProduct, message };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while Change Product status.",
        error: err.message,
      };
    }
  }

  async findById(id, token=null) {
    try {
      const idValidation = this.validateObjectId(id, "Product");
      if (idValidation) return idValidation;

      let customerId = null;
      if (token && token._id) {
        customerId = token._id;
      }

      let existingProduct;
      if (customerId) {
        console.log("customer")
        existingProduct = await this.productRepository.findById(id, customerId);
      } else {
        console.log("emp")
        existingProduct = await this.productRepository.findById(id);
      }

      if (existingProduct) {
        return {
          success: true,
          message: "Product retrieved successfully",
          data: existingProduct,
        };
      }
      return { success: false, message: "Product not found" };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get product by Id.",
        error: err.message,
      };
    }
  }

  async findByBranchId(id) {
    try {
      const idValidation = this.validateObjectId(id, "Branch");
      if (idValidation) return idValidation;
      const existingBranch = await this.branchRepository.findById(id);

      if (!existingBranch) {
        return { success: false, message: "Branch not existing" };
      }
      const productBranch = await this.productRepository.findByBranchId(id);
      const rate = await this.getTodayMatelRate(id);
      if (productBranch) {
        return {
          success: true,
          message: "Product retrieved successfully",
          data: productBranch,
        };
      }
      return { success: false, message: "Product not found" };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get product by Branch Id.",
        error: err.message,
      };
    }
  }

  async getTodayMatelRate(branchId) {
    try {
      const getPrice = await this.metalRateRepository.getMetalRate(branchId);
      return getPrice;
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getProducts(query, token) {
    try {
      const { page, limit, from_date, to_date, id_branch, search, active } =
        query;
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
      const skip = (pageNum - 1) * pageSize;
      const filter = { is_deleted: false };

      if (active !== null && active !== undefined && active !== "") {
        filter.active = active;
      }

      if (query.category) {
        filter.id_category = new mongoose.Types.ObjectId(query.category);
      }

      if (from_date && to_date) {
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format.");
        }

        filter.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      if (isValidObjectId(id_branch)) {
        filter.id_branch = new mongoose.Types.ObjectId(id_branch);
      }

      let customer;
      if (token) {
        customer = token._id;
      }

      const searchOptions = search ? { term: search.trim() } : null;

      const products = await this.productRepository.getProducts(
        filter,
        skip,
        pageSize,
        searchOptions,
        customer ? customer : null
      );
      if (!products.length >= 1) {
        return { success: false, message: "No products found" };
      }

      const totalproducts = await this.productRepository.countProduct(filter);

      return {
        success: true,
        message: "Product retrieved successfully",
        allProducts: products,
        totalproducts,
        totalPages: Math.ceil(totalproducts / pageSize),
        currentPage: pageNum,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get product",
        error: err.message,
      };
    }
  }

  async searchProduct(query) {
    try {
      const {
        page,
        limit,
        from_date,
        to_date,
        id_branch,
        search,
        active,
        category,
        metal,
        purity,
        gemstone,
        gender,
        occasion,
        minPrice,
        maxPrice,
        minWeight,
        maxWeight,
        size,
        color,
        certification,
        inStock,
        sortBy,
        sortOrder,
        subcategory,
      } = query;

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
      const skip = (pageNum - 1) * pageSize;

      const filter = { is_deleted: false, active: true };

      if (active !== null && active !== undefined && active !== "") {
        filter.active = active;
      }

      if (category && isValidObjectId(category)) {
        filter.id_category = new mongoose.Types.ObjectId(category);
      }

      if (subcategory && isValidObjectId(subcategory)) {
        filter.id_subcategory = new mongoose.Types.ObjectId(subcategory);
      }

      if (isValidObjectId(id_branch)) {
        filter.id_branch = new mongoose.Types.ObjectId(id_branch);
      }

      if (from_date && to_date) {
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format.");
        }
        filter.createdAt = { $gte: startDate, $lte: endDate };
      }

      if (metal) {
        filter.metal = { $regex: metal, $options: "i" };
      }

      if (purity) {
        filter.purity = purity;
      }

      if (gemstone) {
        filter.gemstone = { $regex: gemstone, $options: "i" };
      }

      if (gender) {
        filter.gender = gender;
      }

      if (occasion) {
        filter.occasion = { $regex: occasion, $options: "i" };
      }

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      if (minWeight || maxWeight) {
        filter.weight = {};
        if (minWeight) filter.weight.$gte = Number(minWeight);
        if (maxWeight) filter.weight.$lte = Number(maxWeight);
      }

      if (size) {
        filter.size = size;
      }

      if (color) {
        filter.color = { $regex: color, $options: "i" };
      }

      if (certification) {
        filter.certification = { $regex: certification, $options: "i" };
      }

      if (inStock !== undefined) {
        filter.inStock = inStock === "true";
      }

      let searchOptions = {};
      if (search) {
        const regex = new RegExp(search.trim(), "i");
        searchOptions = {
          $or: [
            { name: regex },
            { description: regex },
            { categoryName: regex },
            { metal: regex },
            { gemstone: regex },
          ],
        };
      }

      const finalFilter = search ? { ...filter, ...searchOptions } : filter;

      let sort = { createdAt: -1 };
      if (sortBy) {
        const order = sortOrder === "asc" ? 1 : -1;
        sort = { [sortBy]: order };
      }

      let customer;
      if (token) {
        customer = token._id;
      }

      const products = await this.productRepository.getProducts(
        finalFilter,
        skip,
        pageSize,
        sort,
        customer ? customer : null
      );

      if (!products.length) {
        return { success: false, message: "No products found" };
      }

      const totalProducts = await this.productRepository.countProduct(
        finalFilter
      );

      return {
        success: true,
        message: "Products retrieved successfully",
        allProducts: products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / pageSize),
        currentPage: pageNum,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while getting products",
        error: err.message,
      };
    }
  }

  async getCategoryByCollectionId(id) {
    try {
      const getProducts =
        await this.productRepository.getCategoryByCollectionId(id);

      if (getProducts) {
        const pathUrl = `${config.DISPLAY_IMG_URL}category/`;
        return {
          success: true,
          message: "Prducts fetched successfully",
          data: getProducts,
          pathUrl,
        };
      }
      return { success: false, message: "No products found", data: [] };
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getProductBySubcategroy(id, page, limit, token, filter) {
    try {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const userId = token?._id;

      if (pageNumber < 1 || limitNumber < 1) {
        return {
          success: false,
          message: "Page and limit must be positive integers",
          data: [],
        };
      }

      let sortOption = { createdAt: -1 };

      if (filter && filter.sort) {
        if (filter.sort === "price_lth") {
          sortOption = { discountedAmount: 1 };
        } else if (filter.sort === "price_htl") {
          sortOption = { discountedAmount: -1 };
        } else if (filter.sort === "discount_lth") {
          sortOption = { discountDifference: 1 };
        } else if (filter.sort === "discount_htl") {
          sortOption = { discountDifference: -1 };
        }
      }

      let priceFilter = {};
      if (filter && filter.priceRange) {
        const [minPrice, maxPrice] = filter.priceRange.split("-").map(Number);
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
          priceFilter = {
            discountedAmount: {
              $gte: minPrice,
              $lte: maxPrice,
            },
          };
        }
      }

      const result = await this.productRepository.getProductBySubcategory(
        new mongoose.Types.ObjectId(id),
        pageNumber,
        limitNumber,
        new mongoose.Types.ObjectId(userId),
        { sort: sortOption, priceFilter }
      );

      if (result.products.length > 0) {
        const pathUrl = `${process.env.AWS_DISPLAY_URL}${process.env.AWS_LOCAL_PATH}products/`;

        return {
          success: true,
          message: "Products fetched successfully",
          data: {
            products: result.products,
            pagination: {
              currentPage: result.currentPage,
              totalPages: result.totalPages,
              totalProducts: result.totalCount,
              hasNext: result.hasNext,
              hasPrev: result.hasPrev,
              limit: limitNumber,
            },
          },
          pathUrl,
        };
      }

      return {
        success: false,
        message: "No products found",
        data: {
          products: [],
          pagination: {
            currentPage: pageNumber,
            totalPages: 0,
            totalProducts: 0,
            hasNext: false,
            hasPrev: false,
            limit: limitNumber,
          },
        },
      };
    } catch (err) {
      console.error(err);
      throw new Error("Internal server error");
    }
  }

  async getProductByCategory(id, page, limit, token, filter) {
    try {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const userId = token?._id;

      if (pageNumber < 1 || limitNumber < 1) {
        return {
          success: false,
          message: "Page and limit must be positive integers",
          data: [],
        };
      }

      let sortOption = { createdAt: -1 };

      if (filter && filter.sort) {
        if (filter.sort === "price_lth") {
          sortOption = { discountedAmount: 1 };
        } else if (filter.sort === "price_htl") {
          sortOption = { discountedAmount: -1 };
        } else if (filter.sort === "discount_lth") {
          sortOption = { discountDifference: 1 };
        } else if (filter.sort === "discount_htl") {
          sortOption = { discountDifference: -1 };
        }
      }

      let priceFilter = {};
      if (filter && filter.priceRange) {
        const [minPrice, maxPrice] = filter.priceRange.split("-").map(Number);
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
          priceFilter = {
            discountedAmount: {
              $gte: minPrice,
              $lte: maxPrice,
            },
          };
        }
      }

      const result = await this.productRepository.getProductByCategory(
        new mongoose.Types.ObjectId(id),
        pageNumber,
        limitNumber,
        new mongoose.Types.ObjectId(userId),
        { sort: sortOption, priceFilter }
      );

      if (result.products.length > 0) {
        const pathUrl = `${process.env.AWS_DISPLAY_URL}${process.env.AWS_LOCAL_PATH}products/`;

        return {
          success: true,
          message: "Products fetched successfully",
          data: {
            products: result.products,
            pagination: {
              currentPage: result.currentPage,
              totalPages: result.totalPages,
              totalProducts: result.totalCount,
              hasNext: result.hasNext,
              hasPrev: result.hasPrev,
              limit: limitNumber,
            },
          },
          pathUrl,
        };
      }

      return {
        success: false,
        message: "No products found",
        data: {
          products: [],
          pagination: {
            currentPage: pageNumber,
            totalPages: 0,
            totalProducts: 0,
            hasNext: false,
            hasPrev: false,
            limit: limitNumber,
          },
        },
      };
    } catch (err) {
      console.error(err);
      throw new Error("Internal server error");
    }
  }

  async getProductStockReport(page, limit, search, from_date, to_date) {
    try {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;

      if (pageNumber < 1 || limitNumber < 1) {
        return {
          success: false,
          message: "Page and limit must be positive integers",
          data: [],
        };
      }

      let filter = {};

      if (from_date && to_date) {
        if (new Date(to_date) < new Date(from_date)) {
          throw new Error("End date cannot be before start date");
        }

        const startDate = moment
          .tz(from_date, "Asia/Kolkata")
          .startOf("day")
          .toDate();
        const endDate = moment
          .tz(to_date, "Asia/Kolkata")
          .endOf("day")
          .toDate();

        filter.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      if (search && search.trim() !== "") {
        const searchRegex = new RegExp(search.trim(), "i");

        filter.$or = [
          { product_name: { $regex: searchRegex } },
          { category_name: { $regex: searchRegex } },
          { sku: { $regex: searchRegex } },
        ];
      }

      const result = await this.productRepository.getProductStockReport(
        pageNumber,
        limitNumber,
        filter
      );

      if (result.products.length > 0) {
        const pathUrl = `${process.env.AWS_DISPLAY_URL}${process.env.AWS_LOCAL_PATH}products/`;

        return {
          success: true,
          message: "Products fetched successfully",
          data: {
            products: result.products,
            pagination: {
              currentPage: result.currentPage,
              totalPages: result.totalPages,
              totalProducts: result.totalCount,
              hasNext: result.hasNext,
              hasPrev: result.hasPrev,
              limit: limitNumber,
            },
          },
          pathUrl,
        };
      }

      return {
        success: false,
        message: "No products found",
        data: {
          products: [],
          pagination: {
            currentPage: pageNumber,
            totalPages: 0,
            totalProducts: 0,
            hasNext: false,
            hasPrev: false,
            limit: limitNumber,
          },
        },
      };
    } catch (err) {
      console.error(err);
      throw new Error("Internal server error");
    }
  }

  async toggleBestSeller(id) {
    try {
      const idValidation = this.validateObjectId(id, "Product");
      if (idValidation) return idValidation;

      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        return { success: false, message: "Product not found" };
      }

      const currenStatus = existingProduct?.bestSeller;
      const updatedProduct = await this.productRepository.toggleBestSeller(
        id,
        currenStatus
      );

      if (!updatedProduct) {
        return {
          success: false,
          message: `Failed to ${
            newStatus ? "add to" : "remove from"
          } best seller`,
        };
      }

      return {
        success: true,
        message: `Product ${
          currenStatus ? "removed from" : "added to"
        } best seller`,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while changing product best seller status.",
        error: err.message,
      };
    }
  }

  async allProductsData(query, token) {
    try {
      const { page, limit, search } = query;
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
      const skip = (pageNum - 1) * pageSize;
      const filter = { is_deleted: false };

      let customer;
      if (token) {
        customer = token._id;
      }

      const searchOptions = search ? { term: search.trim() } : null;

      const products = await this.productRepository.allProductsData(
        filter,
        skip,
        pageSize,
        searchOptions,
        customer ? customer : null
      );
      if (!products.length >= 1) {
        return { success: false, message: "No products found" };
      }

      const totalproducts = await this.productRepository.countProduct(filter);

      return {
        success: true,
        message: "Product retrieved successfully",
        allProducts: products,
        totalproducts,
        totalPages: Math.ceil(totalproducts / pageSize),
        currentPage: pageNum,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get product",
        error: err.message,
      };
    }
  }
}

export default ProductUseCase;
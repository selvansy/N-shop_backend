import mongoose, { isValidObjectId } from "mongoose";

class SubCategoryUseCase {
  constructor(subCategoryRepository, categoryRepository, s3Repo, s3Service) {
    this.subCategoryRepository = subCategoryRepository;
    this.categoryRepository = categoryRepository;
    this.s3Repo = s3Repo;
    this.s3Service = s3Service;
  }

  validateObjectId(id, name) {
    if (id && !isValidObjectId(id)) {
      return { success: false, message: `Provide a valid ${name} ID` };
    }
    return null;
  }

  async addSubCategory(subCategoryData, files, token) {


    try {
      const categoryValidation = this.validateObjectId(
        subCategoryData.categoryId,
        "Category"
      );
      if (categoryValidation) return categoryValidation;

      // const categoryExists = await this.categoryRepository.findById(
      //   subCategoryData.categoryId
      // );
      // if (!categoryExists) {
      //   return { success: false, message: "Category not found" };
      // }

      const existingSubCategory =
        await this.subCategoryRepository.findByName(subCategoryData.name);
        
      if (existingSubCategory) {
        return { success: false, message: "SubCategory already exists" };
      }

    


    
      let bannerUrl = null;
      let iconUrl = null;

      
      let imageUrlFinal = null;
      if(files && files.image){
        imageUrlFinal=await this.handleImageUpload(files,null,token);
      }
      if(imageUrlFinal){  
        subCategoryData.bannerImage=imageUrlFinal
      }

      // if (files?.bannerImage) {
      //   bannerUrl = await this.handleImageUpload(files, "bannerImage", token);
      // }
      if (files?.icon) {
        iconUrl = await this.handleImageUpload(files, "icon", token);
      }


      // if (bannerUrl) subCategoryData.bannerImage = bannerUrl;
      if (iconUrl) subCategoryData.icon = iconUrl;
      
      const subCategoryResult =
        await this.subCategoryRepository.addSubCategory(subCategoryData);

      if (subCategoryResult) {
        return { success: true, message: "SubCategory created successfully." };
      }

      return {
        success: false,
        message: "Failed to create subcategory. Please try again later.",
      };
    } catch (err) {
      console.error("Error occurred while adding subcategory:", err.stack || err.message);
      return {
        success: false,
        message: "An error occurred while adding subcategory.",
        error: err.message,
      };
    }
  }


  async editSubCategory(editSubCategoryData, id, files) {
    try {
      const existingSubCategory = await this.subCategoryRepository.findById(id);

      if (!existingSubCategory) {
        return { success: false, message: "SubCategory not found" };
      }

      // Check duplicate name
      const checkAlready = await this.subCategoryRepository.findByName(
        editSubCategoryData.name,
        id
      );
      if (checkAlready) {
        return { success: false, message: "SubCategory already exists" };
      }

      const updateFields = {};
      for (let key in editSubCategoryData) {
        if (
          editSubCategoryData[key] !== existingSubCategory[key] &&
          editSubCategoryData[key] !== undefined
        ) {
          updateFields[key] = editSubCategoryData[key];
        }
      }
      
     

      if (files && files.image ) {
      const s3Configs = await this.s3Helper(
        editSubCategoryData._id || existingSubCategory._id
      );
  //     if (files && files.bannerImage) {
  // const s3Configs = await this.s3Helper(
  //   new mongoose.Types.ObjectId(editSubCategoryData._id || existingSubCategory._id)
  // );


      //  if (files?.image) {
      //   updateFields.bannerImage = await this.handleImageUpload(
      //     files,
      //     "subcategories",
      //     s3Configs
      //   );
      // }
      try {
        updateFields.bannerImage = await this.s3Service.uploadToS3(
          files.image[0],
          "subcategory",            
          s3Configs
        );
      } catch (error) {
        console.error("Error uploading category image:", error);
        return {
          success: false,
          message: "Failed to upload category image. Please try again."
        };
      }
    }
      // if (files?.icon) {
      //   updateFields.icon = await this.handleImageUpload(files, "icon");
      // }

      if (Object.entries(updateFields).length === 0) {
        return { success: false, message: "No changes found" };
      }

      const updateSubCategory =
        await this.subCategoryRepository.editSubCategory(id, updateFields);

      console.log ("sdfg",updateFields);

      if (updateSubCategory) {
        return { success: true, message: "SubCategory edited successfully" };
      }

      return {
        success: false,
        message: "Failed to edit SubCategory. Please try again later.",
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while editing subcategory.",
        error: err.message,
      };
    }
  }

  async deleteSubCategory(id) {
    try {
      const subCategoryValidation = this.validateObjectId(id, "SubCategory");
      if (subCategoryValidation) return subCategoryValidation;

      const existingSubCategory = await this.subCategoryRepository.findById(id);
      if (!existingSubCategory) {
        return { success: false, message: "SubCategory not found" };
      }

      const deleteSubCategoryResult =
        await this.subCategoryRepository.deleteSubCategory(id);

      if (deleteSubCategoryResult) {
        return { success: true, message: "SubCategory deleted successfully" };
      }
      return {
        success: false,
        message: "Failed to delete SubCategory. Please try again later",
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while deleting subcategory.",
        error: err.message,
      };
    }
  }

  async changeStatus(id) {
    try {
      const idValidation = this.validateObjectId(id, "SubCategory");
      if (idValidation) return idValidation;

      const existingSubCategory = await this.subCategoryRepository.findById(id);
      if (!existingSubCategory) {
        return { success: false, message: "SubCategory not found" };
      }

      const updateStatus = await this.subCategoryRepository.changeStatus(
        id,
        existingSubCategory.active
      );
      if (!updateStatus) {
        return { success: false, message: "Failed to change status" };
      }
      const message = existingSubCategory.active
        ? "SubCategory successfully deactivated"
        : "SubCategory successfully activated";

      return { success: true, message };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while changing subcategory status.",
        error: err.message,
      };
    }
  }


  async findById(id) {
    try {
      const idValidation = this.validateObjectId(id, "SubCategory");
      if (idValidation) return idValidation;

      const existingSubCategory = await this.subCategoryRepository.findById(id);
      if (!existingSubCategory) {
        return { success: false, message: "SubCategory not found" };
      }

      return {
        success: true,
        message: "SubCategory retrieved successfully",
        data: existingSubCategory,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while fetching subcategory by id.",
        error: err.message,
      };
    }
  }


  async getSubCategory(query) {
    try {
      const { page, limit, from_date, to_date, categoryId, search, active } =
        query;

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
      const skip = (pageNum - 1) * pageSize;

      const filter = { isDeleted: false };

      if (active !== undefined && active !== null && active !== "") {
        filter.active = active === true || active === "true";
      }


      // Date range filter
      if (from_date && to_date) {
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format.");
        }

        filter.createdAt = { $gte: startDate, $lte: endDate };
      }

      // Search filter
      if (search) {
        const searchRegex = new RegExp(search, "i");
        filter.$or = [{ name: { $regex: searchRegex } }];
      }

     
      if (isValidObjectId(categoryId)) {
        filter.categoryId = categoryId;
      }

      // Fetch with pagination
      const subcategories = await this.subCategoryRepository.getSubCategory(
        filter,
        skip,
        pageSize
      );

      if (!subcategories) {
        return { success: false, message: "No category found" };
      }

      // const totalSubCategory =
      //   await this.subCategoryRepository.getSubCategory(filter);
      const totalcategory = await this.subCategoryRepository.countSubCategory(filter);

      return {
        success: true,
        message: "SubCategories retrieved successfully",
        // data:subcategories,
        // totalDoucuments:totalcategory,
        // totalPages: Math.ceil(totalcategory / pageSize),
        // currentPage: pageNum,
        data:{
          subcategories,
          totalcategory,
          totalPages:Math.ceil(totalcategory / pageSize),
          currentPage:pageNum
        }
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while fetching subcategories",
        error: err.message,
      };
    }
  }

 async findByCategoryId(categoryId) {
    try {
      const idValidation = this.validateObjectId(categoryId, "SubCategory");
      if (idValidation) return idValidation;

      const existingSubCategory = await this.subCategoryRepository.findByCategoryId(categoryId);
      if (!existingSubCategory) {
        return { success: false, message: "Category not found" };
      }

       const pathUrl = `${process.env.AWS_DISPLAY_URL}${process.env.AWS_LOCAL_PATH}subcategory/`

      return {
        success: true,
        message: "SubCategory retrieved successfully",
        data: existingSubCategory,
        pathUrl: pathUrl
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while fetching subcategory by id.",
        error: err.message,
      };
    }
  }



    async handleImageUpload(files, imageUrl, token) {
    if (imageUrl) return imageUrl;
    if (files.image?.[0]) {
      const s3Settings = await this.s3Repo.getSetting();
      if (!s3Settings) throw new Error("S3 configuration not found");
      return await this.s3Service.uploadToS3(
        files.image[0],
        "subcategory",
        s3Settings
      );
    }
    return null;
  }


    async s3Helper() {
      try {
        const s3settings = await this.s3Repo.getSetting();
  
        if (!s3settings) {
          throw new Error("S3 configuration not found");
        }
  
        return {
          s3key: s3settings.s3key,
          s3secret: s3settings.s3secret,
          s3bucket_name: s3settings.s3bucket_name,
          s3display_url: s3settings.s3display_url,
          region: s3settings.region
        };
      } catch (error) {
        console.error("Error in s3Helper:", error);
        throw error;
      }
    }
}

export default SubCategoryUseCase;

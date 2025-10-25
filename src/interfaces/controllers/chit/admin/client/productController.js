class ProductController {
  constructor(productUsecase, validator) {
    this.productUsecase = productUsecase;
    this.validator = validator;
  }

  async addProduct(req, res) {
    try {
      const { error } = this.validator.productValidations.validate(req.body, { allowUnknown: true });

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      if (!req.files.product_image || req.files.product_image.length == 0) {
        return res.status(400).json({ message: "Atleast one image required" });
      }

      req.body.created_by = req.user.id_employee;
      req.body.modified_by = req.user.id_employee;
      const addProductResult = await this.productUsecase.addProduct(
        req.body,
        req.files.product_image
      );
      if (addProductResult.success) {
        return res.status(201).json({ message: addProductResult.message });
      }
      return res.status(400).json({ message: addProductResult.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async editProduct(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Product Id is required" });
      }

      const { error } = this.validator.productValidations.validate(req.body, { allowUnknown: true });

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      req.body.modified_by = req.user.id_employee;

      const updateProduct = await this.productUsecase.editProduct(
        id,
        req.body,
        req.files
      );
      if (updateProduct.success) {
        return res.status(200).json({ message: updateProduct.message });
      }
      return res.status(400).json({ message: updateProduct.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        req.status(400).json({ message: "Product Id is required" });
      }
      const deleteProductResult = await this.productUsecase.deleteProduct(id);
      if (deleteProductResult.success) {
        return res.status(200).json({ message: deleteProductResult.message });
      }
      return res.status(400).json({ message: deleteProductResult.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async changeStatus(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Product Id is required" });
      }

      const changeStatus = await this.productUsecase.changeStatus(id);
      if (changeStatus.success) {
        return res.status(200).json({ message: changeStatus.message });
      }
      return res.status(400).json({ message: changeStatus.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async ProductById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Product Id is required" });
      }

      const productData = await this.productUsecase.findById(id,req.user);
      if (productData.success) {
        return res
          .status(200)
          .json({ message: productData.message, data: productData.data });
      }
      return res.status(400).json({ message: productData.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async ProductByBranchId(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Product Id required" });
      }

      const productData = await this.productUsecase.findByBranchId(id);
      if (productData.success) {
        return res
          .status(200)
          .json({ message: productData.message, data: productData.data });
      }
      return res.status(400).json({ message: productData.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async allProducts(req, res) {
    try {
      const result = await this.productUsecase.getProducts(req.body,req.user);
      if (result.success) {
        return res
          .status(200)
          .json({
            message: result.message,
            data: result.allProducts,
            totalDocument: result.totalproducts,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
          });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

 async searchProduct(req, res) {
    try {
      const result = await this.productUsecase.searchProduct(req.body);
      if (result.success) {
        return res
          .status(200)
          .json({});
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getCategoryByCollectionId(req, res) {
    try {
      const {id} = req.params

      const result = await this.productUsecase.getCategoryByCollectionId(id);

      if (result.success) {
        return res
          .status(200)
          .json({message:result.message,data:result.data,pathUrl:result.pathUrl});
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getProductBySubcategroy(req, res) {
    try {
      const { id } = req.params;

       const { 
        page = 1, 
        sort = 'latest',  //price_lth, price_htl,discount,latest
       priceRange,
       search,
       limit = 10 
     } = req.query;

     const filters = {
       sort,
       priceRange,
       search,
     };

      const result = await this.productUsecase.getProductBySubcategroy(
        id,
        parseInt(page),
        parseInt(limit),
        req.user,
        search,
        filters
      );

      if (result.success) {
        return res.status(200).json({
          message: result.message,
          data: result.data.products,
          pagination: result.data.pagination,
          pathUrl: result.pathUrl,
        });
      }

      return res.status(404).json({
        message: result.message,
        data: result.data.products,
        pagination: result.data.pagination,  
        pathUrl: result.pathUrl
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getProductByCategory(req, res) {
    try {
      const { id } = req.params;
      const { 
        page = 1, 
        sort = 'latest',  //price_lth, price_htl,discount,latest
       priceRange,
        search,
        limit = 10 
      } = req.query;

      const filters = {
        sort,
        priceRange:priceRange,
        search,
      };

      const result = await this.productUsecase.getProductByCategory(
        id,
        parseInt(page),
        parseInt(limit),
        req.user,
        filters
      );

      if (result.success) {
        return res.status(200).json({
          message: result.message,
          data: result.data.products,
          pagination: result.data.pagination,
          pathUrl: result.pathUrl,
          filters: filters
        });
      }

      return res.status(404).json({
        message: result.message,
        data: result.data?.products || [],
        pagination: result.data?.pagination || {},
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getProductStockReport(req, res) {
    try {
      const { page } = req.query;
      const limit = 10;

      const result = await this.productUsecase.getProductStockReport(
        page,
        limit
      );

      if (result.success) {
        return res.status(200).json({
          message: result.message,
          data: result.data.products,
          pagination: result.data.pagination,
          pathUrl: result.pathUrl,
        });
      }

      return res.status(404).json({
        message: result.message,
        data: result.data.products,
        pagination: result.data.pagination,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async toggleBestSeller(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Product Id is required" });
      }

      const changeStatus = await this.productUsecase.toggleBestSeller(id);
      if (changeStatus.success) {
        return res.status(200).json({ message: changeStatus.message });
      }
      return res.status(400).json({ message: changeStatus.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
    
    return res.status(404).json({ 
      message: result.message,
      data: result.data.products,  
      pagination: result.data.pagination 
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }

  async allProductsData(req, res) {
    try {
      const result = await this.productUsecase.allProductsData(req.query, req.user);
      if (result.success) {
        return res.status(200).json({
          message: result.message,
          data: result.allProducts,
          totalDocument: result.totalproducts,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

//  async getProductByCategory(req, res) {
//   try {
//     const { id } = req.params;
//     const { page } = req.query;
//     const limit = 10;
    
//     const result = await this.productUsecase.getProductByCategory(id, page, limit,req.user);

//     if (result.success) {
//       return res.status(200).json({
//         message: result.message,
//         data: result.data.products,
//         pagination: result.data.pagination,  
//         pathUrl: result.pathUrl
//       });
//     }
    
//     return res.status(404).json({ 
//       message: result.message,
//       data: result.data.products,  
//       pagination: result.data.pagination 
//     });
    
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

  async getProductStockReport(req, res) {
    try {
      const { page, limit,search,from_date,to_date } = req.query;

      const response = await this.productUsecase.getProductStockReport(page, limit,search,from_date,to_date);

      if (response.success) {
        return res.status(200).json(response);
      } else {
        return res.status(404).json(response);
      }
    } catch (error) {
      console.error("Controller Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  
}


export default ProductController;
import mongoose, { isValidObjectId } from "mongoose";

class CategoryUseCase {
  constructor(categoryRepository,branchRepository,s3Repo,s3Service) {
    this.categoryRepository = categoryRepository;
    this.branchRepository=branchRepository;
    this.s3Repo=s3Repo;
    this.s3Service=s3Service;
  }

  validateObjectId(id, name) {
    if (id && !isValidObjectId(id)) {
      return { success: false, message: `Provide a valid ${name} ID` };
    }
    return null;
  }

  async addCategory(categoryData,files,token) {
    try {
      console.log(categoryData)
      const branchValidation = this.validateObjectId(
        categoryData.id_branch,
        "Branch"
      );
      if (branchValidation) return branchValidation;

      const metalValidation = this.validateObjectId(
        categoryData.id_metal,
        "Metal"
      );
      if (metalValidation) return metalValidation;

      const existingCategory = await this.categoryRepository.findByName(
        categoryData.category_name
      );

      let imageUrlFinal = null;
      if(files && files.image){
        imageUrlFinal=await this.handleImageUpload(files,null,token);
      }
      if(imageUrlFinal){  
        categoryData.image=imageUrlFinal
      }

      if (existingCategory) {
        return { success: false, message: "Category already exists." };
      }

      const categoryResult = await this.categoryRepository.addCategory(
        categoryData
      );

      if (categoryResult) {
        return { success: true, message: "Category created successfully." };
      }

      return {
        success: false,
        message: "Failed to create category. Please try again later.",
      };
    } catch (err) {
      console.error(
        "Error occurred while adding category:",
        err.stack || err.message
      );
      return {
        success: false,
        message: "An error occurred while adding  category.",
        error: err.message,
      };
    }
  }

  async editCategory(editCategoryData, id,files) {
    try {
      // if(id !== 0 && id !== ''){
      //   const idValidation = this.validateObjectId(id, "category");
      // if (idValidation) return idValidation;
      // }

      // const branchValidation = this.validateObjectId(
      //   editCategoryData.id_branch,
      //   "Branch"
      // );
      // if (branchValidation) return branchValidation;

      // if(typeof editCategoryData.id_metal !== number){
      //   const metalValidation = this.validateObjectId(
      //     editCategoryData.id_metal,
      //     "Metal"
      //   );
      //   if (metalValidation) return metalValidation;
      // }

      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        return { success: false, message: "Category not found" };
      }
      const checkAlready = await this.categoryRepository.findByName(
        editCategoryData.category_name,
        id
      );
      if (checkAlready) {
        return { success: false, message: "Category already Existing" };
      }

      const updateFields = {};

      for (let key in editCategoryData) {
        if (key === "id_branch") {
          if (
            !new mongoose.Types.ObjectId(editCategoryData[key]).equals(
              new mongoose.Types.ObjectId(existingCategory[key])
            )
          ) {
            updateFields[key] = editCategoryData[key];
          }
        } else if (
          editCategoryData[key] !== existingCategory[key] &&
          editCategoryData[key] !== undefined
        ) {
          updateFields[key] = editCategoryData[key];
        }
      }
      if (Object.entries(updateFields).length == 0) {
        return { success: false, message: "No changes found" };
      }

    if (files && files.image) {
      const s3Configs = await this.s3Helper(
        editCategoryData.id_branch || existingCategory.id_branch
      );

      try {
        updateFields.image = await this.s3Service.uploadToS3(
          files.image[0],
          "category",            
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

      const updateCategory = await this.categoryRepository.editCategory(
        id,
        updateFields
      );
      if (updateCategory) {
        return { success: true, message: "Category edited successfully" };
      }
      return {
        success: false,
        message: "Failed to edit Category. Please try again later",
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while editing category.",
        error: err.message,
      };
    }
  }

  async deleteCategory(id) {
    try {
      const CategoryValidate = this.validateObjectId(id, "Category");
      if (CategoryValidate) return CategoryValidate;

      const existingCategory = await this.categoryRepository.findById(id);

      if (!existingCategory) {
        return { success: false, message: "Category not found" };
      }
      const deleteCategoryResult = await this.categoryRepository.deleteCategory(
        id
      );
      if (deleteCategoryResult) {
        return { success: true, message: "Category deleted successfully" };
      }
      return {
        success: false,
        message: "Failed to delete category. Please try again later",
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while deleting  category.",
        error: err.message,
      };
    }
  }

  async changeStatus(id) {
    try {
      const idValidation = this.validateObjectId(id, "category");
      if (idValidation) return idValidation;

      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        return { success: false, message: "Category not found" };
      }

      const updateStatus = await this.categoryRepository.changeStatus(
        id,
        existingCategory.active
      );
      if (!updateStatus) {
        return { success: true, message: "Failed to change Status" };
      }
      let message = existingCategory.active
        ? "Category successfully deactivated"
        : "Category successfully activated";
      return { success: true, message: message };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while change status category.",
        error: err.message,
      };
    }
  }

  async findById(id) {
    try {
      const idValidation = this.validateObjectId(id, "Category");
      if (idValidation) return idValidation;

      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        return { success: false, message: "Category not found" };
      }

      return {
        success: true,
        message: "Category retrieved successfully",
        data: existingCategory,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get category by id.",
        error: err.message,
      };
    }
  }

  async findByBranch(id) {
    try {
      const idValidation = this.validateObjectId(id, "Category");
      if (idValidation) return idValidation;

      const categoryData = await this.categoryRepository.getByBranchId(id);

      if (categoryData) {
        return {
          success: true,
          message: "Category retrieved successfully",
          data: categoryData,
        };
      }
      return { success: false, message: "Category not found" };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get category by branch id.",
        error: err.message,
      };
    }
  }

  async findByMetalId(id) {
    try {
      const idValidation = this.validateObjectId(id, "Metal");
      if (idValidation) return idValidation;
      
      const categoryData = await this.categoryRepository.getByMetalId(id);

      if (categoryData) {
        return {
          success: true,
          message: "Category retrieved successfully",
          data: categoryData,
        };
      }
      return { success: false, message: "Category not found" };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get category by metal id.",
        error: err.message,
      };
    }
  }

  async getCategory(query) {
    try {
      const { page, limit, from_date, to_date, id_branch, search,active } = query;

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
      const skip = (pageNum - 1) * pageSize;
      const filter = { is_deleted: false };
    
      if (active !== undefined && active !== null && active !== "") {
        filter.active = active === true || active === "true";
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
      
      // Search filter
      if (search) {
        const searchRegex = new RegExp(search, "i"); 
        filter.$or = [{ category_name: { $regex: searchRegex } }];
      }

      if (isValidObjectId(id_branch)) {
        filter.id_branch = id_branch;
      }

      // Fetch category with filters
      const category = await this.categoryRepository.getCategory(
        filter,
        skip,
        pageSize
      );
      if (!category.length >= 1) {
        return { success: false, message: "No category found" };
      }

      // Count the total number of matching category
      const totalcategory = await this.categoryRepository.countCategory(filter);

      return {
        success: true,
        message: "Category retrieved successfully",
        data: {
        category,
        totalcategory,
        totalPages: Math.ceil(totalcategory / pageSize),
        currentPage: pageNum
        }
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get category",
        error: err.message,
      };
    }
  }

  async findAllActive (branchId){
    try{
      const idValidation = this.validateObjectId(branchId, "id_branch");
      if (idValidation) return idValidation;

      const checkBranch= await this.branchRepository.findById(branchId)
      if(!checkBranch){
        return {success:false,message:"Branch not found"}
      }

      const data = await this.categoryRepository.findAllActive(branchId)
      if(data.length>=0){
        return {success:true,message:"Category retrieved successfully",data}
      }
      return {success:false,message:"No category found"}
    }catch(err){
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get category",
        error: err.message,
      };
    }
  }

  async getAllCategories (branchId){
    try{
      const idValidation = this.validateObjectId(branchId, "id_branch");
      if (idValidation) return idValidation;

      const checkBranch= await this.branchRepository.findById(branchId)
      if(!checkBranch){
        return {success:false,message:"Branch not found"}
      }

      const data = await this.categoryRepository.getAllCategories(branchId)
      if(data.length>=0){
        return {success:true,message:"Category retrieved successfully",data}
      }
      return {success:false,message:"No category found"}
    }catch(err){
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get category",
        error: err.message,
      };
    }
  }

  async getAllCategoriesWithoutBranch() {
  try {
    const data = await this.categoryRepository.getAllCategoriesWithoutBranch();

    if (data && data.length > 0) {
      return {
        success: true,
        message: "All categories retrieved successfully",
        data,
      };
    }

    return { success: false, message: "No categories found" };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "An error occurred while fetching categories",
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
        "category",
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

export default CategoryUseCase;

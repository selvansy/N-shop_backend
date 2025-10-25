import { isValidObjectId } from "mongoose";

class SizemasterUsecase {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    try {
      return await this.repository.create(data);
    } catch (error) {
      throw new Error(`Failed to create size master: ${error.message}`);
    }
  }

  async getAll() {
    try {
      return await this.repository.getAll();
    } catch (error) {
      throw new Error(`Failed to fetch size masters: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      throw new Error(`Failed to fetch size master by id: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      return await this.repository.update(id, data);
    } catch (error) {
      throw new Error(`Failed to update size master: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete size master: ${error.message}`);
    }
  }

    async getsizemastertable(query) {
        try {
          const { page, limit, from_date, to_date, categoryId, search, active } =
            query;
    
          const pageNum = page ? parseInt(page) : 1;
          const pageSize = limit ? parseInt(limit) : 10;
          const skip = (pageNum - 1) * pageSize;
    
          const filter = {};

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
            filter.$or = [{ sizeName: { $regex: searchRegex } }];
          }
    
         
          if (isValidObjectId(categoryId)) {
            filter.categoryId = categoryId;
          }
    
          // Fetch with pagination
          const subcategories = await this.repository.getsizemastertable(
            filter,
            skip,
            pageSize
          );
    
          if (!subcategories) {
            return { success: false, message: "No category found" };
          }
    
          // const totalSubCategory =
          //   await this.subCategoryRepository.getSubCategory(filter);
          const totalcategory = await this.repository.countsizemaster(filter);
    
          return {
            success: true,
            message: "sizemaster retrieved successfully",
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

  async changeStatus(id) {
    try {

     if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid Size Master ID" };
    }

      const existingSizeMaster = await this.repository.findById(id);
      if (!existingSizeMaster) {
        return { success: false, message: "Size Master not found" };
      }

      const updateStatus = await this.repository.changeStatus(
        id,
        existingSizeMaster.active
      );

      if (!updateStatus) {
        return { success: false, message: "Failed to change status" };
      }

      const message = existingSizeMaster.active
        ? "Size Master successfully deactivated"
        : "Size Master successfully activated";

      return { success: true, message };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while changing Size Master status",
        error: err.message,
      };
    }
  }
}

export default SizemasterUsecase;
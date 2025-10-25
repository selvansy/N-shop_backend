import { isValidObjectId } from "mongoose";
import StonemasterRepositary from "../../../infrastructure/repositories/ecom/stonemasterRepositary.js";

export default class StonemasterUsecase {
  constructor() {
    this.StonematerRepo = new StonemasterRepositary();
  }

  async createStonemaster(data) {
    try {
      const Stonemaster = await this.StonematerRepo.CreateStoneMaster(data);
      return Stonemaster;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error Creating a Stone Diamond Master",
      };
    }
  }

  async Getstonemaster() {
    try {
      const stonemaster = await this.StonematerRepo.Getstonemaster();
      return stonemaster;
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while fetching the stone data" };
    }
  }

  async editStonemaster(id, data) {
    try {
      const stonemaster = await this.StonematerRepo.EditStoneMaster(id, data);
      return stonemaster;
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while edit the stone data" };
    }
  }

  async deleteStonmaster(id) {
    try {
      const stonemaster = await this.StonematerRepo.DeleteStonemaster(id);
      if (!stonemaster) {
        throw new Error("Delivery address not found");
      }

      return {
        success: true,
        message: "Stone master deleted Successfully",
      };
    } catch (error) {
     console.error(error);
      return { success: false, message: "Error while delete the stone data" };
    }
  }

  async Getstonemasterbyid(id) {
    try {
      const stonemaster = await this.StonematerRepo.Getstonemasterbyid(id);
      return stonemaster;
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while fetching the stone data" };
    }
  }

  async getStonemastertable(query) {
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


      if (from_date && to_date) {
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format.");
        }

        filter.createdAt = { $gte: startDate, $lte: endDate };
      }

      if (search) {
        const searchRegex = new RegExp(search, "i");
        filter.$or = [{ stonename: { $regex: searchRegex } }];
      }

      if (isValidObjectId(categoryId)) {
        filter.categoryId = categoryId;
      }

      const subcategories = await this.StonematerRepo.getstonemastertable(
        filter,
        skip,
        pageSize
      );

      if (!subcategories) {
        return { success: false, message: "No category found" };
      }
      const totalcategory = await this.StonematerRepo.countstonemaster(filter);

      return {
        success: true,
        message: "Stone retrieved successfully",
        data: {
          subcategories,
          totalcategory,
          totalPages: Math.ceil(totalcategory / pageSize),
          currentPage: pageNum,
        },
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

  async findByFields(filter) {
    return await this.StonematerRepo.findOne(filter);
  }

  async getDiamond() {
    try {
      const stonemaster = await this.StonematerRepo.getDiamond();
      if(stonemaster.length > 0){
        return {success:true,message:"Diamond data fetched successfully",data:stonemaster}
      }

      return {success:false,message:"No diamond data found",data:stonemaster}
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while fetching the diamond data" };
    }
  }

  async getStone() {
    try {
      const stonemaster = await this.StonematerRepo.getStone();
      if(stonemaster.length > 0){
        return {success:true,message:"Stone data fetched successfully",data:stonemaster}
      }

      return {success:false,message:"No stone data foun",data:stonemaster}
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while fetching the stone data" };
    }
  }

   async changeStatus(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Invalid Stone Master ID" };
      }

      const existingStone = await this.StonematerRepo.findById(id);
      if (!existingStone) {
        return { success: false, message: "Stone Master not found" };
      }

      const updateStatus = await this.StonematerRepo.changeStatus(
        id,
        existingStone.active
      );

      if (!updateStatus) {
        return { success: false, message: "Failed to change status" };
      }

      const message = existingStone.active
        ? "Stone Master successfully deactivated"
        : "Stone Master successfully activated";

      return { success: true, message };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while changing Stone Master status",
        error: err.message,
      };
    }
  }
}

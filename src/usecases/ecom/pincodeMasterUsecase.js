import pincodeMasterRepository from '../../infrastructure/repositories/ecom/pincodeMasterRepository.js';
import { isValidObjectId } from "mongoose";

class PincodeMasterUseCase {
  constructor() {
    this.pincodeRepository = new pincodeMasterRepository();
  }

  createPincode = async (pincodeData) => {
    const existingPincode = await this.pincodeRepository.getPincodeByCode(pincodeData.pincode);
    if (existingPincode) {
      throw new Error('Pincode already exists');
    }

    return await this.pincodeRepository.createPincode(pincodeData);
  };

  getAllPincodes = async ({ page = 1, limit = 10, search = "", country, state, city, isDeliveryAvailable } = {}) => {
  try {
    const filters = {};

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search, "i");
      filters.$or = [
        { country: searchRegex },
        { state: searchRegex },
        { city: searchRegex },
        { pincode: searchRegex },
      ];
    } else {
      if (country) filters.country = country;
      if (state) filters.state = state;
      if (city) filters.city = city;
    }

    if (isDeliveryAvailable !== undefined) {
      filters.isDeliveryAvailable = isDeliveryAvailable === "true";
    }

    const skip = (page - 1) * limit;

    const [pincodes, totalCount] = await Promise.all([
      this.pincodeRepository.getAllPincodes(filters, skip, limit),
      this.pincodeRepository.countPincodes(filters),
    ]);

    return {
      data: pincodes,
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    throw error;
  }
};


  getPincodeById = async (id) => {
    const pincode = await this.pincodeRepository.getPincodeById(id);
    if (!pincode) {
      throw new Error('Pincode not found');
    }
    return pincode;
  };

  updatePincode = async (id, updateData) => {
    const existingPincode = await this.pincodeRepository.getPincodeById(id);
    if (!existingPincode) {
      throw new Error('Pincode not found');
    }

    if (updateData.pincode && updateData.pincode !== existingPincode.pincode) {
      const pincodeWithSameCode = await this.pincodeRepository.getPincodeByCode(updateData.pincode);
      if (pincodeWithSameCode) {
        throw new Error('Pincode already exists');
      }
    }

    return await this.pincodeRepository.updatePincode(id, updateData);
  };

  deletePincode = async (id) => {
    const existingPincode = await this.pincodeRepository.getPincodeById(id);
    if (!existingPincode) {
      throw new Error('Pincode not found');
    }

    return await this.pincodeRepository.deletePincode(id);
  };

  getPincodesByFilters = async (filters = {}) => {
    return await this.pincodeRepository.getPincodesByFilters(filters);
  };

   getPincodesBylatandland = async (filters) => {
    return await this.pincodeRepository.getPincodebylatandlan(filters);
  };

    async getpincodetable(query) {
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
          filter.$or = [
            { pincode: { $regex: searchRegex } }
          ];
        }
  
       
        if (isValidObjectId(categoryId)) {
          filter.categoryId = categoryId;
        }
  
        // Fetch with pagination
        const subcategories = await this.pincodeRepository.getpincodetable(
          filter,
          skip,
          pageSize
        );
  
        if (!subcategories) {
          return { success: false, message: "No category found" };
        }
  
        // const totalSubCategory =
        //   await this.subCategoryRepository.getSubCategory(filter);
        const totalcategory = await this.pincodeRepository.countPincode(filter);
  
        return {
          success: true,
          message: "Pincode retrieved successfully",
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
            return { success: false, message: "Invalid Stone Master ID" };
          }
    
          const existingStone = await this.pincodeRepository.findById(id);
          if (!existingStone) {
            return { success: false, message: "Pincode Master not found" };
          }
    
          const updateStatus = await this.pincodeRepository.changeStatus(
            id,
            existingStone.active
          );
    
          if (!updateStatus) {
            return { success: false, message: "Failed to change status" };
          }
    
          const message = existingStone.active
            ? "Pincode Master successfully deactivated"
            : "Pincode Master successfully activated";
    
          return { success: true, message };
        } catch (err) {
          console.error(err);
          return {
            success: false,
            message: "An error occurred while changing Pincode Master status",
            error: err.message,
          };
        }
      }

}

export default PincodeMasterUseCase;
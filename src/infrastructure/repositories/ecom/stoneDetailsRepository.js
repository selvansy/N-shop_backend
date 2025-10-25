import mongoose from "mongoose";
import stoneDetialsModel from "../../models/ecom/stoneDetialsModel.js";

class StoneDetailsRepository {
  async create(data) {
    try {
      const savedData = await stoneDetialsModel.create(data);
      return savedData;
    } catch (error) {
      console.error("Error in StoneDetailsRepository.create:", error);
      throw error;
    }
  }

  async createMany(dataArray) {
    try {
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        throw new Error("createMany requires a non-empty array of data");
      }

      const savedData = await stoneDetialsModel.insertMany(dataArray, {
        ordered: false,
      });
      return savedData;
    } catch (error) {
      console.error("Error in StoneDetailsRepository.createMany:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const stone = await stoneDetialsModel.findById(id)
      .populate('itemId')
      console.log()
      return stone;
    } catch (error) {
      console.error("Error in StoneDetailsRepository.getById:", error);
      throw error;
    }
  }

 async getManyByIds(ids, type) {
    try {
      const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

      const results = await stoneDetialsModel.find({
        _id: { $in: objectIds },
        type: type, 
      }).populate("itemId"); 

      return { type, data: results };
    } catch (error) {
      console.error("Error in getManyByIds:", error);
      throw error;
    }
  }





}

export default StoneDetailsRepository;

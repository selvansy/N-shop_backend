import StonemasterModel from "../../models/ecom/StonemasterModel.js";

export default class StonemasterRepositary {
  async CreateStoneMaster(data) {
    try {
      const Stone = new StonemasterModel(data);
      return await Stone.save();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async Getstonemaster() {
    try {
      return await StonemasterModel.find({ active: true });
    } catch (error) {
      throw new Error(`Error fetching addresses: ${error.message}`);
    }
  }

  async EditStoneMaster(id, data) {
    try {
      const updatedData = await StonemasterModel.findByIdAndUpdate(
        { _id: id },
        { $set: data },
        { new: true, runValidators: true }
      );

      if (updatedData.matchedCount === 0) {
        return null;
      }

      return updatedData;
    } catch (error) {
      console.error(error);
    }
  }

  async DeleteStonemaster(id) {
    try {
      const updatedData = await StonemasterModel.updateOne(
        { _id: id },
        { $set: { active:false} }
      );

      if (updatedData.matchedCount === 0) {
        return null;
      }

      return updatedData;
    } catch (error) {
      console.error(error);
    }
  }

  async Getstonemasterbyid(id) {
    try {
      return await StonemasterModel.findOne({ _id: id, active: true }).sort({
        createdAt: -1,
      });
    } catch (error) {
      throw new Error(`Error fetching Stone master: ${error.message}`);
    }
  }

  async getstonemastertable(filter, skip, limit) {
    try {
      return await StonemasterModel.find(filter)
        .skip(skip)
        .limit(limit)
        .populate("stone_cut_id", "name")
        .populate("clarity_id", "name")
        .populate("color_id", "name")
        .populate("shape_id", "name")
        .sort({ _id: -1 })
        .exec();
    } catch (err) {
      throw new Error("Database error occurred while getting subcategories");
    }
  }

  async countstonemaster(filter) {
    return await StonemasterModel.countDocuments(filter);
  }

  async findOne(filter) {
    return await StonemasterModel.findOne(filter);
  }

  async getDiamond() {
    try {
      return await StonemasterModel.find({ is_diamond: true }).select("stonename");
    } catch (error) {
      console.error(error);
    }
  }

  async getStone() {
    try {
      const stones = await StonemasterModel.find({ is_diamond: false }).select("stonename")
      return stones || [];
    } catch (error) {
      console.error("Error fetching stones:", error);
      throw error;
    }
  }

   async findById(id) {
    return StonemasterModel.findById(id);
  }

  async changeStatus(id, currentStatus) {
    const result = await StonemasterModel.updateOne(
      { _id: id },
      { active: !currentStatus }
    );
    return result.modifiedCount === 1 ? result : null;
  }
}
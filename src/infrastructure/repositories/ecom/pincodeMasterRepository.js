import PincodeMaster from "../../models/ecom/pincodeMasterModel.js";

class pincodeMasterRepository {
  createPincode = async (pincodeData) => {
    try {
      const pincode = new PincodeMaster(pincodeData);
      return await pincode.save();
    } catch (error) {
      throw error;
    }
  };

  async getAllPincodes(filters = {}, skip = 0, limit = 10) {
    try {
      console.log("dkkd");
      const pipeline = [
        {
          $lookup: {
            from: "states",
            localField: "id_state",
            foreignField: "_id",
            as: "state",
          },
        },
        { $unwind: "$state" },
        {
          $lookup: {
            from: "countries",
            localField: "id_country",
            foreignField: "_id",
            as: "country",
          },
        },
        { $unwind: "$country" },
        {
          $lookup: {
            from: "cities",
            localField: "id_city",
            foreignField: "_id",
            as: "city",
          },
        },
        { $unwind: "$city" },
      ];

      // ✅ Search filter
      if (filters.search) {
        const regex = new RegExp(filters.search, "i");
        pipeline.push({
          $match: {
            $or: [
              { "country.name": regex },
              { "state.name": regex },
              { "city.name": regex },
              { pincode: regex },
            ],
          },
        });
      }

      // ✅ Pagination + total count using facet
      pipeline.push({
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      });

      const result = await PincodeMaster.aggregate(pipeline);

      const data = result[0]?.data || [];
      const totalCount = result[0]?.totalCount[0]?.count || 0;

      return {
        data,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  getPincodeById = async (id) => {
    try {
      return await PincodeMaster.findById(id);
    } catch (error) {
      throw error;
    }
  };

  getPincodeByCode = async (pincode) => {
    try {
      return await PincodeMaster.findOne({ pincode });
    } catch (error) {
      throw error;
    }
  };

  updatePincode = async (id, updateData) => {
    try {
      return await PincodeMaster.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw error;
    }
  };

  deletePincode = async (id) => {
    try {
      return await PincodeMaster.findByIdAndUpdate(
        id,
        { isDeleted: true, active: false },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  };

  getPincodesByFilters = async (filters = {}) => {
    try {
      return await PincodeMaster.find(filters).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  getPincodebylatandlan = async (filters) => {
    try {
      return await PincodeMaster.findOne(filters);
    } catch (error) {
      throw error;
    }
  };

  // async getpincodetable(filter, skip, limit) {
  //   try {
  //     return await PincodeMaster.find(filter)
  //       .skip(skip)
  //       .limit(limit)
  //       .populate("id_country")
  //       .populate("id_state")
  //       .populate("id_city")
  //       .sort({ _id: -1 })
  //       .exec();
  //   } catch (err) {
  //     throw new Error("Database error occurred while getting subcategories");
  //   }
  // }
  async getpincodetable(filter, skip, limit) {
  try {
    const pincodeData = await PincodeMaster.aggregate([
      { $match: filter }, // initial filter
      {
        $lookup: {
          from: "statemasters", // StateMaster collection name in MongoDB
          localField: "id_state",
          foreignField: "id_state",
          as: "state"
        }
      },
      { $unwind: "$state" }, // flatten the state array
      { $match: { "state.deliveryEnabled": true } }, // only enabled states
      {
        $lookup: {
          from: "countries",
          localField: "id_country",
          foreignField: "_id",
          as: "id_country"
        }
      },
      { $unwind: "$id_country" },
      {
        $lookup: {
          from: "states",
          localField: "id_state",
          foreignField: "_id",
          as: "id_state"
        }
      },
      { $unwind: "$id_state" },
      {
        $lookup: {
          from: "cities",
          localField: "id_city",
          foreignField: "_id",
          as: "id_city"
        }
      },
      { $unwind: "$id_city" },
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).exec();

    return pincodeData;
  } catch (err) {
    console.error(err);
    throw new Error("Database error occurred while getting subcategories");
  }
}

  async countPincode(filter) {
    return await PincodeMaster.countDocuments(filter);
  }

   async findById(id) {
      return PincodeMaster.findById(id);
    }

     async changeStatus(id, currentStatus) {
        const result = await PincodeMaster.updateOne(
          { _id: id },
          { active: !currentStatus }
        );
        return result.modifiedCount === 1 ? result : null;
      }
}

export default pincodeMasterRepository;

import sizeMasterModel from "../../models/ecom/sizeMasterModel.js";

class SizemasterRepository {
  async create(data) {
    const sizeMaster = new sizeMasterModel(data);
    return await sizeMaster.save();
  }

  async getAll(filter = {}, sort = { createdAt: -1 }) {
  const [items, total] = await Promise.all([
    sizeMasterModel.find(filter).sort(sort),
    sizeMasterModel.countDocuments(filter),
  ]);

  return { items, total };
}

  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      sizeMasterModel.find(filter).sort(sort).skip(skip).limit(limit),
      sizeMasterModel.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  async findById(id) {
    return await sizeMasterModel.findById(id);
  }

  async update(id, data) {
    console.log("wertyu",id,data)
    return await sizeMasterModel.findByIdAndUpdate(id, data, { new: true });
  }

   async changeStatus(id, currentStatus) {
    try {
      const updateResult = await sizeMasterModel.updateOne(
        { _id: id },
        { active: !currentStatus }
      );
      if (updateResult.modifiedCount === 1) return updateResult;
      return null;
    } catch (err) {
      throw new Error("Database error occurred while changing Size Master status");
    }
  }

  async softDelete(id) {
    return await sizeMasterModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
  }

  async delete(id) {
    return await sizeMasterModel.findByIdAndDelete(id);
  }

    async getsizemastertable(filter, skip, limit) {
            try {
                return await sizeMasterModel.find(filter)
                    .skip(skip)
                  .limit(limit)
                    .sort({ _id: -1 })
                    .exec();
            } catch (err) {
                throw new Error("Database error occurred while getting subcategories");
            }
          }

          async countsizemaster(filter) {
              return await sizeMasterModel.countDocuments(filter);
            }
}

export default SizemasterRepository;

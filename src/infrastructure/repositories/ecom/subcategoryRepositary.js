import ProductModel from "../../models/chit/productModel.js";
import subCategoryModel from "../../models/ecom/subCategoryModel.js";

class SubCategoryRepository {
  async addSubCategory(subCategoryData) {
    try {
      const saveSubCategory = new subCategoryModel(subCategoryData);
      await saveSubCategory.save();
      return saveSubCategory;
    } catch (err) {
      console.error(err);
      throw new Error("Database error occurred while creating subcategory");
    }
  }

  async findById(id) {
    try {
      return await subCategoryModel.findOne({ _id: id, isDeleted: false });
    } catch (err) {
      throw new Error("Database error occurred while finding subcategory by id");
    }
  }

  async findByName(name, id) {
    try {
      const filter = {
        name: name ? new RegExp(`^${name}$`, "i") : undefined,
        isDeleted: false,
      };

      if (id) {
        filter._id = { $ne: id };
      }

      const findSubCategory = await subCategoryModel.findOne(filter);

      if (!findSubCategory) return null;

      return {
        name: findSubCategory.name,
        _id: findSubCategory._id,
      };
    } catch (err) {
      throw new Error(
        "Database error occurred while finding subcategory by name"
      );
    }
  }

  async editSubCategory(id, subCategoryData) {
    try {
      const updateSubCategory = await subCategoryModel.updateOne(
        { _id: id },
        { $set: subCategoryData }
      );
      if (updateSubCategory.modifiedCount === 1) {
        return updateSubCategory;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error("Database error occurred while editing subcategory");
    }
  }

  async deleteSubCategory(id) {
    try {
      const update = await subCategoryModel.updateMany(
        { _id: id },
        { isDeleted: true,active:false }
      );
      await ProductModel.updateMany({ id_subcategory: id }, { $set: { is_deleted: true } });

      if (update.modifiedCount === 1) return true;
      return null;
    } catch (err) {
      throw new Error("Database error occurred while deleting subcategory");
    }
  }

  async changeStatus(id, status) {
    try {
      const updateStatus = await subCategoryModel.updateOne(
        { _id: id },
        { active: !status }
      );
      if (updateStatus.modifiedCount === 1) {
        return updateStatus;
      }
      return null;
    } catch (err) {
      throw new Error(
        "Database error occurred while changing subcategory status"
      );
    }
  }

  async getByCategoryId(id) {
    try {
      const subCategoryData = await subCategoryModel.find({
        categoryId: id,
        isDeleted: false,
      });

      if (subCategoryData.length > 0) {
        return subCategoryData;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(
        "Database error occurred while finding subcategories by category"
      );
    }
  }

  // async getSubCategory(filter, skip, limit) {
  //   try {
  //     return await subCategoryModel.find(filter)
  //       .skip(skip)
  //       .limit(limit)
  //       .populate("categoryId", "category_name")
  //       .sort({ _id: -1 })
  //       .exec();
  //   } catch (err) {
  //     throw new Error("Database error occurred while getting subcategories");
  //   }
  // }

   async getSubCategory(filter, skip, limit) {
      try {
        const categories = await subCategoryModel.aggregate([
          { $match: filter },
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "s3bucketsettings",
              localField: "category.id_branch",
              foreignField: "id_branch",
              as: "s3Details",
            },
          },
          { $unwind: { path: "$s3Details", preserveNullAndEmptyArrays: true } },
  
          { $sort: { _id: -1 } },
          { $skip: skip },
          { $limit: limit },
  
          {
            $project: {
              // categoryId: "$categories.category_name",
               categoryName: "$category.category_name",
              name:1,
              description: 1,
              active: 1,
              isDeleted: 1,
              bannerImage:1,
              createdAt:1,
              pathurl: {
                $concat: [
                  "$s3Details.s3display_url",
                  "aupay/webadmin/assets/subcategory/",
                ],
              },
          },
        }
        ]);
  
        return categories;
      } catch (err) {
        throw new Error("Database error occurred while fetching categories: " + err.message);
      }
    }

  async countSubCategory(filter) {
    return await subCategoryModel.countDocuments(filter);
  }

  async findAllActive(categoryId) {
    try {
      return await subCategoryModel.find({
        active: true,
        isDeleted: false,
        categoryId,
      });
    } catch (err) {
      throw new Error("Database error occurred while getting subcategories");
    }
  }

  async findByCategoryId(categoryId){
    try{
       return await subCategoryModel.find({
        active: true,
        isDeleted: false,
        categoryId,
      });
    }catch(err){
      throw new Error("Database error occurred while getting subcategories")
    }
  }




  async getAllSubCategories(categoryId) {
    try {
      return await subCategoryModel.find({
        active: true,
        isDeleted: false,
        categoryId,
      }).select("name _id");
    } catch (err) {
      throw new Error("Database error occurred while getting subcategories");
    }
  }
}

export default SubCategoryRepository;

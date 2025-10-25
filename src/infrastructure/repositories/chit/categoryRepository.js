import mongoose from "mongoose";
import CategoryModel from "../../models/chit/categoryModel.js";
import ProductModel from "../../models/chit/productModel.js";

class CategoryRepository {
  async addCategory(categoryData) {
    try {
      const saveCategory = new CategoryModel(categoryData);
      await saveCategory.save();
      return saveCategory;
    } catch (err) {
      console.error(err);
      throw new Error("Database error occured while Creating category");
    }
  }

  async findById(id) {
    try {
      return await CategoryModel.findOne({ _id: id, is_deleted: false });
    } catch (err) {
      throw new Error(
        "Database error occurred while finding new arrivals by id"
      );
    }
  }

//   async findById(id) {
//   try {
//     const categories = await CategoryModel.aggregate([
//       { $match: { _id: new mongoose.Types.ObjectId(id), isDeleted: false } },
//       {
//         $lookup: {
//           from: "branches",
//           localField: "id_branch",
//           foreignField: "_id",
//           as: "id_branch",
//         },
//       },
//       { $unwind: { path: "$id_branch", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "metals",
//           localField: "id_metal",
//           foreignField: "_id",
//           as: "id_metal",
//         },
//       },
//       { $unwind: { path: "$id_metal", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "s3bucketsettings",
//           localField: "id_branch._id",
//           foreignField: "id_branch",
//           as: "s3Details",
//         },
//       },
//       { $unwind: { path: "$s3Details", preserveNullAndEmptyArrays: true } },

//       {
//         $project: {
//           category_name: 1,
//           description: 1,
//           // bannerImage: 1,
//           active: 1,
//           isDeleted: 1,
//           id_branch: "$id_branch._id",
//           id_metal: "$id_metal._id",
//           image: 1,
//           createdAt: 1,
//           pathurl: {
//             $concat: [
//               "$s3Details.s3display_url",
//               "aupay/webadmin/assets/category/",
//             ],
//           },
//         },
//       },
//     ]);

//     return categories || null;
//   } catch (err) {
//     throw new Error(
//       "Database error occurred while finding category by id: " + err.message
//     );
//   }
// }


  async findByName(category_name, id) {
    try {
      const filter = {
        category_name: category_name
          ? new RegExp(`^${category_name}$`, "i")
          : undefined,
        is_deleted: false,
      };

      if (id) {
        filter._id = { $ne: id };
      }

      const findCategory = await CategoryModel.findOne(filter);

      if (!findCategory) return null;

      return {
        category_name: findCategory.category_name,
        _id: findCategory._id,
      };
    } catch (err) {
      throw new Error("Database error occurred while finding category by name");
    }
  }

  async editCategory(id, categoryData) {
    try {
      const updateCategory = await CategoryModel.updateOne(
        { _id: id },
        { $set: categoryData }
      );
      if (updateCategory.modifiedCount == 1) {
        return updateCategory;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error("Database error occurred while editing category ");
    }
  }

  async deleteCategory(id) {
    try {
      const update = await CategoryModel.updateOne(
        { _id: id },
        { is_deleted: true }
      );
      await ProductModel.updateMany({id_category:id},{$set:{is_deleted:true}})
      if (update.modifiedCount == 1) return true;
      return null;
    } catch (err) {
      throw new Error("Database error occurred while deleting category");
    }
  }

  async changeStatus(id, status) {
    try {
      const updateStatus = await CategoryModel.updateOne(
        { _id: id },
        { active: !status }
      );
      if (updateStatus.modifiedCount == 1) {
        return updateStatus;
      }
      return null;
    } catch (err) {
      throw new Error("Database error occurred while changing category status");
    }
  }

  async getByBranchId(id) {
    try {
      const categoryData = await CategoryModel.find({
        id_branch: id,
        is_deleted: false,
      });

      if (categoryData.length > 0) {
        return categoryData;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(
        "Database error occurred while finding category by branch"
      );
    }
  }

  async getByMetalId(id) {
    try {
      const categoryData = await CategoryModel.find({
        id_metal: id,
        is_deleted: false,
        active:true
      });

      if (categoryData.length > 0) {
        return categoryData;
      } else {
        return null;
      }
    } catch (err) {
      console.error(err)
      throw new Error(
        "Database error occurred while finding category by metal id"
      );
    }
  }

    // async getCategory(filter, skip, limit) {
    //   try{
    //     console.log(filter);
    //     return await CategoryModel.find(filter)
    //     .skip(skip)
    //     .limit(limit)
    //     .populate('id_branch')
    //     .populate('id_metal','metal_name')
    //     .sort({_id:-1})

    //     .exec();
    //   }catch(err){
    //     throw new Error("Database error occured while get Category");
    //   }
    // }

  async getCategory(filter, skip, limit) {
    try {
      const categories = await CategoryModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "branches",
            localField: "id_branch",
            foreignField: "_id",
            as: "id_branch",
          },
        },
        { $unwind: { path: "$id_branch", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "metals",
            localField: "id_metal",
            foreignField: "_id",
            as: "id_metal",
          },
        },
        { $unwind: { path: "$id_metal", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "s3bucketsettings",
            localField: "id_branch._id",
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
            category_name: 1,
            description: 1,
            bannerImage: 1,
            active: 1,
            isDeleted: 1,
            branchName: "$id_branch.branch_name",
            metalName: "$id_metal.metal_name",
            image:1,
            createdAt:1,
            pathurl: {
              $concat: [
                "$s3Details.s3display_url",
                "aupay/webadmin/assets/category/",
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
  
    async countCategory(filter) {
      return await CategoryModel.countDocuments(filter);
    }

    async findAllActive(branch){
      try{
        return await CategoryModel.find({active:true,is_deleted:false,id_branch:branch})
      }catch(err){
        throw new Error("Database error occured while get Category");
      }
    }

    // async getAllCategories(branch){
    //   try{
    //     return await CategoryModel.find({active:true,id_branch:branch}).select('category_name _id')
    //   }catch(err){
    //     throw new Error("Database error occured while get Category");
    //   }
    // }
async getAllCategories(branch) {
  try {
    const categories = await CategoryModel.aggregate([
      {
        $match: {
          active: true,
          id_branch: new mongoose.Types.ObjectId(branch),
        },
      },
      {
        $lookup: {
          from: "s3bucketsettings",
          localField: "id_branch",
          foreignField: "id_branch",
          as: "s3Details",
        },
      },
      {
        $unwind: {
          path: "$s3Details",
          preserveNullAndEmptyArrays: true,
        },
      },
       {
        $lookup: {
          from: "metals",
          localField: "id_metal",
          foreignField: "_id",
          as: "id_metal",
        },
      },
      { $unwind: { path: "$id_metal", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          category_name: 1,
          image: 1,
          metal_name: "$id_metal.metal_name",
          pathurl: {
              $concat: [
                "$s3Details.s3display_url",
                "aupay/webadmin/assets/category/",
              ],
            },
        },
      },
    ]);

    return categories;
  } catch (err) {
    throw new Error("Database error occurred while getting categories: " + err.message);
  }
}


    async getAllCategoriesWithoutBranch() {
  try {
    return await CategoryModel.find({
      is_deleted:false,
      active:true
    })
      .populate('id_branch')
      .populate('id_metal', 'metal_name')
      .sort({ _id: -1 })
      .exec();
  } catch (err) {
    throw new Error("Database error occurred while fetching all categories");
  }
}

}

export default CategoryRepository;
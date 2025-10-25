// import ProductModel from "../../models/chit/productModel.js";
// import mongoose from "mongoose";
// import moment from "moment";
// import config from "../../../config/chit/env.js";
// class ProductRepository {
//   async findByName(product_name, id_branch, id) {
//     try {
//       const filter = {
//         product_name: product_name,
//         is_deleted: false,
//         id_branch: id_branch,
//       };

//       if (id) {
//         filter._id = { $ne: id };
//       }

//       const findProduct = await ProductModel.findOne(filter);

//       if (!findProduct) return null;

//       return {
//         product_name: findProduct.product_name,
//         _id: findProduct._id,
//       };
//     } catch (err) {
//       throw new Error("Database error occurred while finding Product by name");
//     }
//   }

//   async addProduct(productData) {
//     try {
//       const saveProduct = new ProductModel(productData);
//       await saveProduct.save();
//       return saveProduct;
//     } catch (err) {
//       console.error(err);

//       throw new Error("Database error occurred while add product");
//     }
//   }

//   async findByCode(code) {
//     try {
//       const findByCode = await ProductModel.find({ code, is_deleted: false });
//       if (findByCode.length == 0) {
//         return null;
//       }
//       return true;
//     } catch (err) {
//       throw new Error("Database error occurred while find product code");
//     }
//   }

//   async findById(id, customerId) {
//     try {
//       const isValidCustomerId = customerId && mongoose.Types.ObjectId.isValid(customerId);
  
//       const userData = await ProductModel.aggregate([
//         {
//           $match: {
//             _id: new mongoose.Types.ObjectId(id),
//             is_deleted: false
//           },
//         },
//         {
//           $lookup: {
//             from: "s3bucketsettings",
//             localField: "id_branch",
//             foreignField: "id_branch",
//             as: "s3Details"
//           }
//         },
//         { $unwind: "$s3Details" },
//         {
//           $lookup: {
//             from: "categories",
//             localField: "id_category",
//             foreignField: "_id",
//             as: "category"
//           }
//         },
//         { $unwind: "$category" },
//         {
//           $lookup: {
//             from: "branches",
//             localField: "id_branch",
//             foreignField: "_id",
//             as: "branches"
//           }
//         },
//         { $unwind: "$branches" },

//         {
//           $lookup: {
//             from: "metalrates",
//             let: {
//               purityId: "$id_purity",
//               branchId: "$id_branch"
//             },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       { $eq: ["$purity_id", "$$purityId"] },
//                       { $eq: ["$id_branch", "$$branchId"] }
//                     ]
//                   }
//                 }
//               },
//               { $sort: { createdAt: -1 } },
//               { $limit: 1 }
//             ],
//             as: "purity"
//           }
//         },
//         {
//           $unwind: {
//             path: "$purity",
//             preserveNullAndEmptyArrays: true
//           }
//         },
  
//         {
//           $addFields: {
//             purityRate: "$purity.rate",
//             price: {
//               $cond: {
//                 if: { $and: ["$purity.rate", "$weight"] },
//                 then: { $multiply: ["$weight", "$purity.rate"] },
//                 else: null
//               }
//             }
//           }
//         },
  
//         ...(isValidCustomerId
//           ? [
//               {
//                 $lookup: {
//                   from: "wishlists",
//                   let: { productId: "$_id" },
//                   pipeline: [
//                     {
//                       $match: {
//                         $expr: {
//                           $and: [
//                             { $eq: ["$itemId", "$$productId"] },
//                             { $eq: ["$id_customer", new mongoose.Types.ObjectId(customerId)] }
//                           ]
//                         }
//                       }
//                     }
//                   ],
//                   as: "wishlistMatch"
//                 }
//               },
//               {
//                 $addFields: {
//                   isWishlisted: { $gt: [{ $size: "$wishlistMatch" }, 0] }
//                 }
//               }
//             ]
//           : [
//               {
//                 $addFields: { isWishlisted: false }
//               }
//             ]
//         ),
        
//         {
//           $project: {
//             product_name: 1,
//             description: 1,
//             product_image: 1,
//             code: 1,
//             weight: 1,
//             metalcost: 1,
//             id_metal: 1,
//             id_purity: 1,
//             id_category: 1,
//             gst: 1,
//             sell: 1,
//             showprice: 1,
//             makingCharges: 1,
//             wastageCharges: 1,
//             active: 1,
//             id_branch: 1,
//             categoryName: "$category.category_name",
//             pathurl: {
//               $concat: ["$s3Details.s3display_url", `${config.AWS_LOCAL_PATH}products/`]
//             },
//             isWishlisted: 1,
//             purityRate: 1,
//             price: 1
//           }
//         },
//         { $limit: 1 }
//       ]);
  
//       return userData.length ? userData[0] : null;
  
//     } catch (err) {
//       console.error(err);
//       throw new Error("Database error occurred while finding Product by id");
//     }
//   }

//   async editProduct(productData, id) {
//     try {
//       const editProduct = await ProductModel.updateOne(
//         { _id: id },
//         { $set: productData }
//       );
//       if (editProduct.modifiedCount == 1) {
//         return editProduct;
//       } else {
//         return null;
//       }
//     } catch (err) {
//       throw new Error("Database error occurred while editing Product");
//     }
//   }

//   async deleteProduct(id) {
//     try {
//       const deleteProduct = await ProductModel.updateOne(
//         { _id: id },
//         { is_deleted: true }
//       );
//       if (deleteProduct.modifiedCount == 1) {
//         return true;
//       } else {
//         return null;
//       }
//     } catch (err) {
//       throw new Error("Database error occurred while deleting Product");
//     }
//   }

//   async changeStatus(id, status) {
//     try {
//       const updateStatus = await ProductModel.updateOne(
//         { _id: id },
//         { active: !status }
//       );
//       if (updateStatus.modifiedCount == 1) {
//         return updateStatus;
//       }
//       return null;
//     } catch (err) {
//       throw new Error("Database error occurred while changing product status");
//     }
//   }

//   async findByBranchId(id) {
//     try {
//       const productData = await ProductModel.find({ id_branch: id,is_deleted:false,active:true });
//       if (productData.length >= 1) {
//         return productData;
//       }
//       return null;
//     } catch (err) {
//       throw new Error("Database error occurred while get product by Branch");
//     }
//   }

//   async getProducts(filter, skip, limit, searchOptions, customerId=null) {
//     try {
//       const pipeline = [
//         { $match: filter },
//         {
//           $lookup: {
//             from: "branches",
//             localField: "id_branch",
//             foreignField: "_id",
//             as: "id_branch",
//           },
//         },
//         { $unwind: { path: "$id_branch", preserveNullAndEmptyArrays: true } },
//         {
//           $lookup: {
//             from: "categories",
//             localField: "id_category",
//             foreignField: "_id",
//             as: "id_category",
//           },
//         },
//         { $unwind: { path: "$id_category", preserveNullAndEmptyArrays: true } },
//         {
//           $lookup: {
//             from: "metals",
//             localField: "id_metal",
//             foreignField: "_id",
//             as: "id_metal",
//           },
//         },
//         { $unwind: { path: "$id_metal", preserveNullAndEmptyArrays: true } },
//         {
//           $lookup: {
//             from: "purities",
//             localField: "id_purity",
//             foreignField: "_id",
//             as: "id_purity",
//           },
//         },
//         { $unwind: { path: "$id_purity", preserveNullAndEmptyArrays: true } },
  
//         // S3 bucket settings lookup
//         {
//           $lookup: {
//             from: "s3bucketsettings",
//             localField: "id_branch._id",
//             foreignField: "id_branch",
//             as: "s3Details",
//           },
//         },
//         { $unwind: { path: "$s3Details", preserveNullAndEmptyArrays: true } },
  
//         ...(customerId ? [
//           {
//             $lookup: {
//               from: "wishlists",
//               let: { productId: "$_id" },
//               pipeline: [
//                 {
//                   $match: {
//                     $expr: {
//                       $and: [
//                         { $eq: ["$itemId", "$$productId"] },
//                         { $eq: ["$id_customer", new mongoose.Types.ObjectId(customerId)] }
//                       ]
//                     }
//                   }
//                 }
//               ],
//               as: "wishlistMatch"
//             }
//           },
//           {
//             $addFields: {
//               isWishlisted: {
//                 $gt: [{ $size: "$wishlistMatch" }, 0]
//               }
//             }
//           }
//         ] : [
//           {
//             $addFields: {
//               isWishlisted: false
//             }
//           }
//         ])
//       ];
  
//       // Search logic
//       if (searchOptions && searchOptions.term) {
//         const searchWords = searchOptions.term.split(/\s+|[()]/g).filter(word => word.length > 0);
//         const orConditions = [];
  
//         searchWords.forEach(word => {
//           const wordRegex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
  
//           orConditions.push(
//             { product_name: { $regex: wordRegex } },
//             { "id_branch.branch_name": { $regex: wordRegex } },
//             { "id_category.category_name": { $regex: wordRegex } },
//             { "id_metal.metal_name": { $regex: wordRegex } },
//             { "id_purity.purity_name": { $regex: wordRegex } }
//           );
//         });
  
//         if (!isNaN(searchOptions.term)) {
//           const numSearch = parseFloat(searchOptions.term);
//           orConditions.push({ weight: numSearch });
//         }
  
//         const momentDate = moment(searchOptions.term, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
//         if (momentDate.isValid()) {
//           const startOfDay = momentDate.startOf('day').toDate();
//           const endOfDay = momentDate.endOf('day').toDate();
  
//           orConditions.push({
//             createdAt: { $gte: startOfDay, $lte: endOfDay },
//           });
//         }
  
//         pipeline.push({
//           $match: { $or: orConditions },
//         });
//       }
  
//       pipeline.push(
//         { $skip: skip },
//         { $limit: limit },
//         {
//           $project: {
//             product_name: 1,
//             weight: 1,
//             createdAt: 1,
//             product_image: 1,
//             active: 1,
//             branchName: "$id_branch.branch_name",
//             metalName: "$id_metal.metal_name",
//             purityName: "$id_purity.purity_name",
//             isWishlisted: 1,
//             pathurl: {
//               $concat: [
//                 "$s3Details.s3display_url",
//                 `${config.AWS_LOCAL_PATH}products/`,
//               ],
//             },
//           },
//         }
//       );
  
//       const products = await ProductModel.aggregate(pipeline);
//       return products;
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   async countProduct(filter) {
//     return await ProductModel.countDocuments(filter);
//   }

//   async updateCount(id, count) {
//     try {
//       const countUpdate = await ProductModel.updateOne(
//         { _id: id },
//         { $set: { whatsapp_sent: count } }
//       );

//       if (countUpdate.modifiedCount > 0) {
//         return countUpdate;
//       }

//       return null;
//     } catch (error) {
//       console.error(error);
//     }
//   }
// }

// export default ProductRepository;


import ProductModel from "../../models/chit/productModel.js";
import categoryModel from "../../models/chit/categoryModel.js";
import mongoose from "mongoose";
import moment from "moment";

class ProductRepository {
  async findByName(product_name, id_branch, id) {
    try {
      const filter = {
        product_name: product_name,
        is_deleted: false,
        id_branch: id_branch,
      };

      if (id) {
        filter._id = { $ne: id };
      }

      const findProduct = await ProductModel.findOne(filter);

      if (!findProduct) return null;

      return {
        product_name: findProduct.product_name,
        _id: findProduct._id,
      };
    } catch (err) {
      throw new Error("Database error occurred while finding Product by name");
    }
  }

  async addProduct(productData) {
    try {
      const saveProduct = new ProductModel(productData);
      await saveProduct.save();
      return saveProduct;
    } catch (err) {
      console.error(err);

      throw new Error("Database error occurred while add product");
    }
  }

  async findByCode(code) {
    try {
      const findByCode = await ProductModel.find({ code, is_deleted: false });
      if (findByCode.length == 0) {
        return null;
      }
      return true;
    } catch (err) {
      throw new Error("Database error occurred while find product code");
    }
  }

  // async findById(id, customerId) {
  //   try {
  //     const isValidCustomerId =
  //       customerId && mongoose.Types.ObjectId.isValid(customerId);

  //     const userData = await ProductModel.aggregate([
  //       {
  //         $match: {
  //           _id: new mongoose.Types.ObjectId(id),
  //           is_deleted: false,
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "s3bucketsettings",
  //           localField: "id_branch",
  //           foreignField: "id_branch",
  //           as: "s3Details",
  //         },
  //       },
  //       { $unwind: "$s3Details" },
  //       {
  //         $lookup: {
  //           from: "categories",
  //           localField: "id_category",
  //           foreignField: "_id",
  //           as: "category",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "purities",
  //           localField: "id_purity",
  //           foreignField: "_id",
  //           as: "purityDetails",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "branches",
  //           localField: "id_branch",
  //           foreignField: "_id",
  //           as: "branches",
  //         },
  //       },
  //       { $unwind: "$branches" },
  //       ...(isValidCustomerId
  //         ? [
  //             {
  //               $lookup: {
  //                 from: "wishlists",
  //                 let: { productId: "$_id" },
  //                 pipeline: [
  //                   {
  //                     $match: {
  //                       $expr: {
  //                         $and: [
  //                           { $eq: ["$itemId", "$$productId"] },
  //                           {
  //                             $eq: [
  //                               "$id_customer",
  //                               new mongoose.Types.ObjectId(customerId),
  //                             ],
  //                           },
  //                         ],
  //                       },
  //                     },
  //                   },
  //                 ],
  //                 as: "wishlistMatch",
  //               },
  //             },
  //             {
  //               $addFields: {
  //                 isWishlisted: { $gt: [{ $size: "$wishlistMatch" }, 0] },
  //               },
  //             },
  //           ]
  //         : [
  //             {
  //               $addFields: { isWishlisted: false },
  //             },
  //           ]),
  //       {
  //         $lookup: {
  //           from: "metalrates",
  //           let: { metalId: "$id_metal", purityId: "$id_purity" },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: {
  //                   $and: [
  //                     { $eq: ["$material_type_id", "$$metalId"] },
  //                     { $eq: ["$purity_id", "$$purityId"] },
  //                   ],
  //                 },
  //               },
  //             },
  //             { $sort: { createdAt: -1 } },
  //             { $limit: 1 },
  //           ],
  //           as: "metalPriceInfo",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "stonedetails",
  //           localField: "stoneDetails",
  //           foreignField: "_id",
  //           as: "stoneDiamondDetails",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "stone_masters",
  //           localField: "stoneDiamondDetails.itemId",
  //           foreignField: "_id",
  //           as: "stonedetails.stoneInfo",
  //         },
  //       },
  //       {
  //         $unwind: {
  //           path: "$stonedetails.stoneInfo",
  //           preserveNullAndEmptyArrays: true,
  //         },
  //       },
  //       {
  //         $addFields: {
  //           latestMetalPrice: {
  //             $ifNull: [{ $arrayElemAt: ["$metalPriceInfo.rate", 0] }, 0],
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           baseMetalValue: {
  //             $multiply: [
  //               { $ifNull: ["$netWeight", 0] },
  //               { $ifNull: ["$latestMetalPrice", 0] },
  //             ],
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           rawMakingCharge: {
  //             $switch: {
  //               branches: [
  //                 {
  //                   case: { $eq: ["$makingCharges.mode", 1] },
  //                   then: { $ifNull: ["$makingCharges.actualValue", 0] },
  //                 },
  //                 {
  //                   case: { $eq: ["$makingCharges.mode", 2] },
  //                   then: {
  //                     $multiply: [
  //                       { $ifNull: ["$grossWt", 0] },
  //                       { $ifNull: ["$makingCharges.actualValue", 0] },
  //                     ],
  //                   },
  //                 },
  //               ],
  //               default: 0,
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           rawWastageCharge: {
  //             $switch: {
  //               branches: [
  //                 {
  //                   case: { $eq: ["$wastageCharges.mode", 1] },
  //                   then: { $ifNull: ["$wastageCharges.actualValue", 0] },
  //                 },
  //                 {
  //                   case: { $eq: ["$wastageCharges.mode", 2] },
  //                   then: {
  //                     $multiply: [
  //                       { $ifNull: ["$baseMetalValue", 0] },
  //                       {
  //                         $divide: [
  //                           { $ifNull: ["$wastageCharges.actualValue", 0] },
  //                           100,
  //                         ],
  //                       },
  //                     ],
  //                   },
  //                 },
  //               ],
  //               default: 0,
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           finalMakingCharge: {
  //             $round: [
  //               {
  //                 $subtract: [
  //                   { $ifNull: ["$rawMakingCharge", 0] },
  //                   { $ifNull: ["$makingCharges.discountedValue", 0] },
  //                 ],
  //               },
  //               2,
  //             ],
  //           },
  //           finalWastageCharge: {
  //             $round: [
  //               {
  //                 $subtract: [
  //                   { $ifNull: ["$rawWastageCharge", 0] },
  //                   { $ifNull: ["$wastageCharges.discountedValue", 0] },
  //                 ],
  //               },
  //               2,
  //             ],
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           diamondValue: {
  //             $sum: {
  //               $map: {
  //                 input: {
  //                   $filter: {
  //                     input: "$stoneDiamondDetails",
  //                     as: "sd",
  //                     cond: { $eq: ["$$sd.type", "diamond"] },
  //                   },
  //                 },
  //                 as: "diamond",
  //                 in: { $ifNull: ["$$diamond.price", 0] },
  //               },
  //             },
  //           },
  //           stoneValue: {
  //             $sum: {
  //               $map: {
  //                 input: {
  //                   $filter: {
  //                     input: "$stoneDiamondDetails",
  //                     as: "sd",
  //                     cond: { $eq: ["$$sd.type", "stone"] },
  //                   },
  //                 },
  //                 as: "stone",
  //                 in: { $ifNull: ["$$stone.price", 0] },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           discountedSubtotal: {
  //             $add: [
  //               { $ifNull: ["$baseMetalValue", 0] },
  //               { $ifNull: ["$finalWastageCharge", 0] },
  //               { $ifNull: ["$finalMakingCharge", 0] },
  //               { $ifNull: ["$diamondValue", 0] },
  //               { $ifNull: ["$stoneValue", 0] },
  //             ],
  //           },
  //           actualSubtotal: {
  //             $add: [
  //               { $ifNull: ["$baseMetalValue", 0] },
  //               { $ifNull: ["$rawWastageCharge", 0] },
  //               { $ifNull: ["$rawMakingCharge", 0] },
  //               { $ifNull: ["$diamondValue", 0] },
  //               { $ifNull: ["$stoneValue", 0] },
  //             ],
  //           },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "gstsettings",
  //           localField: "id_branch",
  //           foreignField: "id_branch",
  //           as: "gstInfo",
  //         },
  //       },
  //       {
  //         $addFields: {
  //           gstRate: {
  //             $ifNull: [{ $arrayElemAt: ["$gstInfo.rate", 0] }, 0],
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           discountedAmount: {
  //             $round: [
  //               {
  //                 $multiply: [
  //                   { $ifNull: ["$discountedSubtotal", 0] },
  //                   {
  //                     $add: [
  //                       1,
  //                       { $divide: [{ $ifNull: ["$gstRate", 0] }, 100] },
  //                     ],
  //                   },
  //                 ],
  //               },
  //               2,
  //             ],
  //           },
  //           totalAmount: {
  //             $round: [
  //               {
  //                 $multiply: [
  //                   { $ifNull: ["$actualSubtotal", 0] },
  //                   {
  //                     $add: [
  //                       1,
  //                       { $divide: [{ $ifNull: ["$gstRate", 0] }, 100] },
  //                     ],
  //                   },
  //                 ],
  //               },
  //               2,
  //             ],
  //           },
  //         },
  //       },
  //       {
  //         $project: {
  //           product_name: 1,
  //           description: 1,
  //           product_image: 1,
  //           id_category: 1,
  //           showprice: 1,
  //           id_branch: 1,
  //           subcategoryId: 1,
  //           categoryName: "$category.category_name",
  //           pathurl: {
  //             $concat: [
  //               "$s3Details.s3display_url",
  //               "aupay/webadmin/assets/products/",
  //             ],
  //           },
  //           isWishlisted: 1,
  //           totalAmount: 1,
  //           discountedAmount: 1,
  //           purityName: { $arrayElemAt: ["$purityDetails.purity_name", 0] },
  //           netWeight: "$netWeight",
  //           grossWeight: "$grossWt",
  //           sku: 1,
  //           availableSizes: 1,
  //           makingCharges: 1,
  //           wastageCharges: 1,
  //           latestMetalPrice: "$latestMetalPrice",
  //           stoneDetails:1,
  //           id_purity: 1,
  //           id_metal: 1,
  //           gst: "$gstRate",
  //           bestSeller:1,
  //           code:1,
  //           collection:1,
  //           netWeight:1,
  //           grossWt:1,
  //         },
  //       },
  //       { $limit: 1 },
  //     ]);

  //     return userData.length ? userData[0] : null;
  //   } catch (err) {
  //     console.error(err);
  //     throw new Error("Database error occurred while finding Product by id");
  //   }
  // }
  async findById(id, customerId) {
  try {
    const isValidCustomerId =
      customerId && mongoose.Types.ObjectId.isValid(customerId);

    const userData = await ProductModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          is_deleted: false,
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
      { $unwind: "$s3Details" },
      {
        $lookup: {
          from: "categories",
          localField: "id_category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "purities",
          localField: "id_purity",
          foreignField: "_id",
          as: "purityDetails",
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "id_branch",
          foreignField: "_id",
          as: "branches",
        },
      },
      { $unwind: "$branches" },
      ...(isValidCustomerId
        ? [
            {
              $lookup: {
                from: "wishlists",
                let: { productId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$itemId", "$$productId"] },
                          {
                            $eq: [
                              "$id_customer",
                              new mongoose.Types.ObjectId(customerId),
                            ],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "wishlistMatch",
              },
            },
            {
              $addFields: {
                isWishlisted: { $gt: [{ $size: "$wishlistMatch" }, 0] },
              },
            },
          ]
        : [
            {
              $addFields: { isWishlisted: false },
            },
          ]),
      {
        $lookup: {
          from: "metalrates",
          let: { metalId: "$id_metal", purityId: "$id_purity" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$material_type_id", "$$metalId"] },
                    { $eq: ["$purity_id", "$$purityId"] },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: "metalPriceInfo",
        },
      },
      // CORRECTED STONE DETAILS LOOKUP
      {
        $lookup: {
          from: "stonedetails",
          localField: "stoneDetails",
          foreignField: "_id",
          as: "stoneDiamondDetails",
        },
      },
      // Lookup stone master details for each stone detail
      {
        $unwind: {
          path: "$stoneDiamondDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "stone_masters",
          localField: "stoneDiamondDetails.itemId",
          foreignField: "_id",
          as: "stoneDiamondDetails.stoneInfo",
        },
      },
      {
        $unwind: {
          path: "$stoneDiamondDetails.stoneInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Group back the stone details into an array
      {
        $group: {
          _id: "$_id",
          root: { $first: "$$ROOT" },
          stoneDiamondDetails: { $push: "$stoneDiamondDetails" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$root",
              { stoneDiamondDetails: "$stoneDiamondDetails" },
            ],
          },
        },
      },
      // Continue with your existing calculations...
      {
        $addFields: {
          latestMetalPrice: {
            $ifNull: [{ $arrayElemAt: ["$metalPriceInfo.rate", 0] }, 0],
          },
        },
      },
      {
        $addFields: {
          baseMetalValue: {
            $multiply: [
              { $ifNull: ["$netWeight", 0] },
              { $ifNull: ["$latestMetalPrice", 0] },
            ],
          },
        },
      },
      {
        $addFields: {
          rawMakingCharge: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$makingCharges.mode", 1] },
                  then: { $ifNull: ["$makingCharges.actualValue", 0] },
                },
                {
                  case: { $eq: ["$makingCharges.mode", 2] },
                  then: {
                    $multiply: [
                      { $ifNull: ["$grossWt", 0] },
                      { $ifNull: ["$makingCharges.actualValue", 0] },
                    ],
                  },
                },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $addFields: {
          rawWastageCharge: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$wastageCharges.mode", 1] },
                  then: { $ifNull: ["$wastageCharges.actualValue", 0] },
                },
                {
                  case: { $eq: ["$wastageCharges.mode", 2] },
                  then: {
                    $multiply: [
                      { $ifNull: ["$baseMetalValue", 0] },
                      {
                        $divide: [
                          { $ifNull: ["$wastageCharges.actualValue", 0] },
                          100,
                        ],
                      },
                    ],
                  },
                },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $addFields: {
          finalMakingCharge: {
            $round: [
              {
                $subtract: [
                  { $ifNull: ["$rawMakingCharge", 0] },
                  { $ifNull: ["$makingCharges.discountedValue", 0] },
                ],
              },
              2,
            ],
          },
          finalWastageCharge: {
            $round: [
              {
                $subtract: [
                  { $ifNull: ["$rawWastageCharge", 0] },
                  { $ifNull: ["$wastageCharges.discountedValue", 0] },
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $addFields: {
          diamondValue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$stoneDiamondDetails",
                    as: "sd",
                    cond: { $eq: ["$$sd.type", "diamond"] },
                  },
                },
                as: "diamond",
                in: { $ifNull: ["$$diamond.price", 0] },
              },
            },
          },
          stoneValue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$stoneDiamondDetails",
                    as: "sd",
                    cond: { $eq: ["$$sd.type", "stone"] },
                  },
                },
                as: "stone",
                in: { $ifNull: ["$$stone.price", 0] },
              },
            },
          },
        },
      },
      // NEW: Add fields for total diamond and stone metrics
      {
        $addFields: {
          // Diamond totals
          totalDiamondWeight: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$stoneDiamondDetails",
                    as: "sd",
                    cond: { $eq: ["$$sd.type", "diamond"] },
                  },
                },
                as: "diamond",
                in: { $ifNull: ["$$diamond.weight", 0] },
              },
            },
          },
          totalDiamondCost: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$stoneDiamondDetails",
                    as: "sd",
                    cond: { $eq: ["$$sd.type", "diamond"] },
                  },
                },
                as: "diamond",
                in: { $ifNull: ["$$diamond.cost", 0] },
              },
            },
          },
          totalDiamondPrice: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$stoneDiamondDetails",
                    as: "sd",
                    cond: { $eq: ["$$sd.type", "diamond"] },
                  },
                },
                as: "diamond",
                in: { $ifNull: ["$$diamond.price", 0] },
              },
            },
          },
          totalDiamondCount: {
            $size: {
              $filter: {
                input: "$stoneDiamondDetails",
                as: "sd",
                cond: { $eq: ["$$sd.type", "diamond"] },
              },
            },
          },
          
          // Stone totals
          totalStoneWeight: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$stoneDiamondDetails",
                    as: "sd",
                    cond: { $eq: ["$$sd.type", "stone"] },
                  },
                },
                as: "stone",
                in: { $ifNull: ["$$stone.weight", 0] },
              },
            },
          },
          totalStoneCost: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$stoneDiamondDetails",
                    as: "sd",
                    cond: { $eq: ["$$sd.type", "stone"] },
                  },
                },
                as: "stone",
                in: { $ifNull: ["$$stone.cost", 0] },
              },
            },
          },
          totalStonePrice: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$stoneDiamondDetails",
                    as: "sd",
                    cond: { $eq: ["$$sd.type", "stone"] },
                  },
                },
                as: "stone",
                in: { $ifNull: ["$$stone.price", 0] },
              },
            },
          },
          totalStoneCount: {
            $size: {
              $filter: {
                input: "$stoneDiamondDetails",
                as: "sd",
                cond: { $eq: ["$$sd.type", "stone"] },
              },
            },
          },
          
          // Combined totals (both diamonds and stones)
          totalGemstoneWeight: {
            $sum: "$stoneDiamondDetails.weight"
          },
          totalGemstoneCost: {
            $sum: "$stoneDiamondDetails.cost"
          },
          totalGemstonePrice: {
            $sum: "$stoneDiamondDetails.price"
          },
          totalGemstoneCount: {
            $size: "$stoneDiamondDetails"
          },
        },
      },
      {
        $addFields: {
          discountedSubtotal: {
            $add: [
              { $ifNull: ["$baseMetalValue", 0] },
              { $ifNull: ["$finalWastageCharge", 0] },
              { $ifNull: ["$finalMakingCharge", 0] },
              { $ifNull: ["$diamondValue", 0] },
              { $ifNull: ["$stoneValue", 0] },
            ],
          },
          actualSubtotal: {
            $add: [
              { $ifNull: ["$baseMetalValue", 0] },
              { $ifNull: ["$rawWastageCharge", 0] },
              { $ifNull: ["$rawMakingCharge", 0] },
              { $ifNull: ["$diamondValue", 0] },
              { $ifNull: ["$stoneValue", 0] },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "gstsettings",
          localField: "id_branch",
          foreignField: "id_branch",
          as: "gstInfo",
        },
      },
      {
        $addFields: {
          gstRate: {
            $ifNull: [{ $arrayElemAt: ["$gstInfo.rate", 0] }, 0],
          },
        },
      },
      {
        $addFields: {
          discountedAmount: {
            $round: [
              {
                $multiply: [
                  { $ifNull: ["$discountedSubtotal", 0] },
                  {
                    $add: [
                      1,
                      { $divide: [{ $ifNull: ["$gstRate", 0] }, 100] },
                    ],
                  },
                ],
              },
              2,
            ],
          },
          totalAmount: {
            $round: [
              {
                $multiply: [
                  { $ifNull: ["$actualSubtotal", 0] },
                  {
                    $add: [
                      1,
                      { $divide: [{ $ifNull: ["$gstRate", 0] }, 100] },
                    ],
                  },
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $project: {
          product_name: 1,
          description: 1,
          product_image: 1,
          id_category: 1,
          showprice: 1,
          id_branch: 1,
          subcategoryId: 1,
          categoryName: "$category.category_name",
          pathurl: {
            $concat: [
              "$s3Details.s3display_url",
              "aupay/webadmin/assets/products/",
            ],
          },
          isWishlisted: 1,
          totalAmount: 1,
          discountedAmount: 1,
          purityName: { $arrayElemAt: ["$purityDetails.purity_name", 0] },
          netWeight: "$netWeight",
          grossWeight: "$grossWt",
          sku: 1,
          availableSizes: 1,
          makingCharges: 1,
          wastageCharges: 1,
          latestMetalPrice: "$latestMetalPrice",
          // stoneDetails: 1,
          // stoneDiamondDetails: {
          //   $map: {
          //     input: "$stoneDiamondDetails",
          //     as: "stoneDetail",
          //     in: {
          //       _id: "$$stoneDetail._id",
          //       type: "$$stoneDetail.type",
          //       itemId: "$$stoneDetail.itemId",
          //       weight: "$$stoneDetail.weight",
          //       cost: "$$stoneDetail.cost",
          //       price: "$$stoneDetail.price",
          //       stoneInfo: "$$stoneDetail.stoneInfo",
          //     },
          //   },
          // },
          totalDiamondWeight: 1,
          totalDiamondCost: 1,
          totalDiamondPrice: 1,
          totalDiamondCount: 1,
          totalStoneWeight: 1,
          totalStoneCost: 1,
          totalStonePrice: 1,
          totalStoneCount: 1,
          id_purity: 1,
          id_metal: 1,
          gst: "$gstRate",
          bestSeller: 1,
          code: 1,
          collection: 1,
          netWeight: 1,
          grossWt: 1,
        },
      },
      { $limit: 1 },
    ]);

    return userData.length ? userData[0] : null;
  } catch (err) {
    console.error(err);
    throw new Error("Database error occurred while finding Product by id");
  }
}

  async editProduct(productData, id) {
    try {
      const editProduct = await ProductModel.updateOne(
        { _id: id },
        { $set: productData }
      );
      if (editProduct.modifiedCount == 1) {
        return editProduct;
      } else {
        return null;
      }
    } catch (err) {
      console.log("wertyuiop",err)
      throw new Error("Database error occurred while editing Product");
    }
  }

  async deleteProduct(id) {
    try {
      const deleteProduct = await ProductModel.updateOne(
        { _id: id },
        { is_deleted: true }
      );
      if (deleteProduct.modifiedCount == 1) {
        return true;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error("Database error occurred while deleting Product");
    }
  }

  async changeStatus(id, status) {
    try {
      const updateStatus = await ProductModel.updateOne(
        { _id: id },
        { active: !status }
      );
      if (updateStatus.modifiedCount == 1) {
        return updateStatus;
      }
      return null;
    } catch (err) {
      throw new Error("Database error occurred while changing product status");
    }
  }

  async findByBranchId(id) {
    try {
      const productData = await ProductModel.find({
        id_branch: id,
        is_deleted: false,
        active: true,
      });
      if (productData.length >= 1) {
        return productData;
      }
      return null;
    } catch (err) {
      throw new Error("Database error occurred while get product by Branch");
    }
  }

  // async getProducts(filter, skip, limit, searchOptions, customerId = null) {
  //   try {
  //     const pipeline = [
  //       { $match: filter },
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
  //           from: "categories",
  //           localField: "id_category",
  //           foreignField: "_id",
  //           as: "id_category",
  //         },
  //       },
  //       { $unwind: { path: "$id_category", preserveNullAndEmptyArrays: true } },
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
  //           from: "purities",
  //           localField: "id_purity",
  //           foreignField: "_id",
  //           as: "id_purity",
  //         },
  //       },
  //       { $unwind: { path: "$id_purity", preserveNullAndEmptyArrays: true } },
  //       {
  //         $lookup: {
  //           from: "s3bucketsettings",
  //           localField: "id_branch._id",
  //           foreignField: "id_branch",
  //           as: "s3Details",
  //         },
  //       },
  //       { $unwind: { path: "$s3Details", preserveNullAndEmptyArrays: true } },

  //       ...(customerId
  //         ? [
  //             {
  //               $lookup: {
  //                 from: "wishlists",
  //                 let: { productId: "$_id" },
  //                 pipeline: [
  //                   {
  //                     $match: {
  //                       $expr: {
  //                         $and: [
  //                           { $eq: ["$itemId", "$$productId"] },
  //                           {
  //                             $eq: [
  //                               "$id_customer",
  //                               new mongoose.Types.ObjectId(customerId),
  //                             ],
  //                           },
  //                         ],
  //                       },
  //                     },
  //                   },
  //                 ],
  //                 as: "wishlistMatch",
  //               },
  //             },
  //             {
  //               $addFields: {
  //                 isWishlisted: {
  //                   $gt: [{ $size: "$wishlistMatch" }, 0],
  //                 },
  //               },
  //             },
  //           ]
  //         : [
  //             {
  //               $addFields: {
  //                 isWishlisted: false,
  //               },
  //             },
  //           ]),
  //     ];
  //     if (searchOptions && searchOptions.term) {
  //       const searchWords = searchOptions.term
  //         .split(/\s+|[()]/g)
  //         .filter((word) => word.length > 0);
  //       const orConditions = [];

  //       searchWords.forEach((word) => {
  //         const wordRegex = new RegExp(
  //           word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  //           "i"
  //         );

  //         orConditions.push(
  //           { product_name: { $regex: wordRegex } },
  //           { "id_branch.branch_name": { $regex: wordRegex } },
  //           { "id_category.category_name": { $regex: wordRegex } },
  //           { "id_metal.metal_name": { $regex: wordRegex } },
  //           { "id_purity.purity_name": { $regex: wordRegex } }
  //         );
  //       });

  //       if (!isNaN(searchOptions.term)) {
  //         const numSearch = parseFloat(searchOptions.term);
  //         orConditions.push({ weight: numSearch });
  //       }

  //       const momentDate = moment(
  //         searchOptions.term,
  //         ["DD/MM/YYYY", "YYYY-MM-DD"],
  //         true
  //       );
  //       if (momentDate.isValid()) {
  //         const startOfDay = momentDate.startOf("day").toDate();
  //         const endOfDay = momentDate.endOf("day").toDate();

  //         orConditions.push({
  //           createdAt: { $gte: startOfDay, $lte: endOfDay },
  //         });
  //       }

  //       pipeline.push({
  //         $match: { $or: orConditions },
  //       });
  //     }

  //     pipeline.push(
  //       { $skip: skip },
  //       { $limit: limit },
  //       {
  //         $project: {
  //           product_name: 1,
  //           weight: 1,
  //           createdAt: 1,
  //           product_image: 1,
  //           active: 1,
  //           bestSeller: "$bestSeller",
  //           branchName: "$id_branch.branch_name",
  //           metalName: "$id_metal.metal_name",
  //           purityName: "$id_purity.purity_name",
  //           isWishlisted: 1,
  //           weight: "$quantity",
  //           pathurl: {
  //             $concat: [
  //               "$s3Details.s3display_url",
  //               "aupay/webadmin/assets/products/",
  //             ],
  //           },
  //         },
  //       }
  //     );

  //     const products = await ProductModel.aggregate(pipeline);
  //     return products;
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }
  async getProducts(filter, skip, limit, searchOptions, customerId = null) {
  try {
    const pipeline = [
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
          from: "categories",
          localField: "id_category",
          foreignField: "_id",
          as: "id_category",
        },
      },
      { $unwind: { path: "$id_category", preserveNullAndEmptyArrays: true } },
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
          from: "purities",
          localField: "id_purity",
          foreignField: "_id",
          as: "id_purity",
        },
      },
      { $unwind: { path: "$id_purity", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "s3bucketsettings",
          localField: "id_branch._id",
          foreignField: "id_branch",
          as: "s3Details",
        },
      },
      { $unwind: { path: "$s3Details", preserveNullAndEmptyArrays: true } },

      // Price Calculation Pipeline
      {
        $lookup: {
          from: "metalrates",
          let: { metalId: "$id_metal._id", purityId: "$id_purity._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$material_type_id", "$$metalId"] },
                    { $eq: ["$purity_id", "$$purityId"] },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: "metalPriceInfo",
        },
      },
      {
        $lookup: {
          from: "stonedetails",
          localField: "stoneDetails",
          foreignField: "_id",
          as: "stoneDiamondDetails",
        },
      },
      {
        $lookup: {
          from: "gstsettings",
          localField: "id_branch._id",
          foreignField: "id_branch",
          as: "gstInfo",
        },
      },
      {
        $addFields: {
          latestMetalPrice: {
            $ifNull: [{ $arrayElemAt: ["$metalPriceInfo.rate", 0] }, 0],
          },
          netWeight: {
            $ifNull: ["$netWeight", "$grossWt"],
          },
          gstRate: {
            $ifNull: [{ $arrayElemAt: ["$gstInfo.rate", 0] }, 0],
          },
        },
      },
      {
        $addFields: {
          baseMetalValue: {
            $multiply: [
              { $ifNull: ["$netWeight", 0] },
              { $ifNull: ["$latestMetalPrice", 0] },
            ],
          },
        },
      },
      {
        $addFields: {
          rawMakingCharge: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$makingCharges.mode", 1] },
                  then: { $ifNull: ["$makingCharges.actualValue", 0] },
                },
                {
                  case: { $eq: ["$makingCharges.mode", 2] },
                  then: {
                    $multiply: [
                      { $ifNull: ["$grossWt", 0] },
                      { $ifNull: ["$makingCharges.actualValue", 0] },
                    ],
                  },
                },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $addFields: {
          finalMakingCharge: {
            $round: [
              {
                $subtract: [
                  { $ifNull: ["$rawMakingCharge", 0] },
                  { $ifNull: ["$makingCharges.discountedValue", 0] },
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $addFields: {
          rawWastageCharge: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$wastageCharges.mode", 1] },
                  then: { $ifNull: ["$wastageCharges.actualValue", 0] },
                },
                {
                  case: { $eq: ["$wastageCharges.mode", 2] },
                  then: {
                    $multiply: [
                      { $ifNull: ["$baseMetalValue", 0] },
                      {
                        $divide: [
                          { $ifNull: ["$wastageCharges.actualValue", 0] },
                          100,
                        ],
                      },
                    ],
                  },
                },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $addFields: {
          finalWastageCharge: {
            $round: [
              {
                $subtract: [
                  { $ifNull: ["$rawWastageCharge", 0] },
                  { $ifNull: ["$wastageCharges.discountedValue", 0] },
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $addFields: {
          diamondValue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$stoneDiamondDetails",
                    as: "sd",
                    cond: { $eq: ["$$sd.type", "diamond"] },
                  },
                },
                as: "diamond",
                in: { $ifNull: ["$$diamond.price", 0] },
              },
            },
          },
          stoneValue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$stoneDiamondDetails",
                    as: "sd",
                    cond: { $eq: ["$$sd.type", "stone"] },
                  },
                },
                as: "stone",
                in: { $ifNull: ["$$stone.price", 0] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          discountedSubtotal: {
            $add: [
              { $ifNull: ["$baseMetalValue", 0] },
              { $ifNull: ["$finalWastageCharge", 0] },
              { $ifNull: ["$finalMakingCharge", 0] },
              { $ifNull: ["$diamondValue", 0] },
              { $ifNull: ["$stoneValue", 0] },
            ],
          },
          actualSubtotal: {
            $add: [
              { $ifNull: ["$baseMetalValue", 0] },
              { $ifNull: ["$rawWastageCharge", 0] },
              { $ifNull: ["$rawMakingCharge", 0] },
              { $ifNull: ["$diamondValue", 0] },
              { $ifNull: ["$stoneValue", 0] },
            ],
          },
        },
      },
      {
        $addFields: {
          discountedAmount: {
            $round: [
              {
                $multiply: [
                  { $ifNull: ["$discountedSubtotal", 0] },
                  {
                    $add: [
                      1,
                      { $divide: [{ $ifNull: ["$gstRate", 0] }, 100] },
                    ],
                  },
                ],
              },
              2,
            ],
          },
          totalAmount: {
            $round: [
              {
                $multiply: [
                  { $ifNull: ["$actualSubtotal", 0] },
                  {
                    $add: [
                      1,
                      { $divide: [{ $ifNull: ["$gstRate", 0] }, 100] },
                    ],
                  },
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $addFields: {
          discountDifference: {
            $round: [
              {
                $subtract: [
                  { $ifNull: ["$totalAmount", 0] },
                  { $ifNull: ["$discountedAmount", 0] },
                ],
              },
              2,
            ],
          },
          discountPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          { $ifNull: ["$totalAmount", 0] },
                          { $ifNull: ["$discountedAmount", 0] },
                        ],
                      },
                      { $max: [{ $ifNull: ["$totalAmount", 1] }, 1] },
                    ],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },

      ...(customerId
        ? [
            {
              $lookup: {
                from: "wishlists",
                let: { productId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$itemId", "$$productId"] },
                          {
                            $eq: [
                              "$id_customer",
                              new mongoose.Types.ObjectId(customerId),
                            ],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "wishlistMatch",
              },
            },
            {
              $addFields: {
                isWishlisted: {
                  $gt: [{ $size: "$wishlistMatch" }, 0],
                },
              },
            },
          ]
        : [
            {
              $addFields: {
                isWishlisted: false,
              },
            },
          ]),
    ];

    if (searchOptions && searchOptions.term) {
      const searchWords = searchOptions.term
        .split(/\s+|[()]/g)
        .filter((word) => word.length > 0);
      const orConditions = [];

      searchWords.forEach((word) => {
        const wordRegex = new RegExp(
          word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );

        orConditions.push(
          { product_name: { $regex: wordRegex } },
          { "id_branch.branch_name": { $regex: wordRegex } },
          { "id_category.category_name": { $regex: wordRegex } },
          { "id_metal.metal_name": { $regex: wordRegex } },
          { "id_purity.purity_name": { $regex: wordRegex } }
        );
      });

      if (!isNaN(searchOptions.term)) {
        const numSearch = parseFloat(searchOptions.term);
        orConditions.push({ weight: numSearch });
      }

      const momentDate = moment(
        searchOptions.term,
        ["DD/MM/YYYY", "YYYY-MM-DD"],
        true
      );
      if (momentDate.isValid()) {
        const startOfDay = momentDate.startOf("day").toDate();
        const endOfDay = momentDate.endOf("day").toDate();

        orConditions.push({
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        });
      }

      pipeline.push({
        $match: { $or: orConditions },
      });
    }

    pipeline.push(
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          product_name: 1,
          weight: 1,
          createdAt: 1,
          product_image: 1,
          active: 1,
          bestSeller: "$bestSeller",
          branchName: "$id_branch.branch_name",
          metalName: "$id_metal.metal_name",
          purityName: "$id_purity.purity_name",
          isWishlisted: 1,
          weight: "$quantity",
          totalAmount: 1,
          discountedAmount: 1,
          discountDifference: 1,
          pathurl: {
            $concat: [
              "$s3Details.s3display_url",
              "aupay/webadmin/assets/products/",
            ],
          },
        },
      }
    );

    const products = await ProductModel.aggregate(pipeline);
    return products;
  } catch (err) {
    console.error(err);
    throw new Error("Database error occurred while fetching products");
  }
}

  async countProduct(filter) {
    return await ProductModel.countDocuments(filter);
  }

  async updateCount(id, count) {
    try {
      const countUpdate = await ProductModel.updateOne(
        { _id: id },
        { $set: { whatsapp_sent: count } }
      );

      if (countUpdate.modifiedCount > 0) {
        return countUpdate;
      }

      return null;
    } catch (error) {
      console.error(error);
    }
  }

  async getProductBySubcategory(subcategory, page, limit, userId, filters) {
    try {
      const skip = (page - 1) * limit;
      const sortOption = filters?.sort || { createdAt: -1 };
      const priceFilter = filters?.priceFilter || {};

      const aggregationPipeline = [
        {
          $match: {
            subcategoryId: subcategory,
            active: true,
            is_deleted: false,
          },
        },
        {
          $lookup: {
            from: "wishlists",
            let: {
              productId: "$_id",
              customerId: userId ? { $toString: userId } : null,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: [
                          "$id_customer",
                          new mongoose.Types.ObjectId(userId),
                        ],
                      },
                      { $eq: ["$itemId", "$$productId"] },
                    ],
                  },
                },
              },
            ],
            as: "wishlistInfo",
          },
        },
        {
          $addFields: {
            isWishlist: { $gt: [{ $size: "$wishlistInfo" }, 0] },
          },
        },
        {
          $lookup: {
            from: "metalrates",
            let: { metalId: "$id_metal", purityId: "$id_purity" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$material_type_id", "$$metalId"] },
                      { $eq: ["$purity_id", "$$purityId"] },
                    ],
                  },
                },
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
            ],
            as: "metalPriceInfo",
          },
        },
        {
          $lookup: {
            from: "stonedetails",
            localField: "stoneDetails",
            foreignField: "_id",
            as: "stoneDiamondDetails",
          },
        },
        {
          $lookup: {
            from: "gstsettings",
            localField: "id_branch",
            foreignField: "id_branch",
            as: "gstInfo",
          },
        },
        {
          $addFields: {
            latestMetalPrice: {
              $ifNull: [{ $arrayElemAt: ["$metalPriceInfo.rate", 0] }, 0],
            },
            netWeight: {
              $ifNull: ["$netWeight", "$grossWt"],
            },
            gstRate: {
              $ifNull: [{ $arrayElemAt: ["$gstInfo.rate", 0] }, 0],
            },
          },
        },
        {
          $addFields: {
            baseMetalValue: {
              $multiply: [
                { $ifNull: ["$netWeight", 0] },
                { $ifNull: ["$latestMetalPrice", 0] },
              ],
            },
          },
        },
        {
          $addFields: {
            rawMakingCharge: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$makingCharges.mode", 1] },
                    then: { $ifNull: ["$makingCharges.actualValue", 0] },
                  },
                  {
                    case: { $eq: ["$makingCharges.mode", 2] },
                    then: {
                      $multiply: [
                        { $ifNull: ["$grossWt", 0] },
                        { $ifNull: ["$makingCharges.actualValue", 0] },
                      ],
                    },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            finalMakingCharge: {
              $round: [
                {
                  $subtract: [
                    { $ifNull: ["$rawMakingCharge", 0] },
                    { $ifNull: ["$makingCharges.discountedValue", 0] },
                  ],
                },
                2,
              ],
            },
          },
        },
        {
          $addFields: {
            rawWastageCharge: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$wastageCharges.mode", 1] },
                    then: { $ifNull: ["$wastageCharges.actualValue", 0] },
                  },
                  {
                    case: { $eq: ["$wastageCharges.mode", 2] },
                    then: {
                      $multiply: [
                        { $ifNull: ["$baseMetalValue", 0] },
                        {
                          $divide: [
                            { $ifNull: ["$wastageCharges.actualValue", 0] },
                            100,
                          ],
                        },
                      ],
                    },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            finalWastageCharge: {
              $round: [
                {
                  $subtract: [
                    { $ifNull: ["$rawWastageCharge", 0] },
                    { $ifNull: ["$wastageCharges.discountedValue", 0] },
                  ],
                },
                2,
              ],
            },
          },
        },
        {
          $addFields: {
            diamondValue: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$stoneDiamondDetails",
                      as: "sd",
                      cond: { $eq: ["$$sd.type", "diamond"] },
                    },
                  },
                  as: "diamond",
                  in: { $ifNull: ["$$diamond.price", 0] },
                },
              },
            },
            stoneValue: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$stoneDiamondDetails",
                      as: "sd",
                      cond: { $eq: ["$$sd.type", "stone"] },
                    },
                  },
                  as: "stone",
                  in: { $ifNull: ["$$stone.price", 0] },
                },
              },
            },
          },
        },
        {
          $addFields: {
            discountedSubtotal: {
              $add: [
                { $ifNull: ["$baseMetalValue", 0] },
                { $ifNull: ["$finalWastageCharge", 0] },
                { $ifNull: ["$finalMakingCharge", 0] },
                { $ifNull: ["$diamondValue", 0] },
                { $ifNull: ["$stoneValue", 0] },
              ],
            },
            actualSubtotal: {
              $add: [
                { $ifNull: ["$baseMetalValue", 0] },
                { $ifNull: ["$rawWastageCharge", 0] },
                { $ifNull: ["$rawMakingCharge", 0] },
                { $ifNull: ["$diamondValue", 0] },
                { $ifNull: ["$stoneValue", 0] },
              ],
            },
          },
        },
        {
          $addFields: {
            discountedAmount: {
              $round: [
                {
                  $multiply: [
                    { $ifNull: ["$discountedSubtotal", 0] },
                    {
                      $add: [
                        1,
                        { $divide: [{ $ifNull: ["$gstRate", 0] }, 100] },
                      ],
                    },
                  ],
                },
                2,
              ],
            },
            totalAmount: {
              $round: [
                {
                  $multiply: [
                    { $ifNull: ["$actualSubtotal", 0] },
                    {
                      $add: [
                        1,
                        { $divide: [{ $ifNull: ["$gstRate", 0] }, 100] },
                      ],
                    },
                  ],
                },
                2,
              ],
            },
          },
        },
        {
          $addFields: {
            discountDifference: {
              $round: [
                {
                  $subtract: [
                    { $ifNull: ["$totalAmount", 0] },
                    { $ifNull: ["$discountedAmount", 0] },
                  ],
                },
                2,
              ],
            },
            discountPercentage: {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $subtract: [
                            { $ifNull: ["$totalAmount", 0] },
                            { $ifNull: ["$discountedAmount", 0] },
                          ],
                        },
                        { $max: [{ $ifNull: ["$totalAmount", 1] }, 1] },
                      ],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
          },
        },
        ...(Object.keys(priceFilter).length > 0
          ? [{ $match: priceFilter }]
          : []),
        { $sort: sortOption },
        {
          $facet: {
            metadata: [{ $count: "totalCount" }],
            products: [
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  _id: 1,
                  product_name: 1,
                  product_image: 1,
                  isWishlist: 1,
                  totalAmount: 1,
                  discountedAmount: 1,
                  baseMetalValue: 1,
                  latestMetalPrice: 1,
                  netWeight: 1,
                  bestSeller: 1,
                },
              },
            ],
          },
        },
        { $unwind: { path: "$metadata", preserveNullAndEmptyArrays: true } },
      ];

      const result = await ProductModel.aggregate(aggregationPipeline);

      const products = result[0]?.products || [];
      const totalCount = result[0]?.metadata?.totalCount || 0;

      return {
        products,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      };
    } catch (error) {
      console.error("Error in getProductBySubcategory:", error);
      throw new Error("Error fetching products by subcategory");
    }
  }

  async getProductByCategory(category, page, limit, userId, filters) {
  try {
    const skip = (page - 1) * limit;
    const sortOption = filters?.sort || { createdAt: -1 };
    const priceFilter = filters?.priceFilter || {};

    const aggregationPipeline = [
      { $match: { id_category: category, active: true, is_deleted: false } },
      {
        $lookup: {
          from: "wishlists",
          let: {
            productId: "$_id",
            customerId: userId ? { $toString: userId } : null,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$id_customer",
                        new mongoose.Types.ObjectId(userId),
                      ],
                    },
                    { $eq: ["$itemId", "$$productId"] },
                  ],
                },
              },
            },
          ],
          as: "wishlistInfo",
        },
      },
      {
        $addFields: {
          isWishlist: { $gt: [{ $size: "$wishlistInfo" }, 0] },
        },
      },
      {
        $lookup: {
          from: "metalrates",
          let: { metalId: "$id_metal", purityId: "$id_purity" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$material_type_id", "$$metalId"] },
                    { $eq: ["$purity_id", "$$purityId"] },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: "metalPriceInfo",
        },
      },
      {
        $lookup: {
          from: "stonedetails",
          localField: "stoneDetails",
          foreignField: "_id",
          as: "stoneDiamondDetails",
        },
      },
      {
        $lookup: {
          from: "gstsettings",
          localField: "id_branch",
          foreignField: "id_branch",
          as: "gstInfo",
        },
      },
      {
        $addFields: {
          latestMetalPrice: {
            $ifNull: [{ $arrayElemAt: ["$metalPriceInfo.rate", 0] }, 0],
          },
          netWeight: {
            $ifNull: ["$netWeight", "$grossWt"],
          },
          gstRate: {
            $ifNull: [{ $arrayElemAt: ["$gstInfo.rate", 0] }, 0],
          },
        },
      },
      {
        $addFields: {
          baseMetalValue: {
            $multiply: [
              { $ifNull: ["$netWeight", 0] },
              { $ifNull: ["$latestMetalPrice", 0] },
            ],
          },
        },
      },
      {
        $addFields: {
          rawMakingCharge: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$makingCharges.mode", 1] },
                  then: { $ifNull: ["$makingCharges.actualValue", 0] },
                },
                {
                  case: { $eq: ["$makingCharges.mode", 2] },
                  then: {
                    $multiply: [
                      { $ifNull: ["$grossWt", 0] },
                      { $ifNull: ["$makingCharges.actualValue", 0] },
                    ],
                  },
                },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $addFields: {
          finalMakingCharge: {
            $round: [
              {
                $subtract: [
                  { $ifNull: ["$rawMakingCharge", 0] },
                  { $ifNull: ["$makingCharges.discountedValue", 0] },
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $addFields: {
          rawWastageCharge: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$wastageCharges.mode", 1] },
                  then: { $ifNull: ["$wastageCharges.actualValue", 0] },
                },
                {
                  case: { $eq: ["$wastageCharges.mode", 2] },
                  then: {
                    $multiply: [
                      { $ifNull: ["$baseMetalValue", 0] },
                      {
                        $divide: [
                          { $ifNull: ["$wastageCharges.actualValue", 0] },
                          100,
                        ],
                      },
                    ],
                  },
                },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $addFields: {
          finalWastageCharge: {
            $round: [
              {
                $subtract: [
                  { $ifNull: ["$rawWastageCharge", 0] },
                  { $ifNull: ["$wastageCharges.discountedValue", 0] },
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $addFields: {
          diamondValue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$stoneDiamondDetails",
                    as: "sd",
                    cond: { $eq: ["$$sd.type", "diamond"] },
                  },
                },
                as: "diamond",
                in: { $ifNull: ["$$diamond.price", 0] },
              },
            },
          },
          stoneValue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$stoneDiamondDetails",
                    as: "sd",
                    cond: { $eq: ["$$sd.type", "stone"] },
                  },
                },
                as: "stone",
                in: { $ifNull: ["$$stone.price", 0] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          discountedSubtotal: {
            $add: [
              { $ifNull: ["$baseMetalValue", 0] },
              { $ifNull: ["$finalWastageCharge", 0] },
              { $ifNull: ["$finalMakingCharge", 0] },
              { $ifNull: ["$diamondValue", 0] },
              { $ifNull: ["$stoneValue", 0] },
            ],
          },
          actualSubtotal: {
            $add: [
              { $ifNull: ["$baseMetalValue", 0] },
              { $ifNull: ["$rawWastageCharge", 0] },
              { $ifNull: ["$rawMakingCharge", 0] },
              { $ifNull: ["$diamondValue", 0] },
              { $ifNull: ["$stoneValue", 0] },
            ],
          },
        },
      },
      {
        $addFields: {
          discountedAmount: {
            $round: [
              {
                $multiply: [
                  { $ifNull: ["$discountedSubtotal", 0] },
                  {
                    $add: [
                      1,
                      { $divide: [{ $ifNull: ["$gstRate", 0] }, 100] },
                    ],
                  },
                ],
              },
              2,
            ],
          },
          totalAmount: {
            $round: [
              {
                $multiply: [
                  { $ifNull: ["$actualSubtotal", 0] },
                  {
                    $add: [
                      1,
                      { $divide: [{ $ifNull: ["$gstRate", 0] }, 100] },
                    ],
                  },
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $addFields: {
          discountDifference: {
            $round: [
              {
                $subtract: [
                  { $ifNull: ["$totalAmount", 0] },
                  { $ifNull: ["$discountedAmount", 0] },
                ],
              },
              2,
            ],
          },
          discountPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          { $ifNull: ["$totalAmount", 0] },
                          { $ifNull: ["$discountedAmount", 0] },
                        ],
                      },
                      { $max: [{ $ifNull: ["$totalAmount", 1] }, 1] },
                    ],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
      ...(Object.keys(priceFilter).length > 0
        ? [{ $match: priceFilter }]
        : []),
      { $sort: sortOption },
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          products: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                product_name: 1,
                product_image: 1,
                isWishlist: 1,
                totalAmount: 1,
                discountedAmount: 1,
                bestSeller:1
              },
            },
          ],
        },
      },
      { 
        $unwind: { 
          path: "$metadata", 
          preserveNullAndEmptyArrays: true 
        } 
      },
    ];

    const result = await ProductModel.aggregate(aggregationPipeline);

    const products = result[0]?.products || [];
    const totalCount = result[0]?.metadata?.totalCount || 0;

    return {
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      hasNext: page < Math.ceil(totalCount / limit),
      hasPrev: page > 1,
    };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw new Error("Error fetching products by category");
  }
}

  async getCategoryByCollectionId(id) {
    try {
      const categoryIds = await ProductModel.distinct("id_category", {
        collection: { $in: [id] },
        active: true,
        is_deleted: false,
      });

      if (!categoryIds || categoryIds.length === 0) {
        return null;
      }

      const categories = await categoryModel
        .find(
          { _id: { $in: categoryIds } },
          { _id: 1, category_name: 1, image: 1, pathUrl: 1 }
        )
        .lean();

      return categories;
    } catch (error) {
      console.error("Error in getCategoryByCollectionId:", error);
      throw error;
    }
  }

  async getProductStockReport(page, limit,filter={}) {
    try {
      const skip = (page - 1) * limit;

      
       const query = {
      active: true,
      is_deleted: false,
      ...filter
    };
      // Get total count first
      const totalCount = await ProductModel.countDocuments(query);
  
      // Get products with pagination and populate category
      const products = await ProductModel.find(query)
      .populate('id_category', 'category_name')
      .select('product_name sku code id_category quantity availableSizes')
      .skip(skip)
      .limit(limit)
      .lean();
  
      // Format the response
      const formattedProducts = products.map((product) => {
        let totalStock = product.quantity || 0;
        let sizeDetails = [];

        if (product.availableSizes && product.availableSizes.values) {
          // totalStock = product.availableSizes.values.reduce((sum, size) => sum + (size.quantity || 0), 0);
          sizeDetails = product.availableSizes.values.map((size) => ({
            sizeValue: size.sizeValue,
            quantity: size.quantity,
          }));
        }

        return {
          _id: product._id,
          product_name: product.product_name,
          sku: product.sku,
          category_name: product.id_category?.category_name || "N/A",
          size: sizeDetails,
          stock: sizeDetails,
          total_stock: totalStock,
        };
      });

      const totalPages = Math.ceil(totalCount / limit);

      return {
        products: formattedProducts,
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      console.error("Error in getProductStockReport:", error);
      throw error;
    }
  }

  async toggleBestSeller(id, currentstatus) {
    try {
      const updateStatus = await ProductModel.updateOne(
        { _id: id },
        { bestSeller: !currentstatus }
      );
      if (updateStatus.modifiedCount == 1) {
        return updateStatus;
      }
      return null;
    } catch (err) {
      console.error(err);
      throw new Error("Database error occurred while changing product status");
    }
  }

//   async allProductsData(filter, skip, limit, searchOptions, customerId = null) {
//     try {
//       console.log("Filter received in allProductsData:", filter,search);
//       const pipeline = [
//         { $match: filter },
//         {
//           $lookup: {
//             from: "branches",
//             localField: "id_branch",
//             foreignField: "_id",
//             as: "id_branch",
//           },
//         },
//         { $unwind: { path: "$id_branch", preserveNullAndEmptyArrays: true } },
//         {
//           $lookup: {
//             from: "categories",
//             localField: "id_category",
//             foreignField: "_id",
//             as: "id_category",
//           },
//         },
//         { $unwind: { path: "$id_category", preserveNullAndEmptyArrays: true } },
// {
//   $lookup: {
//     from: "subcategories",
//     localField: "subcategoryId",
//     foreignField: "_id",
//     as: "subcategory"
//   }
// },
// { $unwind: { path: "$subcategory", preserveNullAndEmptyArrays: true } },

// // Collection lookup
// {
//   $lookup: {
//     from: "collections",
//     localField: "collection",
//     foreignField: "_id",
//     as: "collectionData"
//   }
// },
// { $unwind: { path: "$collectionData", preserveNullAndEmptyArrays: true } },
//         {
//           $lookup: {
//             from: "metals",
//             localField: "id_metal",
//             foreignField: "_id",
//             as: "id_metal",
//           },
//         },
//         { $unwind: { path: "$id_metal", preserveNullAndEmptyArrays: true } },
//         {
//           $lookup: {
//             from: "purities",
//             localField: "id_purity",
//             foreignField: "_id",
//             as: "id_purity",
//           },
//         },
//         { $unwind: { path: "$id_purity", preserveNullAndEmptyArrays: true } },
//         {
//           $lookup: {
//             from: "s3bucketsettings",
//             localField: "id_branch._id",
//             foreignField: "id_branch",
//             as: "s3Details",
//           },
//         },
//         { $unwind: { path: "$s3Details", preserveNullAndEmptyArrays: true } },

//         ...(customerId
//           ? [
//               {
//                 $lookup: {
//                   from: "wishlists",
//                   let: { productId: "$_id" },
//                   pipeline: [
//                     {
//                       $match: {
//                         $expr: {
//                           $and: [
//                             { $eq: ["$itemId", "$$productId"] },
//                             {
//                               $eq: [
//                                 "$id_customer",
//                                 new mongoose.Types.ObjectId(customerId),
//                               ],
//                             },
//                           ],
//                         },
//                       },
//                     },
//                   ],
//                   as: "wishlistMatch",
//                 },
//               },
//               {
//                 $addFields: {
//                   isWishlisted: {
//                     $gt: [{ $size: "$wishlistMatch" }, 0],
//                   },
//                 },
//               },
//             ]
//           : [
//               {
//                 $addFields: {
//                   isWishlisted: false,
//                 },
//               },
//             ]),
//       ];
//       if (searchOptions && searchOptions.term) {
//         const searchWords = searchOptions.term
//           .split(/\s+|[()]/g)
//           .filter((word) => word.length > 0);
//         const orConditions = [];

//         searchWords.forEach((word) => {
//           const wordRegex = new RegExp(
//             word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
//             "i"
//           );

//           orConditions.push(
//             { product_name: { $regex: wordRegex } },
//             { description: { $regex: wordRegex } },
//             { code: { $regex: wordRegex } },
//             { sku: { $regex: wordRegex } },
//             { "id_branch.branch_name": { $regex: wordRegex } },
//             { "id_category.category_name": { $regex: wordRegex } },
//             { "subcategory.name": { $regex: wordRegex } }, // after lookup
//             { "id_metal.metal_name": { $regex: wordRegex } },
//             { "id_purity.purity_name": { $regex: wordRegex } },
//             { "collectionData.name": { $regex: wordRegex } }, // after lookup
//             { "stoneDetails.stoneName": { $regex: wordRegex } }
//           );
//         });

//         if (!isNaN(searchOptions.term)) {
//           const numSearch = parseFloat(searchOptions.term);
//           orConditions.push({ weight: numSearch });
//         }

//         const momentDate = moment(
//           searchOptions.term,
//           ["DD/MM/YYYY", "YYYY-MM-DD"],
//           true
//         );
//         if (momentDate.isValid()) {
//           const startOfDay = momentDate.startOf("day").toDate();
//           const endOfDay = momentDate.endOf("day").toDate();

//           orConditions.push({
//             createdAt: { $gte: startOfDay, $lte: endOfDay },
//           });
//         }

//         pipeline.push({
//           $match: { $or: orConditions },
//         });
//       }

//       pipeline.push(
//         { $skip: skip },
//         { $limit: limit },
//         {
//           $project: {
//             product_name: 1,
//             weight: 1,
//             createdAt: 1,
//             product_image: 1,
//             active: 1,
//             bestSeller: "$bestSeller",
//             branchName: "$id_branch.branch_name",
//             metalName: "$id_metal.metal_name",
//             purityName: "$id_purity.purity_name",
//             isWishlisted: 1,
//             weight: "$quantity",
//             pathurl: {
//               $concat: [
//                 "$s3Details.s3display_url",
//                 "aupay/webadmin/assets/products/",
//               ],
//             },
//           },
//         }
//       );

//       const products = await ProductModel.aggregate(pipeline);
//       return products;
//     } catch (err) {
//       console.error(err);
//     }
//   }
async allProductsData(filter, skip, limit, searchOptions, customerId = null) {
  try {
    console.log("Filter received in allProductsData:", filter, searchOptions);
    
    const pipeline = [
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
          from: "categories",
          localField: "id_category",
          foreignField: "_id",
          as: "id_category",
        },
      },
      { $unwind: { path: "$id_category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "subcategories",
          localField: "subcategoryId",
          foreignField: "_id",
          as: "subcategory"
        }
      },
      { $unwind: { path: "$subcategory", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "collections",
          localField: "collection",
          foreignField: "_id",
          as: "collectionData"
        }
      },
      { $unwind: { path: "$collectionData", preserveNullAndEmptyArrays: true } },
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
          from: "purities",
          localField: "id_purity",
          foreignField: "_id",
          as: "id_purity",
        },
      },
      { $unwind: { path: "$id_purity", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "s3bucketsettings",
          localField: "id_branch._id",
          foreignField: "id_branch",
          as: "s3Details",
        },
      },
      { $unwind: { path: "$s3Details", preserveNullAndEmptyArrays: true } },

      ...(customerId
        ? [
            {
              $lookup: {
                from: "wishlists",
                let: { productId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$itemId", "$$productId"] },
                          {
                            $eq: [
                              "$id_customer",
                              new mongoose.Types.ObjectId(customerId),
                            ],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "wishlistMatch",
              },
            },
            {
              $addFields: {
                isWishlisted: {
                  $gt: [{ $size: "$wishlistMatch" }, 0],
                },
              },
            },
          ]
        : [
            {
              $addFields: {
                isWishlisted: false,
              },
            },
          ]),
    ];

    if (searchOptions && searchOptions.term) {
      const searchTerm = searchOptions.term.trim();
      
      const searchRegex = new RegExp(
        searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      const numericSearch = !isNaN(searchTerm) ? parseFloat(searchTerm) : null;

      const searchConditions = [];
      
      if (searchTerm.length > 0) {
        searchConditions.push({
          $or: [
            { product_name: { $regex: searchRegex } },
            { description: { $regex: searchRegex } },
            { code: { $regex: searchRegex } },
            { sku: { $regex: searchRegex } },
            { "id_branch.branch_name": { $regex: searchRegex } },
            { "id_category.category_name": { $regex: searchRegex } },
            { "subcategory.name": { $regex: searchRegex } },
            { "id_metal.metal_name": { $regex: searchRegex } },
            { "id_purity.purity_name": { $regex: searchRegex } },
            { "collectionData.name": { $regex: searchRegex } },
            // { "stoneDetails.stoneName": { $regex: searchRegex } }
          ]
        });
      }

      if (numericSearch !== null) {
        searchConditions.push({ weight: numericSearch });
      }

      if (searchConditions.length > 0) {
        pipeline.push({
          $match: searchConditions.length === 1 ? searchConditions[0] : { $or: searchConditions }
        });
      }
    }

    pipeline.push(
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          product_name: 1,
          weight: 1,
          createdAt: 1,
          product_image: 1,
          active: 1,
          bestSeller: "$bestSeller",
          branchName: "$id_branch.branch_name",
          metalName: "$id_metal.metal_name",
          purityName: "$id_purity.purity_name",
          isWishlisted: 1,
          weight: "$quantity",
          pathurl: {
            $concat: [
              "$s3Details.s3display_url",
              "aupay/webadmin/assets/products/",
            ],
          },
        },
      }
    );

    const products = await ProductModel.aggregate(pipeline);
    return products;
  } catch (err) {
    console.error("Error in allProductsData:", err);
    throw err;
  }
}

 async reduceProductQuantity(productId, sizeId, quantityToReduce) {
      try {       
        const result = await ProductModel.updateOne(
          {
            _id: new mongoose.Types.ObjectId(productId),
            "availableSizes.values._id": new mongoose.Types.ObjectId(sizeId),
            "availableSizes.values.quantity": { $gte: quantityToReduce },
          },
          {
            $inc: {
              quantity: -quantityToReduce,
              "availableSizes.values.$.quantity": -quantityToReduce,
            },
          }
        );

        if (result.modifiedCount === 0) {
          return {
            success: false,
            message: "Failed to reduce product quantity. Product/size not found or insufficient stock.",
          };
        }

        return { success: true, message: "Quantity reduced successfully." };
      } catch (error) {
        console.error("Error reducing product quantity:", error);
        throw new Error("Database error occurred while reducing product quantity.");
      }
    }
    
}

export default ProductRepository;


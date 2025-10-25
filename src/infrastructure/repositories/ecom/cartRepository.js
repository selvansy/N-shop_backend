import cartModel from "../../models/ecom/cartModel.js";
import cartItemModel from "../../models/ecom/cartItemModel.js";
import mongoose from "mongoose";
import config from "../../../config/chit/env.js";
import CartItem from "../../models/ecom/cartItemModel.js";
const ObjectId = mongoose.Types.ObjectId;
class CartRepository {
  async create(cartData) {
    try {
      const cart = new cartModel(cartData);
      return await cart.save();
    } catch (error) {
      console.error(error);
      throw new Error(`Repository Error (createCart): ${error.message}`);
    }
  }
 
  async findCartByUserId(userId) {
    try {
      return cartModel.findOne({ userId });
    } catch (error) {
      throw new Error(`Repository Error (findCartByuserId): ${error.message}`);
    }
  }

// async findById(cartId) {
//   try {
//     const cartData = await cartModel.findById(cartId);

//     const item = await cartItemModel.aggregate([
//       {
//         $match: {
//           cartId: new mongoose.Types.ObjectId(cartId),
//           is_deleted: false,
//         },
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "productId",
//           foreignField: "_id",
//           as: "Product",
//         },
//       },
//       { $unwind: { path: "$Product", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "metalrates",
//           let: {
//             metalId: "$Product.id_metal",
//             purityId: "$Product.id_purity",
//           },
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
//           let: { stoneIds: "$Product.stoneDetails" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $cond: [
//                     { $gt: [{ $size: { $ifNull: ["$$stoneIds", []] } }, 0] },
//                     { $in: ["$_id", "$$stoneIds"] },
//                     false,
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "stoneDiamondDetails",
//         },
//       },
//       {
//         $lookup: {
//           from: "stone_masters",
//           let: { ids: "$stoneDiamondDetails.itemId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $cond: [
//                     { $gt: [{ $size: { $ifNull: ["$$ids", []] } }, 0] },
//                     { $in: ["$_id", "$$ids"] },
//                     false,
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "stoneInfo",
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
//               { $ifNull: ["$Product.netWeight", 0] },
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
//                   case: { $eq: ["$Product.makingCharges.mode", 1] },
//                   then: { $ifNull: ["$Product.makingCharges.actualValue", 0] },
//                 },
//                 {
//                   case: { $eq: ["$Product.makingCharges.mode", 2] },
//                   then: {
//                     $multiply: [
//                       { $ifNull: ["$Product.grossWt", 0] },
//                       { $ifNull: ["$Product.makingCharges.actualValue", 0] },
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
//                   { $ifNull: ["$Product.makingCharges.discountedValue", 0] }
//                 ]
//               },
//               2
//             ]
//           }
//         }
//       },
//       {
//         $addFields: {
//           rawWastageCharge: {
//             $switch: {
//               branches: [
//                 {
//                   case: { $eq: ["$Product.wastageCharges.mode", 1] },
//                   then: { $ifNull: ["$Product.wastageCharges.actualValue", 0] },
//                 },
//                 {
//                   case: { $eq: ["$Product.wastageCharges.mode", 2] },
//                   then: {
//                     $multiply: [
//                       { $ifNull: ["$baseMetalValue", 0] },
//                       {
//                         $divide: [
//                           { $ifNull: ["$Product.wastageCharges.actualValue", 0] },
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
//           finalWastageCharge: {
//             $round: [
//               {
//                 $subtract: [
//                   { $ifNull: ["$rawWastageCharge", 0] },
//                   { $ifNull: ["$Product.wastageCharges.discountedValue", 0] }
//                 ]
//               },
//               2
//             ]
//           }
//         }
//       },
//       {
//         $addFields: {
//           diamondValue: {
//             $sum: {
//               $map: {
//                 input: {
//                   $filter: {
//                     input: { $ifNull: ["$stoneDiamondDetails", []] },
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
//                     input: { $ifNull: ["$stoneDiamondDetails", []] },
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
//           localField: "Product.id_branch",
//           foreignField: "id_branch",
//           as: "gstInfo",
//         },
//       },
//       {
//         $addFields: {
//           gstRate: {
//             $ifNull: [{ $arrayElemAt: ["$gstInfo.rate", 0] }, 0]
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
//           _id: 0,
//           productId: "$Product._id",
//           itemId: "$_id",
//           productName: "$Product.product_name",
//           qty: "$quantity",
//           grossWt: "$Product.grossWt",
//           netWt: "$Product.netWeight",
//           shippingCharge: { $literal: 0 },
//           productImg: { $arrayElemAt: ["$Product.product_image", 0] },
//           price: "$totalAmount",
//           discount: "$discountedAmount",
//           sizeId: "$sizeId",
//           categoryId: "$Product.id_category",
//           subCategoryId: "$Product.subcategoryId",
//           collectionId: "$Product.collection",
//         },
//       },
//       {
//         $facet: {
//           items: [{ $match: {} }],
//           overAllAmount: [
//             {
//               $group: {
//                 _id: null,
//                 totalPrice: { $sum: "$price" },
//                 totalDiscount: { $sum: "$discount" },
//                 shippingCharge: { $sum: "$shippingCharge" },
//               },
//             },
//             { $project: { _id: 0 } },
//           ],
//         },
//       },
//       {
//         $project: {
//           items: 1,
//           overAllAmount: { $arrayElemAt: ["$overAllAmount", 0] },
//         },
//       },
//     ]);

//     return {
//       ...item[0],
//       cartId: cartData._id,
//       pathUrl: `${config.DISPLAY_IMG_URL}products/`,
//     };
//   } catch (error) {
//     console.error(error);
//     throw new Error(`Repository Error (findCartById): ${error.message}`);
//   }
// }
    async findById(cartId) {
    try {
      const cartData = await cartModel.findById(cartId);
      const item = await cartItemModel.aggregate([
        {
          $match: {
            cartId: new mongoose.Types.ObjectId(cartId),
            is_deleted: false,
          },
        },

        // Lookup product details
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "Product",
          },
        },
        { $unwind: { path: "$Product", preserveNullAndEmptyArrays: true } },

        // Lookup latest metal rate
        {
          $lookup: {
            from: "metalrates",
            let: {
              metalId: "$Product.id_metal",
              purityId: "$Product.id_purity",
            },
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

        // Lookup stone/diamond details
        {
          $lookup: {
            from: "stonedetails",
            localField: "Product.stoneDetails",
            foreignField: "_id",
            as: "stoneDiamondDetails",
          },
        },
        {
          $lookup: {
            from: "stone_masters",
            localField: "stoneDiamondDetails.itemId",
            foreignField: "_id",
            as: "stoneInfo",
          },
        },
        // {
        //   $unwind: {
        //     path: "$stoneInfo",
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },

        // Metal price
        {
          $addFields: {
            latestMetalPrice: {
              $ifNull: [{ $arrayElemAt: ["$metalPriceInfo.rate", 0] }, 0],
            },
          },
        },

        // Base metal value
        {
          $addFields: {
            baseMetalValue: {
              $multiply: [
                { $ifNull: ["$Product.netWeight", 0] },
                { $ifNull: ["$latestMetalPrice", 0] },
              ],
            },
          },
        },

        // Raw making charge
        {
          $addFields: {
            rawMakingCharge: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$Product.makingCharges.mode", 1] },
                    then: {
                      $ifNull: ["$Product.makingCharges.actualValue", 0],
                    },
                  },
                  {
                    case: { $eq: ["$Product.makingCharges.mode", 2] },
                    then: {
                      $multiply: [
                        { $ifNull: ["$Product.grossWt", 0] },
                        { $ifNull: ["$Product.makingCharges.actualValue", 0] },
                      ],
                    },
                  },
                ],
                default: 0,
              },
            },
          },
        },

        // Final making charge (after discount)
        {
          $addFields: {
            finalMakingCharge: {
              $round: [
                {
                  $subtract: [
                    { $ifNull: ["$rawMakingCharge", 0] },
                    {
                      $multiply: [
                        { $ifNull: ["$rawMakingCharge", 0] },
                        {
                          $divide: [
                            {
                              $ifNull: [
                                "$Product.makingCharges.discountedValue",
                                0,
                              ],
                            },
                            100,
                          ],
                        },
                      ],
                    },
                  ],
                },
                2,
              ],
            },
          },
        },

        // Raw wastage charge
        {
          $addFields: {
            rawWastageCharge: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$Product.wastageCharges.mode", 1] },
                    then: {
                      $ifNull: ["$Product.wastageCharges.actualValue", 0],
                    },
                  },
                  {
                    case: { $eq: ["$Product.wastageCharges.mode", 2] },
                    then: {
                      $multiply: [
                        { $ifNull: ["$baseMetalValue", 0] },
                        {
                          $divide: [
                            {
                              $ifNull: [
                                "$Product.wastageCharges.actualValue",
                                0,
                              ],
                            },
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

        // Final wastage charge (after discount)
        {
          $addFields: {
            finalWastageCharge: {
              $round: [
                {
                  $subtract: [
                    { $ifNull: ["$rawWastageCharge", 0] },
                    {
                      $multiply: [
                        { $ifNull: ["$rawWastageCharge", 0] },
                        {
                          $divide: [
                            {
                              $ifNull: [
                                "$Product.wastageCharges.discountedValue",
                                0,
                              ],
                            },
                            100,
                          ],
                        },
                      ],
                    },
                  ],
                },
                2,
              ],
            },
          },
        },

        // Diamond & Stone values
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

        // Subtotals
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

        // GST applied
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
                        { $divide: [{ $ifNull: ["$Product.gst", 0] }, 100] },
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
                        { $divide: [{ $ifNull: ["$Product.gst", 0] }, 100] },
                      ],
                    },
                  ],
                },
                2,
              ],
            },
          },
        },

        // Final projection
        {
          $project: {
            _id: 0,
            productId: "$Product._id",
            itemId: "$_id",
            productName: "$Product.product_name",
            qty: "$quantity",
            grossWt: "$Product.grossWt",
            netWt: "$Product.netWeight",
            shippingCharge: { $literal: 0 },
            productImg: { $arrayElemAt: ["$Product.product_image", 0] },
            price: "$totalAmount",
            discount: "$discountedAmount",
            sizeId: "$sizeId",
            categoryId: "$Product.id_category",
            subCategoryId: "$Product.subcategoryId",
            collectionId: "$Product.collection",
          },
        },

        // Facet for totals
        {
          $facet: {
            items: [{ $match: {} }],
            overAllAmount: [
              {
                $group: {
                  _id: null,
                  totalPrice: { $sum: "$price" },
                  totalDiscount: { $sum: "$discount" },
                  shippingCharge: { $sum: "$shippingCharge" },
                },
              },
              { $project: { _id: 0 } },
            ],
          },
        },

        {
          $project: {
            items: 1,
            overAllAmount: { $arrayElemAt: ["$overAllAmount", 0] },
          },
        },
      ]);
      return {
        ...item[0],
        cartId: cartData._id,
        pathUrl: `${config.DISPLAY_IMG_URL}products/`,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Repository Error (findCartById): ${error.message}`);
    }
  }
 
  async findByUserId(userId) {
    try {
      return await cartModel.findOne({ userId, status: "active" });
    } catch (error) {
      console.error(error);
      throw new Error(`Repository Error (findByUserId): ${error.message}`);
    }
  }
 
  async addItemToCart(itemData) {
    try {
      const newItem = new cartItemModel(itemData);
      return await newItem.save();
    } catch (error) {
      console.error(error);
      throw new Error(`Repository Error (addItemToCart): ${error.message}`);
    }
  }
 
  async removeItem(itemId, userId) {
    try {
      return await cartItemModel.findByIdAndUpdate(
        { _id: itemId, userId },
        { $set: { is_deleted: true } }
      );
    } catch (error) {
      console.error(error);
      throw new Error(`Repository Error (removeItem): ${error.message}`);
    }
  }
 
  async getCartSummary(cartId) {
    try {
      const items = await cartItemModel.find({ cartId }).populate("productId");
      if (!items.length) return { totalItems: 0, totalPrice: 0 };
 
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce(
        (sum, item) => sum + item.quantity * (item.productId?.unitPrice || 0),
        0
      );
 
      return { totalItems, totalPrice };
    } catch (error) {
      console.error(error);
      throw new Error(`Repository Error (getCartSummary): ${error.message}`);
    }
  }
 
  async findProductByBranch(cartId, branchId) {
    try {
      const findProduct = await CartItem.aggregate([
        {
          $match: {
            cartId: new ObjectId(cartId),
            is_deleted: false,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "Product",
          },
        },
        {
          $unwind: {
            path: "$Product",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            "Product.id_branch": { $ne: new ObjectId(branchId) }, // ✅ works now
          },
        },
        {
          $project: {
            _id: 0,
            productId: "$Product._id",
          },
        },
      ]);

      console.log(findProduct);
      return findProduct;
    } catch (error) {
      console.error("Error in findProductByBranch:", error);
      return null;
    }
  }
}
 
export default CartRepository;
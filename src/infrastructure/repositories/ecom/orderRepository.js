import mongoose from "mongoose";
import config from "../../../config/chit/env.js";
import CartItem from "../../models/ecom/cartItemModel.js";
import { OrderItem } from "../../models/ecom/orderItemModel.js";
import { Order } from "../../models/ecom/orderModel.js";
import productModel from "../../models/chit/productModel.js";
import orderStatusModel from "../../models/ecom/orderStatusModel.js";
import orderPaymentModel from "../../models/ecom/orderPaymentModel.js";
import ecomPaymentOrderModel from "../../models/ecom/ecomPaymentOrderModel.js";

class OrderRepository {
  async createOrder(orderData, orderItems) {
    try {
      const createdOrder = await Order.create(orderData);
      if (!createdOrder) {
        return null;
      }

      const itemsWithOrderId = orderItems.map((item) => ({
        ...item,
        orderId: createdOrder._id,
      }));

      const createdOrderItems = await OrderItem.insertMany(itemsWithOrderId);
      if (!createdOrderItems) {
        return null;
      }

      return { order: createdOrder, items: createdOrderItems };
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error; 
    }
  }

    async findOrderItemsByCartId(cartId) {
      try {
        return OrderItem.find({orderId:cartId});
      } catch (error) {
        throw new Error(`Repository Error (findCartByuserId): ${error.message}`);
      }
    }

  // async findOrders(userId) {
  //   try {
  //     const findOrder = await Order.find({ userId,active:true})
  //       .populate({
  //         path: "deliveryAddress",
  //         populate: [
  //           { path: "id_city" },
  //           { path: "id_state" },
  //           { path: "id_country" },
  //         ],
  //       })
  //       .sort({createdAt:-1})
  //       .lean();

  //     const ordersWithAddress = findOrder.map((order) => {
  //       if (order.deliveryAddress) {
  //         const addr = order.deliveryAddress;

  //         const fullAddress = [
  //           addr.address,
  //           addr.landmark,
  //           addr.id_city?.city_name,
  //           addr.id_state?.state_name,
  //           addr.id_country?.country_name,
  //           addr.pincode,
  //         ]
  //           .filter(Boolean)
  //           .join(", ");

  //         order.address = fullAddress;
  //       }

  //       return order;
  //     });

  //     return ordersWithAddress;
  //   } catch (error) {
  //     console.log(error);
  //     return null;
  //   }
  // }
 async findOrders(userId) {
  try {
    const findOrder = await Order.find({ userId})
      .populate({
        path: "deliveryAddress",
        populate: [
          { path: "id_city" },
          { path: "id_state" },
          { path: "id_country" },
        ],
      })
      .populate({
        path: "items.productId",
        populate: [
          {
            path: "stoneDetails",
            model: "StoneDetail"
          },
          {
            path: "id_metal",
            model: "Metal"
          },
          {
            path: "id_purity",
            model: "Purity"
          },
          {
            path: "id_branch",
            model: "Branch"
          }
        ],
        strictPopulate: false // Add this line
      })
      .populate({
        path: "paymentDetails",
        model: "Payment",
        strictPopulate: false
      })
      .sort({ createdAt: -1 })
      .lean();

    // Rest of your code remains the same...
    const ordersWithDetails = await Promise.all(
      findOrder.map(async (order) => {
        // Your existing processing logic...
        if (order.deliveryAddress) {
          const addr = order.deliveryAddress;
          const fullAddress = [
            addr.address,
            addr.landmark,
            addr.id_city?.city_name,
            addr.id_state?.state_name,
            addr.id_country?.country_name,
            addr.pincode,
          ]
            .filter(Boolean)
            .join(", ");
          order.address = fullAddress;
        }

        if (order.items && order.items.length > 0) {
          order.items = await Promise.all(
            order.items.map(async (item) => {
              const product = item.productId;
              if (!product) return item;

              // Get latest metal rate
              const metalRate = await MetalRate.findOne({
                material_type_id: product.id_metal?._id,
                purity_id: product.id_purity?._id
              })
                .sort({ createdAt: -1 })
                .lean();

              const currentMetalRate = metalRate?.rate || 0;

              // Get GST rate
              const gstInfo = await GstSetting.findOne({
                id_branch: product.id_branch?._id
              }).lean();
              
              const gstRate = gstInfo?.rate || 0;

              // Calculate weights
              const grossWeight = product.grossWt || 0;
              const netWeight = product.netWeight || product.grossWt || 0;

              // Calculate base metal value
              const baseMetalValue = netWeight * currentMetalRate;

              // Calculate making charges
              let rawMakingCharge = 0;
              let finalMakingCharge = 0;
              
              if (product.makingCharges) {
                if (product.makingCharges.mode === 1) {
                  rawMakingCharge = product.makingCharges.actualValue || 0;
                } else if (product.makingCharges.mode === 2) {
                  rawMakingCharge = grossWeight * (product.makingCharges.actualValue || 0);
                }
                
                finalMakingCharge = Math.round(
                  (rawMakingCharge - (product.makingCharges.discountedValue || 0)) * 100
                ) / 100;
              }

              // Calculate wastage charges
              let rawWastageCharge = 0;
              let finalWastageCharge = 0;
              
              if (product.wastageCharges) {
                if (product.wastageCharges.mode === 1) {
                  rawWastageCharge = product.wastageCharges.actualValue || 0;
                } else if (product.wastageCharges.mode === 2) {
                  rawWastageCharge = baseMetalValue * ((product.wastageCharges.actualValue || 0) / 100);
                }
                
                finalWastageCharge = Math.round(
                  (rawWastageCharge - (product.wastageCharges.discountedValue || 0)) * 100
                ) / 100;
              }

              // Calculate stone details
              const stoneDetails = (product.stoneDetails || []).map(stone => ({
                type: stone.type,
                cts: stone.cts || 0,
                amount: stone.amount || 0,
                price: stone.price || 0,
                stoneName: stone.stoneName || ''
              }));

              const diamondValue = stoneDetails
                .filter(stone => stone.type === 'diamond')
                .reduce((sum, diamond) => sum + (diamond.price || 0), 0);

              const stoneValue = stoneDetails
                .filter(stone => stone.type === 'stone')
                .reduce((sum, stone) => sum + (stone.price || 0), 0);

              // Calculate subtotals
              const discountedSubtotal = baseMetalValue + finalWastageCharge + finalMakingCharge + diamondValue + stoneValue;
              const actualSubtotal = baseMetalValue + rawWastageCharge + rawMakingCharge + diamondValue + stoneValue;

              // Calculate GST amounts
              const discountedAmount = Math.round(
                discountedSubtotal * (1 + (gstRate / 100)) * 100
              ) / 100;

              const totalAmount = Math.round(
                actualSubtotal * (1 + (gstRate / 100)) * 100
              ) / 100;

              const gstAmount = Math.round(
                (discountedSubtotal * (gstRate / 100)) * 100
              ) / 100;

              // Add all calculated fields to the item
              return {
                ...item,
                sku: product.sku || product.product_code || '',
                name: product.product_name || '',
                purityName: product.id_purity?.purity_name || '',
                hsn: product.hsn_code || '',
                metalRate: currentMetalRate,
                grossWeight: grossWeight,
                netWeight: netWeight,
                wastage: product.wastageCharges ? {
                  mode: product.wastageCharges.mode,
                  percentage: product.wastageCharges.mode === 2 ? product.wastageCharges.actualValue : null,
                  amount: product.wastageCharges.mode === 1 ? product.wastageCharges.actualValue : null,
                  discountedValue: product.wastageCharges.discountedValue || 0,
                  finalCharge: finalWastageCharge
                } : null,
                makingCharge: {
                  raw: rawMakingCharge,
                  final: finalMakingCharge,
                  mode: product.makingCharges?.mode,
                  discountedValue: product.makingCharges?.discountedValue || 0
                },
                gst: {
                  rate: gstRate,
                  amount: gstAmount
                },
                stoneDetails: stoneDetails,
                totalStoneValue: stoneValue + diamondValue,
                calculations: {
                  baseMetalValue: baseMetalValue,
                  discountedSubtotal: discountedSubtotal,
                  actualSubtotal: actualSubtotal,
                  discountedAmount: discountedAmount,
                  totalAmount: totalAmount
                }
              };
            })
          );

          order.totalGST = order.items.reduce((sum, item) => sum + (item.gst?.amount || 0), 0);
          
          order.paymentMode = order.paymentDetails?.paymentMode || 'Unknown';
        }

        return order;
      })
    );

    return ordersWithDetails;
  } catch (error) {
    console.error("Error in findOrders:", error);
    return null;
  }
}

  async findOrderItems(orderId) {
    try {
      const findOrder = await Order.findById(orderId)
        .populate({
          path: "deliveryAddress",
          populate: [
            { path: "id_city" },
            { path: "id_state" },
            { path: "id_country" },
          ],
        })
        .lean();
      let address = "";
      if (findOrder.deliveryAddress) {
        const addr = findOrder.deliveryAddress;
        address = [
          addr.address,
          addr.landmark,
          addr.id_city?.city_name,
          addr.id_state?.state_name,
          addr.id_country?.country_name,
          addr.pincode,
        ]
          .filter(Boolean)
          .join(", ");
      }
      const findOrderItem = await OrderItem.find({ orderId }).populate(
        "productId"
      );
      return {
        item: findOrderItem,
        overAll: {
          placedAt: findOrder.createdAt,
          arrivedAt: findOrder.estimatedDeliveryDate,
          orderId: findOrder.orderId,
          address,
          subTotal: findOrder.subtotal,
          totalAmount: findOrder.totalAmount,
          shippingCharge: findOrder.shippingFee,
          status: findOrder.status,
          savedAmount: findOrder.savedAmount,
        },
        pathUrl: `${config.DISPLAY_IMG_URL}products/`,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findById(orderId) {
    try {
      const findOrderItem = await Order.findById(orderId)
      return findOrderItem;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // async getAllOrders() {
  //   try {
  //     const orders = await Order.find().populate("userId", "firstname lastname").sort({createdAt:-1});
  //     return orders;
  //   } catch (error) {
  //     console.log(error);
  //     return null;
  //   }
  // }

  async getAllOrders(page = 1, limit = 10,filter={}) {
  try {
    const skip = (page - 1) * limit; 

    // if (filter && Object.keys(filter).length > 0) {
    //   filter =  { ...filter, ...filter };
    // }
    
    // if (search) {
    //   const trimsearch=search.trim()
    //   filter = {
    //     $or: [
    //       { phone: { $regex: trimsearch, $options: "i" } },
    //       { status: { $regex: trimsearch, $options: "i" } },
    //       { orderId: { $regex: trimsearch, $options: "i" } },
    //     ],
    //   };
    // }

    const orders = await Order.find(filter)
      .populate("userId", "firstname lastname")
      .sort({ createdAt: -1 })
      .skip(skip)   
      .limit(limit); 

      console.log(orders)

    const totalCount = await Order.countDocuments(filter);

    return {
      orders,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}


  async updatePaymentCount(orderId) {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          $set: { active: true, status: "Processing",orderStatus:1 },
        },
        { new: true }
      );
      await CartItem.updateMany(
        { cartId: updatedOrder.cartId },
        { $set: { is_deleted: true } }
      );

      return updatedOrder || null;
    } catch (error) {
      console.error("Error updating payment count:", error);
      throw error;
    }
  }

  async findOrderDetailReport(orderId) {
    try {
      const findOrder = await Order.findById(orderId)
        .populate({
          path: "deliveryAddress",
          populate: [
            { path: "id_city" },
            { path: "id_state" },
            { path: "id_country" },
          ],
        }).populate({
  path: "userId",
  select: "firstname lastname email mobile cus_img" 
})
       

        .lean();
      let address = "";
      if (findOrder.deliveryAddress) {
        const addr = findOrder.deliveryAddress;
        address = [
          addr.address,
          addr.landmark,
          addr.id_city?.city_name,
          addr.id_state?.state_name,
          addr.id_country?.country_name,
          addr.pincode,
        ]
          .filter(Boolean)
          .join(", ");
      }
      
const findOrderItem = await OrderItem.aggregate([
  {
    $match: { orderId: new mongoose.Types.ObjectId(orderId) },
  },
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product",
    },
  },
  {
    $unwind: {
      path: "$product",
      preserveNullAndEmptyArrays: true,
    },
  },
  // Now match sizeId with product.availableSizes.values._id
  {
    $addFields: {
      matchedSize: {
        $arrayElemAt: [
          {
            $filter: {
              input: "$product.availableSizes.values",
              as: "val",
              cond: { $eq: ["$$val._id", "$sizeId"] },
            },
          },
          0,
        ],
      },
    },
  },
  {
    $addFields: {
      sizeValue: "$matchedSize.sizeValue",
      sizeQuantity: "$matchedSize.quantity",
    },
  },
  {
    $project: {
      _id:0,
     productName:"$product.product_name",
     size:"$sizeValue",
     qty:"$quantity",
     img: { $arrayElemAt: ["$product.product_image", 0] }, 
     price:"$discountAmount"
    },
  },
]);


      return {
        item: findOrderItem,
        overAll: {
          placedAt: findOrder.createdAt,
          arrivedAt: findOrder.estimatedDeliveryDate,
          orderId: findOrder.orderId,
          address,
          subTotal: findOrder.subtotal,
          totalAmount: findOrder.totalAmount,
          shippingCharge: findOrder.shippingFee,
          status: findOrder.status,
          savedAmount: findOrder.savedAmount,
          name:`${findOrder.userId.firstname} ${findOrder.userId.lastname??""}`,
          mobile:findOrder.userId?.mobile,
          email:findOrder.userId?.email,
          cus_img:findOrder.userId?.cus_img,
          createdAt:findOrder.createdAt,
          orderStatus:findOrder.orderStatus
        },
        productPathUrl: `${config.DISPLAY_IMG_URL}products/`,
        customerPathUrl: `${config.DISPLAY_IMG_URL}customer/`,
      };
    } catch (error) {
      console.error("Failed to get order item", error);
      throw error;
    }
  }

  async updateQuantity(productData){
    try{

      const updateQuantity = await productModel.aggregate([
        {$match:{}}
      ])

    }catch(error){
      throw error
    }
  }

async getTopSellingProduct(filter) {
  try {
    const result = await Order.aggregate([
      { $match: filter },

      {
        $lookup: {
          from: "orderitems", // collection name
          localField: "_id",
          foreignField: "orderId",
          as: "orderItem",
        },
      },
      { $unwind: "$orderItem" },

      // group by product
      {
        $group: {
          _id: "$orderItem.productId",
          totalSold: { $sum: "$orderItem.quantity" },
          totalAmount: { $sum: "$orderItem.discountAmount" }, // ✅ sum discountAmount here
        },
      },

      // sort by total sold
      { $sort: { totalSold: -1 } },

      // top 10
      { $limit: 10 },

      // get product details
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      {
        $lookup: {
          from: "metals",
          localField: "product.id_metal",
          foreignField: "_id",
          as: "metal",
        },
      },
      { $unwind: "$metal" },

      {
        $lookup: {
          from: "categories",
          localField: "product.id_category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      {
        $lookup: {
          from: "purities",
          localField: "product.id_purity",
          foreignField: "_id",
          as: "purity",
        },
      },
      { $unwind: "$purity" },

      // final projection
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: "$product.product_name",
          totalSold: 1,
          metalName: "$metal.metal_name",
          purityName: "$purity.purity_name",
          categoryName: "$category.category_name",
          totalAmount: 1,
        },
      },
    ]);

    return result;
  } catch (err) {
    console.error("Error in getTopSellingProduct:", err);
    throw err;
  }
}



async getTopSellingCategory(filter) {
  try {
    const result = await Order.aggregate([
      { $match: filter },

      {
        $lookup: {
          from: "orderitems", 
          localField: "_id",
          foreignField: "orderId",
          as: "orderItem",
        },
      },
      { $unwind: "$orderItem" },

      // join product to get categoryId
      {
        $lookup: {
          from: "products",
          localField: "orderItem.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      // group by categoryId
      {
        $group: {
          _id: "$product.id_category",
          totalSold: { $sum: "$orderItem.quantity" },
        },
      },

      // sort by total sold
      { $sort: { totalSold: -1 } },

      // top 10 categories
      { $limit: 10 },

      // lookup category details
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      // final projection
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          categoryName: "$category.category_name",
          totalSold: 1,
        },
      },
    ]);

    return result;
  } catch (err) {
    console.error("Error in getTopSellingCategory:", err);
    throw err;
  }
}


async findOrderStatus (){
  try{
    return await orderStatusModel.find()
  }catch(error){
    return null
  }
}

async findStatusById (id){
  try{
    return await orderStatusModel.findOne({_id:id})
  }catch(error){
    return null
  }
}

async getOverAllReport(startDate,endDate) {
  try {
   

const result = await Order.aggregate([
  {$match:{active:true}},
  {
    $facet: {
      newOrders: [
        {
          $match: {
            orderStatus: 1, // Processing
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { $count: "count" }
      ],
      pendingOrders: [
        {
          $match: {
            orderStatus: 5, // Payment pending
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { $count: "count" }
      ],
      deliveredToday: [
        {
          $match: {
            orderStatus: 3, // Delivered
            deliveredDate: { $gte: startDate, $lte: endDate } // use deliveredDate instead
          }
        },
        { $count: "count" }
      ],
      inShipment: [
        {
          $match: {
            orderStatus: 2, // Placed
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { $count: "count" }
      ]
    }
  },
  {
    $project: {
      newOrders: { $ifNull: [{ $arrayElemAt: ["$newOrders.count", 0] }, 0] },
      pendingOrders: { $ifNull: [{ $arrayElemAt: ["$pendingOrders.count", 0] }, 0] },
      deliveredToday: { $ifNull: [{ $arrayElemAt: ["$deliveredToday.count", 0] }, 0] },
      inShipment: { $ifNull: [{ $arrayElemAt: ["$inShipment.count", 0] }, 0] }
    }
  }
]);


    return result;
  } catch (err) {
    console.error("Error in getTopSellingCategory:", err);
    throw err;
  }
}

async changeOrderStatus(statusId,orderId){
  try{

const findStatus = await orderStatusModel.findById(statusId);
console.log(findStatus)
let updateData = {
  status: findStatus.name,
  orderStatus: findStatus.statusNo
};

// If Delivered → add deliveredDate
if (findStatus.statusNo == 3) {
  updateData.deliveredDate = new Date();
}

const order = await Order.findByIdAndUpdate(
  orderId,
  { $set: updateData },
  { new: true } // returns updated document
);

return order;


  }catch(error){
    return null
  }
}

async getProductCountsByOrder(orderObjectId) {
  try {
    return await this.orderItemModel.aggregate([
      {
        $match: { orderObjectId: orderObjectId }
      },
      {
        $group: {
          _id: "$productId",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          count: 1
        }
      }
    ]);
  } catch (error) {
    console.error("Repo Error in getProductCountsByOrder:", error);
    throw error;
  }
}


// async getPaymentReport(page=1,limit=10,filter={},search=""){
//   try{
//     const skip =(page-1)*limit ;

//     const result = await ecomPaymentOrderModel.find(filter)
//     .populate("id_customer","firstname lastname mobile")
//     .sort({createdAt:-1})
//     .skip(skip)
//     .limit(limit)

//      const totalCount = await ecomPaymentOrderModel.countDocuments(filter);

//      return {
//       result,
//       totalCount,
//       totalPages:Math.ceil(totalCount/limit),
//      }
//   }catch(error){
//     console.error(error)
//     return null
//   }
// }


async getPaymentReport(page = 1, limit = 10, filter = {}, search = "") {
  try {
    
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "customers",
          localField: "id_customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
    ];

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      pipeline.push({
        $match: {
          $or: [
            { orderId: { $regex: searchRegex } },
            { "customer.firstname": { $regex: searchRegex } },
            { "customer.lastname": { $regex: searchRegex } },
            // { "customer.mobile": { $regex: searchRegex } },
              {
        $expr: {
          $regexMatch: {
            input: { $toString: "$customer.mobile" }, 
            regex: searchRegex
          }
        }
      }
          ],
        },
      });
    }
    const countPipeline = [...pipeline, { $count: "totalCount" }];
    const countResult = await ecomPaymentOrderModel.aggregate(countPipeline);
    const totalCount = countResult[0]?.totalCount || 0;

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    pipeline.push({
      $project: {
        _id: 1,
        orderId: 1,
        cf_payment_id: 1,
        cf_order_id: 1,
        payment_session_id: 1,
        payment_amount: 1,
        status: 1,
        active: 1,
        is_deleted: 1,
        orderObjId: 1,
        createdAt: 1,
        updatedAt: 1,
        id_customer: {
          _id: "$customer._id",
          firstname: "$customer.firstname",
          lastname: "$customer.lastname",
          mobile: "$customer.mobile",
        },
        product_payment_ids: 1,
      },
    });

    const result = await ecomPaymentOrderModel.aggregate(pipeline);

    return {
      result,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}


// async getTopSellingProducttable(page=1,limit=10,filter) {
//   try {
//     const result = await Order.aggregate([
//       { $match: filter },

//       {
//         $lookup: {
//           from: "orderitems",
//           localField: "_id",
//           foreignField: "orderId",
//           as: "orderItem",
//         },
//       },
//       { $unwind: "$orderItem" },

//       // group by product
//       {
//         $group: {
//           _id: "$orderItem.productId",
//           totalSold: { $sum: "$orderItem.quantity" },
//           totalAmount: { $sum: "$orderItem.discountAmount" }, 
//         },
//       },

//       // sort by total sold
//       { $sort: { totalSold: -1 } },

//       // top 10
//       { $limit: 10 },

//       // get product details
//       {
//         $lookup: {
//           from: "products",
//           localField: "_id",
//           foreignField: "_id",
//           as: "product",
//         },
//       },
//       { $unwind: "$product" },

//       {
//         $lookup: {
//           from: "metals",
//           localField: "product.id_metal",
//           foreignField: "_id",
//           as: "metal",
//         },
//       },
//       { $unwind: "$metal" },

//       {
//         $lookup: {
//           from: "categories",
//           localField: "product.id_category",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       { $unwind: "$category" },

//       {
//         $lookup: {
//           from: "purities",
//           localField: "product.id_purity",
//           foreignField: "_id",
//           as: "purity",
//         },
//       },
//       { $unwind: "$purity" },

//       // final projection
//       {
//         $project: {
//           _id: 0,
//           productId: "$_id",
//           name: "$product.product_name",
//           totalSold: 1,
//           metalName: "$metal.metal_name",
//           purityName: "$purity.purity_name",
//           categoryName: "$category.category_name",
//           totalAmount: 1,
//         },
//       },
//     ]);

//     return result;
//   } catch (err) {
//     console.error("Error in getTopSellingProduct:", err);
//     throw err;
//   }
// }

async getTopSellingProducttable(page = 1, limit = 10, filter = {}, search = "") {
  try {
    const skip = (page - 1) * limit;

    
    let pipeline = [
      { $match: filter },
      {
        $lookup: { from: "orderitems", localField: "_id", foreignField: "orderId", as: "orderItem" }
      },
      { $unwind: "$orderItem" },
      {
        $group: {
          _id: "$orderItem.productId",
          totalSold: { $sum: "$orderItem.quantity" },
          totalAmount: { $sum: "$orderItem.discountAmount" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" }
      },
      { $unwind: "$product" },
      {
        $lookup: { from: "metals", localField: "product.id_metal", foreignField: "_id", as: "metal" }
      },
      { $unwind: "$metal" },
      {
        $lookup: { from: "categories", localField: "product.id_category", foreignField: "_id", as: "category" }
      },
      { $unwind: "$category" },
      {
        $lookup: { from: "purities", localField: "product.id_purity", foreignField: "_id", as: "purity" }
      },
      { $unwind: "$purity" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: "$product.product_name",
          totalSold: 1,
          metalName: "$metal.metal_name",
          purityName: "$purity.purity_name",
          categoryName: "$category.category_name",
          totalAmount: 1,
        }
      }
    ];

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: searchRegex } },
            { categoryName: { $regex: searchRegex } },
            { metalName: { $regex: searchRegex } }
          ]
        }
      });
    }

    const result = await Order.aggregate(pipeline);

    const totalDocuments = result.length;
    const totalPages = Math.ceil(totalDocuments / limit);

    return {
      result,
      totalDocuments,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (err) {
    console.error("Error in getTopSellingProducttable:", err);
    throw err;
  }
}


}

export default OrderRepository;

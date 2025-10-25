import mongoose, { Schema, Types } from "mongoose";

const OrderItemSchema = new Schema(
  {
    orderId: { type: Types.ObjectId, ref: "Order", required: true, index: true },

    // Product linkage
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    sizeId: { type: Types.ObjectId, ref: "SizeMaster", required: true },
    categoryId: { type: Types.ObjectId, ref: "Category" },
    subCategoryId: { type: Types.ObjectId, ref: "SubCategory" },
    // collectionId: { type: String,default:"" },

    // Product snapshot (immutable after order)
    productName: { type: String, required: true },
    sku: { type: String },
    image: { type: String },


    // Pricing snapshot
    grossWeight:{type:Number,required:true},
    price: { type: Number, required: true },
    quantity: { type: Number, min: 1, required: true,default:1 },
    discountAmount: { type: Number, default: 0 },
    // taxRate: { type: Number, default: 0 }, // percent
    // lineSubtotal: { type: Number, required: true }, // unitPrice * quantity
    // lineDiscount: { type: Number, default: 0 },     // discountPerUnit * quantity
    // lineTax: { type: Number, default: 0 },
    // lineTotal: { type: Number, required: true },    // subtotal - discount + tax

    // Fulfillment
    status: {
      type: String,
      enum: ["pending", "packed", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
      index: true,
    },
    trackingNumber: { type: String, index: true },
    shippedAt: Date,
    deliveredAt: Date,

    // Returns
    returnStatus: {
      type: String,
      enum: ["none", "requested", "approved", "rejected", "refunded", "replaced"],
      default: "none",
    },
    refundAmount: { type: Number, default: 0 },
     estimatedDeliveryDays: { type: Number, required: true },
    estimatedDeliveryDate: { type: Date },
  },
  { timestamps: true }
);

// Indexes for fast lookups
OrderItemSchema.index({ orderId: 1 });
OrderItemSchema.index({ productId: 1 });
OrderItemSchema.index({ categoryId: 1, subCategoryId: 1 });

OrderItemSchema.pre("save", function (next) {
  if (this.isModified("estimatedDeliveryDays") || this.isNew) {
    const today = new Date();
    this.estimatedDeliveryDate = new Date(
      today.setDate(today.getDate() + this.estimatedDeliveryDays)
    );
  }
  next();
});




export const OrderItem = mongoose.model("OrderItem", OrderItemSchema);

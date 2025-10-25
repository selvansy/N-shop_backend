import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const CartItemSchema = new Schema(
  {
    cartId: { type: Types.ObjectId, ref: "Cart", required: true, index: true },
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    // variantId: { type: Types.ObjectId, ref: "Variant" },
    collectionId: { type:String,default:"" },
    sizeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SizeMaster",
      required: true,
    },
    categoryId: { type: Types.ObjectId, ref: "Category" },
    subCategoryId: { type: Types.ObjectId, ref: "SubCategory" },
    productName: { type: String, required: true },
    sku: { type: String },
    image: { type: String },

    // currency: { type: String, default: "INR" },
    // unitPrice: { type: Number, required: true },
    // taxRate: { type: Number, default: 0 },
    // discountPerUnit: { type: Number, default: 0 },
    quantity: { type: Number, min: 1, default: 1 },

    id_metal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metal",
      required: true,
    },
    // metalRate: { type: Number },
    metalWeight: { type: Number },

    id_purity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purity",
      required: true,
    },
    id_metal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metal",
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    // lineSubtotal: { type: Number, default: 0 },
    // lineTax: { type: Number, default: 0 },
    // lineTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CartItemSchema.index({ cartId: 1, productId: 1, variantId: 1 });

const CartItem = mongoose.model("CartItem", CartItemSchema);
export default CartItem;

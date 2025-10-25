import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const CartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", index: true, required:true },
    shippingAddress: { type: Types.ObjectId, ref: "Address" },
    billingAddress: { type: Types.ObjectId, ref: "Address" },
    currency: { type: String, default: "INR" },
    subtotal: { type: Number, default: 0 },
    itemDiscountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "locked", "converted", "abandoned"],
      default: "active",
      index: true,
    },

    expiresAt: { type: Date, index: true },
  },
  { 
    timestamps: true
  }
);

// Pre-save middleware for calculations
// CartSchema.pre('save', function(next) {
//   // Calculate each item's prices
//   this.items.forEach(item => {
//     item.unitPrice = (item.weight * item.baseMetalPrice) + item.makingCharges;
//     item.lineTotal = item.unitPrice + (item.unitPrice * (item.taxRate / 100));
//     item.lineTotal *= item.quantity;
//   });

//   // Calculate cart totals
//   this.subtotal = this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
//   this.taxTotal = this.items.reduce((sum, item) => sum + (item.unitPrice * (item.taxRate / 100) * item.quantity), 0);
//   this.itemsCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
//   this.grandTotal = this.subtotal + this.taxTotal + this.shippingFee - this.itemDiscountTotal;

//   // Update last item added timestamp
//   if (this.isModified('items') && this.items.length > 0) {
//     this.lastItemAddedAt = new Date();
//   }

//   next();
// });

// Instance method to add item
CartSchema.methods.addItem = function(itemData) {
  const newItem = {
    ...itemData,
    addedAt: new Date()
  };
  
  this.items.push(newItem);
  return this.save();
};

// Instance method to remove item
CartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  return this.save();
};

// Instance method to update item quantity
CartSchema.methods.updateItemQuantity = function(itemId, newQuantity) {
  const item = this.items.id(itemId);
  if (item) {
    item.quantity = newQuantity;
  }
  return this.save();
};

// Instance method to clear cart
CartSchema.methods.clearCart = function() {
  this.items = [];
  this.subtotal = 0;
  this.taxTotal = 0;
  this.grandTotal = 0;
  this.itemsCount = 0;
  return this.save();
};

// Static method to find cart by user with paginated items
CartSchema.statics.findByUserWithPagination = function(userId, page = 1, limit = 50) {
  return this.findOne({ userId, status: "active" })
    .select({ 
      items: { $slice: [(page - 1) * limit, limit] },
      subtotal: 1,
      taxTotal: 1,
      grandTotal: 1,
      itemsCount: 1,
      shippingAddress: 1,
      billingAddress: 1,
      status: 1
    });
};

// Static method to get cart summary (without items)
CartSchema.statics.getCartSummary = function(userId) {
  return this.findOne({ userId, status: "active" })
    .select('subtotal taxTotal grandTotal itemsCount shippingFee status');
};

// Indexes for efficient querying
CartSchema.index({ userId: 1, status: 1 });
CartSchema.index({ sessionId: 1, status: 1 });
CartSchema.index({ "items.addedAt": -1 });
CartSchema.index({ lastItemAddedAt: -1, status: 1 });

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;
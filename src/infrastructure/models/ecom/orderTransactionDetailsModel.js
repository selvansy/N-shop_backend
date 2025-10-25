import mongoose from "mongoose";

const transactiondetailsSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true, // web, ios, android
  },
  paymentCode: {
    type: String,
  },
  idCustomer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Customer",
  },
  mobile: {
    type: String,
    required: true,
  },
  idBranch: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Branch",
  },
  totalProducts: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: Number,
    required: true,
    enum: [1, 2], // 1- success ,2- pending
  },
  paymentMode: {
    type: String,
  },
  transDate: {
    type: Date,
    default: Date.now, // ✅ Corrected
    required: true,
  },
  active: {
    type: Boolean,
    default: true, // true = active, false = inactive
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model("OrderTransactionDetails", transactiondetailsSchema);
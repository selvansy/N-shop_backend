import mongoose from 'mongoose';
 
const stoneDetailsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["stone", "diamond"],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stone_master",
      required: false,
    },
    weight: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      default: null,
    },
  },
  {timestamps: false }
);
 
export default mongoose.model('StoneDetails', stoneDetailsSchema);
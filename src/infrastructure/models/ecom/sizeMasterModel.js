import mongoose from "mongoose";

const SizeMasterSchema = new mongoose.Schema(
  {
    sizeName: { type: String, required: true },
    sizes: [{ type: Number, required: true }],
    code: { type: String, required: true },
    unit: {
      type: String,
      enum: ["mm", "cm", "inch"],
      default: "mm"
    },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("SizeMaster", SizeMasterSchema);

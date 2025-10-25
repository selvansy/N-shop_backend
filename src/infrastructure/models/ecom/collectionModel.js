import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // Men, Women, Kids
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    thumbnailImage: { type: String, default: "" },
    icon: { type: String, default: "" },
    active: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Collection", collectionSchema);
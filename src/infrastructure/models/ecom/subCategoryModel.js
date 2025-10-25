import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true },
    description: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    icon: { type: String, default: "" },
    active: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

subCategorySchema.index({ name: "text" });

export default mongoose.model("SubCategory", subCategorySchema);

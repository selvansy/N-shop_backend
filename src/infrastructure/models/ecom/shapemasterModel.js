import mongoose from 'mongoose';
 
const shapeMasterSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // length_to_width_ratio: {
    //   type: mongoose.Schema.Types.Decimal128,
    //   required: false,
    // },
    // facet_count: {
    //   type: Number,
    //   required: false,
    // },
    // popular_for: {
    //   type: String,
    //   required: false,
    //   trim: true,
    // },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    image_url: {
      type: String,
      required: false,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: false,
    },
  },
  { timestamps: true }
);
 
export default mongoose.model('shape_master', shapeMasterSchema);
 
 
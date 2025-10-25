import mongoose from 'mongoose';
 
const clarityMasterSchema = new mongoose.Schema(
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
    // inclusion_level: {
    //   type: String,
    //   required: false,
    //   trim: true,
    // },
    // magnification: {
    //   type: String,
    //   required: false,
    //   trim: true,
    // },
    // grading_standard: {
    //   type: String,
    //   required: false,
    //   trim: true,
    // },
    description: {
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
 
export default mongoose.model('clarity_master', clarityMasterSchema);
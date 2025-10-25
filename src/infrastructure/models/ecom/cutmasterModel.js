import mongoose from 'mongoose';
 
const cutMasterSchema = new mongoose.Schema(
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
    // depth_percentage: {
    //   type: mongoose.Schema.Types.Decimal128,
    //   required: false,
    // },
    // table_percentage: {
    //   type: mongoose.Schema.Types.Decimal128,
    //   required: false,
    // },
    // ideal_proportions: {
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
 
export default mongoose.model('cut_master', cutMasterSchema);
 
 
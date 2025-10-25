import mongoose from 'mongoose';
 
const stoneMasterSchema = new mongoose.Schema(
  {
    // stone_category_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'stone_category',
    //   required: true,
    // },
    // rate: {
    //   type: mongoose.Schema.Types.Decimal128,
    //   required: true,
    // },
    // certificate_amount: {
    //   type: mongoose.Schema.Types.Decimal128,
    //   required: true,
    // },
    stonename:{
      type:String,
      required:true
    },
    percraterate:{
      type:String,
      required:true
    },
    stone_cut_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'cut_master',
      required: false,
    },
    clarity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'clarity_master',
      required: false,
    },
    color_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'color_master',
      required: false,
    },
    shape_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'shape_master',
      required: true,
    },
    // brand_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'brand_master',
    //   required: false,
    // },
    // size_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'stone_size',
    //   required: true,
    // },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    is_diamond: {
      type: Boolean,
      default: false,
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
 
export default mongoose.model('stone_master', stoneMasterSchema);
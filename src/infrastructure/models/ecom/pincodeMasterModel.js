import mongoose from "mongoose";

const { Schema } = mongoose;

const pincodeMasterSchema = new Schema(
  {
    id_country: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Country",
    },
    id_state: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "State",
    },
    id_city: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "City",
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    isDeliveryAvailable: {
      type: Boolean,
      default: false,
    },
    estimatedDeliveryDays: {
      type: Number,
      default: null,
    },
    isDeleted:{
      type:Boolean,
      default:false
    },
    active:{
      type:Boolean,
      default:true
    },
    description:{
      type:String,
      default:""
    },
    deliveryRate:{
      type:Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PincodeMaster", pincodeMasterSchema);
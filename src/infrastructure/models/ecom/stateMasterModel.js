import mongoose from "mongoose";

const { Schema } = mongoose;

const stateMasterSchema = new Schema(
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
    code: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deliveryEnabled:{
        type:Boolean,
        default: true
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("StateMaster", stateMasterSchema);

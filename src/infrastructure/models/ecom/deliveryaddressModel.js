import mongoose from "mongoose";

const deliveryaddressschema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        mobileNo: {
            type: String,
            required: true,
            match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        landmark: {
            type: String,
            default: "",
            trim: true,
        },
        pincode: {
            type: Number,
            required: false,
            default: null
        },
        id_customer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Customer",
            default: null
        },
        id_city: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: "City",
            default: null
        },
        id_state: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: "State",
            default: null
        },
        id_country: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: "Country",
            default: null
        },
        isPrimary: {
            type: Boolean,
            default: false
        },
        is_deleted: {
            type: Boolean,
            default: false
        },
        active:{
            type:Boolean,
            default:true
        },
        addressType: {
            type: Number,
            default: 1 // 1- home , 2- office
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Deliveryaddress", deliveryaddressschema);

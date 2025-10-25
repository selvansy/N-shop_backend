import mongoose from "mongoose";

const orderStatus = new mongoose.Schema({

    name:{
        type:String,
        required: true,
    },
    statusNo:{
        type:String,
        required:true,
    },
    description:{
        type:String
    },
        isDeleted:{
            type:Boolean,
            default:false
        },
        active:{
            type:Boolean,
            default:true
        }
});


export default mongoose.model("OrderStatus",orderStatus );
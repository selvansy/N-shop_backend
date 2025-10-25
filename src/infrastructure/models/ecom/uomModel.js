import mongoose from "mongoose";

const Uomschema = new mongoose.Schema({

    name:{
        type:String,
        required: true,
    },
    code:{
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


export default mongoose.model("Uom",Uomschema );
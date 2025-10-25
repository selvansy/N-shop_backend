import mongoose, { Schema } from 'mongoose';

const paymentSchema = new Schema({
        payment_receipt: {
            type: String,
            default: 1
        },
        id_transaction: {
            type: String,
            required: true
        },
     
        id_customer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref:'Customer'
        },
        id_employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Employee"
        },
        id_branch: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref:'Branch'
        },
        date_payment: {
            type: Date,
            required: true
        },
       
        payment_type: {
            type: Number,
            required: true,  // 1- offline,2- online
            default:1
        },
        payment_mode: {
            type: mongoose.Schema.Types.ObjectId, 
            ref:'PaymentMode'
        },
        cash_amount: {
            type: Number,
            default:0
        },

        payment_amount:{
            type:Number,
            required:true
        },
        
        payment_status: {
            type: Number,
            required: true,
            default:1   
        },
        remark: {
            type: String,
            default: null
        },
       
       
        active: {
            type: Boolean,
            default:true
        },
        is_deleted:{
            type:Boolean,
            default:false
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            required:false
        },
        paymentModeName:{
            type:String,
            default:null
        },
       
    },
    {
        timestamps: true
    }
);

export default mongoose.model('OrderPayments', paymentSchema);
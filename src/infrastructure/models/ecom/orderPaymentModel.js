import mongoose, { Schema } from 'mongoose';

const paymentSchema = new Schema({
        payment_receipt: {
            type: String,
            
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
            required: true,
            ref:'Branch'
        },
        date_payment: {
            type: Date,
            required: true
        },
        paid_installments: {
            type: Number,
            required: true,  //installement no
            default:1
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
        payment_amount: {
            type: Number,
            required: true,
            default:0
        },
        // total_payment: {
        //     type: Number,
        //     required: true,
        //     default:0
        // },
        total_amt: {
            type: Number,
            required: true,
            default:0
        },
        payment_status: {
            type: Number,
            required: true,
            default:2 // 1- success, 2- pending , 3- failed
        },
        date_add: {
            type: Date,
            required: true
        },
        added_by: {
            type: Number,
            required: true,
            default: 0     // 0 -admin , 1- web app, 2 - mobile app
        },
        active: {
            type: Boolean,
            default:true
        },
        is_deleted:{
            type:Boolean,
            default:false
        },
        paymentModeName:{
            type:String,
            default: "Cash Free"
        },
        id_product:{
           type: mongoose.Schema.Types.ObjectId, 
            ref:'Products'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('OrderPaymen', paymentSchema);
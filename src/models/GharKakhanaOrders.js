const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const SliderSchema = mongoose.Schema({
    orderid: {
        type: String,
        default: ""
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    source_location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "addresses",
    },
    destination_location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "addresses",
    },
    products: [
        {
            name: {
                type: String,
                default: ""
            },
            weight: {
                type: String,
                default: ""
            },
            quantity:{
              type:Number,
              default:''  
            },
            category: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "gharkakhanacategories",
            },
            sub_category: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "gharkakhanacategories",
            },
            height: {
                type: String,
                default: ""
            },
            weidth: {
                type: String,
                default: ""
            },
            length: {
                type: String,
                default: ""
            },
        }
    ],
    remarks: {
        type: String,
        default: ""
    },
    pickup_date: {
        type: Date,
        default: null
    },
    pickup_time: {
        type: String,
        default: ""
    },
    delivery_type: {
        type: String,
        default: ""
    },
    delivery_date: {
        type: Date,
        default: null
    },
    delivery_timeslot: {
        type: String,
        default: ""
    },
    active: {
        type: Number,
        default: 1
    },
    deleted: {
        type: Number,
        default: 0
    },
    total_price: {
        type: String,
        default: ""
    },
    shipping_price: {
        type: String,
        default: ""
    },
    pickup_price: {
        type: String,
        default: ""
    },
    delivery_price: {
        type: String,
        default: ""
    },
    pickup_distance: {
        type: String,
        default: ""
    },
    delivery_distance: {
        type: String,
        default: ""
    },
    total_weight: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "pending"
    },
    order_confirmation: {
        type: Number,
        default: 0
    },
    pickup_partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    pickup_boy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    delivery_partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    delivery_boy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    sgst: {
        type: String,
        default: ""
    },
    igst: {
        type: String,
        default: ""
    },
    cgst: {
        type: String,
        default: ""
    },
    multiplier_for_delivery:{
        type: String,
        default: ""
    },
    delivery_free_distance:{
        type: String,
        default: ""
    },
    pick_up_free_distance:{
        type: String,
        default: ""
    },
    multiplier_for_pickup:{
        type: String,
        default: ""
    },
    otp: {
        type: String,
        default: "",
    },
    gateway: {
        type: String,
        default: null,
    },
    source_city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        default: null,
    },
    destination_city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        default: null,
    },
    paid_amount :{
        type: String,
        default: ""
    },
    dues_amount :{
        type: String,
        default: ""
    },
    order_count:{
        type : String,
        default: ""
    },
    browser: {
        type: String,
        default: "",
    },
    transactionid: {
        type: String,
        default: null,
    },
    second_paid_amount :{
        type: String,
        default: ""
    },
    second_transactionid: {
        type: String,
        default: null,
    },
    second_gateway: {
        type: String,
        default: null,
    },
    second_time_payment_status:{
        type: String,
        default:"0", // 0 --> off or false 1--> on or true
    },

    lp_head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    lp_manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    shop_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "shop",
        default: null,
    },
},
    { timestamps: true }
);
module.exports = mongoose.model('gharKaKhanaOrders', SliderSchema);
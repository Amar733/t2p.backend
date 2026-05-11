const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment().tz("Asia/Kolkata").format();

const ShopModalSchema = mongoose.Schema({
    shop_name: {
        type: String,
        default: "",
    },
    shop_description: {
        type: String,
        default: "",
    },
    full_name: {
        type: String,
        default: "",
    },
    mobile: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        default: "",
    },
    address2: {
        type: String,
        default: "",
    },
    landmark: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "states",
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
    },
    post_office: {
        type: String,
        default: "",
    },
    pincode: {
        type: String,
        default: "",
    },
    position: {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    menu: {
        type: [],
    },
    banner: {
        type: [],
    },
    fssi: {
        type: [],
    },
    bank_details: {
        acc_no: {
            type: String,
            default: "",
        },
        bank_name: {
            type: String,
            default: "",
        },
        bank_location: {
            type: String,
            default: "",
        },
        ifsc_code: {
            type: String,
            default: "",
        },
        acc_holder_name: {
            type: String,
            default: "",
        }
    },
    upi_id: {
        type: String,
        default: "",
    },
    qr_code: {
        type: String,
        default: "",
    },
    deleted: {
        type: Number,
        default: 0,
    },
    active: {
        type: Number,
        default: 0,
    },
    added_by : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    otp: {
        type:String,
        default:""
    },
    device_token: {
        type: String,
        default:""
    },
    device_type: {
        type:String,
        default:""
    },
    mobile2: {
        type:String,
        default:""
    }, 
    mobile3: {
        type:String,
        default:""
    },
    dish1:{
        type:String,
        default:""
    },
    dish2:{
        type:String,
        default:""
    },
    dish3:{
        type:String,
        default:""
    },
    detail1:{
        type:String,
        default:""
    },
    detail2:{
        type:String,
        default:""
    },
    detail3: {
        type:String,
        default:""
    },
},
    { timestamps: true }
);
module.exports = mongoose.model("shop", ShopModalSchema);

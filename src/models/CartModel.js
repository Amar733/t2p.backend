const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const CartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        default: null
    },
    productname: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        default: null
    },
    sub_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        default: null
    },
    cuisine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cuisines',
        default: null
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'brands',
        default: null
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cities',
        default: null
    },
    customer_city: {
        type: String,
        default: ""
    },
    customer_zipcode: {
        type: String,
        default: ""
    },
    quantity: {
        type: Number,
        default: 1
    },
    price: {
        type: SchemaTypes.Double,
        default: ""
    },
    coupon:{
        type: String,
        default: ""
    },
    coupontype:{
        type: String,
        default: ""
    },
    couponamount:{
        type: String,
        default: ""
    },
    created_date: {
        type: Date, default: dateKolkata
    },
    update_date: {
        type: Date, default: dateKolkata
    }
});
module.exports = mongoose.model('carts', CartSchema);
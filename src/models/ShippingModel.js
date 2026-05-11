const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const ShippingSchema = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    description_after_ref: {
        type: String,
        default: ""
    },
    price: {
        type: String,
        default: ""
    },
    created_date: {
        type: Date, default: dateKolkata
    },
    update_date: {
        type: Date, default: dateKolkata
    },
    active: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model('shipping_classes', ShippingSchema);
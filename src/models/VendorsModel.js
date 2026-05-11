const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const VendorSchema = mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    contact_person: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        default: ''
    },
    created_date: {
        type: Date, default: dateKolkata
    },
    update_date: {
        type: Date, default: dateKolkata
    },
    active: {
        type: Number,
        default: 1
    },
    deleted: {
        type: Number,
        default: 0
    },
    address: {
        type: String,
        default: ''
    },
    note: {
        type: String,
        default: ''
    }
});
module.exports = mongoose.model('vendors', VendorSchema);
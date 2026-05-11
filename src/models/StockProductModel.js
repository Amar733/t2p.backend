const mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stock_categories',
        default: null
    },
    sub_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stock_categories',
        default: null
    },
    desc: {
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
    },
    weight: {
        type: String,
        default: ""
    },
    bag_no: {
        type: Array,
        default: []
    }
});
module.exports = mongoose.model('stock_products', ProductSchema);
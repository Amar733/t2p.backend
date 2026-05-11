const mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const CategorySchema = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
   
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stock_categories',
        default: null
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
module.exports = mongoose.model('stock_categories', CategorySchema);
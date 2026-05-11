const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const BrandSchema = mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'checkouts',
        default: null
    },
    added_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    date: {
        type: Date, 
        default: dateKolkata
    },
    note: {
        type: String,
        default: ""
    },
    customer_type: {
        type: String,
        default: ""
    },
    complaint_type: {
        type: String,
        default: ""
    }
});
module.exports = mongoose.model('other_order_note', BrandSchema);
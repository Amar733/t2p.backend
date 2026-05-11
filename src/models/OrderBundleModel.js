const mongoose = require("mongoose");
require('mongoose-double')(mongoose);
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const SchemaTypes = mongoose.Schema.Types;
const OrderNoteSchema = mongoose.Schema({
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'checkouts'
    }],
    delivery_partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    box_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order_box',
        default: null
    },
    bag:{
        type: String,
        default: ""
    },
    created_date: {
        type: Date, default: dateKolkata
    }
});
module.exports = mongoose.model('order_bundle', OrderNoteSchema);
const mongoose = require("mongoose");
require('mongoose-double')(mongoose);
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const SchemaTypes = mongoose.Schema.Types;
const OrderNoteSchema = mongoose.Schema({
    bundles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order_bundle'
    }],
    bag:{
        type: String,
        default: ""
    },
    delivery_partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    created_date: {
        type: Date, default: dateKolkata
    }
});
module.exports = mongoose.model('order_box', OrderNoteSchema);
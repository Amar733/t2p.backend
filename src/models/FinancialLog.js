const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment().tz("Asia/Kolkata").format();
require("mongoose-double")(mongoose);
const SchemaTypes = mongoose.Schema.Types;

const checkoutSchema = mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "checkouts",
        default: null,
    },
    partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    commission: {
        type: SchemaTypes.Double,
        default: 0,
    },
    total_weight: {
        type: String,
        default: 0,
    },
    created_date: {
        type: Date,
        default: Date.now,
    },

    end_date: {
        type: Date,
        default: Date.now,
    },

    distance: {
        type: SchemaTypes.Double,
        default: "0",
    },
    type: {
        type: String,
        default: "IN",
    },
    note: {
        type: String,
        default: "IN",
    },
    paid: {
        type: Boolean,
        default: false,
    },

    start_address: {
        type: String,
        default: "",
    },

    end_address: {
        type: String,
        default: "",
    },
    tip_price: {
        type: String,
        default: "0",
    },
});
module.exports = mongoose.model("financial_logs", checkoutSchema);

const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment().tz("Asia/Kolkata").format();
const BulkOrderSchema = mongoose.Schema({
    name: {
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },
    address: {
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
    message: {
        type: String,
        default: "",
    },
    active: {
        type: Number,
        default: 1,
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model("bulk_orders", BulkOrderSchema);

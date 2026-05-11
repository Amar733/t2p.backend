const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment().tz("Asia/Kolkata").format();

const checkoutSchema = mongoose.Schema({
    orderid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "checkouts",
        default: null,
    },
    schedule_time: {
        type: String,
        default: "",
    },
    schedule_date: {
        type: Date,
        default: dateKolkata,
    },
    schedule_status: {
        type: String,
        default: "",
    },
    schedule_status_to: {
        type: String,
        default: "",
    },
});
module.exports = mongoose.model("schedule", checkoutSchema);

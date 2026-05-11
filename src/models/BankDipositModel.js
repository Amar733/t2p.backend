const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment().tz("Asia/Kolkata").format();
const BankDipositSchema = mongoose.Schema({
    type: {
        type: String,
        default: "",
    },
    from: {
        type: String,
        default: "",
    },
    mode: {
        type: String,
        default: "",
    },
    date_of_payment: {
        type: String,
        default: "",
    },
    diposit_by: {
        type: String,
        default: "",
    },
    amount: {
        type: String,
        default: "",
    },
    comment: {
        type: String,
        default: "",
    },
    file: {
        type: [],
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
    update_date: {
        type: Date,
        default: dateKolkata,
    },
    action_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    reason: {
        type: String,
        default: null,
    },
    active: {
        type: Number,
        default: 0,
    },
});
module.exports = mongoose.model("bank_diposit", BankDipositSchema);

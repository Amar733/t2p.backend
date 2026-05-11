const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const MarketingExpenseSchema = mongoose.Schema({
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        default: null,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "expense_categories",
        default: null,
    },
    sub_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "expense_categories",
        default: null,
    },
    amount: {
        type: String,
        default: "",
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        default: null,
    },
    date_of_payment: {
        type: Date,
        default: dateKolkata,
    },
    comment: {
        type: String,
        default: "",
    },
    active: {
        type: Number,
        default: 0,
    },
    deleted: {
        type: Number,
        default: 0,
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
    update_date: {
        type: Date,
        default: dateKolkata,
    },
    added_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "offices",
        default: null,
    },
    file: {
        type: [],
    },
    office_type: {
        type: String,
        default: "",
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
});
module.exports = mongoose.model("marketing_expenses", MarketingExpenseSchema);

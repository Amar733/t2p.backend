const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const PickupPartnerSchema = mongoose.Schema({
    coupon: {
        type: String,
        default: "",
    },
    desc: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        default: "",
    },
    amount: {
        type: String,
        default: "",
    },
    start_date: {
        type: Date,
        default: dateKolkata,
    },
    exp_date: {
        type: Date,
        default: dateKolkata,
    },
    minimum_amount: {
        type: String,
        default: "",
    },
    maximum_amount: {
        type: String,
        default: "",
    },
    max_usage_limit: {
        type: Number,
        default: 0,
    },
    max_usage_limit_user: {
        type: Number,
        default: 0,
    },
    created_date: {
        type: Date,
        default: dateKolkata,
    },
    update_date: {
        type: Date,
        default: dateKolkata,
    },
    active: {
        type: Number,
        default: 0,
    },
    deleted: {
        type: Number,
        default: 0,
    },
    brand: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "brands",
            default: null,
        },
    ],
    category: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
            default: null,
        },
    ],
    product: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            default: null,
        },
    ],
    customer: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            default: null,
        },
    ],
    exclusive: {
        type: String,
        default: "no",
    },
    maximum_discount: {
        type: String,
        default: ""
    }
});
module.exports = mongoose.model("coupon", PickupPartnerSchema);

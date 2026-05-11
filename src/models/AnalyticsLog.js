const mongoose = require("mongoose");

const AnalyticsLog = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        default: null,
    },
    quantity: {
        type: Number,
        default:0
    },
    cuisine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cuisines",
        default: null,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "brands",
        default: null,
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        default: null,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        default: null,
    },
    sub_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        default: null,
    },
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("analytics_log", AnalyticsLog);

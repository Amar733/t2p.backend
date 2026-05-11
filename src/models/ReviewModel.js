const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment().tz("Asia/Kolkata").format();
const ReviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        default: null,
    },
    name: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        default: "",
    },
    mobile: {
        type: String,
        default: "",
    },
    rating: {
        type: String,
        default: "",
    },
    review: {
        type: String,
        default: "",
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
    active: {
        type: Number,
        default: 0,
    },
    deleted: {
        type: Number,
        default: 0,
    },
    file: {
        type: String,
        default: "",
    },

});
module.exports = mongoose.model("reviews", ReviewSchema);

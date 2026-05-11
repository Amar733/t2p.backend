const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const AddressSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    title: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        default: "",
    },
    address2: {
        type: String,
        default: "",
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "states",
    },
    post_office: {
        type: String,
        default: "",
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
    },
    pincode: {
        type: String,
        default: "",
    },
    contact_name: {
        type: String,
        default: "",
    },
    contact_mobile: {
        type: String,
        default: "",
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
    position: {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    landmark: {
        type: String,
        default: "",
    },
});
AddressSchema.index({ position: "2dsphere" });
module.exports = mongoose.model("addresses", AddressSchema);

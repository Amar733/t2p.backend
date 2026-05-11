const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment().tz("Asia/Kolkata").format();
const VendorSchema = mongoose.Schema({
    start_city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        default: null,
    },
    end_city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        default: null,
    },
    cut_of_time: {
        type: String,
        default: "",
    },
    final_delivery_time: {
        type: String,
        default: "",
    },
    remarks: {
        type: String,
        default: "",
    },
    timeslot: {
        type: String,
        default: "",
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
    update_date: {
        type: Date,
        default: dateKolkata,
    },
    express: {
        type: Boolean,
        default: false,
    },
    express_cut_of_time_first: {
        type: String,
        default: "",
    },
    express_final_delivery_time_first: {
        type: String,
        default: "",
    },
    timeslot_first: {
        type: String,
        default: "",
    },
    express_cut_of_time_second: {
        type: String,
        default: "",
    },
    express_final_delivery_time_second: {
        type: String,
        default: "",
    },
    timeslot_second: {
        type: String,
        default: "",
    },
    normal_delivery_cost: {
        type: Number,
        default: 0,
    },
    express_delivery_cost: {
        type: Number,
        default: 0,
    },
    ghar_ka_khana_normal_delivery_cost: {
        type: Number,
        default: 0,
    },
    ghar_ka_khana_express_delivery_cost: {
        type: Number,
        default: 0,
    },
    active: {
        type: Number,
        default: 0,
    },
    deleted: {
        type: Number,
        default: 0,
    },
    express_remarks: {
        type: String,
        default: "",
    },
});
module.exports = mongoose.model("cut_of_time", VendorSchema);

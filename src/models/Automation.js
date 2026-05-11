const mongoose = require("mongoose");

const Automation = mongoose.Schema({
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
    automation_schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "automation_schedule",
        default: null,
    },
    status1: {
        type: Number,
        default: 0
    },
    status2: {
        type: Number,
        default: 0
    },
    status3: {
        type: Number,
        default: 0
    },
    status1W: {
        type: Number,
        default: 0
    },
    status2W: {
        type: Number,
        default: 0
    },
    status3W: {
        type: Number,
        default: 0
    },
    type: {
        type: Number
    },
    allsent: {
        type: Number,
        default: 0
    },
    allsentW: {
        type: Number,
        default: 0
    },
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("automation", Automation);

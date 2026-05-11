const mongoose = require("mongoose");

const TopHeader = mongoose.Schema({
    heading: {
        type: String
    },
    sub_heading: {
        type: String
    },
    mobile_image: {
        type: String
    },
    desktop_image: {
        type: String
    },
    redirect_to: {
        type: String,
        default:""
    },
    deleted: {
        type: Number,
        default: 0
    },
    active : {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('TopHeader', TopHeader);
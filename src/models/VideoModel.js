const mongoose = require("mongoose");

const VideoModel = mongoose.Schema({
    name: {
        type: String
    },
    details: {
        type: String
    },
    video_link_mob: {
        type: String
    },
    video_link_desktop: {
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

module.exports = mongoose.model('video_model', VideoModel);
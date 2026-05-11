const mongoose = require("mongoose");

const AnalyticsLog = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    page: {
        type: String,
        default: ""
    },
    action: { // e.g., "view", "create", "update", "delete"
        type: String,
        default: ""
    },
    ip_address: { // IP address of the user
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    device:{
        type: String,
        default:""
    },
    type: {
        type: String,
        default: ""
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("daily_activity", AnalyticsLog);

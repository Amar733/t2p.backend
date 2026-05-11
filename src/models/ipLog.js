const mongoose = require("mongoose");

const GiftSchema = mongoose.Schema({
    ip: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        default: ""
    },
    quantity: {
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
    internet_provider: {
        type: String,
        default: ""
    },
    active: {
        type: Number,
        default: 0
    },
    unblock_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('ip_log', GiftSchema);

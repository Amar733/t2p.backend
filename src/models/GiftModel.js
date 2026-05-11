const mongoose = require("mongoose");

const GiftSchema = mongoose.Schema({
    gift_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gifts',
        default: null
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    images: {
        type: [],
        default: null
    },
    video: {
        type: String,
        default: ""
    },
    minExpend: {
        type: String,
        default: ""
    },
    maxExpend: {
        type: String,
        default: ""
    },
    dateValidFrom: {
        type: Date,
        default: null
    },
    dateValidTo: {
        type: Date,
        default: null
    },
    active: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Number,
        default: 0
    },
},
    { timestamps: true }
);

module.exports = mongoose.model('gifts', GiftSchema);

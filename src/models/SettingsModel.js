const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const CMSSchema = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    value: {
        type: String,
        default: ""
    },
    order: {
        type: Number,
        default: ""
    }
});

module.exports = mongoose.model('settings', CMSSchema);
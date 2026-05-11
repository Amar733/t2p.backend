const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const StatesSchema = mongoose.Schema({
    name: {
        type: String
    },
    active: {
        type: Number,
        default: 0
    },
    created_date: {
        type: Date, default: dateKolkata
    },
    deleted: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('states', StatesSchema);
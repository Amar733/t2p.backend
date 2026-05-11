const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const DicstrictsSchema = mongoose.Schema({
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'states'
    },
    state_name:{
        type: String
    },
    name: {
        type: String
    },
    active: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Number,
        default: 0
    },
    created_date: {
        type: Date, default: dateKolkata
    }
});

module.exports = mongoose.model('districts', DicstrictsSchema);
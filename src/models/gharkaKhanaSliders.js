const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const SliderSchema = mongoose.Schema({
    // city: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'cities',
    //     default: null
    // },
    name: {
        type: String,
        default: ""
    },
    file: {
        type: String,
        default: ""
    },
    desktop_file: {
        type: String,
        default: ""
    },
    created_date: {
        type: Date, default: dateKolkata
    },
    update_date: {
        type: Date, default: dateKolkata
    },
    active: {
        type: Number,
        default: 1
    },
    deleted: {
        type: Number,
        default: 0
    }
},    { timestamps: true });
module.exports = mongoose.model('gharKaKhanasliders', SliderSchema);
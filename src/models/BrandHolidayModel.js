const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const BrandSchema = mongoose.Schema({
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'brands'
    },
    date: {
        type: Date, 
        default: dateKolkata
    },
    reason: {
        type: String,
        default: ""
    }
});
module.exports = mongoose.model('brands_holiday', BrandSchema);
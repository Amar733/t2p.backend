const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;

const PlanSchema = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    price: {
        type: SchemaTypes.Double,
        default: ""
    },
    day: {
        type: Number,
        default: 0
    },
    city: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cities',
        default: null
    }],
    min_price: {
        type: SchemaTypes.Double,
        default: ""
    },
    max_price: {
        type: SchemaTypes.Double,
        default: ""
    },
    discount: {
        type: SchemaTypes.Double,
        default: ""
    },
    point: {
        type: SchemaTypes.Double,
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
        default: 0
    },
    deleted: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model('plans', PlanSchema);
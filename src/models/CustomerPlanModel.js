const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;

const PlanSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'plans',
        default: null
    },
    transactionid:{
        type: String,
        default: null
    },
    gateway:{
        type: String,
        default: null
    },
    amount: {
        type: SchemaTypes.Double,
        default: 0
    },
    exp_date: {
        type: Date, default: dateKolkata
    },
    created_date: {
        type: Date, default: dateKolkata
    },
    update_date: {
        type: Date, default: dateKolkata
    }
});
module.exports = mongoose.model('customer_plans', PlanSchema);
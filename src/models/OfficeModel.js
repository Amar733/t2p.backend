const mongoose = require("mongoose");
require('mongoose-double')(mongoose);
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const SchemaTypes = mongoose.Schema.Types;

const OfficeSchema = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cities'
    },
    address: {
        type: String,
        default: ""
    },
    contact_person: {
        type: String,
        default: ""
    },
    contact_person_email: {
        type: String,
        default: ""
    },
    contact_person_mobile: {
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
        default: 0
    },
    deleted: {
        type: Number,
        default: 0
    },
    bag_no: {
        type: Array,
        default: []
    },
    position: {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    complete_address: {
        type:String,
        default:""
    }
});
module.exports = mongoose.model('offices', OfficeSchema);
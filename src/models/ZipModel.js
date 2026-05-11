const mongoose = require("mongoose");
require("mongoose-double")(mongoose);
const moment = require("moment-timezone");
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const SchemaTypes = mongoose.Schema.Types;

const ZipSchema = mongoose.Schema({
    name: {
        type: String,
        default: "",
    },
    timeslot: {
        type: String,
        default: "",
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
    },
    additional_cost: {
        type: SchemaTypes.Double,
        default: 0,
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
    update_date: {
        type: Date,
        default: dateKolkata,
    },
    active: {
        type: Number,
        default: 0,
    },
    deleted: {
        type: Number,
        default: 0,
    },
    cod: {
        type: Boolean,
        default: false,
    },
    express_cod: {
        type: Boolean,
        default: false,
    },
    express: {
        type: Boolean,
        default: true,
    },
    cod_availability: {
        type: Number,
        default: 1, /// 1 Yes  , 0 No
    },
});
module.exports = mongoose.model("zips", ZipSchema);

const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
require("mongoose-double")(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const CartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        default: null,
    },

    created_date: {
        type: Date,
        default: dateKolkata,
    },
    update_date: {
        type: Date,
        default: dateKolkata,
    },
});
module.exports = mongoose.model("wishes", CartSchema);

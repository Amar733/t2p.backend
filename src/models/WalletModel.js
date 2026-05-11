const mongoose = require("mongoose");
require("mongoose-double")(mongoose);
const ZipSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    point: {
        type: Number,
        default: 0,
    },
    type: {
        type: Number,
        default: 0,
    },
    note: {
        type: String,
        default: "",
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
    update_date: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model("wallets", ZipSchema);

const mongoose = require("mongoose");
require("mongoose-double")(mongoose);
const SchemaTypes = mongoose.Schema.Types;

const moment = require("moment-timezone");
const dateKolkata = moment().tz("Asia/Kolkata").format();

let counter = 1;
let CountedId = { type: Number, default: () => counter++ };

const StockTransactionSchema = mongoose.Schema({
    id: CountedId,
    po_id: {
        type:String,
        default:""
    },
    bill_no: {
        type: String,
        default: "",
    },
    bill_date: {
        type: Date,
        default: null,
    },
    amount: {
        type: SchemaTypes.Double,
        default: "",
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
    type: {
        type: Number,
        default: 0,
    },
    note: {
        type: String,
        default: "",
    },
    inward_office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "offices",
        default: null,
    },
    outward_office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "offices",
        default: null,
    },
    bag_no: {
        type: Array,
        default: [],
    },
    purchase_price: {
        type: String,
        default: ""
    },
    approved: {
        type:Number,
        default: 0
    },
    order_status: {
        type: String,
        default:""
    },
    customer_city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        default: null,
    },
    source: {
        type: Number,
        default: 0 ////0 -> default ,1 -> automate
    },
    total_purchase_price : {
        type: String,
        default:""
    }

});

const Model = mongoose.model("purchase_stock_transactions", StockTransactionSchema);
module.exports = Model;

Model.find({ id: { $gt: 0 } })
    .sort({ id: -1 })
    .then(([first, ...others]) => {
        if (first) counter = first.id + 1;
    });

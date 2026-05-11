const mongoose = require("mongoose");
require("mongoose-double")(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const moment = require("moment-timezone");
const dateKolkata = moment().tz("Asia/Kolkata").format();

const StockTransactionProductSchema = mongoose.Schema({
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
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "purchase_stock_transactions",
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
    },
    name: {
        type: String,
        default: "",
    },
    bill_no: {
        type: String,
        default: "",
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stock_categories",
        default: null,
    },
    sub_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stock_categories",
        default: null,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    qty: {
        type: Number,
        default: 0,
    },
    unit: {
        type: String,
        default: "",
    },
    rate: {
        type: SchemaTypes.Double,
        default: "",
    },
    total: {
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
    bag_no: {
        type: Array,
        default: [],
    },
    bag_no: {
        type: Array,
        default: [],
    },
    purchase_price: {
        type: String,
        default: ""
    },
    total_purchase_price: {
        type: String,
        default: ""
    },
    approved : {
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
    destroyed: {
        type: Number,
        default: 0 ////1---> true, 0 false
    },
    order_current_location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        default: null,
    },
    scrap : {
        type: Number,
        default: 0
    },
    total_difference: {
        type: String,
        default:"0"
    },
    older_order_no: {
        type: String,
        default:""
    }
});
module.exports = mongoose.model("purchase_stock_transaction_products", StockTransactionProductSchema);

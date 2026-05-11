const mongoose = require("mongoose");
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;

const RateSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stock_products'
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors'
    },
    unit: {
        type: String,
        default: ""
    },
    price: {
        type: SchemaTypes.Double,
        default: 0
    },
    note: {
        type: String,
        default: ""
    }
});
module.exports = mongoose.model('product_rates', RateSchema);
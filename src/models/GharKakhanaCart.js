const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const CartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    name: {
        type: String,
        default: ""
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gharkakhanacategories',
        default: null
    },
    sub_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gharkakhanacategories',
        default: null
    },
    shop_product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shop_product',
        default: null
    },
    price: {
        type: String,
        default: ""
    },
    weight: {
        type: String,
        default: ""
    },
    height: {
        type: String,
        default: ""
    },
    weidth: {
        type: String,
        default: ""
    },
    length: {
        type: String,
        default: ""
    },
    quantity: {
        type: Number,
        default: 0
    }
},
    { timestamps: true }
);
module.exports = mongoose.model('gharkakhanacarts', CartSchema);
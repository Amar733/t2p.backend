const mongoose = require("mongoose");
 
const ShopProductSchema = mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "shop",
        default: null,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "gharkakhanacategories",
        default: null,
    },
    sub_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "gharkakhanacategories",
        default: null,
    },
    name: {
        type: String,
        default: ""
    },
    weight: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    active: {
        type: Number,
        default: 0      
    },
    deleted: {
        type: Number,
        default: 0      
    },
},
    { timestamps: true }
);
module.exports = mongoose.model("shop_product", ShopProductSchema);

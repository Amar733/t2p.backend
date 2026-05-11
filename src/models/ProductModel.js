const mongoose = require("mongoose");
const mongooseSlugPlugin = require("mongoose-slug-plugin");
const moment = require("moment-timezone");
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
require("mongoose-double")(mongoose);
const SchemaTypes = mongoose.Schema.Types;

const ProductSchema = mongoose.Schema({
    combo_products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
        },
    ],
    // products: [{
    //     product: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'products'
    //     },
    //     box: {
    //         type: Number
    //     }
    // }],
    name: {
        type: String,
        default: "",
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        default: null,
    },
    sub_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        default: null,
    },
    cuisine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cuisines",
        default: null,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "brands",
        default: null,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    desc: {
        type: String,
        default: "",
    },
    short_desc: {
        type: String,
        default: "",
    },
    file: {
        type: [],
    },
    price: {
        type: SchemaTypes.Double,
        default: "",
    },
    previous_price: {
         type: Number,
         default: null,
},
    selling_price: {
        type: SchemaTypes.Double,
        default: "",
    },
    discounted_price: {
        type: String,
        default: "",
    },
    purchase_price: {
        type: String,
        default: "",
    },
    batchno: {
        type: String,
        default: "",
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        default: null,
    },
    commission: {
        type: String,
        default: "",
    },
    packaging_charge: {
        type: String,
        default: "",
    },
    tax_status: {
        type: String,
        default: "",
    },
    cgst: {
        type: String,
        default: "",
    },
    sgst: {
        type: String,
        default: "",
    },
    igst: {
        type: String,
        default: "",
    },
    sku: {
        type: String,
        default: "",
    },
    stock_qty: {
        type: String,
        default: "",
    },
    backorders: {
        type: String,
        default: "",
    },
    threshold: {
        type: String,
        default: "",
    },
    manage_stock: {
        type: Number,
        default: 0,
    },
    weight: {
        type: String,
        default: "",
    },
    length: {
        type: String,
        default: "",
    },
    width: {
        type: String,
        default: "",
    },
    height: {
        type: String,
        default: "",
    },
    // shipping: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'shipping_classes',
    //     default: null
    // },
    attribute: {
        type: String,
        default: "",
    },
    tags: {
        type: String,
        default: "",
    },
    start_date: {
        type: Date,
        default: dateKolkata,
    },
    end_date: {
        type: Date,
        default: dateKolkata,
    },
    created_date: {
        type: Date,
        default: dateKolkata,
    },
    update_date: {
        type: Date,
        default: dateKolkata,
    },
    active: {
        type: Number,
        default: 0,
    },
    best_seller: {
        type: Number,
        default: 0,
    },
    deal: {
        type: Number,
        default: 0,
    },
    featured: {
        type: Number,
        default: 0,
    },
    deleted: {
        type: Number,
        default: 0,
    },
    express: {
        type: Boolean,
        default: true,
    },
    added_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    point: {
        type: Number,
        default: 0,
    },
    point_exp_date: {
        type: Date,
        default: "A",
    },
    stock_product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stock_products",
        default: "6049f3db426ac9000878ddf6",
    },
    consumable: {
        type: Number,
        default: 0,
    },
    seo_title: {
        type: String,
        default: "",
    },
    seo_description: {
        type: String,
        default: "",
    },
    seo_keywords: {
        type: String,
        default: "",
    },
    top: {
        type: Number,
        default: 0,
    },
    taste: {
        type: Number,
        default: 0,////0 -> non veg, 1 -> veg
    },
    rating: {
        type: String,
        default: "0"
    },
    hot_food_delivery_charges: {
        type: String,
        default: "",
    },
    hot_food_available: {
        type: Number,
        default: 0        // 0 ---> false , 1 --- true
    },
    product_life: {
        type: String,
        default: ""
    },
    alternative_products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
        },
    ],
},
);
ProductSchema.plugin(mongooseSlugPlugin, { tmpl: "<%=name%>" });
module.exports = mongoose.model("products", ProductSchema);

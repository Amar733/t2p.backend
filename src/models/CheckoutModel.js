const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment().tz("Asia/Kolkata").format();
require("mongoose-double")(mongoose);
const SchemaTypes = mongoose.Schema.Types;

const checkoutSchema = mongoose.Schema({
    orderid: {
        type: String,
        default: "",
    },
    transactionid: {
        type: String,
        default: null,
    },
    gateway: {
        type: String,
        default: null,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    pickup_partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    pickup_partner_commission: {
        type: Number,
        default: 0,
    },
    pickup_boy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    cargo_partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    cargo_partner_commission: {
        type: SchemaTypes.Double,
        default: "0",
    },
    delivery_partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    lp_head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    lp_manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    delivery_partner_commission: {
        type: SchemaTypes.Double,
        default: "0",
    },
    total_weight: {
        type: String,
        default: 0,
    },
    delivery_boy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "addresses",
    },
    order_city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        default: null,
    },
    vendor_city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cities",
        default: null,
    },
    products: [
        {
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
            city: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "cities",
                default: null,
            },
            quantity: {
                type: Number,
                default: 0,
            },
            price: {
                type: SchemaTypes.Double,
                default: 0,
            },
            productname: {
                type: String,
                default: "",
            },
        },
    ],
    coupon: {
        type: String,
        default: null,
    },
    coupontype: {
        type: String,
        default: null,
    },
    couponamount: {
        type: String,
        default: null,
    },
    price: {
        type: String,
        default: "",
    },
    finalprice: {
        type: String,
        default: "",
    },
    cod_collected: {
        type: String,
        default: "0",
    },
    express: {
        type: String,
        default: "",
    },
    totalShippingPrice: {
        type: String,
        default: "",
    },
    totalPackingPrice: {
        type: String,
        default: "",
    },
    totalCGST: {
        type: String,
        default: "",
    },
    totalSGST: {
        type: String,
        default: "",
    },
    totalIGST: {
        type: String,
        default: "",
    },
    additional_cost: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        default: "pending_payment",
    },
    customer_order_status: {
        type: String,
        default: "",
    },
    timeslot: {
        type: String,
        default: "",
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
    update_date: {
        type: Date,
        default: dateKolkata,
    },
    otp: {
        type: String,
        default: "",
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
    vendor_position: {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    cargo_position: {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    delivery_partner_position: {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    delivery_date: {
        type: Date,
        default: dateKolkata,
    },
    deleted: {
        type: Number,
        default: 0,
    },
    schedule_time: {
        type: String,
        default: "",
    },
    schedule_date: {
        type: Date,
        default: dateKolkata,
    },
    schedule_status: {
        type: String,
        default: "",
    },
    schedule_status_to: {
        type: String,
        default: "",
    },
    distance: {
        type: SchemaTypes.Double,
        default: "0",
    },
    paid: {
        type: SchemaTypes.Double,
        default: 0,
    },
    bundle_qr: {
        type: Number,
        default: 0,
    },
    bundle_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order_bundle",
        default: null,
    },
    bag: {
        type: String,
        default: "",
    },
    box_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order_box",
        default: null,
    },
    has_note: {
        type: String,
        default: 0,
    },
    wallet_discount: {
        type: String,
        default: 0,
    },
    pickup_weight: {
        type: String,
        default: "",
    },
    delivery_weight: {
        type: String,
        default: "",
    },
    partial_transaction: {
        type: String,
        default: "",
    },
    partial_transaction_amount: {
        type: String,
        default: "",
    },

    return_reason: {
        type: String,
        default: "",
    },
    complementary: {
        type: Number,
        default: 0,
    },
    browser: {
        type: String,
        default: "",
    },

    pickup_distance: {
        type: SchemaTypes.Double,
        default: 0,
    },
    delivery_distance: {
        type: SchemaTypes.Double,
        default: 0,
    },
    tip_price: {
        type: String,
        default: "",
    },
    order_count: {
        type: Number,
        default: 1
    },
    last_mile_long_distance_extra_charge: {
        type: String,
        default: "",    
    },
    last_mile_long_distance: {
        type: String,
        default: "",    
    },
    last_mile_free_long_distance: {
        type: String,
        default: "",    
    },
    last_mile_long_distance_multiplier: {
        type: String,
        default: "",    
    },
    hot_food_selected:{
        type: Number,
        default: 0,    // 0 ---> false , 1 --- true
    },

    hot_food_total_cost :{
        type: String,
        default: "",   
    },
    old_price: {
        type:String,
        default:''
    }

});
checkoutSchema.index({ position: "2dsphere" });
checkoutSchema.index({ vendor_position: "2dsphere" });
checkoutSchema.index({ cargo_position: "2dsphere" });
checkoutSchema.index({ delivery_partner_position: "2dsphere" });
module.exports = mongoose.model("checkouts", checkoutSchema);

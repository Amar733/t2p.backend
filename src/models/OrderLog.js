const mongoose = require("mongoose");

const OrderLogSchema = mongoose.Schema({
    updated_by_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "checkouts",
        default: null,
    },
    ghar_ka_khana_order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "gharKaKhanaOrders",
        default: null,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        default: null,
    },
    zipcode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "zips",
        default: null,
    },
    type: {
        type: String,
        default: "",
    },
    event: {
        type: String,
        default: "",
    },
    event_data: {
        type: String,
        default: "",
    },
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("order_logs", OrderLogSchema);

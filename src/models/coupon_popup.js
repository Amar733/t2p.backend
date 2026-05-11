const mongoose = require("mongoose");

const PickupPartnerSchema = mongoose.Schema({
    name:{
      type:String,
      default:""  
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "coupon",
        default: null,
    },
    file: {
        type: String,
        default: ""
    },
    active: {
        type: Number,
        default: 0
    }
},
    { timestamps: true }
);
module.exports = mongoose.model("coupon_popup", PickupPartnerSchema);

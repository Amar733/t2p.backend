const mongoose = require("mongoose");
require("mongoose-double")(mongoose);


const sliderShopSchema = mongoose.Schema({
    slider_name: {
        type: String,
        default: "",
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            default: null,
        }
    ],
    deleted: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: "",
    },
    desktop_image: {
        type: String,
        default: "",
    },
    active: {
        type: Number,
        default: 0
    },

},
    { timestamps: true }
);
module.exports = mongoose.model("slidershop", sliderShopSchema);

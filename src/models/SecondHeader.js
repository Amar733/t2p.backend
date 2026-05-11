const mongoose = require("mongoose");
require("mongoose-double")(mongoose);


const secondHeadingSchema = mongoose.Schema({
    heading: {
        type: String,
        default: "",
    },
    sub_heading: {
        type: String,
        default: "",
    },
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
    cuisine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cuisines",
        default: null,
    },
},
    { timestamps: true }
);
module.exports = mongoose.model("second_heading", secondHeadingSchema);

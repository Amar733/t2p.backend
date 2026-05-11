const mongoose = require("mongoose");

const testimonial = mongoose.Schema({
    name: {
        type: String,
        default: "",
    },
    image: {
        type: String,
        default: "",
    },
    message: {
        type: String,
        default: ""
    },
},
    { timestamps: true }
);
module.exports = mongoose.model('testimonial', testimonial);
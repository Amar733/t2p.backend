const mongoose = require("mongoose");


const BlogCategorySchema = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    deleted: {
        type: Number,
        default: 0
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('blogCategory', BlogCategorySchema);
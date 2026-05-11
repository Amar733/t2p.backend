const mongoose = require("mongoose");
const mongooseSlugPlugin = require("mongoose-slug-plugin");

const blogSchema = mongoose.Schema({
    title: {
        type: String,
        default: "",
    },
    active: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: "",
    },
    categories: {
        type: Array,
        default: []
    },
    seo_title: {
        type: String,
        default: ""
    },
    seo_description: {
        type: String,
        default: ""
    },
    seo_keywords: {
        type: String,
        default: ""
    }
},
    { timestamps: true }
);
blogSchema.plugin(mongooseSlugPlugin, { tmpl: "<%=title%>" });
module.exports = mongoose.model('blogs', blogSchema);
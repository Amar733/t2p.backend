const mongoose = require("mongoose");
const mongooseSlugPlugin = require("mongoose-slug-plugin");

const faqSchema = mongoose.Schema({
    question: {
        type: String,
        default: "",
    },
    active: {
        type: Number,
        default: 0
    },
    answer: {
        type: String,
        default: "",  
    }
},
    { timestamps: true }
);

faqSchema.plugin(mongooseSlugPlugin, { tmpl: "<%=question%>" });
module.exports = mongoose.model('faq', faqSchema);
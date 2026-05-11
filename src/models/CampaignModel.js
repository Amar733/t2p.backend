const mongoose = require("mongoose");
const mongooseSlugPlugin = require("mongoose-slug-plugin");

const campaignSchema = mongoose.Schema({
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
    images: {
        type: [],
    },

},
    { timestamps: true }
);

module.exports = mongoose.model('campaigns', campaignSchema);
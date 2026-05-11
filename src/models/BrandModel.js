const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const mongooseSlugPlugin = require("mongoose-slug-plugin");
const BrandSchema = mongoose.Schema({
    name: {
        type: String,
        default: "",
    },
    file: {
        type: String,
        default: "",
    },
    desc: {
        type: String,
        default: "",
    },
    short_desc: {
        type: String,
        default: "",
    },
    created_date: {
        type: Date,
        default: dateKolkata,
    },
    update_date: {
        type: Date,
        default: dateKolkata,
    },
    active: {
        type: Number,
        default: 0,
    },
    gem: {
        type: Number,
        default: 0,
    },
    top: {
        type: Number,
        default: 0,
    },
    deleted: {
        type: Number,
        default: 0,
    },
    seo_title: {
        type: String,
        default: "",
    },
    seo_description: {
        type: String,
        default: "",
    },
    seo_keywords: {
        type: String,
        default: "",
    },
});
BrandSchema.plugin(mongooseSlugPlugin, { tmpl: "<%=name%>" });
module.exports = mongoose.model("brands", BrandSchema);

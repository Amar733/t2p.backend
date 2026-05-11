const mongoose = require("mongoose");
const mongooseSlugPlugin = require('mongoose-slug-plugin');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const CuisineSchema = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    description_after_content: {
        type: String,
        default: ""
    },
    file: {
        type: String,
        default: ""
    },
    created_date: {
        type: Date, default: dateKolkata
    },
    update_date: {
        type: Date, default: dateKolkata
    },
    active: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Number,
        default: 0
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
});
CuisineSchema.plugin(mongooseSlugPlugin, { tmpl: '<%=name%>' });
module.exports = mongoose.model('cuisines', CuisineSchema);
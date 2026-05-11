const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const mongooseSlugPlugin = require('mongoose-slug-plugin');
const CitySchema = mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  description_after_content: {
    type: String,
    default: "",
  },
  file: {
    type: String,
    default: null,
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
  deleted: {
    type: Number,
    default: 0,
  },
  ps: {
    type: String,
    default: "both",
  },
  cod: {
    type: Boolean,
    default: true,
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "states",
    default: null,
  },
  file2: {
    type: String,
    default: null,
  },
  footer: {
    type: Number,
    default: 0,
  },
  heading: {
    type: String,
    default: "",
  },
  sub_heading: {
    type: String,
    default: "",
  },
  footer_content: {
    type: String,
    default: "",
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
  extra_delivery_charges: {
    type: String,
    default: "",
  },

  hot_food_available: {
    type: Number,
    default: 0, // 0 ---> false , 1 --- true
  },
  minimum_order_value: {
    type: String,
    default: "",
  },
  maximum_cod_order_value: {
    type: String,
    default: "",
  },
  cod_availability: {
    type: Number,
    default: 1, /// 1 NO  , 0 yes
  },
});
CitySchema.plugin(mongooseSlugPlugin, { tmpl: '<%=name%>' });
module.exports = mongoose.model('cities', CitySchema);
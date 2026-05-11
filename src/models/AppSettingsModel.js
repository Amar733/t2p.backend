const mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const CMSSchema = mongoose.Schema({
    iis: {
        type: String,
        default: "",
    },
    header_bg_color: {
        type: String,
        default: "",
    },
    popup_bg_color: {
        type: String,
        default: "",
    },
    popup_title: {
        type: String,
        default: "",
    },
    popup_title_color: {
        type: String,
        default: "",
    },
    popup_subtitle: {
        type: String,
        default: "",
    },
    subtitle_title_color: {
        type: String,
        default: "",
    },
    popup_desctiption: {
        type: String,
        default: "",
    },
    subtitle_desctiption_color: {
        type: String,
        default: "",
    },
    slider_text: {
        type: String,
        default: "",
    },
    slider_text_color: {
        type: String,
        default: "",
    },
    slider_text_bg_color: {
        type: String,
        default: "",
    },
    service_popup_bg_color: {
        type: String,
        default: "",
    },
    service_popup_title: {
        type: String,
        default: "",
    },
    service_popup_title_color: {
        type: String,
        default: "",
    },
    service_popup_subtitle: {
        type: String,
        default: "",
    },
    service_subtitle_title_color: {
        type: String,
        default: "",
    },
    service_popup_desctiption: {
        type: String,
        default: "",
    },
    service_subtitle_desctiption_color: {
        type: String,
        default: "",
    },
    cancel_popup_bg_color: {
        type: String,
        default: "",
    },
    cancel_popup_title: {
        type: String,
        default: "",
    },
    cancel_popup_title_color: {
        type: String,
        default: "",
    },
    cancel_popup_subtitle: {
        type: String,
        default: "",
    },
    cancel_subtitle_title_color: {
        type: String,
        default: "",
    },
    cancel_popup_desctiption: {
        type: String,
        default: "",
    },
    cancel_subtitle_desctiption_color: {
        type: String,
        default: "",
    },
    order_track_popup_bg_color: {
        type: String,
        default: "",
    },
    order_track_popup_title: {
        type: String,
        default: "",
    },
    order_track_popup_title_color: {
        type: String,
        default: "",
    },
    order_track_popup_subtitle: {
        type: String,
        default: "",
    },
    order_track_subtitle_title_color: {
        type: String,
        default: "",
    },
    order_track_popup_desctiption: {
        type: String,
        default: "",
    },
    order_track_subtitle_desctiption_color: {
        type: String,
        default: "",
    },
    cod_popup_bg_color: {
        type: String,
        default: "",
    },
    cod_popup_title: {
        type: String,
        default: "",
    },
    cod_popup_title_color: {
        type: String,
        default: "",
    },
    cod_popup_subtitle: {
        type: String,
        default: "",
    },
    cod_subtitle_title_color: {
        type: String,
        default: "",
    },
    cod_popup_desctiption: {
        type: String,
        default: "",
    },
    cod_subtitle_desctiption_color: {
        type: String,
        default: "",
    },

    express_popup_bg_color: {
        type: String,
        default: "",
    },
    express_popup_title: {
        type: String,
        default: "",
    },
    express_popup_title_color: {
        type: String,
        default: "",
    },
    express_popup_subtitle: {
        type: String,
        default: "",
    },
    express_subtitle_title_color: {
        type: String,
        default: "",
    },
    express_popup_desctiption: {
        type: String,
        default: "",
    },
    express_subtitle_desctiption_color: {
        type: String,
        default: "",
    },

    delivery_popup_bg_color: {
        type: String,
        default: "",
    },
    delivery_popup_title: {
        type: String,
        default: "",
    },
    delivery_popup_title_color: {
        type: String,
        default: "",
    },
    delivery_popup_subtitle: {
        type: String,
        default: "",
    },
    delivery_subtitle_title_color: {
        type: String,
        default: "",
    },
    delivery_popup_desctiption: {
        type: String,
        default: "",
    },
    delivery_subtitle_desctiption_color: {
        type: String,
        default: "",
    },
    info_popup: {
        type: String,
        default: "",
    },
    info_image: {
        type: String,
        default: "",
    },
    info_on_off: {
        type: String,
        default: "1",
    },
});

module.exports = mongoose.model("app_settings", CMSSchema);

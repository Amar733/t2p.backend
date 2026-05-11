const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const MaaKaKhanaBannerSchema = mongoose.Schema({
    heading: {
        type: String,
        default: ""
    },
    subheading: {
        type: String,
        default: ""
    },
    //   description: {
    //     type: String,
    //     default: ""
    // },
    
   images: [
  {
    url: { type: String, default: "" },
    active: { type: Number, default: 1 } // 1 = active, 0 = inactive
  }
    ],
   mobileImages: [
  {
    url: { type: String, default: "" },
    active: { type: Number, default: 1 } // 1 = active, 0 = inactive
  }
    ],
    created_date: {
        type: Date,
        default: dateKolkata
    },
    update_date: {
        type: Date,
        default: dateKolkata
    },
    active: {
        type: Number,
        default: 1
    },
    deleted: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('maakakhanabanner', MaaKaKhanaBannerSchema);

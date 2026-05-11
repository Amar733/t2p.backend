const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
const ContactusSchema = mongoose.Schema({
    phone: {
        type: String
    },
    whatsapp: {
        type: String
    },
    email: {
        type: String
    },
    address: {
        type: String
    },
    created_date: {
        type: Date, default: dateKolkata
    },
    update_date: {
        type: Date, default: dateKolkata
    }
});
module.exports = mongoose.model('contactus', ContactusSchema);
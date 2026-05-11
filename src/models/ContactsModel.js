const mongoose = require("mongoose");

const contactsSchema = mongoose.Schema({
    name: {
        type: String,
        default: 0,
    },
    email: {
        type: String,
        default: 0,
    },
    phone: {
        type: String,
        default: 0,
    },
    message: {
        type: String,
        default: 0,
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model("contacts", contactsSchema);

const mongoose = require("mongoose");

const timeslot = mongoose.Schema({
    timeslots: {
        type: [String],
        default: null,
    },
   
},
    { timestamps: true }
);
module.exports = mongoose.model('timeslot', timeslot);
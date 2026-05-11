const mongoose = require("mongoose");
require('mongoose-double')(mongoose);

const UnitSchema = mongoose.Schema({
    name: {
        type: String,
        default: ""
    }
});
module.exports = mongoose.model('units', UnitSchema);
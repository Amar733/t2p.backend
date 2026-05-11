const mongoose = require("mongoose");
const LogSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    event: {
        type: String,
        default: "",
    },
    data: {
        type: String,
        default: "",
    },
}, { timestamps: true }); // This adds createdAt and updatedAt



module.exports = mongoose.model("UserLogs", LogSchema);

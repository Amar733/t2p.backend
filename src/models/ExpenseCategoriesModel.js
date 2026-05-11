const mongoose = require('mongoose');
const ExpenseCategoriesSchema = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'expense_categories',
        default: null
    },
    active: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model('expense_categories', ExpenseCategoriesSchema);
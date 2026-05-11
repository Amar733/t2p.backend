const mongoose = require("mongoose");

const SurveyAnswer = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    survey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "survey",
        default: null,
    },
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        default: null,
    },
    answers: [
        {
            question: {
                type: String,
                default: ""
            },
            answer: {
                type: String,
                default: ""
            }
        }
    ],
    filled: {
        type: Number,
        default: 0
    },
    call1: {
        type: Date, 
        default:null
    },
    call2: {
        type: Date,
        default:null
    },
    call3: {
        type: Date,
        default:null
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('survey_answer', SurveyAnswer);
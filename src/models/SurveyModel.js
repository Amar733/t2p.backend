const mongoose = require("mongoose");
const mongooseSlugPlugin = require("mongoose-slug-plugin");

const surveyModel = mongoose.Schema({
    title: {
        type: String,
        default: "",
    },
    survey: [
        {
            question: {
                type: String,
                default: ""
            },
            options: [
                {
                    type: String,
                    default: ""
                }
            ]
        }
    ],
    assigned_to: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            default: null,
        }
    ],
    active: {
        type: Number,
        default: 0,
    },
    event_type: {
        type: Number,
        default: 0, ////Signup --> 0, Page Visit --> 1, Add To Cart --> 2, Checkout --> 3,   
    },
    start_date: {
        type: Date,
    },
    end_date: {
        type: Date
    },
    delete: {
        type: Number,
        default: 0,
    },
},
    { timestamps: true }
);
surveyModel.plugin(mongooseSlugPlugin, { tmpl: "<%=title%>" });
module.exports = mongoose.model('survey', surveyModel);
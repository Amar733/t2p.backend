const mongoose = require("mongoose");

const AutomationSchedule = mongoose.Schema({
    type: {
        type: Number
        ////0-Page Visit, 1 :- add to cart, 2 :- checkout, 3:- login
    },
    push_notification_title: {
        type: String,
    },
    push_notification_description: {
        type: String,
    },
    push_notification_image: {
        type: String,
        default: ""
    },
    push_notification_image_type: {
        type: Number,
        default: 0
        ////0-From Autaomation, 1 :- from Product db,  
    },
    whatsapp_template_name: {
        type: String
    },
    whatsapp_image_type: {
        type: Number,
        default: 0
        ////0-From Autaomation, 1 :- from Product db,  
    },
    first_message_schedule: {
        type: String
    },
    second_message_schedule: {
        type: String
    },
    third_message_schedule: {
        type: String
    }, 
    first_message_schedule_whatsapp: {
        type: String
    },
    second_message_schedule_whatsapp: {
        type: String
    },
    third_message_schedule_whatsapp: {
        type: String
    },
    delete: {
        type: Number,
        default: 0
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("automation_schedule", AutomationSchedule);

const FAQModel = require("../models/FAQModel");
const { validationResult } = require("express-validator");

exports.createFAQ = (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        const FAQ = new FAQModel({
            question: req.body.question || req.query.question,
            answer: req.body.answer || req.query.answer
        })
        FAQ.save((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                });
            }
            res.status(200).json({
                message: "Question created"
            });
        });
    }
};

exports.viewFAQ = (req, res) => {
    let where = {};
    if (req.body.question || req.query.question) {
        where['question'] = req.body.question || req.query.question;
    }
    if (req.query.id || req.body.id) {
        where['_id'] = req.query.id || req.body.id;
    }

    if (req.query.active || req.query.body) {
        where['active'] = req.query.active || req.query.body;
    }

    FAQModel.find(where).sort("createdAt")
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                });
            }
            res.status(200).json({
                message: "questions found",
                data: data
            });
        });

};


exports.viewFAQFrontend = (req, res) => {
    let where = {};

    where['active'] = 0;

    FAQModel.find(where).sort("createdAt")
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                });
            }
            res.status(200).json({
                message: "questions found",
                data: data
            });
        });

};

exports.updateFAQ = (req, res) => {
    if (req.body.id || req.query.id) {
        console.log(req.body)
        FAQModel.findOneAndUpdate(
            { _id: req.body.id || req.query.id },
            {
                question: req.query.question || req.body.question,
                answer: req.query.answer || req.body.answer
            },
            { new: true, useFindAndModify: false },
            (err, FAQ) => {
                if (err) {
                    return res.status(400).json({
                        error: err,
                    });
                }
                res.status(200).json({
                    message: "Questions are updated"
                });
            })
    } else {
        res.status(200).send({
            status: "error",
            message: "Please provide the id"
        })
    }
};

exports.removeFAQ = (req, res) => {
    if (req.body.id || req.query.id) {
        FAQModel.findByIdAndDelete({
            _id: req.body.id || req.query.id
        }, (err, docs) => {
            if (err) {
                res.status(200).send({
                    status: "error",
                    message: "Something went wrong !! please try again later...",
                    error: err
                })
            } else {
                res.status(200).send({
                    status: "success",
                    message: "FAQ deleted successfully"
                })
            }
        })
    } else {
        res.status(200).send({
            status: "error",
            message: "Please provide the id"
        })
    }
}

exports.updateStatus = (req, res) => {
    if (req.body.id || req.query.id) {
        FAQModel.findOneAndUpdate(
            { _id: req.body.id || req.query.id },
            {
                active: req.body.active
            },
            { new: true, useFindAndModify: false },
            (err, FAQ) => {
                if (err) {
                    return res.status(400).json({
                        error: err,
                    });
                }
                res.status(200).json({
                    message: "Questions are updated"
                });
            })
    } else {
        res.status(200).send({
            status: "error",
            message: "Please provide the id"
        })
    }
}
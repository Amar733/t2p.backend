const Testimonial = require("../models/TestimonialModel");
const { validationResult } = require("express-validator");
const FinancialLog = require("../models/FinancialLog");
const multer = require("multer");
const { response } = require("express");
const fs = require("fs");
const path = require('path');


// Set S3 endpoint to DigitalOcean Spaces


const imagesDir = path.join(__dirname, '../images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('Created images directory:', imagesDir);
} else {
    console.log('Images directory exists:', imagesDir);
}

// Set up multer to store uploaded files in ./images folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagesDir); // Specify the directory to save the file temporarily
    },
    filename: (req, file, cb) => {
        const timestamp = moment().format('YYYYMMDDHHmmssSSS');
        const filename = `${timestamp}${path.extname(file.originalname)}`;
        console.log('Saving file as:', filename); // Debug log
        cb(null, filename);
    }
});

const upload_local = multer({
    storage: storage,
    limits: {
        fileSize: 10000000 // 10MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
            return cb(new Error('Only image/pdf files are allowed!'));
        }
        cb(null, true);
    }
}).array("upload", 1);


exports.create = (req, res) => {
    if (!req.query.name || req.query.name == "") {
        res.status(200).send({
            status: "error",
            message: "Enter name",
            token: req.token,
        });
    } else {
        upload_local(req, res, function (error) {
            // console.log(req.body.categories)
            if (error) {
           
                let testimonialData = new Testimonial({
                    name: req.query.name,
                    message: req.body.html,
                });
                testimonialData.save(function (err) {
                    if (err) {
                        res.status(200).send({
                            status: "error",
                            message: err,
                            token: req.token,
                        });
                    } else {
                        res.status(200).send({
                            status: "success",
                            message: `Testimonial created`,
                        });
                    }
                });
            } else {
                if (req.files.length > 0) {
                    const file = req.files[0]; // Get the first (and only) file from the array
                    const image_data = {
                        fieldname: file.fieldname,
                        originalname: file.originalname,
                        encoding: file.encoding,
                        mimetype: file.mimetype,
                        filename: file.filename,
                        location: `https://${req.get('host')}/images/${file.filename}`, // Construct the location URL
                        size: file.size
                    };


                    let testimonialData = new Testimonial({
                        name: req.query.name,
                        message: req.body.html,
                        image: image_data.location,
                    });
                    testimonialData.save(function (err) {
                        if (err) {
                            res.status(200).send({
                                status: "error",
                                message: err,
                                token: req.token,
                            });
                        } else {
                            res.status(200).send({
                                status: "success",
                                message: "Testimonial has been created successfully.",
                            });
                        }
                    });
                } else {
                    let testimonialData = new Testimonial({
                        name: req.query.name,
                        message: req.body.html,
                    });
                    testimonialData.save(function (err) {
                        if (err) {
                            res.status(200).send({
                                status: "error",
                                message: err,
                                token: req.token,
                            });
                        } else {
                            res.status(200).send({
                                status: "success",
                                message: "Testimonial has been created successfully.",
                            });
                        }
                    });
                }
            }
        });
    }
}

exports.view = (req, res) => {
    let where = {};
    if (req.query.name || req.body.name) {
        where["name"] = req.query.name || req.body.name;
    }

    if (req.query.id || req.body.id) {
        where["_id"] = req.query.id || req.body.id;
    }

    Testimonial.find(where)
        .sort("-createdAt")
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                });
            }
            res.status(200).send({
                status: "success",
                data: data
            });
        });
};

exports.deleteTestimonial = (req, res) => {
    if (req.query.id || req.body.id) {
        Testimonial.findByIdAndDelete({
            _id: req.body.id || req.query.id
        }, (err) => {
            if (err) {
                res.status(200).send({
                    status: "error",
                    message: "Something went wrong !! please try again later...",
                    error: err
                })
            } else {
                res.status(200).send({
                    status: "success",
                    message: "Testimonial deleted successfully"
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

exports.updateTestimonial = (req, res) => {
    if (!req.query.id || req.query.id == "") {
        res.status(200).send({
            status: "error",
            message: "Enter testimonial id",
            token: req.token,
        });
    } else {
        upload_local(req, res, function (error) {
            if (error) {

                let where = {};
                where["_id"] = req.query.id;
                Testimonial.findOneAndUpdate(
                    where,
                    {
                        name: req.query.name,
                        message: req.body.html,
                    },
                    {
                        new: true,
                    }
                )
                    .exec()
                    .then(() => {
                        res.status(200).send({
                            status: "success",
                            message: "Blog has been updated",
                            token: req.token,
                        });
                        return;
                    });
                ////
            } else {
                let where = {};
                where["_id"] = req.query.id;
                let updatedata = {};
                updatedata["name"] = req.query.name;
                updatedata["message"] = req.body.html;

                const file = req.files[0]; // Get the first (and only) file from the array
                const image_data = {
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    encoding: file.encoding,
                    mimetype: file.mimetype,
                    filename: file.filename,
                    location: `https://${req.get('host')}/images/${file.filename}`, // Construct the location URL
                    size: file.size
                };

                if (req.files[0]) {
                    updatedata["image"] = image_data.location;
                }

                Testimonial.findOneAndUpdate(where, updatedata, {
                    new: true,
                })
                    .exec()
                    .then(() => {
                        res.status(200).send({
                            status: "success",
                            message: "Testimonial has been updated..",
                            token: req.token,
                        });
                    });
            }
        });
    }
}

exports.FinancialLog_delete = (req, res) => {
    if (req.body.id) {
        FinancialLog.findByIdAndDelete({
            _id: req.body.id || req.query.id
        }, (err) => {
            if (err) {
                res.status(200).send({
                    status: "error",
                    message: "Something went wrong !! please try again later...",
                    error: err
                })
            } else {
                res.status(200).send({
                    status: "success",
                    message: "Financial log deleted successfully"
                })
            }
        })
    } else {
        res.status(200).send({
            status: "error",
            message: "Please Provide a Id",
        });
    }
}

exports.FinancialLog_Edit = (req, res) => {
    if (req.query.id || req.body.id) {
        let where = {};
        where["_id"] = req.query.id || req.body.id
        FinancialLog.findOneAndUpdate(
            where,
            {
                commission: req.body.amount,
                partner: req.body.partner,
                type: req.body.type,
                note: req.body.note
            },
            {
                new: true,
            }
        )
            .exec()
            .then(() => {
                res.status(200).send({
                    status: "success",
                    message: "Financial Log has been updated",
                    token: req.token,
                });
                return;
            });
    } else {
        res.status(200).send({
            status: "error",
            message: "Please Provide a Id",
        });
    }
}
const RoleAndPermission = require("../models/RoleAndPermissions");
const ShopBySlider = require("../models/ShopBySlider");
const users = require("../models/UsersModel");

const multer = require("multer");
const { response } = require("express");

// Set S3 endpoint to DigitalOcean Spaces
const fs = require("fs");
const path = require('path');


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

const upload2 = multer({
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
}).any();

exports.create = (req, res) => {
    // console.log(req.body);
    let where = {};
    where["rolename"] = req.body.name
    where['deleted'] = 0;


    RoleAndPermission.findOne(where).then(response => {
        if (response != null) {
            res.status(200).send({
                status: "error",
                message: "Role exist in the database.",
            });
        } else {
            const roleandpermission = new RoleAndPermission(req.body);
            roleandpermission.save((err) => {
                if (err) {
                    return res.status(400).json({
                        error: err,
                    });
                }
                res.status(200).json({
                    message: "Role Created Successfully"
                });
            });
        }
    })



};

exports.viewRoleAndPermission = (req, res) => {
    let where = {};
    where['deleted'] = 0;

    RoleAndPermission.find(where)
        .sort("createdAt")
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                });
            }
            res.status(200).json({
                message: "success",
                data: data
            });
        });
};

exports.updateBoth = (req, res) => {
    let where = {};
    where['deleted'] = 0;
    where["_id"] = req.roleandpermission._id
    RoleAndPermission.findOneAndUpdate(
        where,
        { $set: req.body },
        { new: true, useFindAndModify: false },
        (err) => {
            if (err) {
                return res.status(400).json({
                    error: "RoleAndPermission are not updated",
                });
            }
            res.status(200).json({
                message: "RoleAndPermissions are updated"
            });
        }
    );
};

exports.bothById = (req, res, next, id) => {
    RoleAndPermission.findById(id).exec((err, roleandpermission) => {
        if (err || !roleandpermission) {
            return res.status(400).json({
                error: "Role and Permissions not Found",
            });
        }
        req.roleandpermission = roleandpermission;
        next();
    });
};


exports.deleteRole = (req, res) => {
    const roleandpermission = req.roleandpermission;
    let where = {};

    where["role"] = roleandpermission._id;
    where['deleted'] = 0;

    users.countDocuments(where, function (err, count) {
        if (err) {
            console.log(err)
        } else {
            // console.log("Count :", count)
            if (count > 0) {
                // console.log('true');
                return res.status(400).json({ error: 'Role is Used ' })
            } else {
                let where = {};
                where["_id"] = roleandpermission._id;
                RoleAndPermission.findOneAndUpdate(where, {
                    deleted: 1
                }, { new: true })
                    .exec()
                    .then(() => {
                        res.status(200).json({
                            message: "Role Deleted Successfully"
                        })
                    })
            }
        }
    });
};

exports.createShopBySlider = (req, res) => {
    // console.log(req.body);
    ShopBySlider.findOne({ deleted: 0, slider_name: req.body.slider_name })
        .then((response) => {
            if (response != null) {
                res.status(200).send({
                    status: "error",
                    message: "Slider Name already in use.",
                });
            } else {
                upload_local(req, res, function () {
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

                        const slider = new ShopBySlider({
                            slider_name: req.body.slider_name,
                            products: req.body.products,
                            image: image_data.location,
                        });
                        slider.save((err) => {
                            if (err) {
                                return res.status(400).json({
                                    error: err,
                                });
                            }
                            res.status(200).json({
                                message: "Shop By Slider Created Successfully"
                            });
                        });
                    } else {
                        const slider = new ShopBySlider({
                            slider_name: req.body.slider_name,
                            products: req.body.products
                        });
                        slider.save((err) => {
                            if (err) {
                                return res.status(400).json({
                                    error: err,
                                });
                            }
                            res.status(200).json({
                                message: "Shop By Slider Created Successfully"
                            });
                        });
                    }
                });
            }
        })

};



exports.updateShopBySlider = (req, res) => {
    let where = {};
    where['deleted'] = 0;
    where["_id"] = req.body.id

    ShopBySlider.findOneAndUpdate(
        where,
        {
            products: req.body.products ? req.body.products?.split(",") : null,
            slider_name: req.body.slider_name
        },
        { new: true, useFindAndModify: false },
        (err, data) => {
            if (err) {
                return res.status(200).send({
                    status: "error",
                    message: "Shop by slider not updated",
                    error: err
                });
            }
            res.status(200).send({
                status: "success",
                message: "Shop by slider updated",
                result: data
            });
        }
    );
};

exports.updateShopBySliderStatus = (req, res) => {
    let where = {};
    where['deleted'] = 0;
    where["_id"] = req.body.id

    ShopBySlider.findOneAndUpdate(
        where,
        { active: req?.body?.active },
        { new: true, useFindAndModify: false },
        (err) => {
            if (err) {
                return res.status(200).send({
                    status: "error",
                    message: "Shop by slider not updated",
                    error: err
                });
            }
            res.status(200).send({
                status: "success",
                message: "Shop by slider status updated",
            });
        }
    );
};


exports.updateShopBySliderDelete = (req, res) => {
    let where = {};
    where["_id"] = req.body.id

    ShopBySlider.findOneAndUpdate(
        where,
        { deleted: 1 },
        { new: true, useFindAndModify: false },
        (err) => {
            if (err) {
                return res.status(200).send({
                    status: "error",
                    message: "Shop by slider not updated",
                    error: err
                });
            }
            res.status(200).send({
                status: "success",
                message: "Shop by slider Deleted",
            });
        }
    );
};

exports.fetchShopBySlider = (req, res) => {
    let where = {};
    where['deleted'] = 0;
    if (req.query.slider_name) {
        where["slider_name"] = req.query.slider_name;
    }

    ShopBySlider
        .find(where)
        .populate("products")
        .populate({
            path: "products",
            populate: [
                {
                    path: "category",
                    model: "categories",
                    select: "name",
                },
                {
                    path: "sub_category",
                    model: "categories",
                    select: "name",
                },
                {
                    path: "cuisine",
                    model: "cuisines",
                    select: "name",
                },
                {
                    path: "brand",
                    model: "brands",
                    select: "name",
                },
                {
                    path: "vendor",
                    model: "users",
                    select: "full_name",
                },
                {
                    path: "city",
                    model: "cities",
                    select: "name",
                },
            ],
        })
        .exec((err, data) => {
            if (err) {
                return res.status(200).send({
                    status: "error",
                    message: "Something went wrong !! please try again",
                    error: err
                });
            }
            let d = data[0]?.products;
            let da = [];
            if (req.query.taste === "1" || req.query.taste === "0") {
                for (let i = 0; i < d?.length; i++) {
                    if (d[i].taste === Number(req.query.taste)) {
                        da.push(d[i])
                    }
                }
            }
            res.status(200).send({
                status: "success",
                message: "Data fetched successfully",
                result: (req.query.taste === "1" || req.query.taste === "0") ? da : d
            });
        });
}


exports.fetchShopBySlider2 = (req, res) => {
    let where = {};
    where['deleted'] = 0;
    if (req.query.slider_name) {
        where["slider_name"] = req.query.slider_name;
    }

    ShopBySlider
        .find(where)
        .populate("products")
        .exec((err, data) => {
            if (err) {
                return res.status(200).send({
                    status: "error",
                    message: "Something went wrong !! please try again",
                    error: err
                });
            }
            res.status(200).send({
                status: "success",
                message: "Data fetched successfully",
                result: data
            });
        });
}

exports.updateShopBySliderImage = function (req, res) {
    upload2(req, res, function (error2) {
        console.log("error2", error2);
        if (error2) {
            req.status(200).send({
                status: "error",
                message: error2,
            });

            return;
        }
        else {
            let where = {};
            where["_id"] = req.body.id;

            let image_data = [];
            for (let i = 0; i < req.files?.length; i++) {
                const file = req.files[i]; // Get the first (and only) file from the array
                const file_data = {
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    encoding: file.encoding,
                    mimetype: file.mimetype,
                    filename: file.filename,
                    location: `https://${req.get('host')}/images/${file.filename}`, // Construct the location URL
                    size: file.size
                };

                image_data.push(file_data)
            }

            if (image_data[1]?.location) {
                let upload2 = image_data[1] ? image_data[1]?.location : null;
            }
            if (req.files[0]?.location) {
                let upload1 = image_data[0] ? image_data[0]?.location : null;
            }

            ShopBySlider.findOneAndUpdate(
                where,
                {
                    image: upload1,
                    desktop_image: upload2
                },
                { new: true, useFindAndModify: false },
                (err) => {
                    if (err) {
                        return res.status(200).send({
                            status: "error",
                            message: "Shop by slider not updated",
                            error: err
                        });
                    }
                    res.status(200).send({
                        status: "success",
                        message: "Shop by slider images updated",
                    });
                }
            );
        }
    })
};

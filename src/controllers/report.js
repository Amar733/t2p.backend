const CheckoutModel = require("../models/CheckoutModel");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const User = require("../models/UsersModel");

exports.orderReport = (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        let where = {};
        where["status"] = req.body.status === "" ? "delivered" : req.body.status;
        where["deleted"] = 0;

        if (req.body.ordercity && req.query.ordercity != "") {
            where["order_city"] = mongoose.Types.ObjectId(req.body.ordercity);
        }
        if (req.body.vendorcity && req.query.vendorcity != "") {
            where["vendor_city"] = mongoose.Types.ObjectId(req.body.vendorcity);
        }
        if (req.body.start_date && req.body.start_date != "" && req.body.end_date && req.body.end_date != "") {
            where["created_date"] = {
                $gte: new Date(req.body.start_date),
                $lt: new Date(req.body.end_date),
            };
        }

        CheckoutModel.aggregate([
            { $match: where },
            {
                $group: {
                    _id: {
                        year: { $year: { date: "$created_date" } },
                        month: { $month: { date: "$created_date" } },
                    },
                    sum: { $sum: { $toDouble: "$finalprice" } },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]).then((inward_response) => {
            res.status(200).send({
                result: inward_response,
                status: "success",
                token: req.token,
            });
            //////////////
        });
    }
};

exports.orderCount = (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        let where = {};
        where["status"] = req.body.status === "" ? "delivered" : req.body.status;
        where["deleted"] = 0;

        if (req.body.ordercity && req.query.ordercity != "") {
            where["order_city"] = mongoose.Types.ObjectId(req.body.ordercity);
        }
        if (req.body.vendorcity && req.query.vendorcity != "") {
            where["vendor_city"] = mongoose.Types.ObjectId(req.body.vendorcity);
        }
        if (req.body.start_date && req.body.start_date != "" && req.body.end_date && req.body.end_date != "") {
            where["created_date"] = {
                $gte: new Date(req.body.start_date),
                $lt: new Date(req.body.end_date),
            };
        }

        CheckoutModel.aggregate([
            { $match: where },
            {
                $group: {
                    _id: {
                        year: { $year: { date: "$created_date" } },
                        month: { $month: { date: "$created_date" } },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]).then((inward_response) => {
            res.status(200).send({
                result: inward_response,
                status: "success",
                token: req.token,
            });
            //////////////
        });
    }
};

exports.highestOrder = (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        let where = {};
        where["status"] = req.body.status === "" ? "delivered" : req.body.status;
        where["deleted"] = 0;

        if (req.body.ordercity && req.query.ordercity != "") {
            where["order_city"] = mongoose.Types.ObjectId(req.body.ordercity);
        }
        if (req.body.vendorcity && req.query.vendorcity != "") {
            where["vendor_city"] = mongoose.Types.ObjectId(req.body.vendorcity);
        }
        if (req.body.start_date && req.body.start_date != "" && req.body.end_date && req.body.end_date != "") {
            where["created_date"] = {
                $gte: new Date(req.body.start_date),
                $lt: new Date(req.body.end_date),
            };
        }

        CheckoutModel.aggregate([
            { $match: where },
            {
                $group: {
                    _id: {
                        year: { $year: { date: "$created_date" } },
                        month: { $month: { date: "$created_date" } },
                    },
                    max: { $max: "$finalprice" },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ])
            .then((inward_response) => {
                res.status(200).send({
                    result: inward_response,
                    status: "success",
                    token: req.token,
                });
                //////////////
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    result: [],
                    //token: req.token,
                });
            });
    }
};

exports.lowestOrder = (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        let where = {};
        where["status"] = req.body.status === "" ? "delivered" : req.body.status;
        where["deleted"] = 0;

        if (req.body.ordercity && req.query.ordercity != "") {
            where["order_city"] = mongoose.Types.ObjectId(req.body.ordercity);
        }
        if (req.body.vendorcity && req.query.vendorcity != "") {
            where["vendor_city"] = mongoose.Types.ObjectId(req.body.vendorcity);
        }
        if (req.body.start_date && req.body.start_date != "" && req.body.end_date && req.body.end_date != "") {
            where["created_date"] = {
                $gte: new Date(req.body.start_date),
                $lt: new Date(req.body.end_date),
            };
        }

        CheckoutModel.aggregate([
            { $match: where },
            {
                $group: {
                    _id: {
                        year: { $year: { date: "$created_date" } },
                        month: { $month: { date: "$created_date" } },
                    },
                    min: { $min: "$finalprice" },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]).then((inward_response) => {
            res.status(200).send({
                result: inward_response,
                status: "success",
                token: req.token,
            });
            //////////////
        });
    }
};

exports.orderPacking = (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        let where = {};
        where["status"] = req.body.status === "" ? "delivered" : req.body.status;
        where["deleted"] = 0;

        if (req.body.ordercity && req.query.ordercity != "") {
            where["order_city"] = mongoose.Types.ObjectId(req.body.ordercity);
        }
        if (req.body.vendorcity && req.query.vendorcity != "") {
            where["vendor_city"] = mongoose.Types.ObjectId(req.body.vendorcity);
        }
        if (req.body.start_date && req.body.start_date != "" && req.body.end_date && req.body.end_date != "") {
            where["created_date"] = {
                $gte: new Date(req.body.start_date),
                $lt: new Date(req.body.end_date),
            };
        }

        CheckoutModel.aggregate([
            { $match: where },
            {
                $group: {
                    _id: {
                        year: { $year: { date: "$created_date" } },
                        month: { $month: { date: "$created_date" } },
                    },
                    packing: { $sum: { $toDouble: "$totalPackingPrice" } },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]).then((inward_response) => {
            res.status(200).send({
                result: inward_response,
                status: "success",
                token: req.token,
            });
            //////////////
        });
    }
};

exports.orderShipping = (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        let where = {};
        where["status"] = req.body.status === "" ? "delivered" : req.body.status;
        where["deleted"] = 0;

        if (req.body.ordercity && req.query.ordercity != "") {
            where["order_city"] = mongoose.Types.ObjectId(req.body.ordercity);
        }
        if (req.body.vendorcity && req.query.vendorcity != "") {
            where["vendor_city"] = mongoose.Types.ObjectId(req.body.vendorcity);
        }
        if (req.body.start_date && req.body.start_date != "" && req.body.end_date && req.body.end_date != "") {
            where["created_date"] = {
                $gte: new Date(req.body.start_date),
                $lt: new Date(req.body.end_date),
            };
        }

        CheckoutModel.aggregate([
            { $match: where },
            {
                $group: {
                    _id: {
                        year: { $year: { date: "$created_date" } },
                        month: { $month: { date: "$created_date" } },
                    },
                    shipping: { $sum: { $toDouble: "$totalShippingPrice" } },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]).then((inward_response) => {
            res.status(200).send({
                result: inward_response,
                status: "success",
                token: req.token,
            });
            //////////////
        });
    }
};

exports.gst = (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        let where = {};
        where["status"] = req.body.status === "" ? "delivered" : req.body.status;
        where["deleted"] = 0;

        if (req.body.ordercity && req.query.ordercity != "") {
            where["order_city"] = mongoose.Types.ObjectId(req.body.ordercity);
        }
        if (req.body.vendorcity && req.query.vendorcity != "") {
            where["vendor_city"] = mongoose.Types.ObjectId(req.body.vendorcity);
        }
        if (req.body.start_date && req.body.start_date != "" && req.body.end_date && req.body.end_date != "") {
            where["created_date"] = {
                $gte: new Date(req.body.start_date),
                $lt: new Date(req.body.end_date),
            };
        }

        CheckoutModel.aggregate([
            { $match: where },
            {
                $group: {
                    _id: {
                        year: { $year: { date: "$created_date" } },
                        month: { $month: { date: "$created_date" } },
                    },
                    cgst: { $sum: { $toDouble: "$totalCGST" } },
                    sgst: { $sum: { $toDouble: "$totalSGST" } },
                    igst: { $sum: { $toDouble: "$totalIGST" } },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]).then((inward_response) => {
            res.status(200).send({
                result: inward_response,
                status: "success",
                token: req.token,
            });
            //////////////
        });
    }
};

exports.averageOrderValue = (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        let where = {};
        where["status"] = req.body.status === "" ? "delivered" : req.body.status;
        where["deleted"] = 0;

        if (req.body.ordercity && req.query.ordercity != "") {
            where["order_city"] = mongoose.Types.ObjectId(req.body.ordercity);
        }
        if (req.body.vendorcity && req.query.vendorcity != "") {
            where["vendor_city"] = mongoose.Types.ObjectId(req.body.vendorcity);
        }
        if (req.body.start_date && req.body.start_date != "" && req.body.end_date && req.body.end_date != "") {
            where["created_date"] = {
                $gte: new Date(req.body.start_date),
                $lt: new Date(req.body.end_date),
            };
        }

        CheckoutModel.aggregate([
            { $match: where },
            {
                $group: {
                    _id: {
                        year: { $year: { date: "$created_date" } },
                        month: { $month: { date: "$created_date" } },
                    },
                    sum: { $sum: { $toDouble: "$finalprice" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]).then((inward_response) => {
            res.status(200).send({
                result: inward_response,
                status: "success",
                token: req.token,
            });
            //////////////
        });
    }
};

exports.codAmount = (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        let where = {};
        where["status"] = req.body.status === "" ? "delivered" : req.body.status;
        where["gateway"] = "COD";
        where["deleted"] = 0;

        if (req.body.ordercity && req.query.ordercity != "") {
            where["order_city"] = mongoose.Types.ObjectId(req.body.ordercity);
        }
        if (req.body.vendorcity && req.query.vendorcity != "") {
            where["vendor_city"] = mongoose.Types.ObjectId(req.body.vendorcity);
        }
        if (req.body.start_date && req.body.start_date != "" && req.body.end_date && req.body.end_date != "") {
            where["created_date"] = {
                $gte: new Date(req.body.start_date),
                $lt: new Date(req.body.end_date),
            };
        }

        CheckoutModel.aggregate([
            { $match: where },
            {
                $group: {
                    _id: {
                        year: { $year: { date: "$created_date" } },
                        month: { $month: { date: "$created_date" } },
                    },
                    codcollection: { $sum: { $toDouble: "$finalprice" } },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]).then((inward_response) => {
            res.status(200).send({
                result: inward_response,
                status: "success",
                token: req.token,
            });
            //////////////
        });
    }
};

// exports.digitalAmount = (req, res) => {
//     const errors = validationResult(req);
//     if (Object.keys(errors.array()).length > 0) {
//         res.status(200).send({
//             status: "validation_error",
//             errors: errors.array(),
//             token: req.token,
//         });
//     } else {
//         let where = {};
//         where["status"] = req.body.status === "" ? "delivered" : req.body.status;
//         where["gateway"] != "COD";
//         where["deleted"] = 0;

//         if (req.body.ordercity && req.query.ordercity != "") {
//             where["order_city"] = mongoose.Types.ObjectId(req.body.ordercity);
//         }
//         if (req.body.vendorcity && req.query.vendorcity != "") {
//             where["vendor_city"] = mongoose.Types.ObjectId(req.body.vendorcity);
//         }
//         if (req.body.start_date && req.body.start_date != "" && req.body.end_date && req.body.end_date != "") {
//             where["created_date"] = {
//                 $gte: new Date(req.body.start_date),
//                 $lt: new Date(req.body.end_date),
//             };
//         }
//         CheckoutModel.aggregate([
//             { $match: where },
//             {
//                 $group: {
//                     _id: {
//                         year: { $year: { date: "$created_date" } },
//                         month: { $month: { date: "$created_date" } },
//                     },
//                     codcollection: { $sum: { $toDouble: "$finalprice" } },
//                 },
//             },
//             {
//                 $sort: {
//                     "_id.year": 1,
//                     "_id.month": 1,
//                 },
//             },
//         ]).then((inward_response) => {
//             res.status(200).send({
//                 result: inward_response,
//                 status: "success",
//                 token: req.token,
//             });
//             //////////////
//         });
//     }
// };

exports.digitalAmount = (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        let where = {};
        where["status"] = req.body.status === "" ? "delivered" : req.body.status;
        where["gateway"] = { $ne: "COD" };
        // where["gateway"] = "razarpay";
        // where["gateway"] = "Payu";
        where["deleted"] = 0;
        if (req.body.ordercity && req.query.ordercity != "") {
            where["order_city"] = mongoose.Types.ObjectId(req.body.ordercity);
        }
        if (req.body.vendorcity && req.query.vendorcity != "") {
            where["vendor_city"] = mongoose.Types.ObjectId(req.body.vendorcity);
        }
        if (req.body.start_date && req.body.start_date != "" && req.body.end_date && req.body.end_date != "") {
            where["created_date"] = {
                $gte: new Date(req.body.start_date),
                $lt: new Date(req.body.end_date),
            };
        }

        CheckoutModel.aggregate([
            { $match: where },
            {
                $group: {
                    _id: {
                        year: { $year: { date: "$created_date" } },
                        month: { $month: { date: "$created_date" } },
                    },
                    codcollection: { $sum: { $toDouble: "$finalprice" } },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]).then((inward_response) => {
            res.status(200).send({
                result: inward_response,
                status: "success",
                token: req.token,
            });
            //////////////
        });
    }
};

exports.maxOrderFoodItems = (req, res) => {
    // CheckoutModel.map((c) => {
    //     c.map(p => {
    //         return res.json({p:p})
    //     })
    // })
    const errors = validationResult(req);
    if (Object.keys(errors.array()).length > 0) {
        res.status(200).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    } else {
        let where = {};
        where["deleted"] = 0;
        where["status"] = req.body.status === "" ? "delivered" : req.body.status;

        if (req.body.ordercity && req.query.ordercity != "") {
            where["order_city"] = mongoose.Types.ObjectId(req.body.ordercity);
        }
        if (req.body.vendorcity && req.query.vendorcity != "") {
            where["vendor_city"] = mongoose.Types.ObjectId(req.body.vendorcity);
        }
        if (req.body.start_date && req.body.start_date != "" && req.body.end_date && req.body.end_date != "") {
            where["created_date"] = {
                $gte: new Date(req.body.start_date),
                $lt: new Date(req.body.end_date),
            };
        }

        CheckoutModel.find(where)
            .sort("created_date")
            .populate("user")
            .select("products user")
            .then((response) => {
                if (response == null) {
                    res.status(200).send({
                        status: "error",
                        message: "data not found",
                    });
                }
                let productMax = [];
                response.map((chec) => {
                    chec.products.map((pid) => {
                        productMax.push({
                            pr: pid.product,
                            qu: pid.quantity,
                            customer: pid.user,
                            productname: pid.productname,
                            productprice: pid.price,
                            userName: chec.user.full_name,
                            userMobile: chec.user.mobile,
                        });
                    });
                });
                res.json(productMax);
            });
    }
};

exports.readsingleuserData = (req, res) => {
    // req.Usersdata.password = undefined;
    let where = {};
    where["_id"] = req.query.id;
    User.findOne(where)
        .then((response) => {
            res.status(200).send({
                status: "success",
                message: "",
                result: response,
            });
        })
        .catch((error) => {
            res.status(200).send({
                status: "error",
                message: "Invalid user id",
                result: [],
                //token: req.token,
            });
        });
};

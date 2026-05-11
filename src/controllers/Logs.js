const { validationResult } = require("express-validator");
const OrderLog = require("../models/OrderLog");
let moment = require("moment");
const AnalyticsLog = require("../models/AnalyticsLog");
const ProductModel = require("../models/ProductModel");
moment().format();
exports.viewActivityLogs = (req, res) => {
    const errors = validationResult(req);

    // If validation errors exist, return the error response
    if (!errors.isEmpty()) {
        return res.status(400).send({
            status: "validation_error",
            errors: errors.array(),
            token: req.token,
        });
    }

    // Construct the query condition
    let where = {};

    // Filter by partner if present
    if (req.query.partner && req.query.partner.trim() !== "") {
        where["updated_by_user"] = req.query.partner;
    }

    // Filter by date range if start and end dates are provided
    if (req.query.start_date && req.query.start_date.trim() !== "" && req.query.end_date && req.query.end_date.trim() !== "") {
        const start = moment(req.query.start_date).startOf("day").toISOString();
        const end = moment(req.query.end_date).endOf("day").toISOString();
        
        where["createdAt"] = {
            $gte: new Date(start),
            $lt: new Date(end),
        };
    }

    // Filter by type if present
    if (req.query.type && req.query.type.trim() !== "") {
        where["type"] = req.query.type; // Ensure only specific type (e.g., "Product") is selected
    }

    // Pagination parameters with default values if not provided
    const limit = Number(req.query.limit) || 20; // Default limit set to 20
    const skip = Number(req.query.page) || 0;    // Default page set to 0 (first page)

    // Fetch logs and count concurrently for performance
    Promise.all([
        OrderLog.find(where, null, { limit, skip })
            .populate("updated_by_user")
            .populate(req.query.type === "Product" ? "product" : "order") // Conditional population for Product or Order
            .populate("zipcode")
            .sort("-createdAt"), // Sort by creation date in descending order

        OrderLog.countDocuments(where) // Fetch total count for pagination
    ])
    .then(([logs, count]) => {
        res.status(200).send({
            status: "success",
            result: logs,
            count: count,
        });
    })
    .catch((error) => {
        res.status(500).send({
            status: "error",
            message: error.message || "An error occurred while fetching activity logs",
            result: [],
        });
    });
};


exports.AnalyticLogsCreateUser = (req, res) => {
    if (req.body.data) {
        AnalyticsLog.deleteMany({ user_id: { $ne: null } },
            function (err, result) {

            });

        AnalyticsLog.deleteMany({ user_id: null, product_id: null },
            function (err, result) {

            });

        AnalyticsLog.insertMany(JSON.parse(JSON.stringify(req.body.data)))
            .then((response) => {
                res.status(200).send({
                    status: "success",
                    data: req.body.data,
                    result: response
                })
            }).catch((e) => console.log(e));
    }
}

exports.AnalyticLogsCreateProduct = async (req, res) => {
    if (req.body.data) {
        AnalyticsLog.deleteMany({ product_id: { $ne: null } },
            function (err, result) {
            });
        // console.log(req.body.data[0]?.quantity)
        for (let i = 0; i < JSON.parse(JSON.stringify(req.body.data))?.length; i++) {
            await ProductModel.findOne({ _id: JSON.parse(JSON.stringify(req.body.data))[i]?.product_id }).then(response => {
                let a = new AnalyticsLog({
                    product_id: response?._id,
                    quantity: JSON.parse(JSON.stringify(req.body.data))[i]?.quantity,
                    city: response?.city,
                    brand: response?.brand,
                    category: response?.category,
                    sub_category: response?.sub_category,
                    cuisine: response?.cuisine
                })
                a.save(function (err, response) {
                    if (err) {
                        res.status(200).send({
                            status: "error",
                            message: err,
                        });
                    } else {
                        //
                    }
                });
            })
        }
        res.status(200).send({
            status: "success",
        })
    }
}

exports.ViewAnalyticData = (req, res) => {
    let where = {};
    if (req.body.filter === "user") {
        where["user_id"] = { $ne: null }
    }
    if (req.body.filter === "product") {
        where["product_id"] = { $ne: null }
    }
    if (req.body.brand) {
        where["brand"] = req.body.brand;
    }

    if (req.body.category) {
        where["category"] = req.body.category;
    }
    if (req.body.cuisine) {
        where["cuisine"] = req.body.cuisine;
    }
    if (req.body.city) {
        where["city"] = req.body.city;
    }
    if (req.body.sub_category) {
        where["sub_category"] = req.body.sub_category;
    }
    if (req.body.quantity) {
        if (Number(req.body.quantity) === 1) {
            where["quantity"] = 1
        } else if (Number(req.body.quantity) > 1) {
            where["quantity"] = { $gte: 2 }
        }
    }

    AnalyticsLog.find(where, null, {
        limit: Number(req.body.limit),
        skip: Number(req.body.page),
    })
        .populate("product_id")
        .populate("user_id")
        .populate("brand")
        .populate("cuisine")
        .populate("city")
        .populate("category")
        .populate("sub_category")
        .sort("-quantity")
        .then(response => {
            AnalyticsLog.find(where).countDocuments(function (err, count) {
                res.status(200).send({
                    status: "success",
                    result: response,
                    message: "",
                    count: count,
                });
            });
        }).catch(e => console.log(e))
}


exports.AnalyticNewUserCount = (req, res) => {
    let where = {};
    where["quantity"] = 1

    let where1 = {};
    where1["quantity"] = { $gte: 2 };

    where["user_id"] = { $ne: null }
    where1["user_id"] = { $ne: null }
    AnalyticsLog.find({ user_id: { $ne: null } }).countDocuments(function (err, total) {
        AnalyticsLog.find(where).countDocuments(function (err, count) {
            AnalyticsLog.find(where1).countDocuments(function (err, count1) {
                res.status(200).send({
                    status: "success",
                    total: total,
                    new: count,
                    revisit: count1
                });
            });
        });
    });
}
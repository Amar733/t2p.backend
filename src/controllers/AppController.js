const { validationResult } = require("express-validator");
const fs = require('fs');

const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");
const moment = require("moment");
const multer = require("multer");

const Razorpay = require("razorpay");
const firebase = require("firebase");
const distance = require("google-distance-matrix");
moment().format();
const tmoment = require("moment-timezone");
// Set S3 endpoint to DigitalOcean Spaces
const jwt = require("jsonwebtoken");
const SecondHeader = require("../models/SecondHeader");

const path = require('path');

//WhatsApp
const geoip = require('geoip-lite'); // Optional: to determine the location based on IP address
const axios = require("axios");


// Change bucket property to your Space name

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

const SMTP_HOST = process.env.SMTP_HOST || "smtp.sendgrid.net";
const SMTP_PORT = process.env.SMTP_PORT || "587";
const SMTP_USERNAME = process.env.SMTP_USERNAME || "apikey";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || "support@tastes2plate.online";
const PurchaseStockTransaction = require("../models/PurchaseStockTransactionModel");
const PurchaseStockTransactionProduct = require("../models/PurchaseStockTransactionProductModel");

const Category = require("../models/CategoryModel");
const Brand = require("../models/BrandModel");
const Products = require("../models/ProductModel");
const Users = require("../models/UsersModel");
const City = require("../models/CityModel");
const Address = require("../models/AddressModel");
const Contactus = require("../models/ContactusModel");
const Slider = require("../models/SliderModel");
const Cart = require("../models/CartModel");
const Coupon = require("../models/CouponModel");
const Checkout = require("../models/CheckoutModel");
const Settings = require("../models/SettingsModel");
const Review = require("../models/ReviewModel");
const AppSettings = require("../models/AppSettingsModel");
const CutOffTime = require("../models/CutOffTimeModel");
const ZipModel = require("../models/ZipModel");
const States = require("../models/StatesModel");
const OrderNote = require("../models/OrderNoteModel");
const Cuisine = require("../models/CuisineModel");
const BulkOrder = require("../models/BulkOrderModel");
const BrandHoliday = require("../models/BrandHolidayModel");
const Plan = require("../models/PlanModel");
const Wallet = require("../models/WalletModel");
const OrderBundle = require("../models/OrderBundleModel");
const OrderBox = require("../models/OrderBoxModel");
const Office = require("../models/OfficeModel");
const FinancialLog = require("../models/FinancialLog");
const Wish = require("../models/WishModel");
const Blog = require("../models/BlogModel");
const fetch = require("node-fetch");
const sha256 = require("crypto-js/sha256");
const base64 = require("crypto-js/enc-base64");
const utf8 = require("crypto-js/enc-utf8");
const OrderLog = require("../models/OrderLog");
const ShopBySlider = require("../models/ShopBySlider");
const BitlyClient = require("bitly").BitlyClient;
const bitly = new BitlyClient("a61f06cf6bc6025ba9dd5dc7a9dd4f1ab8379a5b");

const CodPayment = require("../models/CodPaymentModel");
const GharKakhanaOrders = require("../models/GharKakhanaOrders");
const GharKaKhanaCategories = require("../models/gharkakhanaCategory");
const GharKakhanaCart = require("../models/GharKakhanaCart");
const GharkaKhanaSliders = require("../models/gharkaKhanaSliders");
const ipLog = require("../models/ipLog");
const coupon_popup = require("../models/coupon_popup");
const MaaKaKhanaBanner = require("../models/MaaKaKhanaBanner");

function gen_otp(mobile, res, successCallback, errorCallback) {
    const otp = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
    let where = {};
    where["deleted"] = 0;
    where["mobile"] = mobile;
    Users.findOneAndUpdate(
        where,
        {
            otp: mobile == "8010265036" ? 123456 : otp,
        },
        {
            new: true,
        }
    )
        .exec()
        .then(() => {
            axios
                .get("https://2factor.in/API/V1/d4ab2eaa-d61e-11ea-9fa5-0200cd936042/SMS/" + mobile + "/" + otp + "/AUTO_FETCH_OTP", {})
                .then(function () {
                    //console.log(response.data);
                    successCallback(otp);
                })
                .catch(function (error) {
                    res.status(200).send({
                        status: "error",
                        message: error.message,
                    });
                });
        })
        .catch((error) => {
            res.status(200).send({
                status: "error",
                message: error.message,
            });
        });
    
}


async function gen_custom_sms(mobile, msg) {
    axios
        .get("https://2factor.in/API/R1/?module=TRANS_SMS&apikey=d4ab2eaa-d61e-11ea-9fa5-0200cd936042&to=" + mobile + "&from=TASTES&msg=" + encodeURI(msg))
        .then(function () {
            //console.log(response.data);
        })
        .catch((error) => {
            console.log(error.message);
        });
}

function gen_order_otp(mobile, order_id, res, successCallback, errorCallback) {
    let otp = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
    let where = {};
    where["otp"] = otp;
    Checkout.findOne(where).then((response) => {
        if (response == null) {
            let where = {};
            where["_id"] = order_id;
            Checkout.findOneAndUpdate(
                where,
                {
                    otp: otp,
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    axios
                        .get("https://2factor.in/API/V1/d4ab2eaa-d61e-11ea-9fa5-0200cd936042/SMS/" + mobile + "/" + otp + "/SMSOTP", {})
                        .then(function () {
                            //console.log(response.data);
                            successCallback(otp);
                        })
                        .catch(function (error) {
                            res.status(200).send({
                                status: "error",
                                message: error.message,
                            });
                        });
                })
                .catch(() => {
                    gen_order_otp(mobile, res);
                });
        } else {
            gen_order_otp(mobile, res);
        }
    });
}

function gen_order_otp2(mobile, order_id, res, successCallback, errorCallback) {
    let otp = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
    let where = {};
    where["otp"] = otp;
    Checkout.findOne(where)
        .populate("delivery_boy", "full_name")
        .then((response) => {
            if (!response) {
                let where = {};
                where["_id"] = order_id;
                Checkout.findOneAndUpdate(
                    where,
                    {
                        otp: otp,
                    },
                    {
                        new: true,
                    }
                )
                    .exec()
                    .then(() => {
                        successCallback(otp);
                        // axios.get("https://2factor.in/API/R1/?module=TRANS_SMS&apikey=d4ab2eaa-d61e-11ea-9fa5-0200cd936042&to=" + mobile + "&from=TASTES&msg=" + encodeURI(msg)).then(function (response) {
                        //     successCallback(otp);
                        // });
                    })
                    .catch(() => {
                        gen_order_otp2(mobile, order_id, res);
                    });
            } else {
                gen_order_otp2(mobile, order_id, res);
            }
        });
}
function gen_ghar_ka_khana_order_otp2(mobile, order_id, res, successCallback) {
    let otp = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;

    let where = {};
    where["otp"] = otp;
    GharKakhanaOrders.findOne(where)
        .populate("delivery_boy", "full_name")
        .then((response) => {
            if (!response) {
                let where = {};
                where["_id"] = order_id;
                GharKakhanaOrders.findOneAndUpdate(
                    where,
                    {
                        otp: otp,
                    },
                    {
                        new: true,
                    }
                )
                    .exec()
                    .then(() => {
                        successCallback(otp);
                        // axios.get("https://2factor.in/API/R1/?module=TRANS_SMS&apikey=d4ab2eaa-d61e-11ea-9fa5-0200cd936042&to=" + mobile + "&from=TASTES&msg=" + encodeURI(msg)).then(function (response) {
                        //     successCallback(otp);
                        // });
                    })
                    .catch(() => {
                        gen_ghar_ka_khana_order_otp2(mobile, order_id, res);
                    });
            } else {
                gen_ghar_ka_khana_order_otp2(mobile, order_id, res);
            }
        });
}

async function GenURL(id) {
    let t2purl = "https://tastes2plate.com/map?order=" + id;
    let url = await bitly.shorten(t2purl);
    //console.log(url);
    return url.link;
}

async function SendWATI(template_name, parameters, number) {
    let data = JSON.stringify({
        countryCode: "+91",
        phoneNumber: number,
        callbackData: "some text here",
        type: "Template",
        template: {
            "name": template_name,
            "languageCode": "en",
            "bodyValues": parameters
        }
    });

    let config = {
        method: "POST",
        url: "https://api.interakt.ai/v1/public/message/",
        headers: {
            Authorization: "Basic LTRlZk1kdjFOT05XcHVvQ1lIeDZMbGl5cGxCWjRiRlJ4VUFOUGNPYlRuazo=",
            "Content-Type": "application/json",
        },
        data: data,
    };

    axios(config)
        .then(function () {
            // console.log(response);
        })
        .catch(function (error) {
            console.log(error)
            console.log(error.message);
        });
}
function latLonDistanceCalculate(lat1, lon1, lat2, lon2) {
    // Convert latitude and longitude from degrees to radians
    const toRadians = (angle) => (angle * Math.PI) / 180;
    lat1 = toRadians(lat1);
    lon1 = toRadians(lon1);
    lat2 = toRadians(lat2);
    lon2 = toRadians(lon2);

    // Haversine formula
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;

    const a =
        Math.sin(dlat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Earth radius in kilometers (mean value)
    const R = 6371;

    // Calculate the distance
    const distance = R * c;

    return distance;
};


module.exports = {
    parent_category_list: function (req, res) {
        let where = {};

        where["active"] = 1;
        where["parent"] = null;
        where["deleted"] = 0;

        Category.find(where)
            .sort({
                created_date: -1,
            })
            .then((response) => {
                res.status(200).send({
                    status: "success",
                    result: response,
                    message: "",
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    result: [],
                });
            });
    },
    sub_category_list: function (req, res) {
        let where = {};

        where["active"] = 1;
        where["parent"] = req.query.parent;
        where["deleted"] = 0;

        Category.find(where)
            .populate("parent", "name")
            .sort({
                created_date: -1,
            })
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
                    message: error,
                    result: [],
                });
            });
    },
    brand_list: function (req, res) {
        let where = {};

        where["active"] = 1;
        where["deleted"] = 0;

        Brand.find(where)
            .sort({ name: 1 })
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
                    message: error,
                    result: [],
                });
            });
    },
    product_list: function (req, res) {
        let where = {};
        if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != NaN && req.query.taste != "NaN" && req.query.taste != "") {
            if (req.query.taste == 0 || req.query.taste == 1) {
                where["taste"] = Number(req?.query?.taste);
            }
        };

        if (req.query.category && req.query.category != "") {
            where["category"] = req.query.category;
        }

        if (req.query.brand && req.query.brand != "") {
            where["brand"] = req.query.brand;
        }

        if (req.query.sub_category && req.query.sub_category != "") {
            where["sub_category"] = req.query.sub_category;
        }

        if (req.query.city && req.query.city != "") {
            where["city"] = req.query.city;
        }

        if (req.query.cuisine && req.query.cuisine != "") {
            where["cuisine"] = req.query.cuisine;
        }
        if (req.query.vendor && req.query.vendor != "") {
            where["vendor"] = req.query.vendor;
        }

        if (req.query.search && req.query.search != "") {
            where["name"] = {
                $regex: ".*" + req.query.search + ".*",
                $options: "i",
            };
        }

        if (req.query.price_start && req.query.price_start != "" && req.query.price_end && req.query.price_end != "") {
            where["price"] = {
                $gt: req.query.price_start,
                $lt: req.query.price_end,
            };
        }

        if (req.query.sale && req.query.sale == "Y") {
            where["deal"] = 1;
        }
        where["active"] = 1;
        where["deleted"] = 0;

        let sort = "-top";

        if (req.query.sort && req.query.sort == "date_added") {
            let sort = {
                created_date: -1,
            };
        }
        if (req.query.sort && req.query.sort == "price_low_first") {
            let sort = {
                price: +1,
            };
        }
        if (req.query.sort && req.query.sort == "price_high_first") {
            let sort = {
                price: -1,
            };
        }


        let skip = Number(req.query.page) > -1 ? (Number(req.query.page)) * Number(req.query.per_page) : 0;
        Products.find(where, null, {
            limit: Number(req.query.per_page),
            skip: skip,
        })
            .populate("category", "name")
            .populate("sub_category", "name")
            .populate("cuisine", "name")
            .populate("brand", "name")
            .populate("vendor", "full_name")
            .populate("city", "name")
            .sort(sort)
            .then((response) => {
                Products.find(where).countDocuments(function (err, count) {
                    res.status(200).send({
                        status: "success",
                        message: "",
                        result: response,
                        count: count,
                    });
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    result: [],
                });
            });
    },
    product_details: function (req, res) {
        let where = {};
        console.log(req.query,"AKSH TESTING")

        where["_id"] = req.query.id;
        where["active"] = 1;
        Products.find(where)
            .populate("category", "name")
            .populate("sub_category", "name")
            .populate("cuisine", "name")
            .populate("brand", "name")
            .populate("vendor", "full_name")
            .populate("city", "name")
            .sort({
                created_date: -1,
            })
            .then((response) => {
                let where = {};
                where["product"] = req.query.id;
                where["active"] = 1;

                Review.find(where)
                    .sort({
                        created_date: -1,
                    })
                    .then((review_response) => {
                        if (req.query.address) {
                            Address.findOne({ _id: req.query.address }).then((address_response) => {
                                let lat1 = address_response?.position?.coordinates[0] ? address_response?.position?.coordinates[0] : 0;
                                let lon1 = address_response?.position?.coordinates[1] ? address_response?.position?.coordinates[1] : 0;
                                let city = address_response?.city;
                                Office.findOne({ city: city })
                                    .then(office_response => {
                                        let lat2 = office_response?.position?.coordinates[0] ? office_response?.position?.coordinates[0] : 0;
                                        let lon2 = office_response?.position?.coordinates[1] ? office_response?.position?.coordinates[1] : 0;
                                        // console.log(lat1, lat2, lon1, lon2,address_response?.city, office_response?.position)
                                        let distance = latLonDistanceCalculate(lat1, lon1, lat2, lon2);
                                        res.status(200).send({
                                            status: "success",
                                            message: "",
                                            result: response,
                                            review: review_response,
                                            distance: distance ? Number(distance?.toFixed(2)) : 0
                                        });
                                    })
                            })
                        } else {
                            if (req.query.city) {
                                let lat1 = req.query.lat ? req.query.lat : 0;
                                let lon1 = req.query.lng ? req.query.lng : 0;
                                let city = req.query?.city;
                                // console.log(req.query, "QUERY");
                                Office.findOne({ city: city })
                                    .then(office_response => {
                                        let lat2 = office_response?.position?.coordinates[0] ? office_response?.position?.coordinates[0] : 0;
                                        let lon2 = office_response?.position?.coordinates[1] ? office_response?.position?.coordinates[1] : 0;
                                        // console.log(lat1, lat2, lon1, lon2, address_response?.city, office_response?.position)
                                        let distance = latLonDistanceCalculate(lat1, lon1, lat2, lon2);
                                        res.status(200).send({
                                            status: "success",
                                            message: "",
                                            result: response,
                                            review: review_response,
                                            distance: distance ? Number(distance?.toFixed(2)) : 0
                                        });
                                    })
                            } else {
                                res.status(200).send({
                                    status: "success",
                                    message: "",
                                    result: response,
                                    review: review_response,
                                    distance: 0
                                });
                            }

                        }
                    })
                    .catch((error) => {
                        res.status(200).send({
                            status: "error",
                            message: error,
                            result: [],
                            review: [],
                            distance: 0
                        });
                    });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    result: [],
                    review: [],
                });
            });
    },
    registration: function (req, res) {
        let where = {};
        where["deleted"] = 0;
        where["mobile"] = req.body.mobile;
        where["user_type"] = "customer";

        Users.findOne(where)
            .then((response) => {
                if (response != null) {
                    res.status(200).send({
                        status: "error",
                        message: "Mobile already in use.",
                        result: [],
                        OTP: "",
                    });
                } else {
                    let where = {};
                    where["deleted"] = 0;
                    where["email"] = req.body.email;
                    where["user_type"] = "customer";

                    Users.findOne(where).then((response) => {
                        if (response != null) {
                            res.status(200).send({
                                status: "error",
                                message: "Email already in use.",
                                result: [],
                                OTP: "",
                            });
                        } else {
                            let where = {};
                            where["deleted"] = 0;
                            where["email"] = req.body.email;
                            Users.findOne(where).then(() => {
                                let userdata = new Users({
                                    email: req.body.email,
                                    mobile: req.body.mobile,
                                    user_type: "customer",
                                    active: 1,
                                    email_verified: 0,
                                    profile_image: "",
                                    device_token: req.body.device_token,
                                    device_type: req.body.device_type,
                                    reffer_by: req.body.reffer_by,
                                    first_time: req.body.reffer_by != "" ? 1 : 0,
                                });

                                //console.log(userdata)

                                userdata.save(function (err, response) {
                                    if (err) {
                                        res.status(200).send({
                                            status: "error",
                                            message: err,
                                            result: [],
                                            OTP: "",
                                        });
                                    } else {
                                        gen_otp(
                                            req.body.mobile,
                                            res,
                                            () => {
                                                res.status(200).send({
                                                    status: "success",
                                                    OTP: "",
                                                    message: "OTP has been sent to mobile number.",
                                                    result: response?._id
                                                });

                                                let where = {};
                                                Settings.find(where)
                                                    .sort({
                                                        order: +1,
                                                    })
                                                    .then((response) => {
                                                        let signup_bonus_reciver = response[33].value;
                                                        let where = {};
                                                        where["mobile"] = req.body.mobile;
                                                        Users.findOneAndUpdate(
                                                            where,
                                                            {
                                                                subscription: {
                                                                    point: signup_bonus_reciver,
                                                                },
                                                            },
                                                            {
                                                                new: true,
                                                            }
                                                        )
                                                            .exec()
                                                            .then((response) => {
                                                                let Walletdata = new Wallet({
                                                                    user: response._id,
                                                                    point: Number(signup_bonus_reciver),
                                                                    type: 1,
                                                                    note: "Referral signup bonus",
                                                                });
                                                                Walletdata.save(function () { });
                                                            });
                                                    });
                                            },
                                            (errorResponse) => {
                                                res.status(200).send({
                                                    status: "error",
                                                    message: errorResponse,
                                                    result: [],
                                                    OTP: "",
                                                });
                                            }
                                        );
                                    }
                                });
                            });
                        }
                    });
                }
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Invalid mobile",
                });
            });
    },
    verify_otp: function (req, res) {
        let where = {};

        where["mobile"] = req.body.mobile;
        where["otp"] = req.body.otp;
        where["deleted"] = 0;
        Users.findOne(where)
            .sort({
                created_date: -1,
            })
            .then((response) => {
                if (response) {
                    if (response.active == 0) {
                        res.status(200).send({
                            status: "error",
                            message: "Account is inactive",
                        });
                        return;
                    }

                    let where = {};
                    where["_id"] = response._id;
                    Users.findOneAndUpdate(
                        where,
                        {
                            otp: null,
                            device_token: req.body.device_token,
                        },
                        {
                            new: true,
                        }
                    )
                        .exec()
                        .then(() => { });

                    res.status(200).send({
                        status: "success",
                        data: response,
                        message: "Otp verified",
                    });
                } else {
                    res.status(200).send({
                        status: "error",
                        data: {},
                        message: "Invalid OTP",
                    });
                }
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    result: {},
                    OTP: "",
                });
            });
    },
    login: async function (req, res) {
        let where = {};
        where["deleted"] = 0;
        where["mobile"] = req.body.mobile;
        where["user_type"] = "customer";

        // For 24 hours
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        try {
            const query = req.body.ip
                ? { ip: req.body.ip, createdAt: { $gte: twentyFourHoursAgo }, active: 0 }
                : { mobile: req.body.mobile, createdAt: { $gte: twentyFourHoursAgo }, active: 0 };


            const otp_qty = await ipLog.countDocuments(query);

            let query2 = req.body.ip
                ? { ip: req.body.ip }
                : { mobile: req.body.mobile }

            const total_qty = await ipLog.countDocuments(query2);


            if (otp_qty < 100) {
                Users.findOne(where)
                    .then((response) => {
                        if (response.active == 0) {
                            res.status(200).send({
                                status: "error",
                                message: "Account is inactive",
                            });
                            return;
                        }

                        if (response != null) {
                            gen_otp(
                                req.body.mobile,
                                res,
                                () => {
                                    let where = {};
                                    where["deleted"] = 0;
                                    where["mobile"] = req.body.mobile;
                                    Users.findOneAndUpdate(
                                        where,
                                        {
                                            device_token: req.body.device_token,
                                            device_type: req.body.device_type,
                                        },
                                        {
                                            new: true,
                                        }
                                    )
                                        .exec()
                                        .then(async () => {
                                            // try {
                                            //     const response = await axios.get(`https://ipapi.co/${req.body.user_ip}/json`);
                                            //     ip_details = response.data || {};
                                            // } catch (axiosError) {
                                            //     console.error('Error fetching IP details:', axiosError);
                                            // }

                                            // Extract only the base path from the URL

                                            // Use geoip to get location info based on IP address as a fallback
                                            const geo = geoip.lookup(req.body.user_ip);
                                            const country = geo?.country || '';
                                            const state = geo?.region || '';
                                            const city = geo?.city || '';

                                            let a = new ipLog({
                                                ip: req.body.user_ip,
                                                mobile: req.body.mobile,
                                                quantity: Number(total_qty ? total_qty : 0) + 1,
                                                state: state,
                                                country: country,
                                                city: city,
                                            })

                                            a.save();
                                            ipLog.updateMany({ mobile: req.body.mobile }, { $set: { active: 0 } }).exec();

                                            res.status(200).send({
                                                status: "success",
                                                OTP: 0,
                                                message: "OTP has been sent to mobile number.",
                                            });

                                        });
                                },
                                (errorResponse) => {
                                    res.status(200).send({
                                        status: "error",
                                        message: errorResponse,
                                        OTP: "",
                                    });
                                }
                            );
                        } else {
                            res.status(200).send({
                                status: "error",
                                message: "mobile number not registered",
                                OTP: "",
                            });
                        }
                    })
                    .catch(() => {
                        res.status(200).send({
                            status: "error",
                            message: "Invalid mobile",
                            OTP: "",
                        });
                    });
            } else {
                res.status(200).send({
                    status: "error",
                    message: "You have exceeded permessible limit of OTP and it is blocked forever. Please contact us on WhatsApp at 8100709627 to resume the service",
                });
            }
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).send('Internal server error');
        }
    },
    send_otp: async function (req, res) {
        let where = {};
        where["mobile"] = req.body.mobile;
        where["deleted"] = 0;
        
        // Validate required fields
        if (!req.body.mobile) {
            return res.status(200).send({
                status: "error",
                message: "Mobile number is required",
            });
        }
        
        // For 24 hours
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        try {
            const query = req.body.ip
                ? { ip: req.body.ip, createdAt: { $gte: twentyFourHoursAgo }, active: 0 }
                : { mobile: req.body.mobile, createdAt: { $gte: twentyFourHoursAgo }, active: 0 };

            const otp_qty = await ipLog.countDocuments(query);


            let query2 = req.body.ip
                ? { ip: req.body.ip }
                : { mobile: req.body.mobile }

            const total_qty = await ipLog.countDocuments(query2);


            if (otp_qty < 100) {
                Users.findOne(where)
                    .then((response) => {
                        if (response != null) {
                            gen_otp(
                                req.body.mobile,
                                res,
                                async (successResponse) => {
                                    // let ip_details = {};
                                    // try {
                                    //     const response = await axios.get(`https://ipapi.co/${req.body.user_ip}/json`);
                                    //     ip_details = response.data || {};
                                    // } catch (axiosError) {
                                    //     console.error('Error fetching IP details:', axiosError);
                                    // }

                                    // Extract only the base path from the URL

                                    // Use geoip to get location info based on IP address as a fallback
                                    const geo = geoip.lookup(req.body.user_ip);
                                    const country = geo?.country || '';
                                    const state = geo?.region || '';
                                    const city = geo?.city || '';

                                    let a = new ipLog({
                                        ip: req.body.user_ip,
                                        mobile: req.body.mobile,
                                        quantity: Number(total_qty ? total_qty : 0) + 1,
                                        state: state,
                                        country: country,
                                        city: city
                                    })

                                    a.save();

                                    ipLog.updateMany({ mobile: req.body.mobile }, { $set: { active: 0 } }).exec();

                                    res.status(200).send({
                                        status: "success",
                                        OTP: successResponse,
                                        message: "OTP has been sent to mobile number.",
                                        otp_qty: otp_qty,
                                        total_qty: total_qty
                                    });

                                },
                                (errorResponse) => {
                                    res.status(200).send({
                                        status: "error",
                                        message: errorResponse,
                                        OTP: "",
                                    });
                                }
                            );
                        } else {
                            res.status(200).send({
                                status: "error",
                                message: "mobile number not registered",
                                OTP: "",
                            });
                        }
                    })
                    .catch(() => {
                        res.status(200).send({
                            status: "error",
                            message: "Invalid mobile",
                            OTP: "",
                        });
                    });
            } else {
                res.status(200).send({
                    status: "error",
                    message: "You have exceeded permessible limit of OTP and it is blocked forever. Please contact us on WhatsApp at 8100709627 to resume the service",
                });
            }
        }
        catch (error) {
            console.error('Error processing request:', error);
            res.status(500).send('Internal server error');
        }
    },
    get_profile: function (req, res) {
        let where = {};
        where["_id"] = req.query.id;
        Users.findOne(where)
            .then((response) => {
                res.status(200).send({
                    status: "success",
                    message: "",
                    result: response,
                });
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Invalid user id",
                    result: [],
                    //token: req.token,
                });
            });
    },
    edit_profile: function (req, res) {
        let where = {};
        where["_id"] = req.body.id;
        Users.findOneAndUpdate(
            where,
            {
                mobile: req.body.mobile,
                full_name: req.body.full_name,
                email: req.body.email
            },
            {
                new: true,
            }
        )
            .exec()
            .then(() => {
                res.status(200).send({
                    status: "success",
                    message: "Profile has been updated.",
                    //token: req.token,
                });
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Profile update error.",
                    //token: req.token,
                });
            });
    },
    all_city_list: function (req, res) {
        let where = {};

        where["active"] = 1;
        where["deleted"] = 0;

        City.find(where)
            .sort({ name: 1 })
            .then((response) => {
                if (response) {
                    res.status(200).send({
                        status: "success",
                        message: "",
                        result: response,
                    });
                } else {
                    res.status(200).send({
                        status: "error",
                        result: [],
                        message: "No data found",
                    });
                }
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    result: [],
                    //token: req.token,
                });
            });
    },
    update_profile_image: function (req, res) {
        upload_local(req, res, function (error) {
            if (error) {
                res.status(200).send({
                    status: "error",
                    message: error.code,
                    //token: req.token,
                });
            } else {

                let where = {};
                where["_id"] = req.body.id;

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

                Users.findOneAndUpdate(
                    where,
                    {
                        profile_image: image_data.location,
                        update_date: moment().format(),
                    },
                    {
                        new: true,
                    }
                )
                    .exec()
                    .then(() => {
                        res.status(200).send({
                            status: "success",
                            message: "Profile image has been updated",
                            //token: req.token,
                            profile_image: image_data.location,
                        });
                    })
                    .catch((error) => {
                        res.status(200).send({
                            status: "error",
                            message: error,
                            profile_image: "",
                        });
                    });
            }
        });
    },
    address_list: function (req, res) {
        const userId = req.query.id || req.query.user_id || req.query.userid;
        
        if (!userId) {
            return res.status(200).send({
                status: "error",
                message: "User ID is required",
                result: [],
            });
        }
        
        let where = {};
        where["user"] = userId;
        where["deleted"] = 0;
        
        console.log('Address Query:', where);
        console.log('Request params:', req.query);
        
        Address.find(where)
            .sort({
                created_date: -1,
            })
            .populate("city", "name")
            .populate("state", "name")
            .then((response) => {
                console.log('Addresses found:', response.length);
                if (response && response.length > 0) {
                    res.status(200).send({
                        status: "success",
                        message: "",
                        result: response,
                    });
                } else {
                    res.status(200).send({
                        status: "success",
                        message: "No addresses found",
                        result: [],
                    });
                }
            })
            .catch((error) => {
                console.error('Address list error:', error);
                res.status(200).send({
                    status: "error",
                    message: error.message || error,
                    result: [],
                });
            });
    },
    add_address: function (req, res) {
        const userId = req.body.userId || req.body.userid || req.body.user_id;
        
        if (!userId) {
            return res.status(200).send({
                status: "error",
                message: "User ID is required",
            });
        }
        
        console.log('Adding address for user:', userId);
        
        let userAddressData = new Address({
            user: userId,
            title: req.body.title || req.body.addressType || '',
            address: req.body.address,
            address2: req.body.address2 || '',
            city: req.body.city,
            state: req.body.state,
            post_office: req.body.post_office || '',
            pincode: req.body.pincode,
            contact_name: req.body.contact_name || '',
            contact_mobile: req.body.contact_mobile || '',
            position: {
                type: "Point",
                coordinates: [req.body.lat ? req.body.lat.substring(0, 7) : 0, req.body.lng ? req.body.lng.substring(0, 7) : 0],
            },
            landmark: req.body.landmark || '',
        });

        userAddressData
            .save()
            .then((response) => {
                console.log('Address saved successfully:', response._id);
                res.status(200).send({
                    status: "success",
                    message: "Address added",
                    response: response,
                });
            })
            .catch((error) => {
                console.error('Error saving address:', error);
                res.status(200).send({
                    status: "error",
                    message: error.message || error,
                });
            });
    },
    get_address: function (req, res) {
        const userId = req.query.userId || req.query.id || req.query.user_id || req.query.userid;
        
        if (!userId) {
            return res.status(200).send({
                status: "error",
                message: "User ID is required",
                result: [],
            });
        }
        
        let where = {};
        where["user"] = userId;
        where["deleted"] = 0;
        
        Address.find(where)
            .populate("city", "name")
            .populate("state", "name")
            .sort({ created_date: -1 })
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
                    message: error.message || "Error fetching addresses",
                    result: [],
                });
            });
    },
    edit_address: function (req, res) {
        let where = {};
        where["_id"] = req.body.id;
        Address.findOneAndUpdate(
            where,
            {
                title: req.body.title,
                address: req.body.address,
                address2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                post_office: req.body.post_office,
                pincode: req.body.pincode,
                contact_name: req.body.contact_name,
                contact_mobile: req.body.contact_mobile,
                landmark: req.body.landmark,
                position: {
                    type: "Point",
                    coordinates: [req.body.lat ? req.body.lat.substring(0, 7) : 0, req.body.lng ? req.body.lng.substring(0, 7) : 0],
                },
            },
            {
                new: true,
            }
        )
            .exec()
            .then(() => {
                res.status(200).send({
                    status: "success",
                    message: "Address has been updated.",
                    //token: req.token,
                });
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Address update error.",
                    //token: req.token,
                });
            });
    },
    delete_address: function (req, res) {
        let where = {};
        where["_id"] = req.query.id;
        Address.findOneAndUpdate(
            where,
            {
                deleted: 1,
            },
            {
                new: true,
            }
        )
            .exec()
            .then(() => {
                res.status(200).send({
                    status: "success",
                    message: "Address has been deleted.",
                    //token: req.token,
                });
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Address update error.",
                    //token: req.token,
                });
            });
    },
    get_contact_us: function (req, res) {
        let where = {};
        Contactus.findOne(where)
            .then((response) => {
                res.status(200).send({
                    status: "success",
                    message: "",
                    result: response,
                });
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Invalid response",
                    result: [],
                    //token: req.token,
                });
            });
    },
    edit_contact_us: function (req, res) {
        let where = {};
        where["_id"] = req.body.id;
        Contactus.findOneAndUpdate(
            where,
            {
                phone: req.body.phone,
                whatsapp: req.body.whatsapp,
                email: req.body.email,
                address: req.body.address,
            },
            {
                new: true,
            }
        )
            .exec()
            .then(() => {
                res.status(200).send({
                    status: "success",
                    message: "Contact us updated.",
                    //token: req.token,
                });
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Contact us update error.",
                    //token: req.token,
                });
            });
    },

    home: function (req, res) {
        let where = {};
        where["parent"] = null;
        where["deleted"] = 0;
        where["active"] = 1;
        Category.find(where)
            .limit(8)
            .then((category_response) => {
                let where = {};
                where["deleted"] = 0;
                where["active"] = 1;
                Slider.find(where)
                    .limit(50)
                    .populate("city", "name")
                    .then((slider_response) => {
                        let where = {};
                        where["deal"] = 1;
                        where["deleted"] = 0;
                        where["active"] = 1;
                        where['city'] = req.query.city;
                        where["end_date"] = {
                            $gt: moment().toISOString(),
                        };
                        if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != NaN && req.query.taste != "NaN" && req.query.taste != "") {
                            if (req.query.taste == 0 || req.query.taste == 1) {
                                where["taste"] = Number(req?.query?.taste);
                            }
                        };
                        where['combo_products'] = null;
                        Products.find(where)
                            .limit(50)
                            .populate("combo_products")
                            .populate("city", "name")
                            .populate("brand", "name")
                            .populate("category", "name")
                            .populate("sub_category", "name")
                            .populate("cuisine", "name")
                            .then((deal_response) => {
                                let where = {};
                                where["deleted"] = 0;
                                where["active"] = 1;
                                where['city'] = req.query.city;
                                where["combo_products"] = null;
                                where["best_seller"] = 1;
                                where["created_date"] = {
                                    $gte: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000),
                                };
                                if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != NaN && req.query.taste != "NaN" && req.query.taste != "") {
                                    if (req.query.taste == 0 || req.query.taste == 1) {
                                        where["taste"] = Number(req?.query?.taste);
                                    }
                                };
                                Products.find(where)
                                    .limit(50)
                                    .populate("combo_products")
                                    .populate("city", "name")
                                    .populate("brand", "name")
                                    .populate("category", "name")
                                    .populate("sub_category", "name")
                                    .populate("cuisine", "name")
                                    .then((best_seller_response) => {
                                        let where = {};
                                        where["discounted_price"] = {
                                            $ne: "",
                                        };
                                        Coupon.find(where).then((special_response) => {
                                            let where = {};
                                            where["deleted"] = 0;
                                            where["active"] = 1;
                                            where["featured"] = 1;
                                            where["combo_products"] = null;
                                            if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != NaN && req.query.taste != "NaN" && req.query.taste != "") {
                                                if (req.query.taste == 0 || req.query.taste == 1) {
                                                    where["taste"] = Number(req?.query?.taste);
                                                }
                                            };
                                            Products.find(where)
                                                .limit(50)
                                                .populate("combo_products")
                                                .populate("city", "name")
                                                .populate("brand", "name")
                                                .populate("category", "name")
                                                .populate("sub_category", "name")
                                                .populate("cuisine", "name")
                                                .then((featured_response) => {
                                                    let where = {};
                                                    where["deleted"] = 0;
                                                    where["active"] = 1;
                                                    City.find(where)
                                                        .populate("combo_products")
                                                        .sort({ name: 1 })
                                                        .then((city_response) => {
                                                            let where = {};

                                                            if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != NaN && req.query.taste != "NaN" && req.query.taste != "") {
                                                                if (req.query.taste == 0 || req.query.taste == 1) {
                                                                    where["taste"] = Number(req?.query?.taste);
                                                                }
                                                            };
                                                            where["combo_products"] = {
                                                                $ne: null,
                                                            }
                                                            where["active"] = 1;
                                                            where['deleted'] = 0;
                                                            Products.find(where)
                                                                .populate("combo_products")
                                                                .limit(50)
                                                                .populate("city", "name")
                                                                .populate("brand", "name")
                                                                .populate("category", "name")
                                                                .populate("sub_category", "name")
                                                                .populate("cuisine", "name")
                                                                .then((combo_response) => {
                                                                    Cuisine.find({
                                                                        active: 1,
                                                                        deleted: 0,
                                                                    }).then((cuisine_response) => {
                                                                        let where = {};
                                                                        where["deleted"] = 0;
                                                                        where["active"] = 1;
                                                                        where["ps"] = {
                                                                            $ne: "product",
                                                                        };
                                                                        City.find(where, null, {}).then((service_city) => {
                                                                            let where = {};
                                                                            where["top"] = 1;
                                                                            Brand.find(where)

                                                                                .limit(16)
                                                                                .exec((err, TopBrandData) => {
                                                                                    let where = {};
                                                                                    where["gem"] = 1;
                                                                                    Brand.find(where)

                                                                                        .limit(16)
                                                                                        .exec((err, HiddenData) => {
                                                                                            let where = {};
                                                                                            where["top"] = 1;
                                                                                            if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != NaN && req.query.taste != "NaN" && req.query.taste != "") {
                                                                                                if (req.query.taste == 0 || req.query.taste == 1) {
                                                                                                    where["taste"] = Number(req?.query?.taste);
                                                                                                }
                                                                                            };
                                                                                            Products.find(where)
                                                                                                .populate("city", "name")
                                                                                                .populate("brand", "name")
                                                                                                .populate("category", "name")
                                                                                                .populate("sub_category", "name")
                                                                                                .populate("cuisine", "name")
                                                                                                .limit(40)
                                                                                                .exec((err, MostOrderd) => {
                                                                                                    let whereTop = {};
                                                                                                    whereTop['deleted'] = 0;

                                                                                                    ShopBySlider
                                                                                                        .find(whereTop)
                                                                                                        .populate("products")
                                                                                                        .exec((err, top_most_ordered_products) => {
                                                                                                            let where = {};

                                                                                                            where["deleted"] = 0;
                                                                                                            where["active"] = 1;

                                                                                                            GharkaKhanaSliders.find(where)
                                                                                                                .populate("city", "name")
                                                                                                                .sort("name")
                                                                                                                .then((ghar_ka_khana_slider) => {
                                                                                                                    res.status(200).send({
                                                                                                                        status: "success",
                                                                                                                        category: category_response,
                                                                                                                        slider: slider_response,
                                                                                                                        product_deal: deal_response,
                                                                                                                        best_seller: best_seller_response,
                                                                                                                        special: special_response,
                                                                                                                        featured: featured_response,
                                                                                                                        city: city_response,
                                                                                                                        combo: combo_response,
                                                                                                                        cuisine: cuisine_response,
                                                                                                                        service_city: service_city,
                                                                                                                        top_brands: TopBrandData,
                                                                                                                        hidden_gems: HiddenData,
                                                                                                                        most_orderd_item: MostOrderd,
                                                                                                                        message: "",
                                                                                                                        top_most_ordered_products: top_most_ordered_products,
                                                                                                                        ghar_ka_khana_slider: ghar_ka_khana_slider
                                                                                                                    });
                                                                                                                })

                                                                                                        });
                                                                                                });
                                                                                        });
                                                                                });
                                                                        });
                                                                    });
                                                                });
                                                        });
                                                });
                                        });
                                    });
                            });
                    });
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Invalid response",
                    category: [],
                    slider: [],
                    product_deal: [],
                    best_seller: [],
                });
            });
    },

    offer_deal: function (req, res) {
        let where = {};
        where["deleted"] = 0;
        where["active"] = 1;
        where["deal"] = 1;
        //where["city"] = req.query.city;
        where["end_date"] = {
            $gt: moment().toISOString(),
        };
        Products.find(where)
            .limit(50)
            .then((deal_response) => {
                let where = {};
                where["status"] = "vendor_approved";
                Checkout.find(where)
                    .limit(20)
                    .then((best_seller_checkout) => {
                        let i, j, k;
                        let sold = [];
                        for (i = 0; i < best_seller_checkout.length; i++) {
                            if (best_seller_checkout[i].products) {
                                for (j = 0; j < best_seller_checkout[i].products.length; j++) {
                                    sold.push(best_seller_checkout[i].products[j].product);
                                }
                            }
                        }

                        let filteredArray = sold.filter(function (item, pos) {
                            return sold.indexOf(item) == pos;
                        });
                        let where = {};
                        let ids = [];
                        for (k = 0; k < filteredArray.length; k++) {
                            ids.push(mongoose.Types.ObjectId(filteredArray[k]));
                        }

                        where["_id"] = { $in: ids };
                        where["deleted"] = 0;
                        where["active"] = 1;
                        Products.find(where)
                            .limit(50)
                            .then((best_seller_response) => {
                                let where = {};
                                where["deleted"] = 0;
                                where["active"] = 1;
                                where["city"] = req.query.city;
                                where["combo_products"] = {
                                    $ne: null,
                                };
                                Products.find(where)
                                    .limit(50)
                                    .then((combo_response) => {
                                        let where = {};
                                        where["exp_date"] = {
                                            $gt: moment().toISOString(),
                                        };
                                        where["deleted"] = 0;
                                        where["active"] = 1;
                                        where["exclusive"] = "no";
                                        Coupon.find(where).then((coupon_response) => {
                                            res.status(200).send({
                                                status: "success",
                                                product_deal: deal_response,
                                                best_seller: best_seller_response,
                                                combo: combo_response,
                                                coupon: coupon_response,
                                            });
                                        });
                                    });
                            });
                    });
            });
    },

    add_to_cart: function (req, res) {
        let where = { _id: req.body.productid };
    
        Products.findOne(where)
            .then((response) => {
                if (!response) {
                    return res.status(200).send({
                        status: "error",
                        message: "Product not found",
                    });
                }
    
                let whereSameCity = { user: req.body.id, city: response.city };
                Cart.find(whereSameCity).countDocuments(function (err, check_city) {
                    if (err) {
                        return res.status(200).send({
                            status: "error",
                            message: err,
                        });
                    }
    
                    let whereTotal = { user: req.body.id };
                    Cart.find(whereTotal).countDocuments(function (err, total_city) {
                        if (err) {
                            return res.status(200).send({
                                status: "error",
                                message: err,
                            });
                        }
    
                        if (total_city == check_city) {
                            let whereCart = {
                                product: req.body.productid,
                                user: req.body.id,
                            };
    
                            Cart.findOne(whereCart).then((product_response) => {
                                let productPrice;
    
                                if (response.selling_price && response.selling_price.value && !isNaN(response.selling_price.value)) {
                                    productPrice = response.selling_price.value;
                                } else if (response.price && response.price.value && !isNaN(response.price.value)) {
                                    productPrice = response.price.value;
                                } else {
                                    productPrice = 0;
                                }
    
                                if (product_response) {
                                    let currentQty = product_response.quantity;
                                    let newQty = Number(currentQty) + Number(req.body.quantity);
                                    let totalPrice = Number(productPrice) * newQty;
    
                                    Cart.findOneAndUpdate(
                                        whereCart,
                                        {
                                            quantity: newQty,
                                            price: totalPrice,
                                            customer_city: req.body.customer_city || "",
                                            customer_zipcode: req.body.customer_zip || req.body.customer_zipcode || "",
                                        },
                                        { new: true }
                                    )
                                        .exec()
                                        .then(() => {
                                            let whereCount = { user: req.body.id };
                                            Cart.find(whereCount).countDocuments(function (err, count) {
                                                res.status(200).send({
                                                    status: "success",
                                                    message: "cart added",
                                                    qty: count,
                                                });
                                            });
                                        });
                                } else {
                                    let totalPrice = Number(productPrice) * Number(req.body.quantity);
    
                                    let cartData = new Cart({
                                        user: req.body.id,
                                        product: req.body.productid,
                                        productname: response.name,
                                        category: response.category,
                                        sub_category: response.sub_category,
                                        cuisine: response.cuisine,
                                        brand: response.brand,
                                        vendor: response.vendor,
                                        quantity: req.body.quantity,
                                        city: response.city,
                                        customer_city: req.body.customer_city || "",
                                        customer_zipcode: req.body.customer_zip || req.body.customer_zipcode || "",
                                        price: totalPrice,
                                    });
    
                                    cartData
                                        .save()
                                        .then(() => {
                                            let whereCount = { user: req.body.id };
                                            Cart.find(whereCount).countDocuments(function (err, count) {
                                                res.status(200).send({
                                                    status: "success",
                                                    message: "cart added",
                                                    qty: count,
                                                });
                                            });
                                        })
                                        .catch((error) => {
                                            res.status(200).send({
                                                status: "error",
                                                message: error,
                                                qty: 0,
                                            });
                                        });
                                }
                            });
                        } else {
                            res.status(200).send({
                                status: "error",
                                message: "Cart inclueds product(s) from other city.",
                            });
                        }
                    });
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                });
            });
    },
    
    add_to_wish: function (req, res) {
        const userId = req.body.id || req.body.userId;
        const productId = req.body.productid || req.body.productId;

        if (!userId || !productId) {
            return res.status(200).send({
                status: "error",
                message: "User ID and Product ID are required",
                qty: 0,
            });
        }

        let where = {};
        where["product"] = productId;
        where["user"] = userId;
        
        Wish.find(where).countDocuments(function (err, count) {
            if (count > 0) {
                res.status(200).send({
                    status: "error",
                    message: "Product already in wish list",
                    qty: count,
                });
            } else {
                let WishData = new Wish({
                    user: userId,
                    product: productId,
                });
                WishData.save()
                    .then(() => {
                        let where = {};
                        where["user"] = userId;
                        Wish.find(where).countDocuments(function (err, count) {
                            res.status(200).send({
                                status: "success",
                                message: "Product added to wish list",
                                qty: count,
                            });
                        });
                    })
                    .catch((error) => {
                        res.status(200).send({
                            status: "error",
                            message: error,
                            qty: 0,
                        });
                    });
            }
        });
    },

    cart_list: function (req, res) {
        var where = {};
        where["user"] = req.query.id;
        
        console.log('Cart Query:', where);
        console.log('Request params:', req.query);
        
        Cart.find(where)
            .populate("vendor")
            .populate({
                path: "product",
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
                    {
                        path: "shipping",
                        model: "shipping_classes",
                        select: "price",
                    },
                ],
            })
            .sort({
                created_date: -1,
            })
            .then((response) => {
                console.log('Cart items found:', response.length);
                
                if (response.length == 0) {
                    res.status(200).send({
                        status: "error",
                        message: "Cart is empty",
                        result: [],
                        cartprice: 0,
                        shipping_weight: 0,
                        total_packing_price: 0,
                        total_cgst: 0,
                        total_sgst: 0,
                        total_igst: 0,
                        final_price: 0,
                        last_mile_long_distance_extra_charge: 0
                    });
                    return;
                }
                
                // If customer_city and customer_zip are not provided, return basic cart info
                if (!req.query.customer_city || !req.query.customer_zip) {
                    console.log('Missing customer_city or customer_zip, returning basic cart');
                    res.status(200).send({
                        status: "success",
                        message: "Cart items retrieved. Provide customer_city and customer_zip for pricing details.",
                        result: response,
                        cartprice: 0,
                        shipping_weight: 0,
                        total_packing_price: 0,
                        total_cgst: 0,
                        total_sgst: 0,
                        total_igst: 0,
                        final_price: 0,
                        last_mile_long_distance_extra_charge: 0,
                        isCODAvailable: false
                    });
                    return;
                }
                
                var vendor_city = response[0].vendor.city;
                var isCityHotFoodAvialable = 0;
                var isCODAvailable = 1;
                var isCODAvailableZip=1;
                var where = {};
                where["_id"] = vendor_city;
                City.findOne(where).then((vendor_state_response) => {
                    var vendor_state = vendor_state_response.state;

                    var where = {};
                    where["_id"] = req.query.customer_city;
                    City.findOne(where)
                        .then((customer_state_response) => {
                            var customer_state = customer_state_response.state;
                            var extra_delivery_charges = customer_state_response?.extra_delivery_charges ? customer_state_response?.extra_delivery_charges : 1;
                            isCityHotFoodAvialable = customer_state_response?.hot_food_available;
                            isCODAvailable = customer_state_response?.cod_availability;

                            var where = {};
                            where["name"] = req.query.customer_zip;
                            where["active"] = 1;
                            ZipModel.findOne(where).then((zip_response) => {
                                if (!zip_response) {
                                    res.status(200).send({
                                        status: "error",
                                        message: "Pincode is disabled",
                                    });
                                    return false;
                                }
                                isCODAvailableZip = zip_response?.cod_availability;
                                // var additional_cost = Number(zip_response ? zip_response.additional_cost : 0);

                                var additional_cost = 0;
                                var totalCartPrice = 0;
                                var totalWeight = 0;
                                var totalPackingPrice = 0;
                                var totalCGST = 0;
                                var totalIGST = 0;
                                var totalSGST = 0;
                                var totalHotFoodCost = 0;

                                var isProductHotFoodAvailable = 0;

                                for (var i = 0; i < response.length; i++) {
                                    var hot_food_delivery_cost = 0;

                                    if (response[i].product.weight != "" && response[i].product.weight) {
                                        var total_weight = response[i].product.weight * Number(response[i].quantity);
                                    }

                                    if (response[i].product.packaging_charge != "" && response[i].product.packaging_charge) {
                                        var total_packg_charge = response[i].product.packaging_charge * Number(response[i].quantity);
                                    }
                                    if (response[i].product.hot_food_delivery_charges != "" && response[i].product.hot_food_delivery_charges) {
                                        hot_food_delivery_cost = Number(response[i]?.product?.hot_food_delivery_charges) * Number(response[i]?.quantity);
                                    }
                                    if (response[i].product.hot_food_available == 1) {
                                        isProductHotFoodAvailable = response[i].product.hot_food_available;
                                    }
                                    totalCartPrice = Number(totalCartPrice) + Number(response[i].price);
                                    totalWeight = Number(totalWeight) + Number(total_weight);
                                    totalPackingPrice = Number(totalPackingPrice) + Number(total_packg_charge);
                                    if (hot_food_delivery_cost && response[i].product.hot_food_available == 1) { totalHotFoodCost += hot_food_delivery_cost }

                                }

                                var where = {};
                                where["start_city"] = vendor_city;
                                where["end_city"] = req.query.customer_city;
                                CutOffTime.findOne(where, null, {})
                                    .sort({
                                        created_date: -1,
                                    })
                                    .then((cutoff_response) => {
                                        if (cutoff_response == null) {
                                            res.status(200).send({
                                                status: "error",
                                                message: "We are not delivering to your city",
                                                result: response,
                                            });
                                            return;
                                        }
                                        var current_time = moment.tz("Asia/Kolkata").unix();
                                        var today = new Date();
                                        var dd = String(today.getDate()).padStart(2, "0");

                                        var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
                                        var yyyy = today.getFullYear();
                                        today = mm + "/" + dd + "/" + yyyy;

                                        var provided_time = today + " " + cutoff_response.cut_of_time + ":00";
                                        var datum = Date.parse(provided_time) / 1000;

                                        ////////////
                                        var express_cut_of_time_first = today + " " + cutoff_response.express_cut_of_time_first + ":00";
                                        express_cut_of_time_first = Date.parse(express_cut_of_time_first) / 1000;
                                        var express_cut_of_time_second = today + " " + cutoff_response.express_cut_of_time_second + ":00";
                                        express_cut_of_time_second = Date.parse(express_cut_of_time_second) / 1000;

                                        ////////////

                                        if (current_time > datum) {
                                            var tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000 * 2);
                                            year = tomorrow.getFullYear();
                                            month = tomorrow.getMonth() + 1;
                                            dt = tomorrow.getDate();

                                            if (dt < 10) {
                                                dt = "0" + dt;
                                            }
                                            if (month < 10) {
                                                month = "0" + month;
                                            }
                                            var delivery_date = yyyy + "/" + month + "/" + dt;
                                        } else {
                                            var tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
                                            year = tomorrow.getFullYear();
                                            month = tomorrow.getMonth() + 1;
                                            dt = tomorrow.getDate();

                                            if (dt < 10) {
                                                dt = "0" + dt;
                                            }
                                            if (month < 10) {
                                                month = "0" + month;
                                            }
                                            var delivery_date = yyyy + "/" + month + "/" + dt;
                                        }
                                        if (current_time < express_cut_of_time_second) {
                                            var timeslot = "Afternoon";
                                        }
                                        if (current_time < express_cut_of_time_first) {
                                            var timeslot = "Night";
                                        } else {
                                            var timeslot = "Night";
                                        }

                                        var express_shipping = Number(cutoff_response.express_delivery_cost) * Number(totalWeight) + additional_cost;
                                        var normal_shipping = Number(cutoff_response.normal_delivery_cost) * Number(totalWeight) + additional_cost;

                                        var final_price = 0;
                                        var normal_ttl = Number(totalCartPrice) + (Number(normal_shipping) + Number(totalPackingPrice));
                                        var express_ttl = Number(totalCartPrice) + (Number(express_shipping) + Number(totalPackingPrice));

                                        // var normal_ttl = Number(totalCartPrice) + (Number(normal_shipping) + Number(totalPackingPrice));
                                        // var express_ttl = Number(totalCartPrice) + (Number(express_shipping) + Number(totalPackingPrice));

                                        var where = {};
                                        Settings.find(where)
                                            .sort({ _id: 1 })
                                            .then((settings_response) => {
                                                var where = {};
                                                var delivery_free_distance = settings_response[53]?.value;

                                                where["status"] = {
                                                    $nin: ["delivered", "pending_payment", "declined_vendor", "rejected_customer", "refunded", "failed", "cancel", "on_hold"],
                                                };
                                                where["deleted"] = 0;
                                                where["user"] = req.query.id;
                                                Checkout.find(where).then((open_order) => {
                                                    var total_open_order_amount = 0;
                                                    for (var i = 0; i < open_order.length; i++) {
                                                        total_open_order_amount = Number(total_open_order_amount) + Number(open_order[i].finalprice);
                                                    }

                                                    var where = {};
                                                    where["_id"] = req.query.id;
                                                    Users.findOne(where).then((customer_response) => {
                                                        var one_point_value = settings_response[28]?.value;
                                                        var point = customer_response ? Number(customer_response.subscription.point) : 0;
                                                        var point_in_rupees = Number(settings_response[31]?.value) * one_point_value;

                                                        var exp_date = customer_response?.subscription.exp_date;

                                                        var where = {};
                                                        where["_id"] = customer_response?.subscription.plan;
                                                        Plan.findOne(where).then((plan_response) => {
                                                            var plan_discount = 0;
                                                            if (plan_response && !moment(exp_date).isBefore(moment(), "day")) {
                                                                plan_discount = (totalCartPrice * plan_response.discount) / 100;
                                                            }

                                                            var normal_ttl2 = normal_ttl - plan_discount - point_in_rupees;
                                                            var express_ttl2 = express_ttl - plan_discount - point_in_rupees;

                                                            normal_ttl = normal_ttl - plan_discount;
                                                            express_ttl = express_ttl - plan_discount;

                                                            if (customer_state.toString() == "5f665ee12d45902c98aa8f1f") {
                                                                var normal_total_cgst = (normal_ttl * 2.5) / 100;
                                                                var normal_total_sgst = (normal_ttl * 2.5) / 100;

                                                                var normal_total_cgst2 = (normal_ttl2 * 2.5) / 100;
                                                                var normal_total_sgst2 = (normal_ttl2 * 2.5) / 100;

                                                                var express_total_cgst = (express_ttl * 2.5) / 100;
                                                                var express_total_sgst = (express_ttl * 2.5) / 100;

                                                                var express_total_cgst2 = (express_ttl2 * 2.5) / 100;
                                                                var express_total_sgst2 = (express_ttl2 * 2.5) / 100;

                                                                var new_final_price_express = totalCartPrice + totalPackingPrice + express_shipping + express_total_cgst + express_total_sgst;

                                                                var new_final_price_express2 = totalCartPrice + totalPackingPrice + express_shipping + express_total_cgst2 + express_total_sgst2 - plan_discount - point_in_rupees;

                                                                var new_final_price_normal = totalCartPrice + totalPackingPrice + normal_shipping + normal_total_sgst + normal_total_cgst;

                                                                var new_final_price_normal2 = totalCartPrice + totalPackingPrice + normal_shipping + normal_total_sgst2 + normal_total_cgst2 - plan_discount - point_in_rupees;
                                                            } else {
                                                                var normal_total_igst = (Number(normal_ttl) * 5) / 100;
                                                                var express_total_igst = (Number(express_ttl) * 5) / 100;

                                                                var normal_total_igst2 = (Number(normal_ttl2) * 5) / 100;
                                                                var express_total_igst2 = (Number(express_ttl2) * 5) / 100;

                                                                var new_final_price_express = totalCartPrice + totalPackingPrice + express_shipping + express_total_igst;

                                                                var new_final_price_normal = totalCartPrice + totalPackingPrice + normal_shipping + normal_total_igst;

                                                                var new_final_price_express2 = totalCartPrice + totalPackingPrice + express_shipping + express_total_igst2 - plan_discount - point_in_rupees;

                                                                var new_final_price_normal2 = totalCartPrice + totalPackingPrice + normal_shipping + normal_total_igst2 - plan_discount - point_in_rupees;
                                                            }
                                                            var express_available = cutoff_response.express;
                                                            if (zip_response && zip_response.express != true) {
                                                                express_available = false;
                                                            }
                                                            var total_distance = 0;
                                                            if (req.query.address) {
                                                                Office.find({ city: req.query.customer_city })
                                                                    .then(office_response => {
                                                                        var lat1 = office_response[0]?.position?.coordinates[0] ? office_response[0]?.position?.coordinates[0] : 0;
                                                                        var lon1 = office_response[0]?.position?.coordinates[1] ? office_response[0]?.position?.coordinates[1] : 0;
                                                                        Address.findOne({ _id: req.query.address }).then((address_response) => {
                                                                            var lat2 = address_response?.position?.coordinates[0] ? address_response?.position?.coordinates[0] : 0;
                                                                            var lon2 = address_response?.position?.coordinates[1] ? address_response?.position?.coordinates[1] : 0;

                                                                            total_distance = latLonDistanceCalculate(lat1, lon1, lat2, lon2);
                                                                            var last_mile_long_distance_extra_charge = 0;
                                                                            if (total_distance > delivery_free_distance) {
                                                                                last_mile_long_distance_extra_charge = (total_distance - delivery_free_distance) * Number(extra_delivery_charges);
                                                                            }
                                                                            // console.log(total_distance, "TD", last_mile_long_distance_extra_charge, extra_delivery_charges)
                                                                            res.status(200).send({
                                                                                status: "success",
                                                                                express: express_available,
                                                                                normal_delivery_date: delivery_date,
                                                                                express_timeslot: timeslot,
                                                                                result: response,
                                                                                cartprice: totalCartPrice,
                                                                                shipping_weight: totalWeight,
                                                                                total_packing_price: totalPackingPrice,
                                                                                total_cgst: Number(totalCGST),
                                                                                total_sgst: Number(totalSGST),
                                                                                total_igst: Number(totalIGST),
                                                                                total_hot_food_cost: totalHotFoodCost,

                                                                                // total_distance: total_distance?.toFixed(2),
                                                                                last_mile_long_distance_extra_charge: last_mile_long_distance_extra_charge?.toFixed(2),
                                                                                last_mile_long_distance: total_distance?.toFixed(2),
                                                                                last_mile_long_distance_multiplier: extra_delivery_charges,
                                                                                last_mile_free_long_distance: delivery_free_distance,
                                                                                gst: {
                                                                                    normal: {
                                                                                        total_cgst: normal_total_cgst ? normal_total_cgst.toFixed(2) : 0,
                                                                                        total_sgst: normal_total_sgst ? normal_total_sgst.toFixed(2) : 0,
                                                                                        total_igst: normal_total_igst ? normal_total_igst.toFixed(2) : 0,
                                                                                    },
                                                                                    express: {
                                                                                        total_cgst: express_total_cgst ? express_total_cgst.toFixed(2) : 0,
                                                                                        total_sgst: express_total_sgst ? express_total_sgst.toFixed(2) : 0,
                                                                                        total_igst: express_total_igst ? express_total_igst.toFixed(2) : 0,
                                                                                    },
                                                                                },

                                                                                gst_with_point: {
                                                                                    normal: {
                                                                                        total_cgst: normal_total_cgst2 ? normal_total_cgst2.toFixed(2) : 0,
                                                                                        total_sgst: normal_total_sgst2 ? normal_total_sgst2.toFixed(2) : 0,
                                                                                        total_igst: normal_total_igst2 ? normal_total_igst2.toFixed(2) : 0,
                                                                                    },
                                                                                    express: {
                                                                                        total_cgst: express_total_cgst2 ? express_total_cgst2.toFixed(2) : 0,
                                                                                        total_sgst: express_total_sgst2 ? express_total_sgst.toFixed(2) : 0,
                                                                                        total_igst: express_total_igst2 ? express_total_igst2.toFixed(2) : 0,
                                                                                    },
                                                                                },

                                                                                final_price: final_price,
                                                                                shipping: {
                                                                                    normal_shipping: normal_shipping.toFixed(2),
                                                                                    express_shipping: express_shipping.toFixed(2),
                                                                                },
                                                                                new_final_price: {
                                                                                    normal: String(Math.round(new_final_price_normal)),
                                                                                    express: String(Math.round(new_final_price_express)),
                                                                                    with_wallet: {
                                                                                        normal: String(Math.round(new_final_price_normal2)),
                                                                                        express: String(Math.round(new_final_price_express2)),
                                                                                    },
                                                                                },
                                                                                plan_discount: plan_response ? (totalCartPrice * plan_response.discount) / 100 : 0,
                                                                                customer_point: customer_response?.subscription.point,
                                                                                one_point_value: one_point_value,
                                                                                open_order_value: total_open_order_amount.toFixed(2),
                                                                                max_open_cod_order: settings_response[26].value,
                                                                                hot_food_available_city: isCityHotFoodAvialable,
                                                                                hot_food_available_product: isProductHotFoodAvailable,
                                                                                total_hot_food_cost: totalHotFoodCost,
                                                                                isCODAvailable : isCODAvailable == 1 ? isCODAvailableZip ==1 ?  1: 0 : 0
                                                                            });
                                                                        });
                                                                    })
                                                            } else {
                                                                var last_mile_long_distance_extra_charge = 0;
                                                                res.status(200).send({
                                                                    status: "success",
                                                                    express: express_available,
                                                                    normal_delivery_date: delivery_date,
                                                                    express_timeslot: timeslot,
                                                                    result: response,
                                                                    cartprice: totalCartPrice,
                                                                    shipping_weight: totalWeight,
                                                                    total_packing_price: totalPackingPrice,
                                                                    total_cgst: Number(totalCGST),
                                                                    total_sgst: Number(totalSGST),
                                                                    total_igst: Number(totalIGST),
                                                                    last_mile_long_distance_extra_charge: last_mile_long_distance_extra_charge,
                                                                    gst: {
                                                                        normal: {
                                                                            total_cgst: normal_total_cgst ? normal_total_cgst.toFixed(2) : 0,
                                                                            total_sgst: normal_total_sgst ? normal_total_sgst.toFixed(2) : 0,
                                                                            total_igst: normal_total_igst ? normal_total_igst.toFixed(2) : 0,
                                                                        },
                                                                        express: {
                                                                            total_cgst: express_total_cgst ? express_total_cgst.toFixed(2) : 0,
                                                                            total_sgst: express_total_sgst ? express_total_sgst.toFixed(2) : 0,
                                                                            total_igst: express_total_igst ? express_total_igst.toFixed(2) : 0,
                                                                        },
                                                                    },

                                                                    gst_with_point: {
                                                                        normal: {
                                                                            total_cgst: normal_total_cgst2 ? normal_total_cgst2.toFixed(2) : 0,
                                                                            total_sgst: normal_total_sgst2 ? normal_total_sgst2.toFixed(2) : 0,
                                                                            total_igst: normal_total_igst2 ? normal_total_igst2.toFixed(2) : 0,
                                                                        },
                                                                        express: {
                                                                            total_cgst: express_total_cgst2 ? express_total_cgst2.toFixed(2) : 0,
                                                                            total_sgst: express_total_sgst2 ? express_total_sgst.toFixed(2) : 0,
                                                                            total_igst: express_total_igst2 ? express_total_igst2.toFixed(2) : 0,
                                                                        },
                                                                    },

                                                                    final_price: final_price,
                                                                    shipping: {
                                                                        normal_shipping: normal_shipping.toFixed(2),
                                                                        express_shipping: express_shipping.toFixed(2),
                                                                    },
                                                                    new_final_price: {
                                                                        normal: String(Math.round(new_final_price_normal)),
                                                                        express: String(Math.round(new_final_price_express)),
                                                                        with_wallet: {
                                                                            normal: String(Math.round(new_final_price_normal2)),
                                                                            express: String(Math.round(new_final_price_express2)),
                                                                        },
                                                                    },
                                                                    plan_discount: plan_response ? (totalCartPrice * plan_response.discount) / 100 : 0,
                                                                    customer_point: customer_response?.subscription.point,
                                                                    one_point_value: one_point_value,
                                                                    open_order_value: total_open_order_amount.toFixed(2),
                                                                    max_open_cod_order: settings_response[26].value,
                                                                    hot_food_available_city: isCityHotFoodAvialable,
                                                                    hot_food_available_product: isProductHotFoodAvailable,
                                                                    total_hot_food_cost: totalHotFoodCost,
                                                                    isCODAvailable : isCODAvailable == 1 ? isCODAvailableZip ==1 ?  true: false : false
                                                                });
                                                            }
                                                        });
                                                    });
                                                });
                                            });
                                    });
                            });
                        })
                        .catch((error) => {
                            res.status(200).send({
                                status: "error",
                                message: "Cart is empty",
                                result: [],
                                cartprice: 0,
                                shipping_weight: 0,
                                total_packing_price: 0,
                                total_cgst: 0,
                                total_sgst: 0,
                                total_igst: 0,
                                final_price: 0,
                                plan_discount: 0,
                                one_point_value: 0,
                                open_order_value: 0,
                                max_open_cod_order: 0,
                                last_mile_long_distance_extra_charge: 0,
                                isCODAvailable : false
                            });
                        });
                });
            });
    },

    wish_list: function (req, res) {
        const userId = req.query.id || req.query.userId || req.query.user_id;
        
        if (!userId) {
            return res.status(200).send({
                status: "error",
                message: "User ID is required",
                result: [],
            });
        }
        
        let where = {};
        where["user"] = userId;
        
        console.log('Wishlist Query:', where);
        console.log('Request params:', req.query);
        
        Wish.find(where)
            .populate({
                path: "product",
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
                    {
                        path: "shipping",
                        model: "shipping_classes",
                        select: "price",
                    },
                ],
            })
            .sort({
                created_date: -1,
            })
            .then((response) => {
                console.log('Wishlist items found:', response.length);
                res.status(200).send({
                    status: "success",
                    result: response,
                });
            })
            .catch((error) => {
                console.error('Wishlist error:', error);
                res.status(200).send({
                    status: "error",
                    message: error.message || "Error fetching wishlist",
                    result: [],
                });
            });
    },

    delete_cart: function (req, res) {
        let itemId = req.query.itemId || req.query.id;
        let userId = req.query.userid || req.query.userId;
        
        if (!itemId) {
            return res.status(200).send({
                status: "error",
                message: "Item ID is required",
            });
        }
        
        Cart.findByIdAndDelete(itemId)
            .then((response) => {
                if (!response) {
                    return res.status(200).send({
                        status: "error",
                        message: "Cart item not found",
                    });
                }
                
                // If userId provided, return updated cart count
                if (userId) {
                    Cart.countDocuments({ user: userId }, function (err, count) {
                        res.status(200).send({
                            status: "success",
                            message: "Cart deleted successfully",
                            result: response,
                            cartCount: count
                        });
                    });
                } else {
                    res.status(200).send({
                        status: "success",
                        message: "Cart deleted successfully",
                        result: response,
                    });
                }
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error.message || error,
                });
            });
    },

    delete_wish: function (req, res) {
        Wish.findByIdAndDelete(req.query.id)
            .then((response) => {
                if (!response) {
                    return res.status(200).send({
                        status: "error",
                        message: "Wish item not found",
                    });
                }
                res.status(200).send({
                    status: "success",
                    message: "Product deleted from wish list successfully",
                    result: response,
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error.message || error,
                });
            });
    },

    update_cart: function (req, res) {
        let where = {};
        where["product"] = req.body.id;
        where["user"] = req.body.userid;
        Cart.findOne(where)
            .populate("product")
            .then((cart_response) => {
                let quantity = req.body.quantity;
                let productPrice = cart_response.product.price.value;

                if (cart_response.product.selling_price) {
                    try {
                        if (cart_response.product.selling_price.value && cart_response.product.selling_price.value != NaN) {
                            productPrice = cart_response.product.selling_price.value;
                        }
                    } catch (err) { }
                }
                
                let totalPrice = Number(productPrice);

                let where = {};
                where["product"] = req.body.id;
                where["user"] = req.body.userid;
                Cart.findOneAndUpdate(
                    where,
                    {
                        quantity: req.body.quantity,
                        price: Number(totalPrice) * Number(quantity),
                    },
                    {
                        new: true,
                    }
                )
                    .exec()
                    .then(() => {
                        res.status(200).send({
                            status: "success",
                            message: "Cart updated.",
                            //token: req.token,
                        });
                    })
                    .catch(() => {
                        res.status(200).send({
                            status: "error",
                            message: "Cart update error.",
                            //token: req.token,
                        });
                    });
            });
    },
    coupon_popup_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where['active'] = 1;
            coupon_popup.find(where)
                .populate("coupon")
                .then((response) => {
                    coupon_popup.find(where).countDocuments(function (err, count) {
                        res.status(200).send({
                            status: "success",
                            token: req.token,
                            result: response,
                            totalCount: count,
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },

    apply_coupon: function (req, res) {
        var where = {};
        where["user"] = req.body.userid;
        Cart.find(where)
            .populate("vendor")
            .populate({
                path: "product",
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
                    {
                        path: "shipping",
                        model: "shipping_classes",
                        select: "price",
                    },
                ],
            })
            .sort({
                created_date: -1,
            })
            .then((response) => {
                var coupon = req.body.coupon;
                var where = {};
                where["coupon"] = coupon;
                where["active"] = 1;
                where["deleted"] = 0;

                Coupon.findOne(where).then((response_coupon) => {
                    var vendor_city = response[0].vendor.city;
                    var where = {};
                    where["_id"] = vendor_city;
                    City.findOne(where).then((vendor_state_response) => {
                        var vendor_state = vendor_state_response.state;

                        var where = {};
                        where["start_city"] = vendor_city;
                        where["end_city"] = req.body.customer_city;
                        CutOffTime.findOne(where, null, {})
                            .sort({
                                created_date: -1,
                            })
                            .then((cutoff_response) => {
                                var where = {};
                                where["_id"] = req.body.customer_city;
                                City.findOne(where).then((customer_state_response) => {
                                    var where = {};
                                    where["name"] = req.body.customer_zip;
                                    where["active"] = 1;
                                    ZipModel.findOne(where).then((zip_response) => {
                                        if (!zip_response) {
                                            res.status(200).send({
                                                status: "error",
                                                message: "Pincode is disabled",
                                            });
                                            return false;
                                        }

                                        var additional_cost = Number(zip_response ? zip_response.additional_cost : 0);

                                        var customer_state = customer_state_response.state;
                                        var totalCartPrice = 0;
                                        var totalWeight = 0;
                                        var totalPackingPrice = 0;
                                        var totalCGST = 0;
                                        var totalIGST = 0;
                                        var totalSGST = 0;

                                        for (var i = 0; i < response.length; i++) {
                                            
                                            if (
                                                response[i].product.deal == 1 &&
                                                new Date() >= new Date(response[i].product.start_date) &&
                                                new Date() <= new Date(response[i].product.end_date)
                                              ) { 
                                                    res.status(200).send({
                                                        status: "error",
                                                        message: "Coupon is not applicable.",
                                                        couponMinAmount,
                                                        coupon_discount: 0,
                                                        coupon_type: "",
                                                        cartprice: 0,
                                                        shipping_weight: 0,
                                                        total_packing_price: 0,
                                                        total_cgst: 0,
                                                        total_sgst: 0,
                                                        total_igst: 0,
                                                        final_price: 0,
                                                        customer_point: 0,
                                                        one_point_value: 0,
                                                        open_order_value: 0,
                                                        max_open_cod_order: 0,
                                                    });
                                                    return;
                                                }

                                                if (response_coupon && response_coupon.brand && response_coupon && response[i].brand && !response_coupon.brand.includes(response[i].brand)) {
                                                    res.status(200).send({
                                                        status: "error",
                                                        message: "Coupon is not applicable",
                                                        couponMinAmount,
                                                        coupon_discount: 0,
                                                        coupon_type: "",
                                                        cartprice: 0,
                                                        shipping_weight: 0,
                                                        total_packing_price: 0,
                                                        total_cgst: 0,
                                                        total_sgst: 0,
                                                        total_igst: 0,
                                                        final_price: 0,
                                                        customer_point: 0,
                                                        one_point_value: 0,
                                                        open_order_value: 0,
                                                        max_open_cod_order: 0,
                                                    });
                                                    return;
                                                }

                                                if (response_coupon && response_coupon.product && !response_coupon.product.includes(response[i].product._id)) {
                                                    res.status(200).send({
                                                        status: "error",
                                                        message: "Coupon is not applicable.",
                                                        couponMinAmount,
                                                        coupon_discount: 0,
                                                        coupon_type: "",
                                                        cartprice: 0,
                                                        shipping_weight: 0,
                                                        total_packing_price: 0,
                                                        total_cgst: 0,
                                                        total_sgst: 0,
                                                        total_igst: 0,
                                                        final_price: 0,
                                                        customer_point: 0,
                                                        one_point_value: 0,
                                                        open_order_value: 0,
                                                        max_open_cod_order: 0,
                                                    });
                                                    return;
                                                }

                                                if (response_coupon && response_coupon.customer && !response_coupon.customer.includes(req.body.userid)) {
                                                    res.status(200).send({
                                                        status: "error",
                                                        message: "Coupon is not applicable.",
                                                        couponMinAmount,
                                                        coupon_discount: 0,
                                                        coupon_type: "",
                                                        cartprice: 0,
                                                        shipping_weight: 0,
                                                        total_packing_price: 0,
                                                        total_cgst: 0,
                                                        total_sgst: 0,
                                                        total_igst: 0,
                                                        final_price: 0,
                                                        customer_point: 0,
                                                        one_point_value: 0,
                                                        open_order_value: 0,
                                                        max_open_cod_order: 0,
                                                    });
                                                    return;
                                                }

                                                if (response_coupon && response_coupon.category && !response_coupon.category.includes(response[i].category)) {
                                                    res.status(200).send({
                                                        status: "error",
                                                        message: "Coupon is not applicable.",
                                                        couponMinAmount,
                                                        coupon_discount: 0,
                                                        coupon_type: "",
                                                        cartprice: 0,
                                                        shipping_weight: 0,
                                                        total_packing_price: 0,
                                                        total_cgst: 0,
                                                        total_sgst: 0,
                                                        total_igst: 0,
                                                        final_price: 0,
                                                        customer_point: 0,
                                                        one_point_value: 0,
                                                        open_order_value: 0,
                                                        max_open_cod_order: 0,
                                                    });
                                                    return;
                                                }

                                                if (response[i].product.weight != "" && response[i].product.weight) {
                                                    var total_weight = response[i].product.weight * Number(response[i].quantity);
                                                }

                                                if (response[i].product.packaging_charge != "" && response[i].product.packaging_charge) {
                                                    var total_packg_charge = response[i].product.packaging_charge * Number(response[i].quantity);
                                                }
                                                totalCartPrice = Number(totalCartPrice) + Number(response[i].price);
                                                totalWeight = Number(totalWeight) + Number(total_weight);
                                                totalPackingPrice = Number(totalPackingPrice) + Number(total_packg_charge);
                                            
                                        }
                                        //var final_price = (totalCartPrice+totalPackingPrice+totalCGST+totalSGST+totalIGST);

                                        var todayDate = moment().format();

                                        if (response_coupon != null) {
                                            var couponType = response_coupon.type;
                                            var couponAmount = response_coupon.amount;
                                            var couponMinAmount = response_coupon.minimum_amount;
                                            var couponMaxAmount = response_coupon.maximum_amount;
                                            var couponExpiryDate = moment(response_coupon.exp_date).endOf("day").format();
                                            var couponMaximumDiscount = response_coupon.maximum_discount ? response_coupon.maximum_discount : 0;

                                            if (todayDate > couponExpiryDate) {
                                                res.status(200).send({
                                                    status: "error",
                                                    // token: req.token,
                                                    message: "Coupon expired",
                                                    couponMinAmount,
                                                    coupon_discount: 0,
                                                    coupon_type: "",
                                                    cartprice: 0,
                                                    shipping_weight: 0,
                                                    total_packing_price: 0,
                                                    total_cgst: 0,
                                                    total_sgst: 0,
                                                    total_igst: 0,
                                                    final_price: 0,
                                                    customer_point: 0,
                                                    one_point_value: 0,
                                                    open_order_value: 0,
                                                    max_open_cod_order: 0,
                                                });
                                            } else {
                                                if (Number(totalCartPrice) < Number(couponMinAmount)) {
                                                    res.status(200).send({
                                                        status: "error",
                                                        // token: req.token,
                                                        message: "Cart amount should be more than " + couponMinAmount,
                                                        coupon_discount: 0,
                                                        coupon_type: "",
                                                        shipping_weight: 0,
                                                        total_packing_price: 0,
                                                        total_cgst: 0,
                                                        total_sgst: 0,
                                                        total_igst: 0,
                                                        final_price: 0,
                                                        customer_point: 0,
                                                        one_point_value: 0,
                                                        open_order_value: 0,
                                                        max_open_cod_order: 0,
                                                        cart_price : totalCartPrice,
                                                    });
                                                } else if (Number(totalCartPrice) > Number(couponMaxAmount)) {
                                                    res.status(200).send({
                                                        status: "error",
                                                        message: "Cart amount should be less than " + couponMaxAmount,
                                                        coupon_discount: 0,
                                                        coupon_type: "",
                                                        shipping_weight: 0,
                                                        total_packing_price: 0,
                                                        total_cgst: 0,
                                                        total_sgst: 0,
                                                        total_igst: 0,
                                                        final_price: 0,
                                                        gst: {},
                                                        shipping: {},
                                                        new_final_price: {},
                                                        customer_point: 0,
                                                        one_point_value: 0,
                                                        open_order_value: 0,
                                                        max_open_cod_order: 0,
                                                        cart_price : totalCartPrice,

                                                    });
                                                } else {
                                                    if (cutoff_response) {
                                                        var express_shipping = Number(cutoff_response.express_delivery_cost) * Number(totalWeight) + additional_cost;
                                                        var normal_shipping = Number(cutoff_response.normal_delivery_cost) * Number(totalWeight) + additional_cost;
                                                    } else {
                                                        var express_shipping = 0;
                                                        var normal_shipping = 0;
                                                    }

                                                    var where = {};
                                                    Settings.find(where).then((settings_response) => {
                                                        var where = {};
                                                        where["status"] = {
                                                            $nin: ["delivered", "pending_payment", "declined_vendor", "rejected_customer", "refunded", "failed", "cancel", "on_hold"],
                                                        };
                                                        where["deleted"] = 0;
                                                        where["user"] = req.query.id;
                                                        Checkout.find(where).then((open_order) => {
                                                            var total_open_order_amount = 0;
                                                            for (var i = 0; i < open_order.length; i++) {
                                                                total_open_order_amount = Number(total_open_order_amount) + Number(open_order[i].finalprice);
                                                            }

                                                            var where = {};
                                                            where["_id"] = req.body.userid;
                                                            Users.findOne(where).then((customer_response) => {
                                                                var one_point_value = settings_response[28].value;
                                                                var point = customer_response ? Number(customer_response.subscription.point) : 0;
                                                                var point_in_rupees = Number(point) * one_point_value;

                                                                var exp_date = customer_response.subscription.exp_date;

                                                                var where = {};
                                                                where["_id"] = customer_response.subscription.plan;
                                                                Plan.findOne(where).then((plan_response) => {
                                                                    var plan_discount = 0;
                                                                    if (plan_response && !moment(exp_date).isBefore(moment(), "day")) {
                                                                        plan_discount = (totalCartPrice * plan_response.discount) / 100;
                                                                    }

                                                                    if (couponType == "P") {
                                                                        var total_Discount = (Number(totalCartPrice) * Number(couponAmount)) / Number(100);
                                                                        var cd = 0;
                                                                        if (total_Discount > Number(couponMaximumDiscount) && Number(couponMaximumDiscount) != 0) {
                                                                            cd = Number(couponMaximumDiscount);
                                                                        } else {
                                                                            cd = total_Discount;
                                                                        }

                                                                        var totalCartPriceCoupon = Number(totalCartPrice) - Number(cd)


                                                                        var final_price = 0;
                                                                        var normal_ttl = Number(totalCartPriceCoupon) + (Number(normal_shipping) + Number(totalPackingPrice)) - Number(plan_discount);
                                                                        var express_ttl = Number(totalCartPriceCoupon) + (Number(express_shipping) + Number(totalPackingPrice)) - Number(plan_discount);

                                                                        var normal_ttl2 = normal_ttl - plan_discount - point_in_rupees;
                                                                        var express_ttl2 = express_ttl - plan_discount - point_in_rupees;

                                                                        if (customer_state.toString() == "5f665ee12d45902c98aa8f1f") {
                                                                            var normal_total_cgst = (normal_ttl * 2.5) / 100;
                                                                            var normal_total_sgst = (normal_ttl * 2.5) / 100;

                                                                            var normal_total_cgst2 = (normal_ttl2 * 2.5) / 100;
                                                                            var normal_total_sgst2 = (normal_ttl2 * 2.5) / 100;

                                                                            var express_total_cgst = (express_ttl * 2.5) / 100;
                                                                            var express_total_sgst = (express_ttl * 2.5) / 100;

                                                                            var express_total_cgst2 = (express_ttl2 * 2.5) / 100;
                                                                            var express_total_sgst2 = (express_ttl2 * 2.5) / 100;

                                                                            var new_final_price_express = totalCartPriceCoupon + totalPackingPrice + express_shipping + express_total_cgst + express_total_sgst;

                                                                            var new_final_price_express2 = totalCartPrice + totalPackingPrice + express_shipping + express_total_cgst2 + express_total_sgst2 - plan_discount - point_in_rupees;

                                                                            var new_final_price_normal = totalCartPriceCoupon + totalPackingPrice + normal_shipping + normal_total_sgst + normal_total_cgst;

                                                                            var new_final_price_normal2 = totalCartPrice + totalPackingPrice + normal_shipping + normal_total_sgst2 + normal_total_cgst2 - plan_discount - point_in_rupees;
                                                                        } else {
                                                                            var normal_total_igst = (Number(normal_ttl) * 5) / 100;
                                                                            var express_total_igst = (Number(express_ttl) * 5) / 100;

                                                                            var normal_total_igst2 = (Number(normal_ttl2) * 5) / 100;
                                                                            var express_total_igst2 = (Number(express_ttl2) * 5) / 100;

                                                                            var new_final_price_express = totalCartPriceCoupon + totalPackingPrice + express_shipping + express_total_igst;

                                                                            var new_final_price_normal = totalCartPriceCoupon + totalPackingPrice + normal_shipping + normal_total_igst;

                                                                            var new_final_price_express2 = totalCartPrice + totalPackingPrice + express_shipping + express_total_igst2 - plan_discount - point_in_rupees;

                                                                            var new_final_price_normal2 = totalCartPrice + totalPackingPrice + normal_shipping + normal_total_igst2 - plan_discount - point_in_rupees;
                                                                        }

                                                                        res.status(200).send({
                                                                            status: "success",
                                                                            message: "coupon applied",
                                                                            coupon_type: "percentage",
                                                                            coupon_discount: Number(cd).toFixed(2),
                                                                            cartprice: totalCartPrice.toFixed(2),
                                                                            shipping_weight: totalWeight ? totalWeight : 0,
                                                                            total_packing_price: totalPackingPrice ? totalPackingPrice.toFixed(2) : 0,
                                                                            total_cgst: totalCGST ? Number(totalCGST) : 0,
                                                                            total_sgst: totalSGST ? Number(totalSGST) : 0,
                                                                            total_igst: totalIGST ? Number(totalIGST) : 0,
                                                                            gst: {
                                                                                normal: {
                                                                                    total_cgst: normal_total_cgst ? normal_total_cgst.toFixed(2) : 0,
                                                                                    total_sgst: normal_total_sgst ? normal_total_sgst.toFixed(2) : 0,
                                                                                    total_igst: normal_total_igst ? normal_total_igst.toFixed(2) : 0,
                                                                                },
                                                                                express: {
                                                                                    total_cgst: express_total_cgst ? express_total_cgst.toFixed(2) : 0,
                                                                                    total_sgst: express_total_sgst ? express_total_sgst.toFixed(2) : 0,
                                                                                    total_igst: express_total_igst ? express_total_igst.toFixed(2) : 0,
                                                                                },
                                                                            },

                                                                            gst_with_point: {
                                                                                normal: {
                                                                                    total_cgst: normal_total_cgst2 ? normal_total_cgst2.toFixed(2) : 0,
                                                                                    total_sgst: normal_total_sgst2 ? normal_total_sgst2.toFixed(2) : 0,
                                                                                    total_igst: normal_total_igst2 ? normal_total_igst2.toFixed(2) : 0,
                                                                                },
                                                                                express: {
                                                                                    total_cgst: express_total_cgst2 ? express_total_cgst2.toFixed(2) : 0,
                                                                                    total_sgst: express_total_sgst2 ? express_total_sgst.toFixed(2) : 0,
                                                                                    total_igst: express_total_igst2 ? express_total_igst2.toFixed(2) : 0,
                                                                                },
                                                                            },

                                                                            final_price: newCartPrice ? newCartPrice : 0,
                                                                            shipping: {
                                                                                normal_shipping: normal_shipping.toFixed(2),
                                                                                express_shipping: express_shipping.toFixed(2),
                                                                            },
                                                                            new_final_price: {
                                                                                normal: new_final_price_normal.toFixed(2),
                                                                                express: new_final_price_express.toFixed(2),
                                                                                with_wallet: {
                                                                                    normal: new_final_price_normal2.toFixed(2),
                                                                                    express: new_final_price_express2.toFixed(2),
                                                                                },
                                                                            },
                                                                            plan_discount: plan_response ? (totalCartPrice * plan_response.discount) / 100 : 0,
                                                                            customer_point: customer_response.subscription.point,
                                                                            open_order_value: total_open_order_amount.toFixed(2),
                                                                            max_open_cod_order: settings_response[19].value,
                                                                        });
                                                                    } else {
                                                                        var totalCartPriceCoupon = Number(totalCartPrice) - Number(couponAmount);

                                                                        // var totalCartPriceCoupon =
                                                                        //     Number(totalCartPrice) -
                                                                        //     (Number(totalCartPrice) * Number(couponAmount)) / Number(100);

                                                                        var final_price = 0;
                                                                        var normal_ttl = Number(totalCartPriceCoupon) + (Number(normal_shipping) + Number(totalPackingPrice)) - Number(plan_discount);
                                                                        var express_ttl = Number(totalCartPriceCoupon) + (Number(express_shipping) + Number(totalPackingPrice)) - Number(plan_discount);

                                                                        var normal_ttl2 = normal_ttl - plan_discount - point_in_rupees;
                                                                        var express_ttl2 = express_ttl - plan_discount - point_in_rupees;

                                                                        if (customer_state.toString() == "5f665ee12d45902c98aa8f1f") {
                                                                            var normal_total_cgst = (normal_ttl * 2.5) / 100;
                                                                            var normal_total_sgst = (normal_ttl * 2.5) / 100;

                                                                            var normal_total_cgst2 = (normal_ttl2 * 2.5) / 100;
                                                                            var normal_total_sgst2 = (normal_ttl2 * 2.5) / 100;

                                                                            var express_total_cgst = (express_ttl * 2.5) / 100;
                                                                            var express_total_sgst = (express_ttl * 2.5) / 100;

                                                                            var express_total_cgst2 = (express_ttl2 * 2.5) / 100;
                                                                            var express_total_sgst2 = (express_ttl2 * 2.5) / 100;

                                                                            var new_final_price_express = totalCartPriceCoupon + totalPackingPrice + express_shipping + express_total_cgst + express_total_sgst;

                                                                            var new_final_price_express2 = totalCartPrice + totalPackingPrice + express_shipping + express_total_cgst2 + express_total_sgst2 - plan_discount - point_in_rupees;

                                                                            var new_final_price_normal = totalCartPriceCoupon + totalPackingPrice + normal_shipping + normal_total_sgst + normal_total_cgst;

                                                                            var new_final_price_normal2 = totalCartPrice + totalPackingPrice + normal_shipping + normal_total_sgst2 + normal_total_cgst2 - plan_discount - point_in_rupees;
                                                                        } else {
                                                                            var normal_total_igst = (Number(normal_ttl) * 5) / 100;
                                                                            var express_total_igst = (Number(express_ttl) * 5) / 100;

                                                                            var normal_total_igst2 = (Number(normal_ttl2) * 5) / 100;
                                                                            var express_total_igst2 = (Number(express_ttl2) * 5) / 100;

                                                                            var new_final_price_express = totalCartPriceCoupon + totalPackingPrice + express_shipping + express_total_igst;

                                                                            var new_final_price_normal = totalCartPriceCoupon + totalPackingPrice + normal_shipping + normal_total_igst;

                                                                            var new_final_price_express2 = totalCartPrice + totalPackingPrice + express_shipping + express_total_igst2 - plan_discount - point_in_rupees;

                                                                            var new_final_price_normal2 = totalCartPrice + totalPackingPrice + normal_shipping + normal_total_igst2 - plan_discount - point_in_rupees;
                                                                        }

                                                                        var newCartPrice = 0;
                                                                        res.status(200).send({
                                                                            status: "success",
                                                                            message: "coupon applied",
                                                                            coupon_discount: Number(couponAmount),
                                                                            coupon_type: "fixed",
                                                                            cartprice: totalCartPrice.toFixed(2),
                                                                            shipping_weight: totalWeight ? totalWeight : 0,
                                                                            total_packing_price: totalPackingPrice ? totalPackingPrice.toFixed(2) : 0,
                                                                            total_cgst: totalCGST ? Number(totalCGST) : 0,
                                                                            total_sgst: totalSGST ? Number(totalSGST) : 0,
                                                                            total_igst: totalIGST ? Number(totalIGST) : 0,
                                                                            gst: {
                                                                                normal: {
                                                                                    total_cgst: normal_total_cgst ? normal_total_cgst.toFixed(2) : 0,
                                                                                    total_sgst: normal_total_sgst ? normal_total_sgst.toFixed(2) : 0,
                                                                                    total_igst: normal_total_igst ? normal_total_igst.toFixed(2) : 0,
                                                                                },
                                                                                express: {
                                                                                    total_cgst: express_total_cgst ? express_total_cgst.toFixed(2) : 0,
                                                                                    total_sgst: express_total_sgst ? express_total_sgst.toFixed(2) : 0,
                                                                                    total_igst: express_total_igst ? express_total_igst.toFixed(2) : 0,
                                                                                },
                                                                            },
                                                                            final_price: newCartPrice ? newCartPrice.toFixed(2) : 0,
                                                                            shipping: {
                                                                                normal_shipping: normal_shipping.toFixed(2),
                                                                                express_shipping: express_shipping.toFixed(2),
                                                                            },
                                                                            new_final_price: {
                                                                                normal: new_final_price_normal.toFixed(2),
                                                                                express: new_final_price_express.toFixed(2),
                                                                                with_wallet: {
                                                                                    normal: new_final_price_normal2.toFixed(2),
                                                                                    express: new_final_price_express2.toFixed(2),
                                                                                },
                                                                            },
                                                                            plan_discount: plan_response ? (totalCartPrice * plan_response.discount) / 100 : 0,
                                                                            customer_point: customer_response.subscription.point,
                                                                            one_point_value: one_point_value,
                                                                            open_order_value: total_open_order_amount.toFixed(2),
                                                                            max_open_cod_order: settings_response[19].value,
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    });
                                                }
                                            }
                                        } else {
                                            res.status(200).send({
                                                status: "error",
                                                message: "Inavlid coupon.",
                                                coupon_discount: 0,
                                                coupon_type: "",
                                                cartprice: 0,
                                                shipping_weight: 0,
                                                total_packing_price: 0,
                                                total_cgst: 0,
                                                total_sgst: 0,
                                                total_igst: 0,
                                                final_price: 0,
                                                gst: {},
                                                shipping: {},
                                                new_final_price: {},
                                                customer_point: 0,
                                                one_point_value: 0,
                                                open_order_value: 0,
                                                max_open_cod_order: 0,
                                            });
                                        }
                                    });
                                });
                            });
                    });
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: "something went wrong",
                    coupon_discount: 0,
                    coupon_type: "",
                    cartprice: 0,
                    shipping_weight: 0,
                    total_packing_price: 0,
                    total_cgst: 0,
                    total_sgst: 0,
                    total_igst: 0,
                    final_price: 0,
                    one_point_value: 0,
                    open_order_value: 0,
                    max_open_cod_order: 0,
                });
            });
    },
    checkout: function (req, res) {
        //var cartId = req.body.cartid.split(',')
        var userId = req.body.userid;
        //var cartPrice = req.body.cartprice
        var where = {};
        where["_id"] = userId;

        Users.findOne(where).then((user_response) => {
            if (user_response?.login_active == 0) {
                res.status(200).send({
                    status: "error",
                    message: "Your account is deactivated by admin",
                    result: [],
                });
                return;
            }

            var coupon = req.body.coupon;
            var d = new Date();
            var n = d.getFullYear();
            var m = d.getMonth();
            var d = d.getDay();
            var orderId = "T2P-" + Math.floor(Date.now() / 1000);

            var where = {};
            where["user"] = userId;
            where["status"] = "delivered";
            where["gateway"] = "COD";
            Checkout.find(where).then((checkout_response) => {
                if (checkout_response) {
                    var where = {};
                    where["user"] = userId;
                    Cart.find(where)
                        .populate("vendor")
                        .populate({
                            path: "product",
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
                                    select: "name active",
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
                                {
                                    path: "shipping",
                                    model: "shipping_classes",
                                    select: "price",
                                },
                            ],
                        })
                        .then((response1) => {
                            var vendor_city = response1[0].vendor.city;
                            var where = {};
                            where["_id"] = vendor_city;
                            City.findOne(where).then((vendor_state_response) => {
                                var vendor_state = vendor_state_response.state;
                                var where = {};
                                where["start_city"] = vendor_city;
                                where["end_city"] = req.body.customer_city;

                                CutOffTime.findOne(where, null, {}).then((cutoff_response) => {
                                    var where = {};
                                    where["_id"] = req.body.customer_city;
                                    City.findOne(where).then((customer_state_response) => {
                                        if (customer_state_response.ps != "product" && customer_state_response.active == 0) {
                                            res.status(200).send({
                                                status: "error",
                                                message: "Delivery is unavailable in this city",
                                                orderId: "",
                                            });
                                            return false;
                                        }
                                        var extra_delivery_charges = customer_state_response?.extra_delivery_charges ? customer_state_response?.extra_delivery_charges : 1;

                                        var where = {};
                                        where["name"] = req.body.customer_zip;
                                        where["active"] = 1;
                                        ZipModel.findOne(where).then((zip_response) => {
                                            if (!zip_response) {
                                                res.status(200).send({
                                                    status: "error",
                                                    message: "Pincode is disabled",
                                                });
                                                return false;
                                            }
                                            // var additional_cost = Number(zip_response ? zip_response.additional_cost : 0);
                                            var additional_cost = 0;
                                            var express_cod = zip_response.express_cod;
                                            if (express_cod && req.body.express == "Y") {
                                                res.status(200).send({
                                                    status: "error",
                                                    message: "COD of express delivery is not available in provided pin code",
                                                });
                                                return false;
                                            }
                                            var customer_state = customer_state_response.state;
                                            var totalCartPrice = 0;
                                            var totalWeight = 0;
                                            var total_weight = 0;
                                            var totalPackingPrice = 0;
                                            var totalCGST = 0;
                                            var totalIGST = 0;
                                            var totalSGST = 0;
                                            var holiday_count = 0;
                                            var totalHotFoodCost = 0;

                                            var ids = [];

                                            for (var i = 0; i < response1.length; i++) {
                                                var hot_food_delivery_cost = 0;

                                                if (Number(response1[i].quantity) < 0) {
                                                    res.status(200).send({
                                                        status: "error",
                                                        message: response1[i].product.productname + " Product quantity needs to be 1 or greater than 1.",
                                                    });
                                                    return false;
                                                }
                                                var product_brand_active = response1[i].product.brand.active;
                                                if (product_brand_active == 0) {
                                                    res.status(200).send({
                                                        status: "error",
                                                        message: response1[i].product.brand.name + " Product is unavalibale now.",
                                                    });
                                                    return false;
                                                }

                                                if (response1[i].product && response1[i].product.weight != "" && response1[i].product.weight) {
                                                    var total_weight = response1[i].product.weight * Number(response1[i].quantity);
                                                }

                                                if (response1[i].product.packaging_charge != "" && response1[i].product.packaging_charge) {
                                                    var total_packg_charge = response1[i].product.packaging_charge * Number(response1[i].quantity);
                                                }
                                                if (response1[i].product.hot_food_delivery_charges != "" && response1[i].product.hot_food_delivery_charges) {
                                                    hot_food_delivery_cost = Number(response1[i]?.product?.hot_food_delivery_charges) * Number(response1[i]?.quantity);
                                                }

                                                if (customer_state.toString() == "5f665ee12d45902c98aa8f1f") {
                                                    if (response1[i].product.cgst != "" && response1[i].product.cgst) {
                                                        var total_cgst = ((Number(totalCartPrice) + Number(response1[i].price) * Number(response1[i].quantity)) * Number(response1[i].product.cgst)) / 100;
                                                    }
                                                    if (response1[i].product.sgst != "" && response1[i].product.sgst) {
                                                        var total_sgst = ((Number(totalCartPrice) + Number(response1[i].price) * Number(response1[i].quantity)) * Number(response1[i].product.sgst)) / 100;
                                                    }
                                                    var total_igst = 0;
                                                }
                                                if (customer_state.toString() != "5f665ee12d45902c98aa8f1f") {
                                                    if (response1[i].product.igst != "" && response1[i].product.igst) {
                                                        var total_igst = ((Number(totalCartPrice) + Number(response1[i].price) * Number(response1[i].quantity)) * Number(response1[i].product.igst)) / 100;
                                                    }
                                                    var total_cgst = 0;
                                                    var total_sgst = 0;
                                                }

                                                totalCartPrice = Number(totalCartPrice) + Number(response1[i].price);
                                                totalWeight = Number(totalWeight) + Number(total_weight);
                                                totalPackingPrice = Number(totalPackingPrice) + Number(total_packg_charge);
                                                totalCGST = Number(totalCGST) + Number(total_cgst);
                                                totalSGST = Number(totalSGST) + Number(total_sgst);
                                                totalIGST = Number(totalIGST) + Number(total_igst);
                                                if (hot_food_delivery_cost && req.body?.hot_food_selected == 1 && response1[i].product.hot_food_available == 1) {
                                                    totalHotFoodCost += hot_food_delivery_cost;
                                                }

                                                var product_brand = response1[i].product.brand._id;
                                                ids.push(mongoose.Types.ObjectId(product_brand));
                                            }

                                            //var final_price = (totalCartPrice+totalWeight+totalPackingPrice+totalCGST+totalSGST+totalIGST);

                                            var where = {};
                                            Settings.find(where)
                                                .sort({ _id: 1 })
                                                .then((settings_response) => {
                                                    var where = {};
                                                    where["_id"] = req.body.userid;
                                                    var delivery_free_distance = settings_response[53]?.value;

                                                    Users.findOne(where).then((customer_response) => {
                                                        // var minimum_order_value = settings_response[25]?.value;
                                                        var minimum_order_value = vendor_state_response.minimum_order_value;
                                                        var one_point_value = settings_response[28]?.value;
                                                        var point = customer_response ? Number(settings_response[31]?.value) : 0;
                                                        var point_in_rupees = Number(point) * one_point_value;

                                                        var express_shipping = Number(cutoff_response.express_delivery_cost) * Number(totalWeight) + additional_cost;
                                                        var normal_shipping = Number(cutoff_response.normal_delivery_cost) * Number(totalWeight) + additional_cost;

                                                        var final_price = 0;
                                                        var normal_ttl = Number(totalCartPrice) + (Number(normal_shipping) + Number(totalPackingPrice));
                                                        var express_ttl = Number(totalCartPrice) + (Number(express_shipping) + Number(totalPackingPrice));

                                                        var where = {};
                                                        where["_id"] = customer_response ? customer_response.subscription.plan : null;
                                                        Plan.findOne(where).then((plan_response) => {
                                                            var plan_discount = 0;
                                                            if (plan_response && !moment(exp_date).isBefore(moment(), "day")) {
                                                                plan_discount = (totalCartPrice * plan_response.discount) / 100;
                                                            }

                                                            var normal_ttl2 = normal_ttl - plan_discount - point_in_rupees;
                                                            var express_ttl2 = express_ttl - plan_discount - point_in_rupees;

                                                            if (customer_state.toString() == "5f665ee12d45902c98aa8f1f") {
                                                                var normal_total_cgst = (normal_ttl * 2.5) / 100;
                                                                var normal_total_sgst = (normal_ttl * 2.5) / 100;

                                                                var normal_total_cgst2 = (normal_ttl2 * 2.5) / 100;
                                                                var normal_total_sgst2 = (normal_ttl2 * 2.5) / 100;

                                                                var normal_total_igst = 0;
                                                                var express_total_igst = 0;

                                                                var express_total_cgst = (express_ttl * 2.5) / 100;
                                                                var express_total_sgst = (express_ttl * 2.5) / 100;

                                                                var express_total_cgst2 = (express_ttl2 * 2.5) / 100;
                                                                var express_total_sgst2 = (express_ttl2 * 2.5) / 100;
                                                            } else {
                                                                var normal_total_igst = (Number(normal_ttl) * 5) / 100;
                                                                var express_total_igst = (Number(express_ttl) * 5) / 100;

                                                                var normal_total_igst2 = (Number(normal_ttl2) * 5) / 100;
                                                                var express_total_igst2 = (Number(express_ttl2) * 5) / 100;

                                                                var normal_total_cgst = 0;
                                                                var normal_total_sgst = 0;
                                                            }

                                                            if (req.body.express == "Y") {
                                                                var shipping = express_shipping;
                                                                var totalCGST = req.body.wallet_discount != "" ? express_total_cgst : express_total_cgst2;
                                                                var totalSGST = req.body.wallet_discount != "" ? express_total_sgst : express_total_sgst2;
                                                                var totalIGST = req.body.wallet_discount != "" ? express_total_igst : express_total_igst2;
                                                                var finalprice = Number(totalCartPrice + totalPackingPrice + express_shipping + (totalSGST ? totalSGST : 0) + (totalCGST ? totalCGST : 0) + (totalIGST ? totalIGST : 0)) + (Number(req.body.tip_price) ? Number(req.body.tip_price) : 0);
                                                            } else {
                                                                var shipping = normal_shipping;
                                                                var totalCGST = req.body.wallet_discount != "" ? normal_total_cgst : normal_total_cgst2;
                                                                var totalSGST = req.body.wallet_discount != "" ? normal_total_sgst : normal_total_sgst2;
                                                                var totalIGST = req.body.wallet_discount != "" ? normal_total_igst : normal_total_igst2;
                                                                var finalprice = Number(totalCartPrice + totalPackingPrice + normal_shipping + (totalSGST ? totalSGST : 0) + (totalCGST ? totalCGST : 0) + (totalIGST ? totalIGST : 0)) + (Number(req.body.tip_price) ? Number(req.body.tip_price) : 0);
                                                            }

                                                            if (req.body.coupon && req.body.coupon != "") {
                                                                var totalIGST = 0;
                                                                var totalCGST = 0;
                                                                var totalSGST = 0;

                                                                var virtual_total = Number(totalCartPrice) + Number(shipping) + Number(totalPackingPrice) - Number(req.body.couponamount);

                                                                if (customer_state.toString() == "5f665ee12d45902c98aa8f1f") {
                                                                    totalCGST = (Number(virtual_total) * 2.5) / 100;
                                                                    totalSGST = (Number(virtual_total) * 2.5) / 100;
                                                                } else {
                                                                    totalIGST = (Number(virtual_total) * 5) / 100;
                                                                }

                                                                finalprice = Number(virtual_total + totalCGST + totalSGST + totalIGST) + (Number(req.body.tip_price) ? Number(req.body.tip_price) : 0);
                                                            }
                                                            // console.log(finalprice);
                                                            // res.status(200).send({
                                                            //     status: "error",
                                                            //     message: "--",
                                                            //     orderId: "",
                                                            // });
                                                            // return false;

                                                            var where = {};
                                                            where["brand"] = { $in: ids };
                                                            const today = new Date(req.body.delivery_date);

                                                            var start = moment(moment(today)).format("YYYY-MM-DD");
                                                            var end = moment(moment(today)).add(1, "days").format("YYYY-MM-DD");

                                                            // where["date"] = {
                                                            //     $gte: moment(today, "YYYY-MM-DD").subtract(1, "days").toDate(),
                                                            //     $lt: moment(today, "YYYY-MM-DD").add(1, "days").toDate(),
                                                            // };

                                                            where["date"] = {
                                                                $gte: new Date(start),
                                                                $lt: new Date(end),
                                                            };

                                                            BrandHoliday.findOne(where)
                                                                .populate("brand", "name")
                                                                .then((brand_holiday_response) => {
                                                                    BrandHoliday.find(where).countDocuments(function (err, count) {
                                                                        holiday_count = holiday_count + count;
                                                                        if (Number(count) > 0) {
                                                                            res.status(200).send({
                                                                                status: "error",
                                                                                message: "Delivery is unavailable of " + brand_holiday_response.brand.name + " due to " + brand_holiday_response.reason,
                                                                            });
                                                                            return false;
                                                                        } else {
                                                                            if (Number(finalprice) < Number(minimum_order_value)) {
                                                                                res.status(200).send({
                                                                                    status: "error",
                                                                                    message: "Minimum order value should be Rs." + minimum_order_value,
                                                                                    orderId: "",
                                                                                    //token: req.token,
                                                                                });
                                                                                return;
                                                                            }
                                                                            var wallet_discount = 0;
                                                                            if (req.body.wallet_discount == "true") {
                                                                                wallet_discount = point;
                                                                            }

                                                                            // res.status(200).send({
                                                                            //     status: "error",
                                                                            //     message: finalprice.toFixed(2),
                                                                            //     orderId: "",
                                                                            // });
                                                                            // return false;
                                                                            var where1 = {};
                                                                            where1["user"] = req.body.userid;
                                                                            where1["status"] = "delivered";
                                                                            var total_distance = 0;
                                                                            Office.find({ city: req.body.customer_city })
                                                                                .then(office_response => {
                                                                                    var lat1 = office_response[0]?.position.coordinates[0] ? office_response[0]?.position.coordinates[0] : 0;
                                                                                    var lon1 = office_response[0]?.position.coordinates[1] ? office_response[0]?.position.coordinates[1] : 0;
                                                                                    Address.findOne({ _id: req.body.address }).then((address_response) => {
                                                                                        var lat2 = address_response?.position?.coordinates[0] ? address_response?.position?.coordinates[0] : 0;
                                                                                        var lon2 = address_response?.position?.coordinates[1] ? address_response?.position?.coordinates[1] : 0;

                                                                                        total_distance = latLonDistanceCalculate(lat1, lon1, lat2, lon2);
                                                                                        var last_mile_long_distance_extra_charge = 0;
                                                                                        if (total_distance > delivery_free_distance) {
                                                                                            last_mile_long_distance_extra_charge = (total_distance - delivery_free_distance) * Number(extra_delivery_charges);
                                                                                        }
                                                                                        var otp = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
                                                                                        var che = Checkout.findOne({ otp: otp });
                                                                                        if (che.otp === null) {
                                                                                            otp = otp
                                                                                        } else if (che.otp != null) {
                                                                                            otp = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
                                                                                        }

                                                                                        Checkout.find(where1).countDocuments(function (err, orcount) {
                                                                                            var checkoutData = new Checkout({
                                                                                                user: userId,
                                                                                                address: req.body.address,
                                                                                                timeslot: req.body.timeslot,
                                                                                                orderid: orderId,
                                                                                                products: response1,
                                                                                                coupon: req.body.coupon,
                                                                                                coupontype: req.body.coupontype,
                                                                                                couponamount: req.body.couponamount,
                                                                                                price: totalCartPrice.toFixed(2),
                                                                                                // finalprice: finalprice.toFixed(2),
                                                                                                finalprice: Math.round(Number(finalprice) + last_mile_long_distance_extra_charge + totalHotFoodCost),
                                                                                                additional_cost: req.body.additional_cost,
                                                                                                express: req.body.express,
                                                                                                totalShippingPrice: shipping.toFixed(2),
                                                                                                totalPackingPrice: totalPackingPrice.toFixed(2),
                                                                                                totalCGST: totalCGST ? totalCGST.toFixed(2) : 0,
                                                                                                totalSGST: totalSGST ? totalSGST.toFixed(2) : 0,
                                                                                                totalIGST: totalIGST ? totalIGST.toFixed(2) : 0,
                                                                                                delivery_date: req.body.delivery_date,
                                                                                                total_weight: total_weight ? total_weight : 0,
                                                                                                order_city: req.body.customer_city,
                                                                                                vendor_city: vendor_city,
                                                                                                wallet_discount: wallet_discount,
                                                                                                browser: req.body.browser ? req.body.browser : "",
                                                                                                tip_price: req.body.tip_price,
                                                                                                order_count: Number(orcount ? orcount : 0) + 1,
                                                                                                last_mile_long_distance_extra_charge: last_mile_long_distance_extra_charge ? last_mile_long_distance_extra_charge.toFixed(2) : 0,
                                                                                                last_mile_long_distance: total_distance ? total_distance.toFixed(2) : 0,
                                                                                                last_mile_long_distance_multiplier: extra_delivery_charges,
                                                                                                last_mile_free_long_distance: delivery_free_distance,
                                                                                                hot_food_total_cost: totalHotFoodCost,
                                                                                                hot_food_selected: req.body?.hot_food_selected ? req.body?.hot_food_selected : 0,
                                                                                                otp: otp
                                                                                            });
                                                                                            // console.log(orcount, "ORDER COUNT");
                                                                                            checkoutData
                                                                                                .save()
                                                                                                .then((response) => {
                                                                                                    res.status(200).send({
                                                                                                        status: "success",
                                                                                                        message: "checkout success",
                                                                                                        orderId: orderId,
                                                                                                    });
                                                                                                })
                                                                                                .catch((error) => {
                                                                                                    res.status(200).send({
                                                                                                        status: "error",
                                                                                                        message: error,
                                                                                                        orderId: "",
                                                                                                        //token: req.token,
                                                                                                    });
                                                                                                });
                                                                                        });
                                                                                    });
                                                                                });

                                                                        }
                                                                    });
                                                                });
                                                        });
                                                    });
                                                });
                                        });
                                    });
                                });
                            });
                        });
                } else {
                    res.status(200).send({
                        status: "error",
                        message: "One COD order is pending delivery. Please let it deliver. ",
                        result: [],
                    });
                    return;
                }
            });
        });
    },
    checkout_confirm: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["orderid"] = req.body.orderid;
            Checkout.findOne(where)
                .populate("products.product", "vendor point point_exp_date")
                .populate("address", "pincode city")
                .populate("user", "mobile full_name")
                .populate("vendor", "city")
                .then((response) => {
                    let wallet_discount = response.wallet_discount;
                    let orderid = response.orderid;
                    if (req.body.gateway != "COD") {
                        let where = {};
                        Settings.find(where)
                            .sort({
                                order: +1,
                            })
                            .then((settings_response) => {
                                let point = 0;
                                for (let i = 0; i < response.products.length; i++) {
                                    if (!moment(response.products[i].point_exp_date).isBefore(moment(), "day") && response.products[i].point) {
                                        point = Number(response.products[i].point) + point;
                                    }
                                }

                                let point1 = settings_response[35].value;
                                let point2 = settings_response[36].value;
                                let earning1 = settings_response[37].value;

                                let point3 = settings_response[38].value;
                                let point4 = settings_response[39].value;
                                let earning2 = settings_response[40].value;

                                let point5 = settings_response[41].value;
                                let point6 = settings_response[42].value;
                                let earning3 = settings_response[43].value;

                                let point7 = settings_response[45].value;
                                let point8 = settings_response[46].value;
                                let earning4 = settings_response[47].value;

                                if (Number(response.finalprice) >= Number(point1) || Number(response.finalprice) >= Number(point2)) {
                                    point = point + Number(earning1);
                                }

                                if (Number(response.finalprice) >= Number(point3) || Number(response.finalprice) >= Number(point4)) {
                                    point = point + Number(earning2);
                                }

                                if (Number(response.finalprice) >= Number(point5) || Number(response.finalprice) >= Number(point6)) {
                                    point = point + Number(earning3);
                                }

                                if (Number(response.finalprice) >= Number(point7) || Number(response.finalprice) >= Number(point8)) {
                                    point = point + Number(earning4);
                                }

                                let where = {};
                                where["_id"] = response.user;
                                Users.findOne(where).then((customer_response) => {
                                    let cistomer_point = customer_response.subscription.point;

                                    let where = {};
                                    where["_id"] = response.user;
                                    Users.findOneAndUpdate(
                                        where,
                                        {
                                            subscription: {
                                                point: point + Number(cistomer_point),
                                            },
                                        },
                                        {
                                            new: true,
                                        }
                                    ).exec();

                                    if (wallet_discount == "0") {
                                        let Walletdata = new Wallet({
                                            user: customer_response._id,
                                            point: point,
                                            type: 1,
                                            note: "For order#" + orderid,
                                        });
                                        Walletdata.save(function () { });
                                    } else {
                                        let Walletdata = new Wallet({
                                            user: customer_response._id,
                                            point: wallet_discount,
                                            type: 0,
                                            note: "For order#" + orderid,
                                        });
                                        Walletdata.save(function () { });
                                        let msg = "Dear customer, We have deducted " + wallet_discount + " wallet point from your account. Regards, Tastes2plate";
                                        gen_custom_sms(customer_response.mobile, msg);

                                        axios
                                            .get("https://omst5afyma.execute-api.ap-south-1.amazonaws.com/production/admin/send_email_template?email=" + customer_response.email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "customer",
                                            wallet_discount
                                        ];
                                        SendWATI("wallet_out", parameters, customer_response.mobile);
                                    }
                                });
                            });
                    }

                    let vendor = response.products[0].vendor;
                    let pincode = response.address.pincode;
                    let customer_mobile = response?.user?.mobile;
                    let timeslot = response.timeslot;
                    let delivery_date = response.delivery_date;
                    let total_weight = response.total_weight;
                    let city = response.address.city;
                    let customer_id = response.user._id;
                    let final_price = response.finalprice;
                    let id = response._id;
                    let where = {};
                    where["_id"] = vendor;


                    Users.findOne(where).then((response) => {
                        let where = {};
                        where["_id"] = customer_id;
                        Users.findOne(where).then((customer_response) => {
                            if (customer_response.cod == 0 && req.body.gateway == "COD") {
                                res.status(200).send({
                                    status: "error",
                                    message: "COD order is disabled by admin",
                                    result: [],
                                });
                                return;
                            }

                            let vendor_communication_zipcode = response.communication_zipcode;
                            let vendor_position = response.vendor_position;

                            let where = {};
                            where["service_zipcode"] = {
                                $regex: vendor_communication_zipcode,
                            };
                            where["user_type"] = "delivery_partner";
                            where["deleted"] = 0;
                            Users.findOne(where).then((response) => {
                                let pickup_partner = response ? response._id : null;
                                let price_per_kg = response ? (response.price_per_kg == "" ? 0 : response.price_per_kg) : 0;
                                let pickup_commission = Number(total_weight) * Number(price_per_kg);
                                // console.log(where,pickup_partner, response,'PICK UP PARTNER')

                                let where = {};
                                where["service_zipcode"] = {
                                    $regex: vendor_communication_zipcode,
                                };
                                where["user_type"] = "cargo_partner";
                                where["deleted"] = 0;
                                Users.findOne(where).then((response) => {
                                    let cargo_partner = response ? response._id : null;
                                    let price_per_kg = response ? (response.price_per_kg == "" ? 0 : response.price_per_kg) : 0;
                                    let cargo_commission = Number(total_weight) * Number(price_per_kg);

                                    let cargo_position = response ? response.cargo_position : {};
                                    let where = {};
                                    where["service_zipcode"] = {
                                        $regex: pincode,
                                    };
                                    where["user_type"] = "delivery_partner";
                                    where["deleted"] = 0;
                                    Users.findOne(where).then((response) => {
                                        let delivery_partner = response ? response._id : null;
                                        let price_per_kg = response ? (response.price_per_kg == "" ? 0 : response.price_per_kg) : 0;
                                        let delivery_commission = Number(total_weight) * Number(price_per_kg);

                                        let delivery_partner_position = response ? response.delivery_partner_position : {};
                                        let where = {};
                                        where["orderid"] = req.body.orderid;
                                        Checkout.findOneAndUpdate(
                                            where,
                                            {
                                                status: "waiting_vendor_approval",
                                                gateway: req.body.gateway,
                                                transactionid: req.body.transactionid,
                                                vendor: vendor,
                                                pickup_partner: pickup_partner,
                                                cargo_partner: cargo_partner,
                                                delivery_partner: delivery_partner,
                                                vendor_position: vendor_position,
                                                cargo_position: cargo_position,
                                                delivery_partner_position: delivery_partner_position,

                                                pickup_partner_commission: pickup_commission,
                                                cargo_partner_commission: cargo_commission,
                                                delivery_partner_commission: delivery_commission,
                                            },
                                            {
                                                new: true,
                                            }
                                        )
                                            .exec()
                                            .then((response) => {
                                                if (req.body.gateway === "COD") {
                                                    let CodPaymentData = new CodPayment({
                                                        city: city,
                                                        amount: final_price,
                                                        added_by: delivery_partner,
                                                        number: req.body.orderid,
                                                        order_id: id,
                                                    });
                                                    CodPaymentData.save(function (err, response) {
                                                        if (err) {
                                                            res.status(200).send({
                                                                status: "error",
                                                                message: err,
                                                                token: req.token,
                                                            });
                                                            console.log(err, "ERROR")
                                                        } else {
                                                            console.log(response, "Respon");
                                                        }
                                                    });
                                                }

                                                Cart.deleteMany(
                                                    {
                                                        user: response.user._id,
                                                    },
                                                    function () {
                                                        res.status(200).send({
                                                            status: "success",
                                                            message: "order confirmed",
                                                            result: response,
                                                        });

                                                        axios.get("https://omst5afyma.execute-api.ap-south-1.amazonaws.com/production/admin/send_order_invoice?id=" + response._id).then(function () { });

                                                        let parameters = [
                                                            req.body.orderid,
                                                            moment(moment(delivery_date)).format("YYYY-MM-DD"),
                                                            timeslot
                                                        ];
                                                        SendWATI("order_confirmation_em", parameters, customer_mobile);

                                                        let msg = "Thanks for choosing T2P, your order no " + req.body.orderid + " will be delivered on " + moment(moment(delivery_date)).format("YYYY-MM-DD") + " in " + timeslot + ". Regards, TASTES2PLATE ";
                                                        //let msg = "Dear " + full_name + ", thanks for choosing TASTES2PLATE. Your order no " + req.body.orderid + " is processed successfully and will be delivered on " + moment(moment(delivery_date, 'YYYY-MM-DD')).format('YYYY-MM-DD') + " in " + timeslot + ". Regards, T2P CUSTOMER CARE TEAM";
                                                        gen_custom_sms(customer_mobile, msg);

                                                        let OrderNoteData = new OrderNote({
                                                            note: msg,
                                                            order: req.body.orderid,
                                                        });

                                                        OrderNoteData.save(function () { });

                                                        //Assign LP Head
                                                        let where = {};
                                                        where["multiple_city"] = { $in: [city] };
                                                        where["user_type"] = "lp_head";
                                                        where["deleted"] = 0;
                                                        Users.findOne(where).then((lp_head_response) => {
                                                            if (lp_head_response) {
                                                                let lp_head = lp_head_response._id;
                                                                let where = {};
                                                                where["orderid"] = req.body.orderid;
                                                                Checkout.findOneAndUpdate(
                                                                    where,
                                                                    {
                                                                        lp_head: lp_head,
                                                                    },
                                                                    {
                                                                        new: true,
                                                                    }
                                                                )
                                                                    .exec()
                                                                    .then(() => { });
                                                            }
                                                        });

                                                        //Assign LP Manager
                                                         where = {};
                                                        where["multiple_city"] = { $in: [city] };
                                                        where["user_type"] = "lp_manager";
                                                        where["service_zipcode"] = {
                                                            $regex: pincode,
                                                        };
                                                        where["deleted"] = 0;
                                                        Users.findOne(where).then((lp_manager_response) => {
                                                            if (lp_manager_response) {
                                                                let lp_manager = lp_manager_response._id;
                                                                let where = {};
                                                                where["orderid"] = req.body.orderid;
                                                                Checkout.findOneAndUpdate(
                                                                    where,
                                                                    {
                                                                        lp_manager: lp_manager,
                                                                    },
                                                                    {
                                                                        new: true,
                                                                    }
                                                                )
                                                                    .exec()
                                                                    .then(() => { });
                                                            }
                                                        });
                                                    }
                                                );
                                            })
                                            .catch((error) => {
                                                res.status(200).send({
                                                    status: "error",
                                                    message: error,
                                                    result: [],
                                                });
                                            });
                                    });
                                });
                            });
                        });
                    });
                });
        }
    },
    logistic_login: function (req, res) {
        let where = {};
        where["mobile"] = req.body.mobile;
        where["deleted"] = 0;
        Users.findOne({
            mobile: req.body.mobile,
            deleted: 0,
            // $or: [{
            // 	user_type: {
            // 		$ne: "lp_head"
            // 	}
            // }],
            // $or: [{
            // 	user_type: {
            // 		$ne: "lp_manager"
            // 	}
            // }],
            $or: [
                {
                    user_type: {
                        $ne: "admin",
                    },
                },
            ],
        })
            .then((response) => {
                if (response) {
                    gen_otp(
                        req.body.mobile,
                        res,
                        (successResponse) => {
                            res.status(200).send({
                                status: "success",
                                OTP: successResponse,
                                message: "OTP has been sent to mobile number.",
                            });
                        },
                        (errorResponse) => {
                            res.status(200).send({
                                status: "error",
                                message: errorResponse,
                                OTP: 0,
                            });
                        }
                    );
                } else {
                    res.status(200).send({
                        status: "error",
                        message: "mobile number not registered",
                    });
                }
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Invalid mobile",
                });
            });
    },
    verify_logistic_otp: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["mobile"] = req.body.mobile;
            where["otp"] = req.body.otp;
            where["deleted"] = 0;
            Users.findOne(where)
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    if (response) {

                        Office.findOne({ city: response?.customer_support_city[0] }).then((office_response) => {
                            res.status(200).send({
                                status: "success",
                                result: response,
                                office_data: office_response,
                                message: "Otp verified",
                            });
                        })

                    } else {
                        res.status(200).send({
                            status: "error",
                            result: [],
                            message: "Invalid OTP",
                        });
                    }
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },
    add_logistics_boy: function (req, res) {
        let where = {};
        where["deleted"] = 0;
        where["mobile"] = req.body.mobile;
        Users.findOne(where)
            .then((response) => {
                if (response != null) {
                    res.status(200).send({
                        status: "error",
                        message: "Mobile already in use.",
                    });
                } else {
                    let where = {};
                    where["deleted"] = 0;
                    where["_id"] = req.body.master;
                    Users.findOne(where)
                        .then((response) => {
                            if (response) {
                                let userdata = new Users({
                                    user_type: req.body.user_type,
                                    master: req.body.master,
                                    full_name: req.body.full_name,
                                    mobile: req.body.mobile,
                                    email: req.body.email,
                                    active: 1,
                                });
                                userdata.save(function (err, response) {
                                    if (err) {
                                        res.status(200).send({
                                            status: "error",
                                            message: err,
                                            data: [],
                                        });
                                    } else {
                                        res.status(200).send({
                                            status: "success",
                                            message: "Account has been created successfully.",
                                            data: response,
                                        });
                                    }
                                });
                            } else {
                                res.status(200).send({
                                    status: "error",
                                    message: "Pickup partner not found.",
                                    data: response,
                                });
                            }
                        })
                        .catch(() => {
                            res.status(200).send({
                                status: "error",
                                message: "Invalid mobile/password",
                                data: [],
                            });
                        });
                }
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Invalid mobile/password",
                    data: [],
                });
            });
    },
    list_logistics_boy: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            if (req.body.name && req.body.name != "") {
                where["full_name"] = {
                    $regex: ".*" + req.body.name,
                    $options: "i",
                };
            }

            if (req.body.mobile && req.body.mobile != "") {
                where["mobile"] = {
                    $regex: ".*" + req.body.mobile,
                    $options: "i",
                };
            }

            where["deleted"] = 0;
            where["user_type"] = req.body.user_type;

            if (req.body.master && req.body.master != "") {
                where["master"] = req.body.master;
            }

            Users.find(where, null, {})
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    res.status(200).send({
                        status: "success",
                        result: response,
                        message: "",
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },
    delete_logistic_boy: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Users.findOneAndUpdate(
                where,
                {
                    deleted: 1,
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    res.status(200).send({
                        status: "success",
                        message: "Delivery boy has been deleted",
                    });
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                    });
                });
        }
    },
    settings: function (req, res) {
        let where = {};
        Settings.find(where)
            .sort({
                order: +1,
            })
            .then((response) => {
                let where = {};
                where["iis"] = "123456";
                AppSettings.findOne(where).then((app_response) => {
                    let where = {};
                    where["_id"] = req.body.pickup_city || null;
                    City.findOne(where).then((pickup_city_response) => {
                        let where = {};
                        where["_id"] = req.body.delivery_city || null;
                        City.findOne(where).then((delivery_city_response) => {

                            //console.log(response);
                            res.status(200).send({
                                status: "success",
                                result: {
                                    meta_access_token: "EAAJMU1GthCMBO8jmfPYmUdMDYXS9fILRsEIPlgD4TEvniJXWHgzBwKMNiuxEZABZBLWZAd7ct9wjUmCipXZBL8g1pyxXCcEKTMfEJZAdeJgj2vGF1eP2AVpWLZAHkUM1Vhh1ONbGPhNB36N4wRTYQ0QoUZBjeVlrIhzUj4b99H6ytvIxIrOwZBo1H6BIvc2xB9jx9gZDZD",
                                    contact_email: response[14].value,
                                    contact_phone: response[7].value,
                                    whatsapp: response[19].value,
                                    address: response[20].value,
                                    about_us: response[13].value,
                                    terms: response[8].value,
                                    privacy: response[15].value,
                                    customer_android_version: response[3].value,
                                    customer_ios_version: response[9].value,
                                    cancel_time: response[27].value,
                                    dashboard: [
                                        {
                                            background_image: response[0].value,
                                            icon: response[17].value,
                                            title: response[12].value,
                                        },
                                        {
                                            background_image: response[1].value,
                                            icon: response[5].value,
                                            title: response[18].value,
                                        },
                                        {
                                            background_image: response[2].value,
                                            icon: response[10].value,
                                            title: response[16].value,
                                        },
                                        {
                                            background_image: response[4].value,
                                            icon: response[6].value,
                                            title: response[11].value,
                                        },
                                    ],
                                    logistic_android_version: response[21].value,
                                    logistic_ios_version: response[22].value,
                                    vendor_android_version: response[23].value,
                                    vendor_ios_version: response[24].value,
                                    minimum_order_value: pickup_city_response?.minimum_order_value || response[25]?.value,
                                    maximum_order_value_cod: delivery_city_response?.maximum_cod_order_value || response[26]?.value,
                                    point: {
                                        settings1: {
                                            min_order: response[45].value,
                                            max_order: response[46].value,
                                            point: response[47].value,
                                        },
                                        settings2: {
                                            min_order: response[35].value,
                                            max_order: response[36].value,
                                            point: response[37].value,
                                        },
                                        settings3: {
                                            min_order: response[38].value,
                                            max_order: response[39].value,
                                            point: response[40].value,
                                        },
                                        point_value_in_rupee: response[23].value,
                                        signup_bonus_reciver: response[33].value,
                                        signup_bonus_sender: response[32].value,
                                        cod_digital_payment: response[34].value,
                                        review: response[44].value,
                                    },
                                    refund: response[49].value,
                                    product_not_available_message: response[50].value,
                                    //app_settings: app_response,
                                    app_settings: {
                                        header_bg_color: app_response?.header_bg_color,
                                        popup: {
                                            popup_bg_color: app_response.popup_bg_color,
                                            popup_subtitle: app_response.popup_subtitle,
                                            popup_title: app_response.popup_title,
                                            popup_title_color: app_response.popup_title_color,
                                            subtitle_desctiption_color: app_response.subtitle_desctiption_color,
                                            subtitle_title_color: app_response.subtitle_title_color,
                                        },
                                        slider: {
                                            slider_text: app_response.slider_text,
                                            slider_text_bg_color: app_response.slider_text_bg_color,
                                            slider_text_color: app_response.slider_text_color,
                                        },
                                        slider: {
                                            service_popup_bg_color: app_response.service_popup_bg_color,
                                            service_popup_desctiption: app_response.service_popup_desctiption,
                                            service_popup_subtitle: app_response.service_popup_subtitle,
                                            service_popup_title: app_response.service_popup_title,
                                            service_popup_title_color: app_response.service_popup_title_color,
                                            service_subtitle_desctiption_color: app_response.service_subtitle_desctiption_color,
                                            service_subtitle_title_color: app_response.service_subtitle_title_color,
                                        },
                                        cancel: {
                                            cancel_popup_bg_color: app_response.cancel_popup_bg_color,
                                            cancel_popup_desctiption: app_response.cancel_popup_desctiption,
                                            cancel_popup_subtitle: app_response.cancel_popup_subtitle,
                                            cancel_popup_title: app_response.cancel_popup_title,
                                            cancel_popup_title_color: app_response.cancel_popup_title_color,
                                            cancel_subtitle_desctiption_color: app_response.cancel_subtitle_desctiption_color,
                                            cancel_subtitle_title_color: app_response.cancel_subtitle_title_color,
                                        },
                                        order: {
                                            order_track_popup_bg_color: app_response.order_track_popup_bg_color,
                                            order_track_popup_desctiption: app_response.order_track_popup_desctiption,
                                            order_track_popup_subtitle: app_response.order_track_popup_subtitle,
                                            order_track_popup_title: app_response.order_track_popup_title,
                                            order_track_popup_title_color: app_response.order_track_popup_title_color,
                                            order_track_subtitle_desctiption_color: app_response.order_track_subtitle_desctiption_color,
                                            order_track_subtitle_title_color: app_response.order_track_subtitle_title_color,
                                        },
                                        cod: {
                                            cod_popup_bg_color: app_response.cod_popup_bg_color,
                                            cod_popup_desctiption: app_response.cod_popup_desctiption,
                                            cod_popup_subtitle: app_response.cod_popup_subtitle,
                                            cod_popup_title: app_response.cod_popup_title,
                                            cod_popup_title_color: app_response.cod_popup_title_color,
                                            cod_subtitle_desctiption_color: app_response.cod_subtitle_desctiption_color,
                                            cod_subtitle_title_color: app_response.cod_subtitle_title_color,
                                        },
                                        express: {
                                            express_popup_bg_color: app_response.express_popup_bg_color,
                                            express_popup_desctiption: app_response.express_popup_desctiption,
                                            express_popup_subtitle: app_response.express_popup_subtitle,
                                            express_popup_title: app_response.express_popup_title,
                                            express_popup_title_color: app_response.express_popup_title_color,
                                            express_subtitle_desctiption_color: app_response.express_subtitle_desctiption_color,
                                            express_subtitle_title_color: app_response.express_subtitle_title_color,
                                        },

                                        delivery_popup: {
                                            delivery_popup_bg_color: app_response.delivery_popup_bg_color,
                                            delivery_popup_desctiption: app_response.delivery_popup_desctiption,
                                            delivery_popup_subtitle: app_response.delivery_popup_subtitle,
                                            delivery_popup_title: app_response.delivery_popup_title,
                                            delivery_popup_title_color: app_response.delivery_popup_title_color,
                                            delivery_subtitle_desctiption_color: app_response.delivery_subtitle_desctiption_color,
                                            delivery_subtitle_title_color: app_response.delivery_subtitle_title_color,
                                        },

                                        info_popup: {
                                            info_popup_text: app_response.info_popup,
                                            info_popup_image: app_response.info_image,
                                            info_on_off: app_response.info_on_off,
                                        },
                                    },
                                    af2ap: response[63].value,
                                    shop_by_city: response[64].value,
                                    tagline: response[65].value,
                                    heading: response[66].value,
                                    sub_heading: response[67].value,
                                    home_video_mobile: response[68].value,
                                    home_video_desktop: response[69].value,
                                    second_header: response[70].value,
                                    search_by_city: response[71].value,
                                    faq_header1: response[72]?.value,
                                    faq_header2: response[73]?.value
                                },
                                message: "",
                            });

                        })

                    })

                    // res.status(200).send({
                    //   status: "success",
                    //   result: {
                    //     contact_email: response[0].value,
                    //     contact_phone: response[1].value,
                    //     whatsapp: response[19].value,
                    //     address: response[20].value,
                    //     about_us: response[2].value,
                    //     terms: response[3].value,
                    //     privacy: response[4].value,
                    //     customer_android_version: response[5].value,
                    //     customer_ios_version: response[6].value,
                    //     dashboard: [
                    //       {
                    //         background_image: response[7].value,
                    //         icon: response[8].value,
                    //         title: response[9].value,
                    //       },
                    //       {
                    //         background_image: response[10].value,
                    //         icon: response[11].value,
                    //         title: response[12].value,
                    //       },
                    //       {
                    //         background_image: response[13].value,
                    //         icon: response[14].value,
                    //         title: response[15].value,
                    //       },
                    //       {
                    //         background_image: response[15].value,
                    //         icon: response[17].value,
                    //         title: response[18].value,
                    //       },
                    //     ],
                    //     logistic_android_version: response[21].value,
                    //     logistic_ios_version: response[22].value,
                    //     vendor_android_version: response[23].value,
                    //     vendor_ios_version: response[24].value,
                    //     minimum_order_value: response[25].value,
                    //     maximum_order_value_cod: response[26].value,
                    //     app_settings: app_response,
                    //   },
                    //   message: "",
                    // });
                });
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Someting went wrong",
                    result: [],
                });
            });
    },
    vendor_pending_order: function (req, res) {
        let where = {};
        where["status"] = "waiting_vendor_approval";
        where["vendor"] = req.query.vendor;
        Checkout.find(where)
            .populate("user")
            .populate("products.product")
            .populate("vendor")
            .populate("cargo_partner")
            .populate("delivery_partner")
            .populate("pickup_partner")
            .populate("delivery_boy")
            .populate("pickup_boy")
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
                    message: error,
                    result: [],
                });
            });
    },
    approve_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Checkout.findOneAndUpdate(
                where,
                {
                    status: "vendor_approved",
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    //Order Log Start

                    const authHeader = req.headers["authorization"];
                    const token = authHeader && authHeader.split(" ")[0];
                    const decodedToken = jwt.decode(token);
                    const userId = decodedToken?.user_id;

                    const orderLog = new OrderLog({
                        order: req?.body?.id || req?.query?.id,
                        updated_by_user: userId,
                        event: "Status Update",
                        event_data: "status: vendor_approved",
                        type: "Order"
                    });

                    orderLog.save(function (err) {
                        if (err) {
                            console.log(err, "ERR");
                        } else {
                            return;
                        }
                    });

                    //Order Log END
                    Checkout.findOne(where)
                        .populate("user")
                        .then(respon => {
                            gen_order_otp2(
                                respon.user.mobile,
                                req.body.id,
                                res,
                                () => {
                                    res.status(200).send({
                                        status: "success",
                                        message: "Status Chnaged",
                                    });
                                }
                            )
                        })
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                    });
                });
        }
    },

    ready_pickup_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            if (req.body.id && req.body.id != "") {
                where["_id"] = req.body.id;
            }

            Checkout.findOneAndUpdate(
                where,
                {
                    status: "ready_pickup",
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    //Order Log Start
                    const authHeader = req.headers["authorization"];
                    const token = authHeader && authHeader.split(" ")[0];
                    const decodedToken = jwt.decode(token);
                    const userId = decodedToken?.user_id;

                    const orderLog = new OrderLog({
                        order: req?.body?.id || req?.query?.id,
                        updated_by_user: userId,
                        event: "Status Update",
                        event_data: "status: ready_pickup",
                        type: "Order"
                    });

                    orderLog.save(function (err) {
                        if (err) {
                            console.log(err, "ERR");
                        } else {
                            return;
                        }
                    });
                    //Order Log END
                    res.status(200).send({
                        status: "success",
                        message: "Status Chnaged",
                    });
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                    });
                });
        }
    },

    vendor_active_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Checkout.findOneAndUpdate(
                where,
                {
                    status: "vendor_approved",
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    //Order Log Start
                    const authHeader = req.headers["authorization"];
                    const token = authHeader && authHeader.split(" ")[0];
                    const decodedToken = jwt.decode(token);
                    const userId = decodedToken?.user_id;

                    const orderLog = new OrderLog({
                        order: req?.body?.id || req?.query?.id,
                        updated_by_user: userId,
                        event: "Status Update",
                        event_data: "status: vendor_approved",
                        type: "Order"
                    });

                    orderLog.save(function (err) {
                        if (err) {
                            console.log(err, "ERR");
                        } else {
                            return;
                        }
                    });
                    //Order Log END
                    res.status(200).send({
                        status: "success",
                        message: "Status Chnaged",
                    });
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                    });
                });
        }
    },
    pickup_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            if (req.body.id && req.body.id != "") {
                where["pickup_partner"] = req.body.id;
            }

            if (req.body.pickup_boy && req.body.pickup_boy != "") {
                where["pickup_boy"] = req.body.pickup_boy;
            }

            if (req.body.order_city && req.body.order_city != "") {
                where["order_city"] = req.body.order_city;
            }

            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");

            where["delivery_date"] = {
                $gte: today.toDate(),
                $lt: tmoment(tomorrow).endOf("day").toDate(),
            };

            // if (req.body.unassigned && req.body.unassigned != "") {
            //   where["pickup_boy"] = null;
            // }

            // where["status"] = { $ne: "delivered" };
            // where["status"] = { $ne: "pending_payment" };
            // where["status"] = { $ne: "declined_vendor" };
            // where["status"] = { $ne: "rejected_customer" };
            // where["status"] = { $ne: "refunded" };
            // where["status"] = { $ne: "failed" };
            // where["status"] = { $ne: "cancel" };
            // where["status"] = { $ne: "on_hold" };

            where["status"] = {
                $nin: [
                    "delivered",
                    "pending_payment",
                    "declined_vendor",
                    "rejected_customer",
                    "refunded",
                    "failed",
                    "cancel",
                    "on_hold",

                    "delivered_to_cargo_partner",
                    "cargo_off_loaded",
                    "cargo_delivery_started",
                    "received_destination_airport",
                    "delivered_to_delivery_partner",
                    "delivery_boy_assigned",
                    "delivery_boy_started",
                    //"pickup_boy_assigned",
                    //"pickup_boy_started",
                ],
            };

            // where["$or"] = [{
            // 		status: { $ne: "delivered" }
            // 	},
            // 	{
            // 		status: { $ne: "pending_payment" }
            // 	},
            // 	// {
            // 	// 	status: "ready_pickup"
            // 	// },
            // 	// {
            // 	// 	status: "pickup_boy_started"
            // 	// },
            // ];
            //console.log(where);
            where["deleted"] = 0;
            Checkout.find(where, null, {})
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")

                .populate("lp_manager")
                .populate("lp_head")

                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    res.status(200).send({
                        status: "success",
                        result: response,
                        message: "",
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },
    pickup_past_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            Checkout.find(
                {
                    pickup_partner: req.body.id,
                    status: "delivered",
                    deleted: 0,
                },
                null,
                {
                    limit: Number(req.query.per_page),
                    skip: Number(req.query.page),
                }
            )
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")
                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    Checkout.find(where).countDocuments(function (err, count) {
                        res.status(200).send({
                            status: "success",
                            result: response,
                            message: "",
                            count: count,
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },
    cargo_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");

            where["delivery_date"] = {
                $gte: today.toDate(),
                $lt: tmoment(tomorrow).endOf("day").toDate(),
            };

            // if (req.body.name && req.body.name != "") {
            //   where["full_name"] = { $regex: ".*" + req.body.name, $options: "i" };
            // }
            // Checkout.find(
            //   {
            //     cargo_partner: req.body.id,
            //     $or: [
            //       { status: "cargo_delivery_started" },
            //       { status: "delivered_to_cargo_partner" },
            //     ],
            //     //$or:[ ]
            //   },
            //   null,
            //   {}
            // );

            where["cargo_partner"] = req.body.id;

            // where["status"] = { $ne: "delivered" };
            // where["status"] = { $ne: "pending_payment" };
            // where["status"] = { $ne: "declined_vendor" };
            // where["status"] = { $ne: "rejected_customer" };
            // where["status"] = { $ne: "refunded" };
            // where["status"] = { $ne: "failed" };
            // where["status"] = { $ne: "cancel" };
            // where["status"] = { $ne: "on_hold" };

            // where["status"] = {$nin : [
            // 	"delivered",
            // 	"pending_payment",
            // 	"declined_vendor",
            // 	"rejected_customer",
            // 	"refunded",
            // 	"failed",
            // 	"cancel",
            // 	"on_hold"
            // ]};

            where["$or"] = [
                {
                    status: "waiting_vendor_approval",
                },
                {
                    status: "vendor_approved",
                },
                {
                    status: "ready_pickup",
                },
                {
                    status: "pickup_boy_assigned",
                },
                {
                    status: "pickup_boy_started",
                },
                {
                    status: "delivered_to_cargo_partner",
                },
                {
                    status: "cargo_off_loaded",
                },
                {
                    status: "cargo_delivery_started",
                },
            ];

            where["deleted"] = 0;

            Checkout.find(where, null, {})
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")

                .populate("lp_manager")
                .populate("lp_head")

                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: 1,
                })
                .then((response) => {
                    res.status(200).send({
                        status: "success",
                        result: response,
                        message: "",
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },
    cargo_past_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            Checkout.find(
                {
                    cargo_partner: req.body.id,
                    status: "delivered",
                    deleted: 0,
                },
                null,
                {
                    limit: Number(req.query.per_page),
                    skip: Number(req.query.page),
                }
            )
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")
                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    Checkout.find(where).countDocuments(function (err, count) {
                        res.status(200).send({
                            status: "success",
                            result: response,
                            message: "",
                            count: count,
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },
    delivery_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");

            where["delivery_date"] = {
                $gte: today.toDate(),
                $lt: tmoment(tomorrow).endOf("day").toDate(),
            };


            if (req.body.id && req.body.id != "") {
                where["delivery_partner"] = req.body.id;
            }

            if (req.body.pickup_boy && req.body.pickup_boy != "") {
                where["delivery_boy"] = req.body.delivery_boy;
            }

            if (req.body.order_city && req.body.order_city != "") {
                where["vendor_city"] = req.body.order_city;
            }


            where["$or"] = [
                {
                    status: "waiting_vendor_approval",
                },
                {
                    status: "vendor_approved",
                },
                {
                    status: "ready_pickup",
                },
                {
                    status: "pickup_boy_assigned",
                },
                {
                    status: "pickup_boy_started",
                },
                {
                    status: "delivered_to_cargo_partner",
                },
                {
                    status: "cargo_off_loaded",
                },
                {
                    status: "cargo_delivery_started",
                },

                {
                    status: "received_destination_airport",
                },
                {
                    status: "delivered_to_delivery_partner",
                },
                {
                    status: "delivery_boy_assigned",
                },
                {
                    status: "delivery_boy_started",
                },
            ];

            // where["status"] = { $ne: "delivered" };
            // where["status"] = { $ne: "pending_payment" };
            // where["status"] = { $ne: "declined_vendor" };
            // where["status"] = { $ne: "rejected_customer" };
            // where["status"] = { $ne: "refunded" };
            // where["status"] = { $ne: "failed" };
            // where["status"] = { $ne: "cancel" };
            // where["status"] = { $ne: "on_hold" };

            // where["status"] = {$nin : [
            // 	"delivered",
            // 	"pending_payment",
            // 	"declined_vendor",
            // 	"rejected_customer",
            // 	"refunded",
            // 	"failed",
            // 	"cancel",
            // 	"on_hold"
            // ]};

            if (req.body.id && req.body.id != "") {
                where["delivery_partner"] = req.body.id;
            }
            where["deleted"] = 0;
            Checkout.find(where, null, {})
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")
                .populate("lp_manager")
                .populate("lp_head")
                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })

                .sort({
                    created_date: 1,
                })
                .then((response) => {
                    // let origins = ['40.7421,-73.9914'];
                    // let destinations = ['41.8337329,-87.7321554'];

                    res.status(200).send({
                        status: "success",
                        result: response,
                        message: "",
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },
    delivery_past_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            Checkout.find(
                {
                    delivery_partner: req.body.id,
                    status: "delivered",
                    deleted: 0,
                },
                null,
                {
                    limit: Number(req.query.per_page),
                    skip: Number(req.query.page),
                }
            )
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")
                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    Checkout.find(where).countDocuments(function (err, count) {
                        res.status(200).send({
                            status: "success",
                            result: response,
                            message: "",
                            count: count,
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    pickup_partner_order_assign_pickup_boy: async function (req, res) {
        let ids = req.body.id.split(",");
        let pickup_boy = req.body.pickup_boy.split(",");

        for (let i = 0; i < ids.length; i++) {
            let where = {};
            where["_id"] = ids[i];
            await Checkout.findOneAndUpdate(
                where,
                {
                    pickup_boy: pickup_boy[i],
                    status: "pickup_boy_assigned",
                    deleted: 0,
                },
                {
                    new: true,
                }
            ).exec().then(() => {
                const authHeader = req.headers["authorization"];
                const token = authHeader && authHeader.split(" ")[0];
                const decodedToken = jwt.decode(token);
                const userId = decodedToken?.user_id;

                const orderLog = new OrderLog({
                    order: ids[i],
                    updated_by_user: userId,
                    event: "Pickup Boy Assigned",
                    event_data: "pickup_boy_assigned :- " + pickup_boy[i],
                    type: "Order"
                });

                orderLog.save(function (err) {
                    if (err) {
                        return;
                    } else {
                        return;
                    }
                })
            });
        }

        res.status(200).send({
            status: "success",
            message: "Picup boy assigned",
        });
    },

    pickup_boy_order_start: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Checkout.findOneAndUpdate(
                where,
                {
                    status: "pickup_boy_started",
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    const authHeader = req.headers["authorization"];
                    const token = authHeader && authHeader.split(" ")[0];
                    const decodedToken = jwt.decode(token);
                    const userId = decodedToken?.user_id;

                    const orderLog = new OrderLog({
                        order: req?.body?.id || req?.query?.id,
                        updated_by_user: userId,
                        event: "Picup boy Status Changed",
                        event_data: "pickup_boy_started",
                        type: "Order"
                    });

                    orderLog.save(function (err) {
                        if (err) {
                            return;
                        } else {
                            return;
                        }
                    })
                    Checkout.findOne(where)
                        .populate("user")
                        .then(respon => {
                            gen_order_otp2(
                                respon.user.mobile,
                                req.body.id,
                                res,
                                () => {
                                    res.status(200).send({
                                        status: "success",
                                        message: "Picup boy journey started",
                                    });
                                }
                            )
                        })
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                    });
                });
        }
    },

    send_otp_to_cargo: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            Checkout.findOne(
                {
                    _id: req.body.id,
                },
                null,
                {}
            )
                .populate("cargo_partner")
                .then((response) => {
                    gen_order_otp(
                        response.cargo_partner.mobile,
                        req.body.id,
                        res,
                        (successResponse) => {
                            res.status(200).send({
                                status: "success",
                                OTP: successResponse,
                                message: "OTP has been sent to cargo partner.",
                            });
                        },
                        (errorResponse) => {
                            res.status(200).send({
                                status: "error",
                                message: errorResponse,
                                OTP: "",
                            });
                        }
                    );
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    delivered_to_cargo: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            Checkout.findOne(
                {
                    _id: req.body.id,
                },
                null,
                {}
            ).then((response) => {
                if (response.otp == req.body.otp) {
                    let where = {};
                    where["_id"] = req.body.id;
                    Checkout.findOneAndUpdate(
                        where,
                        {
                            status: "delivered_to_cargo_partner",
                            otp: null,
                        },
                        {
                            new: true,
                        }
                    )
                        .exec()
                        .then(() => {
                            CodPayment.findOneAndRemove({ order_id: req.body.id })
                                .exec()
                                .then(() => {
                                    return;
                                }).catch((error) => {
                                    console.log((error));
                                });
                            res.status(200).send({
                                status: "success",
                                message: "Delivered to cargo partner",
                            });
                        })
                        .catch(() => {
                            res.status(200).send({
                                status: "error",
                                message: "Something went wrong",
                            });
                        });
                } else {
                    res.status(200).send({
                        status: "error",
                        message: "Invalid OTP",
                    });
                }
            });
        }
    },

    pickup_boy_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");

            where["delivery_date"] = {
                $gte: today.toDate(),
                $lt: tmoment(tomorrow).endOf("day").toDate(),
            };

            where["pickup_boy"] = req.body.id;


            where["$or"] = [
                {
                    status: "waiting_vendor_approval",
                },
                {
                    status: "vendor_approved",
                },
                {
                    status: "ready_pickup",
                },
                {
                    status: "pickup_boy_assigned",
                },
                {
                    status: "pickup_boy_started",
                },
            ];

            //where["status"] = "waiting_vendor_approval";
            //where["status"] = "vendor_approved";
            //where["status"] = "ready_pickup";
            //where["status"] = "pickup_boy_assigned";
            //where["status"] = "pickup_boy_started";

            // where["status"] = {$nin : [
            // 	"delivered",
            // 	"pending_payment",
            // 	"declined_vendor",
            // 	"rejected_customer",
            // 	"refunded",
            // 	"failed",
            // 	"cancel",
            // 	"on_hold"
            // ]};
            where["deleted"] = 0;
            Checkout.find(where, null, {})
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")

                .populate("lp_head")
                .populate("lp_manager")

                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: 1,
                })
                .then((response) => {
                    res.status(200).send({
                        status: "success",
                        result: response,
                        message: "",
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    pickup_boy_past_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            Checkout.find(
                {
                    pickup_boy: req.body.id,
                    status: "delivered",
                    deleted: 0,
                },
                null,
                {
                    limit: Number(req.query.per_page),
                    skip: Number(req.query.page),
                }
            )
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")
                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    Checkout.find(where).countDocuments(function (err, count) {
                        res.status(200).send({
                            status: "success",
                            result: response,
                            message: "",
                            count: count,
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },
    cargo_start_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            Checkout.findOne(
                {
                    _id: req.body.id,
                },
                null,
                {}
            ).then(() => {
                let where = {};
                where["_id"] = req.body.id;
                Checkout.findOneAndUpdate(
                    where,
                    {
                        status: "cargo_delivery_started",
                    },
                    {
                        new: true,
                    }
                )
                    .exec()
                    .then(() => {
                        //Order Log Start
                        const authHeader = req.headers["authorization"];
                        const token = authHeader && authHeader.split(" ")[0];
                        const decodedToken = jwt.decode(token);
                        const userId = decodedToken?.user_id;

                        const orderLog = new OrderLog({
                            order: req?.body?.id || req?.query?.id,
                            updated_by_user: userId,
                            event: "Status Update",
                            event_data: "status: cargo_delivery_started",
                            type: "Order"
                        });

                        orderLog.save(function (err) {
                            if (err) {
                                console.log(err, "ERR");
                            } else {
                                return;
                            }
                        });
                        //Order Log END

                        res.status(200).send({
                            status: "success",
                            message: "Cargo agent started order",
                        });
                    })
                    .catch(() => {
                        res.status(200).send({
                            status: "error",
                            message: "Something went wrong",
                        });
                    });
            });
        }
    },
    send_otp_to_delivery_partner: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            Checkout.findOne(
                {
                    _id: req.body.id,
                },
                null,
                {}
            )
                .populate("delivery_partner")
                .then((response) => {
                    gen_order_otp(
                        response.delivery_partner.mobile,
                        req.body.id,
                        res,
                        (successResponse) => {
                            res.status(200).send({
                                status: "success",
                                OTP: successResponse,
                                message: "OTP has been sent to cargo partner.",
                            });
                        },
                        (errorResponse) => {
                            res.status(200).send({
                                status: "error",
                                message: errorResponse,
                                OTP: "",
                            });
                        }
                    );
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },
    delivered_to_delivery_partner: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            Checkout.findOne(
                {
                    _id: req.body.id,
                },
                null,
                {}
            ).then((response) => {
                if (response.otp == req.body.otp) {
                    let where = {};
                    where["_id"] = req.body.id;
                    Checkout.findOneAndUpdate(
                        where,
                        {
                            status: "delivered_to_delivery_partner",
                            otp: null,
                        },
                        {
                            new: true,
                        }
                    )
                        .exec()
                        .then(() => {
                            res.status(200).send({
                                status: "success",
                                message: "Delivered to delivery partner",
                            });
                        })
                        .catch(() => {
                            res.status(200).send({
                                status: "error",
                                message: "Something went wrong",
                            });
                        });
                } else {
                    res.status(200).send({
                        status: "error",
                        message: "Invalid OTP",
                    });
                }
            });
        }
    },

    delivery_partner_order_assign_delivery_boy: async function (req, res) {
        let ids = req.body.id.split(",");
        let delivery_boy = req.body.delivery_boy.split(",");

        for (let i = 0; i < ids.length; i++) {
            let where = {};
            where["_id"] = ids[i];
            await Checkout.findOneAndUpdate(
                where,
                {
                    delivery_boy: delivery_boy[i],
                },
                {
                    new: true,
                }
            ).exec().then(() => {
                const authHeader = req.headers["authorization"];
                const token = authHeader && authHeader.split(" ")[0];
                const decodedToken = jwt.decode(token);
                const userId = decodedToken?.user_id;

                const orderLog = new OrderLog({
                    order: ids[i],
                    updated_by_user: req.body.user_id || req?.query?.user_id ? req.body.user_id || req?.query?.user_id : userId,
                    event: "Delivery Boy Assigned",
                    event_data: "Delivery Boy :- " + delivery_boy[i],
                    type: "Order"
                });

                orderLog.save(function (err) {
                    if (err) {
                        console.log(err, "ERR");
                    } else {
                        return;
                    }
                })
            });
        }

        res.status(200).send({
            status: "success",
            message: "Delivery boy assigned",
        });
    },
    delivery_partner_order_assign_delivery_boy_notification: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Checkout.findOneAndUpdate(
                where,
                {
                    status: "delivery_boy_assigned",
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    Checkout.findOne(
                        {
                            _id: req.body.id,
                        },
                        null,
                        {}
                    )
                        .populate("delivery_boy")
                        .populate("user")
                        .then((response) => {
                            let mobile = response.user.mobile;
                            let email = response.user.email;
                            let dboy_name = response.delivery_boy ? response.delivery_boy.full_name : "N/A";
                            let msg = "Dear CUSTOMER, Delivery Boy " + dboy_name.trim() + " is assigned for your ORDER NO # " + response.orderid + ". Regards, TASTES2PLATE CUSTOMER SUPPORT TEAM";
                            //console.log(msg);
                            gen_custom_sms(mobile, msg);

                            let msg5 = "DEAR CUSTOMER, PLEASE HELP US BY CHECKING THE QUALITY OF FOOD AT THE TIME OF DELIVERY. AFTER ACCEPTING THE DELIVERY, ANY COMPLAIN REGARDING FOOD QUALITY WILL BE DIFFICULT TO ASCERTAIN. Tastes2plate CC Team";
                            gen_custom_sms(mobile, msg5);

                             msg = encodeURI("Dear CUSTOMER, Delivery Boy " + dboy_name + " is assigned for your ORDER NO # " + response.orderid + ". Regards, TASTES2PLATE CUSTOMER SUPPORT TEAM");

                            let parameters = [
                                "CUSTOMER",
                                dboy_name,
                                response.orderid
                            ];
                            SendWATI("delivery_boy_assigned", parameters, mobile);

                             msg = "Dear sir, please put the packet in boiling water for 5 minutes if Biryani is in packet. For other food items, this is not required. Regards, T2P";
                            gen_custom_sms(mobile, msg);
                            SendWATI("boiling_water_md", parameters, mobile);
                            SendWATI("food_complain", parameters, mobile);
                            let ordernote = new OrderNote({
                                note: msg,
                                order: req.query.id,
                            });
                            ordernote.save(function () { });

                            axios
                                .get("https://omst5afyma.execute-api.ap-south-1.amazonaws.com/production/admin/send_email_template?email=" + email + "&msg=" + msg, {})
                                .then(function () {
                                    //console.log(response.data);
                                })
                                .catch(function (error) {
                                    console.log(error);
                                });

                            const authHeader = req.headers["authorization"];
                            const token = authHeader && authHeader.split(" ")[0];
                            const decodedToken = jwt.decode(token);
                            const userId = decodedToken?.user_id;

                            const orderLog = new OrderLog({
                                order: req?.body?.id || req?.query?.id,
                                updated_by_user: userId,
                                event: "Delivery Boy Assigned Status Notification Sent",
                                event_data: "delivery_boy_assigned",
                                type: "Order"
                            });

                            orderLog.save(function (err) {
                                if (err) {
                                    console.log(err, "ERR");
                                } else {
                                    return;
                                }
                            })
                            res.status(200).send({
                                status: "success",
                                message: "Notification sent",
                            });
                        });
                });
        }
    },
    delivery_boy_order_start: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;

            let where1 = {};
            where1["_id"] = req.body.id;
            where1["status"] = "delivery_boy_started";
            Checkout.findOne(where).then(respon => {
                if (respon != null) {
                    res.status(200).send({
                        status: "success",
                        message: "Picup boy journey already started",
                        // token: decodedToken ? "Token Found" : "Token Not found"
                    });
                    // return ;
                } else {
                    Checkout.findOneAndUpdate(
                        where,
                        {
                            status: "delivery_boy_started",
                        },
                        {
                            new: true,
                        }
                    )
                        .exec()
                        .then(() => {
                            let where = {};
                            where["_id"] = req.body.id || req?.query?.id;

                            //ORder Log
                            const authHeader = req.headers["authorization"];
                            const token = authHeader && authHeader.split(" ")[0];
                            const decodedToken = jwt.decode(token);
                            const userId = decodedToken?.user_id;

                            const orderLog = new OrderLog({
                                order: req?.body?.id || req?.query?.id,
                                updated_by_user: req.body.user_id || req?.query?.user_id ? req.body.user_id || req?.query?.user_id : userId,
                                event: "Delivery Boy Order Started Status",
                                event_data: "delivery_boy_started",
                                type: "Order"
                            });

                            orderLog.save(function (err) {
                                if (err) {
                                    console.log(err, "ERR");
                                } else {
                                    return;
                                }
                            })

                            //ORder Log END

                            Checkout.findOne(where)
                                .populate("user")
                                .populate("delivery_boy")
                                .then((response) => {
                                    let mobile = response.user.mobile;
                                    let email = response.user.email;
                                    let db_name = response.delivery_boy != null ? response.delivery_boy.full_name : "N/A";

                                    res.status(200).send({
                                        status: "success",
                                        message: "Picup boy journey started",
                                        token: decodedToken ? "Token Found" : "Token Not found"
                                    });

                                    GenURL(response._id).then(function (url_result) {
                                        let msg12 = "DEAR CUSTOMER, DELIVERY BOY " + db_name + " IS OUT FOR DELIVERY OF YOUR ORDER NO " + response.orderid + " WITH TASTES2PLATE; HIS MOBILE NUMBER IS " + response.delivery_boy.mobile + ". NOW, YOU CAN TRACK " + url_result + " THE DELIVERY BOY. REGARDS, TASTES2PLATE (T2P) CUSTOMER SUPPORT TEAM";
                                        //console.log(msg12);
                                        gen_custom_sms(mobile, msg12);
                                    });

                                    let dmobile = response.delivery_boy && response.delivery_boy.mobile != "" ? response.user.mobile : "Not Available";

                                    let parameters = [
                                        "CUSTOMER",
                                        db_name,
                                        response.orderid,
                                        response.delivery_boy.mobile
                                        // { name: "1", value: "CUSTOMER" },
                                        // { name: "2", value: db_name },
                                        // { name: "3", value: response.orderid },
                                        // { name: "4", value: response.delivery_boy.mobile },
                                    ];
                                    SendWATI("delivery_boy_out_for_delivery", parameters, mobile);

                                    let msg3 = "DEAR CUSTOMER, DELIVERY BOY " + db_name + " IS OUT FOR DELIVERY FOR YOUR ORDER NO " + response.orderid + " WITH TASTES2PLATE; HIS MOBILE NUMBER IS " + response.delivery_boy.mobile + ". YOU CAN NOW TRACK THE DELIVERY BOY REGARDS, TASTES2PLATE (T2P) CUSTOMER SUPPORT TEAM";
                                    gen_custom_sms(mobile, msg3);

                                    let db_image = response.delivery_boy.profile_image && response.delivery_boy.profile_image != "" ? ' <img src="' + response.delivery_boy.profile_image + '" width="125" height="120" style="display: block; border: 0px; margin-bottom: 15%;" alt="tastes2plate" />' : "";
                                    let msg4 = "DEAR CUSTOMER, DELIVERY BOY " + db_name + " IS OUT FOR DELIVERY FOR YOUR ORDER NO " + response.orderid + " AND HIS MOBILE NUMBER IS " + dmobile + ". " + db_image + "";

                                    axios
                                        .get("https://omst5afyma.execute-api.ap-south-1.amazonaws.com/production/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg4), {})
                                        .then(function () {
                                            //console.log(response.data);
                                        })
                                        .catch(function (error) {
                                            console.log(error);
                                        });

                                    let payload = {
                                        merchantId: "CHARABUNISERVICESRAJARHAT",
                                        transactionId: response.orderid,
                                        merchantOrderId: response.orderid,
                                        amount: response.finalprice,
                                        //"mobileNumber":"7065265407",
                                        expiresIn: 180,
                                    };

                                    let x_verify = sha256(base64.stringify(utf8.parse(JSON.stringify(payload))) + "/v3/payLink/init" + "5b6a2591-2b28-4840-a5ac-762a5fbfb6d6") + "###" + 1;

                                    const url = "https://mercury-t2.phonepe.com/v3/payLink/init";
                                    const options = {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "X-VERIFY": x_verify,
                                        },
                                        body: JSON.stringify({
                                            request: base64.stringify(utf8.parse(JSON.stringify(payload))),
                                        }),
                                    };
                                    fetch(url, options)
                                        .then((res) => res.json())
                                        .then((json) => {
                                            //console.log(json);
                                            let payLink = json.data.payLink;
                                            if (payLink) {
                                                let msg9 = "DEAR CUSTOMER, DELIVERY BOY " + db_name + " IS OUT-FOR-DELIVERY OF YOUR ORDER NO " + response.orderid + ". YOU CAN DO PAYMENT ONLINE USING THIS LINK " + payLink + ". REGARDS, TASTES2PLATE (T2P) CUSTOMER SUPPORT TEAM";

                                                axios
                                                    .get("https://omst5afyma.execute-api.ap-south-1.amazonaws.com/production/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg9), {})
                                                    .then(function () {
                                                        //console.log(response.data);
                                                    })
                                                    .catch(function (error) {
                                                        console.log(error);
                                                    });

                                                gen_custom_sms(mobile, msg9);
                                            }
                                        })
                                        .catch((err) => console.error("error:" + err));
                                });
                        })
                        .catch(() => {
                            res.status(200).send({
                                status: "error",
                                message: "Something went wrong",
                            });
                        });
                };
            });
        }
    },

    send_otp_to_customer: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            Checkout.findOne(
                {
                    _id: req.body.id,
                },
                null,
                {}
            )
                .populate("user")
                .populate("delivery_boy")
                .then((response) => {
                    let dboy_name = response.delivery_boy ? response.delivery_boy.full_name : "N/A";
                    gen_order_otp2(
                        response.user.mobile,
                        req.body.id,
                        res,
                        (successResponse) => {
                            // console.log(successResponse);
                            // let msg = encodeURI("Dear customer, your OTP for Delivery of your order no " + response.orderid + " is " + successResponse + ". Please provide it to the delivery boy " + dboy_name + " at the time of delivery. Thanks, tastes2plate (t2p)");
                            // gen_custom_sms(response.user.mobile, msg);

                            let parameters = [
                                response.orderid,
                                successResponse,
                                dboy_name
                                // { name: "1", value: response.orderid },
                                // { name: "2", value: successResponse },
                                // { name: "3", value: dboy_name },
                            ];
                            SendWATI("delivery_customer_otp", parameters, response.user.mobile);

                            res.status(200).send({
                                status: "success",
                                OTP: successResponse,
                                message: "OTP has been sent to customer.",
                            });
                        },
                        (errorResponse) => {
                            res.status(200).send({
                                status: "error",
                                message: errorResponse,
                                OTP: "",
                            });
                        }
                    );
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },
    delivered_to_customer: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let updatedata = {};
            updatedata["status"] = "delivered";
            updatedata["otp"] = null;
            updatedata["distance"] = req.body.distance;

            if (req.body.gateway && req.body.gateway.trim() != "") {
                updatedata["gateway"] = req.body.gateway == "cod" ? "COD" : req.body.gateway;
            }

            Checkout.findOne(
                {
                    _id: req.body.id,
                },
                null,
                {}
            )
                .populate("user")
                .then((response) => {
                    if (response.otp == req.body.otp) {
                        let where = {};
                        where["_id"] = req.body.id;
                        Checkout.findOneAndUpdate(where, updatedata, {
                            new: true,
                        })
                            .exec()
                            .then((response) => {
                                let order_id = response?.orderid;
                                let checkoutData = Checkout.findOne({
                                    orderid: order_id
                                });
                                let purTran = PurchaseStockTransaction.findOne({
                                    bill_no: {
                                        $regex: order_id,
                                    }
                                });
                                for (let i = 0; i < checkoutData?.products?.length; i++) {
                                    PurchaseStockTransactionProduct.findOne({
                                        transaction: purTran?._id,
                                        product: checkoutData?.products[i]?.product,
                                    }).then(resp => {
                                        if (resp) {
                                            if (resp?.qty == checkoutData?.products[i]?.quantity) {
                                                PurchaseStockTransactionProduct.findOneAndUpdate({
                                                    _id: resp?._id
                                                }, {
                                                    destroyed: 1
                                                },
                                                    {
                                                        new: true,
                                                    }
                                                )
                                                    .exec()
                                            } else if (Number(resp?.qty) > Number(checkoutData?.products[i]?.quantity)) {
                                                PurchaseStockTransactionProduct.findOneAndUpdate({
                                                    _id: resp?._id
                                                }, {
                                                    qty: (Number(resp?.qty) - Number(checkoutData?.products[i]?.quantity))
                                                },
                                                    {
                                                        new: true,
                                                    }
                                                )
                                                    .exec()
                                            }
                                        }
                                    })
                                }


                                if (response.user.first_time == 1) {
                                    let where = {};
                                    Settings.find(where).then((settings_response) => {
                                        let signup_bonus_sender = settings_response[32].value;
                                        let sender = response.user.reffer_by;

                                        let where = {};
                                        where["mobile"] = sender;
                                        Users.findOne(where).then((sender_response) => {
                                            let point = sender_response.subscription.point;
                                            let new_point = Number(point) + Number(signup_bonus_sender);
                                            let where = {};
                                            where["mobile"] = sender;
                                            Users.findOneAndUpdate(
                                                where,
                                                {
                                                    subscription: {
                                                        point: new_point,
                                                    },
                                                },
                                                {
                                                    new: true,
                                                }
                                            )
                                                .exec()
                                                .then((sender_response) => {
                                                    let Walletdata = new Wallet({
                                                        user: sender_response._id,
                                                        point: Number(signup_bonus_sender),
                                                        type: 1,
                                                        note: "Referral signup bonus",
                                                    });
                                                    Walletdata.save(function () { });

                                                    let where = {};
                                                    where["_id"] = sender_response._id;
                                                    Users.findOneAndUpdate(
                                                        where,
                                                        {
                                                            first_time: 0,
                                                        },
                                                        {
                                                            new: true,
                                                        }
                                                    )
                                                        .exec()
                                                        .then(() => { });
                                                });
                                        });
                                    });
                                }
                                res.status(200).send({
                                    status: "success",
                                    message: "Delivered to customer",
                                });

                            })
                            .catch(() => {
                                res.status(200).send({
                                    status: "error",
                                    message: "Something went wrong",
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "error",
                            message: "Invalid OTP",
                        });
                    }
                });
        }
    },

    change_order_status_new: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let updatedata = {};
            updatedata["status"] = "delivered";
            updatedata["otp"] = null;
            // updatedata["distance"] = req.body.distance;

            if (req.body.gateway && req.body.gateway.trim() != "") {
                updatedata["gateway"] = req.body.gateway == "cod" ? "COD" : req.body.gateway;
            }
            // console.log(req.body)

            Checkout.findOne(
                {
                    _id: req.body.id || req.query.id,
                },
                null,
                {}
            )
                .populate("user")
                .then((response) => {
                    // console.log(response,"RES")
                    //Order Log Start

                    const authHeader = req.headers["authorization"];
                    const token = authHeader && authHeader.split(" ")[0];
                    const decodedToken = jwt.decode(token);
                    const userId = decodedToken?.user_id;

                    const orderLog = new OrderLog({
                        order: req?.body?.id || req?.query?.id,
                        updated_by_user: req.body.user_id || req?.query?.user_id ? req.body.user_id || req?.query?.user_id : userId,
                        event: "Change Order Status",
                        event_data: "Status:- Delivered",
                        type: "Order"
                    });

                    orderLog.save(function (err) {
                        if (err) {
                            console.log(err, "ERR");
                        } else {
                            return;
                        }
                    });

                    //Order Log END
                    if (response) {
                        let where = {};
                        where["_id"] = req.body.id || req.query.id;
                        Checkout.findOneAndUpdate(where, updatedata, {
                            new: true,
                        })
                            .exec()
                            .then((response) => {
                                // console.log(response,"RESPONSE")
                                res.status(200).send({
                                    status: "success",
                                    message: "Delivered to customer",
                                });

                                if (response.user.first_time == 1) {
                                    let where = {};
                                    Settings.find(where).then((settings_response) => {
                                        let signup_bonus_sender = settings_response[32].value;
                                        let sender = response.user.reffer_by;

                                        let where = {};
                                        where["mobile"] = sender;
                                        Users.findOne(where).then((sender_response) => {
                                            let point = sender_response.subscription.point;
                                            let new_point = Number(point) + Number(signup_bonus_sender);
                                            let where = {};
                                            where["mobile"] = sender;
                                            Users.findOneAndUpdate(
                                                where,
                                                {
                                                    subscription: {
                                                        point: new_point,
                                                    },
                                                },
                                                {
                                                    new: true,
                                                }
                                            )
                                                .exec()
                                                .then((sender_response) => {
                                                    let Walletdata = new Wallet({
                                                        user: sender_response._id,
                                                        point: Number(signup_bonus_sender),
                                                        type: 1,
                                                        note: "Referral signup bonus",
                                                    });
                                                    Walletdata.save(function () { });

                                                    let where = {};
                                                    where["_id"] = response._id;
                                                    Users.findOneAndUpdate(
                                                        where,
                                                        {
                                                            first_time: 0,
                                                        },
                                                        {
                                                            new: true,
                                                        }
                                                    )
                                                        .exec()
                                                        .then(() => { });
                                                });
                                        });
                                    });
                                }
                            })
                            .catch(() => {
                                res.status(200).send({
                                    status: "error",
                                    message: "Something went wrong",
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "error",
                            message: "Please try again !!",
                        });
                    }
                });
        }
    },

    update_profile: function (req, res) {
        let where = {};
        where["_id"] = req.body.id;
        Users.findOneAndUpdate(
            where,
            {
                address: req.body.address,
                full_name: req.body.full_name,
                customer_support_city: req.body.customer_support_city.split(","),
                communication_zipcode: req.body.communication_zipcode,
                service_zipcode: req.body.service_zipcode,
                bank_name: req.body.bank_name,
                acc_holder_name: req.body.acc_holder_name,
                acc_number: req.body.acc_number,
                branch_code: req.body.branch_code,
                ifsc: req.body.ifsc,
                bank_address: req.body.bank_address,
            },
            {
                new: true,
            }
        )
            .exec()
            .then(() => {
                res.status(200).send({
                    status: "success",
                    message: "Profile has been updated.",
                    //token: req.token,
                });
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Profile update error.",
                    //token: req.token,
                });
            });
    },

    update_logistic: function (req, res) {
        let where = {};
        where["_id"] = req.body.id;
        Users.findOneAndUpdate(
            where,
            {
                address: req.body.address,
                full_name: req.body.full_name,
                service_zipcode: req.body.service_zipcode,
                email: req.body.email,
                mobile: req.body.mobile,
                city: req.body.city,
            },
            {
                new: true,
            }
        )
            .exec()
            .then(() => {
                res.status(200).send({
                    status: "success",
                    message: "Profile has been updated.",
                    //token: req.token,
                });
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Profile update error.",
                    //token: req.token,
                });
            });
    },

    update_order_position: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Checkout.findOneAndUpdate(
                where,
                {
                    $set: {
                        position: {
                            type: "Point",
                            coordinates: [req.body.lat, req.body.lng],
                        },
                    },
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    //Order Log Start

                    const authHeader = req.headers["authorization"];
                    const token = authHeader && authHeader.split(" ")[0];
                    const decodedToken = jwt.decode(token);
                    const userId = decodedToken?.user_id;

                    const orderLog = new OrderLog({
                        order: req?.body?.id || req?.query?.id,
                        updated_by_user: userId,
                        event: "Update Order Position",
                        event_data: ` 
                            type: "Point",
                            coordinates: [${req.body.lat}, ${req.body.lng}],
                        `,
                        type: "Order"
                    });

                    orderLog.save(function (err) {
                        if (err) {
                            console.log(err, "ERR");
                        } else {
                            return;
                        }
                    });

                    //Order Log END

                    res.status(200).send({
                        status: "success",
                        message: "Order location updated",
                        token: req.token,
                    });
                });
        }
    },

    add_review: function (req, res) {

        upload_local(req, res, function (error) {
            if (error) {
                // res.status(200).send({
                //     status: "error",
                //     message: error.code,
                //     token: req.token,
                // });

                let ReviewData = new Review({
                    user: req.body.user ? req.body.user : null,
                    product: req.body.product,
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    rating: req.body.rating,
                    review: req.body.review,
                });

                ReviewData.save()
                    .then((response) => {
                        res.status(200).send({
                            status: "success",
                            message: "Review added",
                            result: response,
                        });
                    })
                    .catch((error) => {
                        res.status(200).send({
                            status: "error",
                            message: error,
                            result: [],
                        });
                    });
            } else {
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
                let ReviewData = new Review({
                    user: req.body.user ? req.body.user : null,
                    product: req.body.product,
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    rating: req.body.rating,
                    review: req.body.review,
                    file: image_data ? image_data.location : null,
                });

                ReviewData.save()
                    .then((response) => {
                        res.status(200).send({
                            status: "success",
                            message: "Review added",
                            result: response,
                        });
                    })
                    .catch((error) => {
                        res.status(200).send({
                            status: "error",
                            message: error,
                            result: [],
                        });
                    });
            }
        });
    },

    my_orders: function (req, res) {
        const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

        let where = {};
        where["user"] = req.query.id;
        where["deleted"] = 0;
        Checkout.find(where, null, {
            limit: Number(req.query.per_page),
            skip: Number(req.query.page),
        })
            .populate("user")
            .populate("products.product")
            .populate("vendor")
            .populate("cargo_partner")
            .populate("delivery_partner")
            .populate("pickup_partner")
            .populate({
                path: "address",
                populate: [
                    {
                        path: "city",
                        model: "cities",
                        select: "name",
                    },
                    {
                        path: "state",
                        model: "states",
                        select: "name",
                    },
                ],
            })
            .populate("delivery_boy")
            .populate("pickup_boy")
            .sort({
                created_date: -1,
            })
            .then((response) => {
                if (response) {
                    Checkout.find(where).countDocuments(function (err, count) {
                        Settings.find({}, null, {}).then((settings_response) => {
                            res.status(200).send({
                                status: "success",
                                result: response,
                                message: "",
                                count: count,
                                server_time: dateKolkata,
                                cancel_time: settings_response[27].value,
                            });
                        });
                    });
                } else {
                    res.status(200).send({
                        status: "error",
                        message: "No data found",
                        result: [],
                        server_time: dateKolkata,
                        count: 0,
                        cancel_time: "",
                    });
                }
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    result: [],
                    server_time: dateKolkata,
                    count: 0,
                    cancel_time: "",
                });
            });
    },
    cancel_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Checkout.findOne(where, null, {}).then((checkout_response) => {
                let start_city = checkout_response.vendor_city;
                let end_city = checkout_response.order_city;
    
                let where = {};
                where["start_city"] = start_city;
                where["end_city"] = end_city;
                CutOffTime.findOne(where, null, {}).then((cutoff_response) => {
    
    
                    // Fetching settings
                    Settings.find({}, null, {}).then(() => {
                        const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
                        let server_timestamp = moment(dateKolkata).tz("Asia/Kolkata").unix();
    
                        let order_time = moment(checkout_response.created_date).tz("Asia/Kolkata").format();
                        let order_timestamp = moment(order_time).add(16, "minutes").unix();
    
                        // Check if order cancellation is allowed based on the timestamp
                        if (order_timestamp < server_timestamp) {
                            res.status(200).send({
                                status: "error",
                                message: "Order cannot be cancelled. Contact admin for more details.",
                                token: req.token,
                            });
                            return;
                        }
    
                        if (seconds2 > seconds) {
                            res.status(200).send({
                                status: "error",
                                message: "Order cannot be cancelled. Contact admin for more details.",
                                token: req.token,
                            });
                            return;
                        }
    
                        // Express order cancellation time check
                        if (checkout_response.express == "Y") {
                            let cut_of_time = cutoff_response.express_cut_of_time_first + ":00";
                            let a = cut_of_time.split(":");
                            let seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
    
                            let d = new Date(); // for now
                            let current_time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                            let b = current_time.split(":");
                            let seconds2 = +b[0] * 60 * 60 + +b[1] * 60 + +b[2];
    
                            if (seconds2 > seconds) {
                                res.status(200).send({
                                    status: "error",
                                    message: "Order cannot be cancelled. Contact admin for more details.",
                                    token: req.token,
                                });
                                return;
                            }
    
                             cut_of_time = cutoff_response.express_cut_of_time_second + ":00";
                             a = cut_of_time.split(":");
                             seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
    
                             d = new Date(); // for now
                             current_time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                             b = current_time.split(":");
                             seconds2 = +b[0] * 60 * 60 + +b[1] * 60 + +b[2];
    
                            if (seconds2 > seconds) {
                                res.status(200).send({
                                    status: "error",
                                    message: "Order cannot be cancelled. Contact admin for more details.",
                                    token: req.token,
                                });
                                return;
                            }
                        }
    
                        // Update checkout status to 'cancel'
                        let where = {};
                        where["_id"] = req.body.id;
                        Checkout.findOneAndUpdate(
                            where,
                            { status: "cancel" },
                            { new: true }
                        )
                            .exec()
                            .then((response) => {
                                let orderid = response.orderid;
    
                                // Fetch purchase stock transactions related to this order
                                PurchaseStockTransactionProduct.find({
                                    bill_no: { $regex: response.orderid }
                                })
                                    .exec()
                                    .then((purTran) => {
                                        // Iterate over the transactions and update
                                        for (const che_item of purTran) {
                                            PurchaseStockTransactionProduct.findOneAndUpdate({
                                                _id: che_item._id
                                            }, {
                                                approved: 1,
                                                order_status: "cancel",
                                                older_order_no: orderid,
                                                bill_no: ""
                                            }, {
                                                new: true
                                            }).exec();
                                        }
                                    })
                                    .catch((error) => {
                                        console.log("Error fetching purchase transactions:", error);
                                    });
    
                                // Remove COD payment record for this order
                                CodPayment.findOneAndRemove({ order_id: req.body.id })
                                    .exec()
                                    .then(() => {
                                        return;
                                    }).catch((error) => {
                                        console.log(error);
                                    });
    
                                // Order Log Start
                                const authHeader = req.headers["authorization"];
                                const token = authHeader && authHeader.split(" ")[0];
                                const decodedToken = jwt.decode(token);
                                const userId = decodedToken?.user_id;
    
                                const orderLog = new OrderLog({
                                    order: req?.body?.id || req?.query?.id,
                                    updated_by_user: userId,
                                    event: "Status Update",
                                    event_data: "status: cancel",
                                    type: "Order"
                                });
    
                                orderLog.save(function (err) {
                                    if (err) {
                                        console.log(err, "ERR");
                                    } else {
                                        return;
                                    }
                                });
                                // Order Log END
    
                                // Send response to client
                                res.status(200).send({
                                    status: "success",
                                    message: "Order cancelled",
                                    token: req.token,
                                });
                            });
                    });
                });
            });
        }
    },    
    get_city_zip: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            City.aggregate([
                {
                    $lookup: {
                        from: "zips",
                        localField: "_id",
                        foreignField: "city",
                        as: "zips",
                    },
                },
            ]).then((response) => {
                res.status(200).send({
                    status: "success",
                    token: req.token,
                    result: response,
                });
            });
        }
    },

    cutofftime_check: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["start_city"] = req.query.start_city;
            where["end_city"] = req.query.end_city;
            CutOffTime.findOne(where, null, {})
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    res.status(200).send({
                        status: "success",
                        result: response,
                        message: "",
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    check_zipcode: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.query.vendor;
            where["user_type"] = "vendor";
            Users.findOne(where, null, {})
                .then((response) => {
                    let delivery_city = response.delivery_city;
                    let vendor_city = response.city;
                    let where = {};
                    where["name"] = req.query.zipcode;
                    where["active"] = 1;
                    ZipModel.findOne(where, null, {})
                        .sort({
                            created_date: -1,
                        })
                        .then((response) => {
                            if (!response) {
                                res.status(200).send({
                                    status: "error",
                                    message: "Pincode is disabled",
                                });
                                return false;
                            }

                            let city = response.city;
                            if (delivery_city.includes(city)) {
                                let where = {};
                                where["start_city"] = vendor_city;
                                where["end_city"] = city;
                                CutOffTime.findOne(where, null, {})
                                    .sort({
                                        created_date: -1,
                                    })
                                    .then((cutoff_response) => {
                                        if (cutoff_response) {
                                            res.status(200).send({
                                                status: "success",
                                                cutoff_response: cutoff_response ? cutoff_response : {},
                                                additional_cost: response.additional_cost,
                                                express: response.express,
                                                disable_express_cod: response.express_cod,
                                                cod: response.cod,
                                                message: "",
                                            });
                                        } else {
                                            res.status(200).send({
                                                status: "error",
                                                cutoff_response: cutoff_response ? cutoff_response : {},
                                                additional_cost: response.additional_cost,
                                                express: response.express,
                                                disable_express_cod: response.express_cod,
                                                message: "Sorry! We are not available in your city",
                                            });
                                        }
                                    })
                                    .catch((error) => {
                                        res.status(200).send({
                                            status: "error",
                                            message: error,
                                            result: [],
                                        });
                                    });
                            } else {
                                res.status(200).send({
                                    status: "error",
                                    message: "not available",
                                    additional_cost: "",
                                });
                            }
                        })
                        .catch(() => {
                            res.status(200).send({
                                status: "error",
                                message: "Zip is not under delivery location",
                                additional_cost: "",
                            });
                        });
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Vendor not found",
                        additional_cost: "",
                    });
                });
        }
    },

    clear_cart: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.user;
            Users.findOne(where)
                .then((response) => {
                    if (response == null) {
                        res.status(200).send({
                            status: "error",
                            message: "Not found",
                            token: req.token,
                        });
                    } else {
                        Cart.deleteMany(
                            {
                                user: req.body.user,
                            },
                            function () {
                                res.status(200).send({
                                    status: "success",
                                    message: "Cart cleared",
                                });
                            }
                        );
                    }
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                        token: req.token,
                    });
                });
        }
    },
    website_home: function (req, res) {
        // console.log(req.query)
        Category.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "parent",
                    as: "sub_category",
                },
            },
            {
                $match: {
                    parent: null,
                    deleted: 0,
                    active: 1,
                },
            },
        ]).then((category_response) => {
            let where = {};
            where["deleted"] = 0;
            Slider.find(where).then((slider_response) => {
                let where = {};
                where["deal"] = 1;
                where["deleted"] = 0;
                where["active"] = 1;
                //where['city'] = req.query.city;
                where["end_date"] = {
                    $gt: moment().toISOString(),
                };
                if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != NaN && req.query.taste != "NaN" && req.query.taste != "" && req.query.taste != null) {
                    if (req.query.taste == 0 || req.query.taste == 1) {
                        where["taste"] = Number(req?.query?.taste);
                    }
                };
                //where['combo_products'] = null;
                Products.find(where)
                    //.populate("combo_products")
                    .limit(16)
                    .then((deal_response) => {
                        let where = {};
                        where["deleted"] = 0;
                        //where['city'] = req.query.city;
                        //where["combo_products"] = null;
                        where["active"] = 1;
                        if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != NaN && req.query.taste != "NaN" && req.query.taste != "" && req.query.taste != null) {
                            if (req.query.taste == 0 || req.query.taste == 1) {
                                where["taste"] = Number(req?.query?.taste);
                            }
                        };
                        where["best_seller"] = 1;

                        Products.find(where)
                            // .populate("combo_products")
                            // .populate("city")
                            .limit(12)
                            .then((best_seller_response) => {
                                let where = {};
                                //where["discounted_price"] = { $ne: "" };
                                if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != NaN && req.query.taste != "NaN" && req.query.taste != "" && req.query.taste != null) {
                                    if (req.query.taste == 0 || req.query.taste == 1) {
                                        where["taste"] = Number(req?.query?.taste);
                                    }
                                };
                                Products.find(where)
                                    .limit(16)
                                    //  .populate("city")
                                    .then((special_response) => {
                                        let where = {};
                                        where["deleted"] = 0;
                                        where["featured"] = 1;
                                        // where["combo_products"] = null;
                                        where["active"] = 1;
                                        if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != NaN && req.query.taste != "NaN" && req.query.taste != "" && req.query.taste != null) {
                                            if (req.query.taste == 0 || req.query.taste == 1) {
                                                where["taste"] = Number(req?.query?.taste);
                                            }
                                        };
                                        Products.find(where)
                                            //.populate("combo_products")
                                            //  .populate("city")
                                            .limit(16)
                                            .then((featured_response) => {
                                                let where = {};
                                                where["deleted"] = 0;
                                                where["active"] = 1;
                                                City.find(where, null, {})
                                                    .sort({
                                                        name: 1,
                                                    })
                                                    .then((city_response) => {
                                                        let where = {};
                                                        where["deleted"] = 0;
                                                        where["active"] = 1;
                                                        where["ps"] = {
                                                            $ne: "product",
                                                        };
                                                        City.find(where, null, {})
                                                            .sort({ name: 1 })
                                                            .then((service_city) => {
                                                                Cuisine.find({ active: 1, deleted: 0 }, null, {}).then((cuisine) => {
                                                                    Brand.find({ active: 1, deleted: 0 }, null, {})
                                                                        .sort({ name: 1 })
                                                                        .then((brand) => {
                                                                            let where = {};
                                                                            where["active"] = 0;
                                                                            Blog.find(where)
                                                                                .populate("blog_category")
                                                                                .sort("-createdAt")
                                                                                .limit(9)
                                                                                .exec((err, blogdata) => {
                                                                                    let where = {};
                                                                                    where["top"] = 1;
                                                                                    Brand.find(where)
                                                                                        .limit(16)
                                                                                        .exec((err, TopBrandData) => {
                                                                                            let where = {};
                                                                                            where["top"] = 1;
                                                                                            if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != NaN && req.query.taste != "NaN" && req.query.taste != "" && req.query.taste != null) {
                                                                                                if (req.query.taste == 0 || req.query.taste == 1) {
                                                                                                    where["taste"] = Number(req?.query?.taste);
                                                                                                }
                                                                                            };
                                                                                            Products.find(where)
                                                                                                .limit(40)
                                                                                                .exec((err, MostOrderd) => {
                                                                                                    let where = {};
                                                                                                    where["gem"] = 1;
                                                                                                    Brand.find(where)
                                                                                                        .limit(16)
                                                                                                        .exec((err, HiddenData) => {
                                                                                                            let whereTop = {};
                                                                                                            whereTop['deleted'] = 0;

                                                                                                            ShopBySlider
                                                                                                                .find(whereTop)
                                                                                                                .populate("products")
                                                                                                                .exec((err, top_most_ordered_products) => {
                                                                                                                    let where = {};

                                                                                                                    where["deleted"] = 0;
                                                                                                                    where["active"] = 1;

                                                                                                                    GharkaKhanaSliders.find(where)
                                                                                                                        // .populate("city", "name")
                                                                                                                        .sort("name")
                                                                                                                        .then((ghar_ka_khana_slider) => {
                                                                                                                            res.status(200).send({
                                                                                                                                status: "success HELLO",
                                                                                                                                category: category_response,
                                                                                                                                slider: slider_response,
                                                                                                                                product_deal: deal_response,
                                                                                                                                best_seller: best_seller_response,
                                                                                                                                special: special_response,
                                                                                                                                featured: featured_response,
                                                                                                                                message: "",
                                                                                                                                city: city_response,
                                                                                                                                service_city: service_city,
                                                                                                                                brand: brand,
                                                                                                                                cuisine: cuisine,
                                                                                                                                blogdata: blogdata,
                                                                                                                                top_brands: TopBrandData,
                                                                                                                                hidden_gems: HiddenData,
                                                                                                                                most_orderd_item: MostOrderd,
                                                                                                                                top_most_ordered_products: top_most_ordered_products,
                                                                                                                                ghar_ka_khana_slider: ghar_ka_khana_slider
                                                                                                                            });
                                                                                                                        })

                                                                                                                })
                                                                                                        });
                                                                                                });
                                                                                        });
                                                                                });
                                                                        });
                                                                });
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
        });
    },

    delivery_boy_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");

            where["delivery_date"] = {
                $gte: today.toDate(),
                $lt: tmoment(tomorrow).endOf("day").toDate(),
            };

            // where["status"] = { $ne: "delivered" };
            // where["status"] = { $ne: "pending_payment" };
            // where["status"] = { $ne: "declined_vendor" };
            // where["status"] = { $ne: "rejected_customer" };
            // where["status"] = { $ne: "refunded" };
            // where["status"] = { $ne: "failed" };
            // where["status"] = { $ne: "cancel" };
            // where["status"] = { $ne: "on_hold" };
            where["delivery_boy"] = req.body.id;

            where["status"] = {
                $nin: ["delivered", "pending_payment", "declined_vendor", "rejected_customer", "refunded", "failed", "cancel", "on_hold"],
            };
            where["deleted"] = 0;
            Checkout.find(where, null, {})
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("delivery_boy")
                .populate("pickup_boy")

                .populate("lp_head")
                .populate("lp_manager")

                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    distance.key("AIzaSyCh_QjZ_T4zDwRuuNA4JkIysLRRVvrHc9c");
                    //distance.transit_mode('subway');



                    let origins = [];
                    let destinations = [];
                    let distances2 = [];
                    let i;

                    for (i = 0; i < response.length; i++) {
                        if (i < 10) {
                            origins.push(req.body.lat + "," + req.body.lng);
                            //origins.push('San Francisco CA');
                            destinations.push(response[i].address.position.coordinates);
                            //destinations.push('New York NY');
                        }
                    }

                    distance.matrix(origins, destinations, function (err, distances) {
                        //console.log(distances);
                        if (err) {
                            return console.log(err);
                        }
                        if (!distances) {
                            return console.log("no distances");
                        }
                        if (distances.status == "OK") {
                            // for (let i=0; i < origins.length; i++) {
                            // 	for (let j = 0; j < destinations.length; j++) {
                            // 		let origin = distances.origin_addresses[i];
                            // 		let destination = distances.destination_addresses[j];
                            // 		if (distances.rows[0].elements[j].status == 'OK') {
                            // 			let distance = distances.rows[i].elements[j].distance.text;

                            // 			distances2.push(distances.rows[i].elements);
                            // 			console.log('Distance from ' + origin + ' to ' + destination + ' is ' + distance);
                            // 		} else {
                            // 			//console.log(destination + ' is not reachable by land from ' + origin);
                            // 		}
                            // 	}
                            // }

                            for (let i = 0; i < origins.length; i++) {
                                if (distances.rows[0].elements[i].status == "OK") {
                                    //let distance = distances.rows[i].elements[j].distance.text;

                                    distances2.push({
                                        orderId: response[i]._id,
                                        distances: distances.rows[0].elements[i],
                                    });
                                    //console.log('Distance from ' + origin + ' to ' + destination + ' is ' + distance);
                                }
                            }

                            res.status(200).send({
                                status: "success",
                                result: response,
                                distance: distances2,
                                message: "",
                            });
                        } else {
                            res.status(200).send({
                                status: "success",
                                result: response,
                                distance: distances2,
                                message: "",
                            });
                        }
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    delivery_boy_past_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            Checkout.find(
                {
                    delivery_boy: req.query.id,
                    status: "delivered",
                    deleted: 0,
                },
                null,
                {
                    limit: Number(req.query.per_page),
                    skip: Number(req.query.page),
                }
            )
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("delivery_boy")
                .populate("pickup_boy")
                .populate("pickup_partner")
                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    Checkout.find(where).countDocuments(function (err, count) {
                        res.status(200).send({
                            status: "success",
                            result: response,
                            message: "",
                            count: count,
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },
    update_vendor_position: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Users.findOneAndUpdate(
                where,
                {
                    $set: {
                        vendor_position: {
                            type: "Point",
                            coordinates: [req.body.lat, req.body.lng],
                        },
                    },
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    //console.log(response);
                    res.status(200).send({
                        status: "success",
                        message: "Vendor location updated",
                        token: req.token,
                    });
                });
        }
    },
    update_cargo_position: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Users.findOneAndUpdate(
                where,
                {
                    $set: {
                        vendor_position: {
                            type: "Point",
                            coordinates: [req.body.lat, req.body.lng],
                        },
                    },
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    //console.log(response);
                    res.status(200).send({
                        status: "success",
                        message: "Cargo location updated",
                        token: req.token,
                    });
                });
        }
    },
    update_delivery_parner_position: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Users.findOneAndUpdate(
                where,
                {
                    $set: {
                        vendor_position: {
                            type: "Point",
                            coordinates: [req.body.lat, req.body.lng],
                        },
                    },
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    //console.log(response);
                    res.status(200).send({
                        status: "success",
                        message: "Delivery partner location updated",
                        token: req.token,
                    });
                });
        }
    },
    update_token: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Users.findOneAndUpdate(
                where,
                {
                    $set: {
                        device_token: req.body.device_token,
                        device_type: req.body.device_type,
                    },
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    //console.log(response);
                    res.status(200).send({
                        status: "success",
                        message: "Token has been updated",
                        token: req.token,
                    });
                });
        }
    },

    state_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            States.aggregate([
                {
                    $match: { active: 1 },
                },
                {
                    $lookup: {
                        from: "cities",
                        localField: "_id",
                        foreignField: "state",
                        as: "city",
                    },
                },
            ]).then((response) => {
                res.status(200).send({
                    status: "success",
                    token: req.token,
                    result: response,
                });
            });

            //   States.find(where)
            //     .sort({ created_date: -1 })
            //     .then((response) => {
            //       res.status(200).send({
            //         status: "success",
            //         token: req.token,
            //         result: response
            //       });
            //     })
            //     .catch((error) => {
            //       res.status(200).send({
            //         status: "error",
            //         message: error,
            //         token: req.token,
            //       });
            //     });
        }
    },

    city_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            if (req.query.state && req.query.state != "") {
                where["_id"] = req.query.state;
                States.findOne(where).then((state_response) => {
                    let state_name = state_response.name;
                    if (state_name == "Uttar Pradesh (UP)") {
                        let where = {};
                        where["name"] = "Delhi (DL)";
                        States.findOne(where).then((new_state_response) => {
                            let state = new_state_response._id;
                            let where = {};
                            where["deleted"] = 0;
                            where["$or"] = [
                                {
                                    ps: "service",
                                },
                                {
                                    ps: "both",
                                },
                            ];
                            where["$or"] = [
                                {
                                    state: state,
                                },
                                {
                                    state: req.query.state,
                                },
                            ];
                            City.find(where)
                                .sort({
                                    name: 1,
                                })
                                .then((response) => {
                                    res.status(200).send({
                                        status: "success",
                                        token: req.token,
                                        result: response,
                                    });
                                })
                                .catch((error) => {
                                    res.status(200).send({
                                        status: "error",
                                        message: error,
                                        token: req.token,
                                    });
                                });
                        });
                        return;
                    }

                    if (state_name == "Haryana (HR)") {
                        let where = {};
                        where["name"] = "Delhi (DL)";
                        States.findOne(where).then((new_state_response) => {
                            let state = new_state_response._id;
                            let where = {};
                            where["state"] = state;
                            //where['state'] = req.query.state;
                            where["deleted"] = 0;
                            where["$or"] = [
                                {
                                    ps: "service",
                                },
                                {
                                    ps: "both",
                                },
                            ];
                            where["$or"] = [
                                {
                                    state: state,
                                },
                                {
                                    state: req.query.state,
                                },
                            ];
                            City.find(where)
                                .sort({
                                    name: 1,
                                })
                                .then((response) => {
                                    res.status(200).send({
                                        status: "success",
                                        token: req.token,
                                        result: response,
                                    });
                                })
                                .catch((error) => {
                                    res.status(200).send({
                                        status: "error",
                                        message: error,
                                        token: req.token,
                                    });
                                });
                        });
                        return;
                    } else {
                        let where = {};
                        where["state"] = req.query.state;
                        where["$or"] = [
                            {
                                ps: "service",
                            },
                            {
                                ps: "both",
                            },
                        ];
                        where["deleted"] = 0;
                        City.find(where)
                            .sort({
                                name: 1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    token: req.token,
                                    result: response,
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    token: req.token,
                                });
                            });
                    }
                });
            }
        }
    },

    zipcode_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["city"] = req.query.city;
            where["active"] = 1;
            ZipModel.find(where)
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    res.status(200).send({
                        status: "success",
                        token: req.token,
                        result: response,
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },

    payment_update_delivery: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["orderid"] = req.body.orderid;
            Checkout.findOne(where)
                .populate("products.product", "vendor point point_exp_date")
                .populate("address", "pincode")
                .then((response) => {
                    if (req.body.gateway != "COD") {
                        let where = {};
                        Settings.find(where)
                            .sort({
                                order: +1,
                            })
                            .then((settings_response) => {
                                let point = 0;
                                for (let i = 0; i < response.products.length; i++) {
                                    if (!moment(response.products[i].point_exp_date).isBefore(moment(), "day") && response.products[i].point) {
                                        point = Number(response.products[i].point) + point;
                                    }
                                }

                                let point1 = settings_response[35].value;
                                let point2 = settings_response[36].value;
                                let earning1 = settings_response[37].value;

                                let point3 = settings_response[38].value;
                                let point4 = settings_response[39].value;
                                let earning2 = settings_response[40].value;

                                let point5 = settings_response[41].value;
                                let point6 = settings_response[42].value;
                                let earning3 = settings_response[43].value;

                                let point7 = settings_response[45].value;
                                let point8 = settings_response[46].value;
                                let earning4 = settings_response[47].value;

                                if (Number(response.finalprice) >= Number(point1) || Number(response.finalprice) >= Number(point2)) {
                                    point = point + Number(earning1);
                                    //console.log(1);
                                }

                                if (Number(response.finalprice) >= Number(point3) || Number(response.finalprice) >= Number(point4)) {
                                    point = point + Number(earning2);
                                }

                                if (Number(response.finalprice) >= Number(point5) || Number(response.finalprice) >= Number(point6)) {
                                    point = point + Number(earning3);
                                }

                                if (Number(response.finalprice) >= Number(point7) || Number(response.finalprice) >= Number(point8)) {
                                    point = point + Number(earning4);
                                }

                                let where = {};
                                where["_id"] = response.user;
                                Users.findOne(where).then((customer_response) => {
                                    let cistomer_point = customer_response.subscription.point;

                                    let where = {};
                                    where["_id"] = response.user;
                                    Users.findOneAndUpdate(
                                        where,
                                        {
                                            subscription: {
                                                point: point + Number(cistomer_point),
                                            },
                                        },
                                        {
                                            new: true,
                                        }
                                    ).exec();

                                    let Walletdata = new Wallet({
                                        user: response.user,
                                        point: point,
                                        type: 1,
                                        note: "For order#" + response.orderid,
                                    });
                                    Walletdata.save(function () { });
                                });
                            });
                    }

                    let where = {};
                    where["orderid"] = req.body.orderid;
                    Checkout.findOneAndUpdate(
                        where,
                        {
                            gateway: req.body.gateway,
                            transactionid: req.body.transactionid,
                        },
                        {
                            new: true,
                        }
                    )
                        .exec()
                        .then(() => {
                            res.status(200).send({
                                status: "success",
                                message: "Payment data updated",
                            });
                        })
                        .catch(() => {
                            res.status(200).send({
                                status: "error",
                                message: "Something went wrong",
                            });
                        });
                });
        }
    },

    pickup_boy_order_start: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Checkout.findOneAndUpdate(
                where,
                {
                    status: "pickup_boy_started",
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    res.status(200).send({
                        status: "success",
                        message: "Picup boy journey started",
                    });
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                    });
                });
        }
    },

    razorpay_create_order: function (req, res) {
        // Users.deleteMany({ mobile: null }).then(function(){
        // //Users.deleteMany({ mobile: { $ne: "T2P-2021328824" } }).then(function(){
        // 	console.log("Data deleted"); // Success
        // }).catch(function(error){
        // 	console.log(error); // Failure
        // });

        //return;
        const instance = new Razorpay({
            key_id: "rzp_live_ZLgzjgdHBJDlP8",
            key_secret: "SGAmDJNT1a6UcNyuEQIFS1ag",
        });
        try {
            const options = {
                amount: (Number(req.body.amount) * 100).toFixed(0), // amount == Rs 10
                currency: "INR",
                receipt: req.body.order_id,
                payment_capture: 1,
                // 1 for automatic capture // 0 for manual capture
            };
            instance.orders.create(options, async function (err, order) {
                if (err) {
                    res.status(200).send({
                        status: "error",
                        message: err,
                    });
                }
                res.status(200).send({
                    status: "success",
                    result: order,
                });
                // return res.status(200).json();
            });
        } catch (err) {
            res.status(200).send({
                status: "error",
                message: err,
            });
        }
    },

    get_order_invoice: function (req, res) {
        let where = {};
        where["_id"] = req.query.id;
        Checkout.findOne(where)
            .populate("user")
            .populate("products.product")
            .populate("vendor")
            .populate("cargo_partner")
            .populate("delivery_partner")
            .populate("pickup_partner")
            .populate({
                path: "address",
                populate: [
                    {
                        path: "city",
                        model: "cities",
                        select: "name",
                    },
                ],
            })
            .then((response) => {
                let html_template =
                    "<!DOCTYPE html>" +
                    "<html>" +
                    "<head>" +
                    "    <title></title>" +
                    '    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
                    '    <meta name="viewport" content="width=device-width, initial-scale=1">' +
                    '    <meta http-equiv="X-UA-Compatible" content="IE=edge" />' +
                    '    <style type="text/css">' +
                    "        body," +
                    "        table," +
                    "        td," +
                    "        a {" +
                    "            -webkit-text-size-adjust: 100%;" +
                    "            -ms-text-size-adjust: 100%;" +
                    "        }" +
                    "        table," +
                    "        td {" +
                    "            mso-table-lspace: 0pt;" +
                    "            mso-table-rspace: 0pt;" +
                    "        }" +
                    "        img {" +
                    "            -ms-interpolation-mode: bicubic;" +
                    "        }" +
                    "        img {" +
                    "            border: 0;" +
                    "            height: auto;" +
                    "            line-height: 100%;" +
                    "            outline: none;" +
                    "            text-decoration: none;" +
                    "        }" +
                    "        table {" +
                    "            border-collapse: collapse !important;" +
                    "        }" +
                    "        body {" +
                    "            height: 100% !important;" +
                    "            margin: 0 !important;" +
                    "            padding: 0 !important;" +
                    "            width: 100% !important;" +
                    "        }" +
                    "        a[x-apple-data-detectors] {" +
                    "            color: inherit !important;" +
                    "            text-decoration: none !important;" +
                    "            font-size: inherit !important;" +
                    "            font-family: inherit !important;" +
                    "            font-weight: inherit !important;" +
                    "            line-height: inherit !important;" +
                    "        }" +
                    "        @media screen and (max-width: 480px) {" +
                    "            .mobile-hide {" +
                    "                display: none !important;" +
                    "            }" +
                    "            .mobile-center {" +
                    "                text-align: center !important;" +
                    "            }" +
                    "        }" +
                    '        div[style*="margin: 16px 0;"] {' +
                    "            margin: 0 !important;" +
                    "        }" +
                    "    </style>" +
                    '<body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">' +
                    '    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">' +
                    "        For what reason would it be advisable for me to think about business content? That might be little bit risky to have crew member like them." +
                    "    </div>" +
                    '    <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                    "        <tr>" +
                    '            <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">' +
                    '                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">' +
                    "                     " +
                    "                    <tr>" +
                    '                        <td align="center" style="padding: 35px 35px 20px 35px; background-color: #ffffff;" bgcolor="#ffffff">' +
                    '                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">' +
                    "                                <tr>" +
                    '                                    <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;"> <img src="https://tastes2plate.com/img/site-logo.png" width="125" height="120" style="display: block; border: 0px;" alt="tastes2plate" /><br>' +
                    '                                        <h2 style="font-size: 30px; font-weight: 800; line-height: 36px; color: #333333; margin: 0;"> Thank You For Your Order! </h2>' +
                    "                                    </td>" +
                    "                                </tr>" +
                    "                                <tr>" +
                    '                                    <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">' +
                    '                                        <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;"> Hi ' +
                    response.user.full_name +
                    ", <br/><br/> Just to let you know â€” we have received your <br/> order #" +
                    response.orderid +
                    ", and it is now being processed: <br/> </p>" +
                    "                                    </td>" +
                    "                                </tr>" +
                    "" +
                    "                                <tr>" +
                    '                                    <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">' +
                    '                                        <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;"> ORDER#' +
                    response.orderid +
                    " </p>" +
                    "                                    </td>" +
                    "                                </tr>" +
                    "" +
                    "                                <tr>" +
                    '                                    <td align="left" style="padding-top: 20px;">' +
                    '                                        <table cellspacing="0" cellpadding="0" border="0" width="100%">' +
                    "                                            <tr>" +
                    '                                                <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Items </td>' +
                    '                                                <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Price </td>' +
                    '                                                <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> QTY </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Price </td>' +
                    "                                            </tr>";

                let i;
                for (i = 0; i < response.products.length; i++) {
                    html_template = html_template + "                         <tr>" + '                                                <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;"> ' + response.products[i].productname + " </td>" + '                                                <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;"> ' + response.products[i].price / +response.products[i].quantity + " </td>" + '                                                <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;"> ' + response.products[i].quantity + " </td>" + '                                                <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;"> ' + response.products[i].price + " </td>" + "                                           </tr>";
                }

                html_template =
                    html_template +
                    " <tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Total </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response.price +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Shipping Price </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response.totalShippingPrice +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Packaging Price </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response.totalPackingPrice +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Total CGST </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response.totalCGST +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Total SGST </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response.totalSGST +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Total IGST </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response.totalIGST +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> Total IGST </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> ₹' +
                    response.totalIGST +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> Hot Food Delivery Charge </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> ₹' +
                    response?.hot_food_total_cost +
                    " </td>" +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> Tip Price </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> ₹' +
                    response?.tip_price +
                    " </td>" +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> Last Mile Long Distance Extra Delivery Charge </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> ₹' +
                    response?.last_mile_long_distance_extra_charge +
                    " </td>" +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Discount </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response.couponamount +
                    " </td>" +
                    "                                            	</tr>" +
                    "										</table>" +
                    "                                    </td>" +
                    "                                </tr>" +
                    "                                <tr>" +
                    '                                    <td align="left" style="padding-top: 20px;">' +
                    '                                        <table cellspacing="0" cellpadding="0" border="0" width="100%">' +
                    "                                            <tr>" +
                    '                                                <td width="75%" align="right" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;"> SUB TOTAL </td>' +
                    '                                                <td width="25%" align="right" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;"> ₹' +
                    response.finalprice +
                    " </td>" +
                    "                                            </tr>" +
                    "                                        </table>" +
                    "                                    </td>" +
                    "                                </tr>" +
                    "                            </table>" +
                    "                        </td>" +
                    "                    </tr>" +
                    "                    <tr>" +
                    '                        <td align="center" height="100%" valign="top" width="100%" style="padding: 0 35px 0px 35px; background-color: #ffffff;" bgcolor="#ffffff">' +
                    '                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px;">' +
                    "                                <tr>" +
                    '                                    <td align="center" valign="top" style="font-size:0;">' +
                    '                                        <div style="display:inline-block; max-width:50%; min-width:240px; vertical-align:top; width:100%;">' +
                    '                                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">' +
                    "                                                <tr>" +
                    '                                                    <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">' +
                    '                                                        <p style="font-weight: 800;">Delivery Address</p>' +
                    "                                                        <p> <strong>" +
                    response.address.title +
                    "</strong> <br/> " +
                    response.address.address +
                    " <br> " +
                    response.address.address2 +
                    "<br/>" +
                    response.address.city.name +
                    ", " +
                    response.address.pincode +
                    " <br/> Contact name: " +
                    response.address.contact_name +
                    " <br/>  Contact number: " +
                    response.address.contact_mobile +
                    " </p>" +
                    "                                                    </td>" +
                    "                                                </tr>" +
                    "                                            </table>" +
                    "                                        </div>" +
                    '                                        <div style="display:inline-block; max-width:50%; min-width:240px; vertical-align:top; width:100%;">' +
                    '                                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">' +
                    "                                                <tr>" +
                    '                                                    <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">' +
                    '                                                        <p style="font-weight: 800;">Estimated Delivery Date</p>' +
                    "                                                        <p>" +
                    moment(moment(response.delivery_date, "YYYY-MM-DD")).format("YYYY-MM-DD") +
                    " - " +
                    response.timeslot +
                    " </p>" +
                    "                                                    </td>" +
                    "                                                </tr>" +
                    "                                            </table>" +
                    "                                        </div>" +
                    "                                    </td>" +
                    "                                </tr>" +
                    "                            </table>" +
                    "                        </td>" +
                    "                    </tr>" +
                    '                   <tr><td style="padding: 35px; background-color: #ffffff; font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px;" bgcolor="#ffffff;">Thanks for using tastes2plate.com! <br/><br/> Please Pay digitally for all COD Orders and ask for QR code to make payment online from delivery man.  </td></tr>  ' +
                    "                    <tr>" +
                    '                        <td align="center" style="padding: 35px; background-color: #ffffff;" bgcolor="#ffffff">' +
                    '                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">' +
                    "                                 " +
                    "                                <tr>" +
                    '                                    <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; padding: 5px 0 10px 0;">' +
                    '                                        <img src="https://tastes2plate.com/img/phone_pay.png" style="border:none;display:inline-block;font-size:14px;font-weight:bold;outline:none;text-decoration:none;text-transform:capitalize;vertical-align:middle;margin-right:10px;width:200px;"> <br/> <p style="font-size: 14px; font-weight: 800; line-height: 18px; color: #333333;"> ' +
                    "                                        tastes2plate.com <br/>" +
                    "                                        Charabuni Services Pvt Ltd, 811 QUBE <br/>" +
                    "                                        Near City Center II New Town <br/>Kolkata 700156" +
                    "                                        </p>" +
                    "                                    </td>" +
                    "                                </tr>" +
                    "                                " +
                    "                            </table>" +
                    "                        </td>" +
                    "                    </tr>" +
                    "                </table>" +
                    "            </td>" +
                    "        </tr>" +
                    "    </table>" +
                    "</body>" +
                    "</html>";

                res.status(200).send({
                    result: html_template,
                });
            });
    },

    pickup_earnings: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["pickup_partner"] = req.query.id;
            Checkout.find(where, null, {
                limit: Number(req.query.per_page),
                skip: Number(req.query.page),
            })
                .select("pickup_partner_commission orderid total_weight created_date")
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    Checkout.find(where).countDocuments(function (err, count) {
                        Checkout.aggregate([
                            {
                                $match: {
                                    pickup_partner: mongoose.Types.ObjectId(req.query.id),
                                },
                            },
                            {
                                $group: {
                                    _id: "_id",
                                    totalValue: {
                                        $sum: "$pickup_partner_commission",
                                    },
                                },
                            },
                        ]).then((sum_res) => {
                            let result = [];
                            let i;
                            for (i = 0; i < response.length; i++) {
                                result.push({
                                    orderid: response[i].orderid,
                                    commission: response[i].pickup_partner_commission ? response[i].pickup_partner_commission : 0,
                                    total_weight: response[i].total_weight,
                                    _id: response[i]._id,
                                    created_date: response[i].created_date,
                                });
                            }

                            res.status(200).send({
                                status: "success",
                                result: result,
                                message: "",
                                count: count,
                                sum: sum_res[0].totalValue,
                            });
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    cargo_earnings: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["cargo_partner"] = req.query.id;
            Checkout.find(where, null, {
                limit: Number(req.query.per_page),
                skip: Number(req.query.page),
            })
                .select("cargo_partner_commission orderid total_weight created_date")
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    Checkout.find(where).countDocuments(function (err, count) {
                        Checkout.aggregate([
                            {
                                $match: {
                                    cargo_partner: mongoose.Types.ObjectId(req.query.id),
                                },
                            },
                            {
                                $group: {
                                    _id: "_id",
                                    totalValue: {
                                        $sum: "$cargo_partner_commission",
                                    },
                                },
                            },
                        ]).then((sum_res) => {
                            let result = [];
                            let i;
                            for (i = 0; i < response.length; i++) {
                                result.push({
                                    orderid: response[i].orderid,
                                    commission: response[i].cargo_partner_commission ? response[i].cargo_partner_commission : 0,
                                    total_weight: response[i].total_weight,
                                    _id: response[i]._id,
                                    created_date: response[i].created_date,
                                });
                            }

                            res.status(200).send({
                                status: "success",
                                result: result,
                                message: "",
                                count: count,
                                sum: sum_res[0].totalValue,
                            });
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    delivery_earnings: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["delivery_partner"] = req.query.id;
            Checkout.find(where, null, {
                limit: Number(req.query.per_page),
                skip: Number(req.query.page),
            })
                .select("deliverypartner_commission orderid total_weight created_date")
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    Checkout.find(where).countDocuments(function (err, count) {
                        Checkout.aggregate([
                            {
                                $match: {
                                    delivery_partner: mongoose.Types.ObjectId(req.query.id),
                                },
                            },
                            {
                                $group: {
                                    _id: "_id",
                                    totalValue: {
                                        $sum: "$delivery_partner_commission",
                                    },
                                },
                            },
                        ]).then((sum_res) => {
                            let result = [];
                            let i;
                            for (i = 0; i < response.length; i++) {
                                result.push({
                                    orderid: response[i].orderid,
                                    commission: response[i].delivery_partner_commission ? response[i].delivery_partner_commission : 0,
                                    total_weight: response[i].total_weight,
                                    _id: response[i]._id,
                                    created_date: response[i].created_date,
                                });
                            }

                            res.status(200).send({
                                status: "success",
                                result: result,
                                message: "",
                                count: count,
                                sum: sum_res[0] ? sum_res[0].totalValue : 0,
                            });
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    order_updates: function (req, res) {
        let where = {};
        where["order"] = req.query.id;
        OrderNote.find(where)
            .sort({
                created_date: -1,
            })
            .then((response) => {
                // Set the configuration for your app
                // TODO: Replace with your project's config object
                let config = {
                    apiKey: "AIzaSyBBjM-pHA9jtke6FEm7lZhJGz5t0FMWWMQ",
                    authDomain: "taste2plate-1be43.firebaseapp.com",
                    databaseURL: "https://taste2plate-1be43-default-rtdb.firebaseio.com",
                    projectId: "taste2plate-1be43",
                    storageBucket: "taste2plate-1be43.appspot.com",
                    messagingSenderId: "569149647523",
                    appId: "1:569149647523:web:d45b4e84541e550344ed16",
                    measurementId: "G-JXJ8SYTZ2W",
                };
                //firebase.initializeApp(config);
                if (!firebase.apps.length) {
                    firebase.initializeApp(config);
                }

                // Get a reference to the database service
                let database = firebase.database();

                database
                    .ref("/")
                    .once("value")
                    .then(function (snapshot) {
                        let result = snapshot.val();
                        let order_id = req.query.id;

                        res.status(200).send({
                            status: "success",
                            result: response,
                            message: "",
                            position: result["userlocation" + order_id] ? result["userlocation" + order_id] : {},
                        });
                    });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    result: [],
                });
            });
    },

    bulk_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let bulkorderdata = new BulkOrder({
                name: req.body.name,
                city: req.body.city,
                address: req.body.address,
                mobile: req.body.mobile,
                email: req.body.email,
                message: req.body.msg,
            });

            bulkorderdata.save(function (err, response) {
                if (err) {
                    res.status(200).send({
                        status: "error",
                        message: err,
                        token: req.token,
                    });
                } else {
                    let msg9 = "There is a Bulk Order requirement from " + req.body.name + " and mobile number of customer is " + req.body.mobile + ". Tastes2plate";
                    axios
                        .get("https://omst5afyma.execute-api.ap-south-1.amazonaws.com/production/admin/send_email_template?email=support@tastes2plate.com&msg=" + encodeURI(msg9), {})
                        .then(function () {
                            //console.log(response.data);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });

                    gen_custom_sms("6290226765", msg9);

                    res.status(200).send({
                        status: "success",
                        message: "data saved.",
                        data: response,
                    });
                }
            });
        }
    },

    employee_status_chnage: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.user;
            Users.findOne(where)
                .then((response) => {
                    if (response == null) {
                        res.status(200).send({
                            status: "error",
                            message: "User not found",
                            token: req.token,
                        });
                    } else {
                        if (response.active == 0) {
                            let active = 1;
                        } else {
                            let active = 0;
                        }
                        Users.findOneAndUpdate(
                            where,
                            {
                                active: active,
                            },
                            {
                                new: true,
                            }
                        )
                            .exec()
                            .then(() => {
                                res.status(200).send({
                                    status: "success",
                                    message: "Status updated",
                                    token: req.token,
                                    active: active,
                                });
                            })
                            .catch(() => {
                                res.status(200).send({
                                    status: "error",
                                    message: "Something went wrong",
                                    token: req.token,
                                });
                            });
                    }
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                        token: req.token,
                    });
                });
        }
    },

    upload_doc1: function (req, res) {
        upload_local(req, res, function (error) {
            if (error) {
                res.status(200).send({
                    status: "error",
                    message: error.code,
                    //token: req.token,
                });
            } else {
                let where = {};
                where["_id"] = req.body.id;
                Users.findOne(where).then(() => {
                   
                    if (req.files[0]) {
                        let where = {};
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
                        where["_id"] = req.body.id;
                        Users.findOneAndUpdate(
                            where,
                            {
                                doc1: image_data.location,
                                doc1_type: req.body.doc1_type,
                                update_date: moment().format(),
                            },
                            {
                                new: true,
                            }
                        )
                            .exec()
                            .then(() => {
                                res.status(200).send({
                                    status: "success",
                                    message: "Doc 1 has been updated",
                                    doc: image_data.location,
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    doc: "",
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "error",
                            message: "Select image",
                            doc: "",
                        });
                    }
                });
            }
        });
    },

    upload_doc2: function (req, res) {
        upload_local(req, res, function (error) {
            if (error) {
                res.status(200).send({
                    status: "error",
                    message: error.code,
                    //token: req.token,
                });
            } else {
                let where = {};
                where["_id"] = req.body.id;
                Users.findOne(where).then(() => {
                   

                    if (req.files[0]) {
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

                        let where = {};
                        where["_id"] = req.body.id;
                        Users.findOneAndUpdate(
                            where,
                            {
                                doc2: image_data.location,
                                doc2_type: req.body.doc2_type,
                                update_date: moment().format(),
                            },
                            {
                                new: true,
                            }
                        )
                            .exec()
                            .then(() => {
                                res.status(200).send({
                                    status: "success",
                                    message: "Doc 2 has been updated",
                                    doc: image_data.location,
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    doc: "",
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "error",
                            message: "Select image",
                            doc: "",
                        });
                    }
                });
            }
        });
    },

    upload_doc3: function (req, res) {
        upload_local(req, res, function (error) {
            if (error) {
                res.status(200).send({
                    status: "error",
                    message: error.code,
                    //token: req.token,
                });
            } else {
                let where = {};
                where["_id"] = req.body.id;
                Users.findOne(where).then(() => {
                   
                    if (req.files[0]) {
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

                        let where = {};
                        where["_id"] = req.body.id;
                        Users.findOneAndUpdate(
                            where,
                            {
                                doc3: image_data.location,
                                doc3_type: req.body.doc3_type,
                                update_date: moment().format(),
                            },
                            {
                                new: true,
                            }
                        )
                            .exec()
                            .then(() => {
                                res.status(200).send({
                                    status: "success",
                                    message: "Doc 3 has been updated",
                                    doc: image_data.location,
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    doc: "",
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "error",
                            message: "Select image",
                            doc: "",
                        });
                    }
                });
            }
        });
    },

    update_profile_image2: function (req, res) {
        upload_local(req, res, function (error) {
            if (error) {
                res.status(200).send({
                    status: "error",
                    message: error.code,
                    //token: req.token,
                });
            } else {
                let where = {};
                where["_id"] = req.body.id;
                Users.findOne(where).then(() => {
                    
                    if (req.files[0]) {
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

                        let where = {};
                        where["_id"] = req.body.id;
                        Users.findOneAndUpdate(
                            where,
                            {
                                profile_image: image_data.location,
                                update_date: moment().format(),
                            },
                            {
                                new: true,
                            }
                        )
                            .exec()
                            .then(() => {
                                res.status(200).send({
                                    status: "success",
                                    message: "Profile image has been updated",
                                    doc: image_data.location,
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    doc: "",
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "error",
                            message: "Select image",
                            doc: "",
                        });
                    }
                });
            }
        });
    },

    lp_manager_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.query.id;
            Users.findOne(where)
                .select("lp_manager")
                .populate("lp_manager")
                .then((response) => {
                    res.status(200).send({
                        status: "success",
                        token: req.token,
                        result: response,
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },


    lp_manager_delivery_partner: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.query.id;
            Users.findOne(where)
                .select("delivery_boy")
                .populate("delivery_boy")
                .then((response) => {
                    res.status(200).send({
                        status: "success",
                        token: req.token,
                        result: response,
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },


    lp_head_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");
            if (req.query.lp_head != "") {
                // let lp_manager_list = [];
                let delivery_partner_list = [];
                let where = {};
                where["_id"] = req.query.lp_head;
                Users.findOne(where).populate('lp_manager').then((response) => {
                    if (response?.user_type == 'lp_head') {
                        let where = {};
                        let i;
                        if (response) {
                            for (i = 0; i < response.lp_manager.length; i++) {
                                // lp_manager_list.push(mongoose.Types.ObjectId(response.lp_manager[i]._id));
                                delivery_partner_list.push(...response.lp_manager[i].delivery_boy.map(id => mongoose.Types.ObjectId(id)));

                            }
                        }

                        // where["lp_manager"] = { $in: lp_manager_list };
                        where["delivery_partner"] = { $in: delivery_partner_list };
                        where["delivery_date"] = {
                            $gte: today.toDate(),
                            $lt: tmoment(tomorrow).endOf("day").toDate(),
                        };

                        where["$or"] = [
                            {
                                status: "waiting_vendor_approval",
                            },
                            {
                                status: "vendor_approved",
                            },
                            {
                                status: "ready_pickup",
                            },
                            {
                                status: "pickup_boy_assigned",
                            },
                            {
                                status: "pickup_boy_started",
                            },
                            {
                                status: "delivered_to_cargo_partner",
                            },
                            {
                                status: "cargo_off_loaded",
                            },
                            {
                                status: "cargo_delivery_started",
                            },

                            {
                                status: "received_destination_airport",
                            },
                            {
                                status: "delivered_to_delivery_partner",
                            },
                            {
                                status: "delivery_boy_assigned",
                            },
                            {
                                status: "delivery_boy_started",
                            },
                        ];

                        //console.log(where);
                        Checkout.find(where, null, {})
                            .populate("user")
                            .populate("products.product")
                            .populate("vendor")
                            .populate("cargo_partner")
                            .populate("delivery_partner")
                            .populate("pickup_partner")
                            .populate("pickup_boy")
                            .populate("delivery_boy")
                            .populate("lp_manager")
                            .populate("lp_head")
                            .populate({
                                path: "address",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .sort({
                                created_date: -1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    result: response,
                                    message: "",
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });

                    } else {
                        res.status(200).send({
                            status: "Lp head not exist !!",
                            token: req.token,
                        });
                    }
                });
            } else {
                res.status(200).send({
                    status: "Please send lp_manager key !!",
                    token: req.token,
                });
            }
        }
    },
    lp_head_pickup_partner_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");
            if (req.query.lp_head) {
                let pickup_partner_list = [];
                let lp_manager_list = [];
                let where = {};
                where["_id"] = req.query.lp_head;
                Users.findOne(where).populate('lp_manager').then(async (response) => {
                    if (response?.user_type == 'lp_head') {
                        if (response) {
                            for (let i = 0; i < response.lp_manager.length; i++) {
                                lp_manager_list.push(mongoose.Types.ObjectId(response.lp_manager[i]._id));
                                pickup_partner_list.push(...response.lp_manager[i].delivery_boy.map(id => mongoose.Types.ObjectId(id)));

                            }
                        }

                        if (req.query.lp_manager) {
                            let found = false;
                            for (let i = 0; i < lp_manager_list.length; i++) {
                                if (String(lp_manager_list[i]) == req.query.lp_manager) {
                                    found = true;
                                    break;

                                }
                            }
                            if (!found) {
                                return res.status(200).send({
                                    status: "error",
                                    message: "Lp Manager does not exist in that lp head",
                                    result: [],
                                });
                            } else {
                                pickup_partner_list = [];
                                await Users.findOne({ _id: req.query.lp_manager }).then((response) => {
                                    if (response) {
                                        pickup_partner_list.push(...response.delivery_boy.map(id => mongoose.Types.ObjectId(id)));
                                    }

                                });

                            }



                        }
                        let where = {};

                        where["pickup_partner"] = { $in: pickup_partner_list };



                        if (req.query.pickup_partner) {

                            let found = false;
                            for (let i = 0; i < pickup_partner_list.length; i++) {
                                if (String(pickup_partner_list[i]) == req.query.pickup_partner) {
                                    found = true;
                                    break;

                                }
                            }
                            if (!found) {
                                return res.status(200).send({
                                    status: "error",
                                    message: "Pickup partner does not exist in that lp head",
                                    result: [],
                                });
                            } else {
                                where["pickup_partner"] = req.query.pickup_partner;
                            }
                        }



                        where["delivery_date"] = {
                            $gte: today.toDate(),
                            $lt: tmoment(tomorrow).endOf("day").toDate(),
                        };

                        where["status"] = {
                            $nin: [
                                "delivered",
                                "pending_payment",
                                "declined_vendor",
                                "rejected_customer",
                                "refunded",
                                "failed",
                                "cancel",
                                "on_hold",

                                "delivered_to_cargo_partner",
                                "cargo_off_loaded",
                                "cargo_delivery_started",
                                "received_destination_airport",
                                "delivered_to_delivery_partner",
                                "delivery_boy_assigned",
                                "delivery_boy_started",

                            ],
                        };

                        if (req.query.order_city && req.query.order_city != "") {
                            where["order_city"] = req.query.order_city;
                        }

                        Checkout.find(where, null, {})
                            .populate("user")
                            .populate("products.product")
                            .populate("vendor")
                            .populate("cargo_partner")
                            .populate("delivery_partner")
                            .populate("pickup_partner")
                            .populate("pickup_boy")
                            .populate("delivery_boy")
                            .populate("lp_manager")
                            .populate("lp_head")
                            .populate({
                                path: "address",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .sort({
                                created_date: -1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    result: response,
                                    message: "",
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "Lp head not exist !!",
                            token: req.token,
                        });
                    }
                });
            } else {
                res.status(200).send({
                    status: "Please send lp_head key!!",
                    token: req.token,
                });
            }
        }
    },
    lp_head_delivery_partner_order_list: async function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");
            if (req.query.lp_head) {
                let delivery_partner_list = [];
                let lp_manager_list = [];
                let where = {};
                where["_id"] = req.query.lp_head;
                Users.findOne(where).populate('lp_manager').then(async (response) => {
                    if (response?.user_type == 'lp_head') {
                        let where = {};
                        if (response) {
                            for (let i = 0; i < response.lp_manager.length; i++) {
                                lp_manager_list.push(mongoose.Types.ObjectId(response.lp_manager[i]._id));
                                delivery_partner_list.push(...response.lp_manager[i].delivery_boy.map(id => mongoose.Types.ObjectId(id)));

                            }
                        }
                        if (req.query.lp_manager) {
                            let found = false;
                            for (let i = 0; i < lp_manager_list.length; i++) {
                                if (String(lp_manager_list[i]) == req.query.lp_manager) {
                                    found = true;
                                    break;

                                }
                            }
                            if (!found) {
                                return res.status(200).send({
                                    status: "error",
                                    message: "Lp Manager does not exist in that lp head",
                                    result: [],
                                });
                            } else {
                                delivery_partner_list = [];
                                await Users.findOne({ _id: req.query.lp_manager }).then((response) => {
                                    if (response) {
                                        delivery_partner_list.push(...response.delivery_boy.map(id => mongoose.Types.ObjectId(id)));
                                    }

                                });

                            }



                        }
                         where = {};

                        where["delivery_partner"] = { $in: delivery_partner_list };


                        if (req.query.delivery_partner) {
                            let found = false;
                            for (let i = 0; i < delivery_partner_list.length; i++) {
                                if (String(delivery_partner_list[i]) == req.query.delivery_partner) {
                                    found = true;
                                    break;

                                }
                            }
                            if (!found) {
                                return res.status(200).send({
                                    status: "error",
                                    message: "Delivery partner does not exist in that lp head",
                                    result: [],
                                });
                            } else {
                                where["delivery_partner"] = req.query.delivery_partner;
                            }
                        }



                        where["delivery_date"] = {
                            $gte: today.toDate(),
                            $lt: tmoment(tomorrow).endOf("day").toDate(),
                        };

                        where["$or"] = [
                            {
                                status: "waiting_vendor_approval",
                            },
                            {
                                status: "vendor_approved",
                            },
                            {
                                status: "ready_pickup",
                            },
                            {
                                status: "pickup_boy_assigned",
                            },
                            {
                                status: "pickup_boy_started",
                            },
                            {
                                status: "delivered_to_cargo_partner",
                            },
                            {
                                status: "cargo_off_loaded",
                            },
                            {
                                status: "cargo_delivery_started",
                            },

                            {
                                status: "received_destination_airport",
                            },
                            {
                                status: "delivered_to_delivery_partner",
                            },
                            {
                                status: "delivery_boy_assigned",
                            },
                            {
                                status: "delivery_boy_started",
                            },
                        ];

                        if (req.query.order_city && req.query.order_city != "") {
                            where["vendor_city"] = req.query.order_city;
                        }
                        //console.log(where);
                        Checkout.find(where, null, {})
                            .populate("user")
                            .populate("products.product")
                            .populate("vendor")
                            .populate("cargo_partner")
                            .populate("delivery_partner")
                            .populate("pickup_partner")
                            .populate("pickup_boy")
                            .populate("delivery_boy")
                            .populate("lp_manager")
                            .populate("lp_head")
                            .populate({
                                path: "address",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .sort({
                                created_date: -1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    result: response,
                                    message: "",
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });



                    } else {
                        res.status(200).send({
                            status: "Lp head not exist !!",
                            token: req.token,
                        });
                    }
                });
            } else {
                res.status(200).send({
                    status: "Please send lp_head key !!",
                    token: req.token,
                });
            }
        }
    },
    lp_manager_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");
            if (req.query.lp_manager) {
                let delivery_partner_list = [];
                let where = {};
                where["_id"] = req.query.lp_manager;
                Users.findOne(where).then((response) => {
                    if (response?.user_type == 'lp_manager') {
                        let where = {};
                        if (response) {
                            delivery_partner_list.push(...response.delivery_boy.map(id => mongoose.Types.ObjectId(id)));
                        }


                        where["delivery_partner"] = { $in: delivery_partner_list };
                        where["delivery_date"] = {
                            $gte: today.toDate(),
                            $lt: tmoment(tomorrow).endOf("day").toDate(),
                        };

                        where["$or"] = [
                            {
                                status: "waiting_vendor_approval",
                            },
                            {
                                status: "vendor_approved",
                            },
                            {
                                status: "ready_pickup",
                            },
                            {
                                status: "pickup_boy_assigned",
                            },
                            {
                                status: "pickup_boy_started",
                            },
                            {
                                status: "delivered_to_cargo_partner",
                            },
                            {
                                status: "cargo_off_loaded",
                            },
                            {
                                status: "cargo_delivery_started",
                            },

                            {
                                status: "received_destination_airport",
                            },
                            {
                                status: "delivered_to_delivery_partner",
                            },
                            {
                                status: "delivery_boy_assigned",
                            },
                            {
                                status: "delivery_boy_started",
                            },
                        ];

                        //console.log(where);
                        Checkout.find(where, null, {})
                            .populate("user")
                            .populate("products.product")
                            .populate("vendor")
                            .populate("cargo_partner")
                            .populate("delivery_partner")
                            .populate("pickup_partner")
                            .populate("pickup_boy")
                            .populate("delivery_boy")
                            .populate("lp_manager")
                            .populate("lp_head")
                            .populate({
                                path: "address",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .sort({
                                created_date: -1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    result: response,
                                    message: "",
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "Lp manager not exist !!",
                            token: req.token,
                        });
                    }
                });
            } else {
                res.status(200).send({
                    status: "Please send lp_manager key !!",
                    token: req.token,
                });
            }
        }
    },
    lp_manager_delivery_partner_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");
            if (req.query.lp_manager != "") {
                let delivery_partner_list = [];
                let where = {};
                where["_id"] = req.query.lp_manager;
                Users.findOne(where).then((response) => {
                    if (response?.user_type == 'lp_manager') {
                        let where = {};
                        if (response) {
                            delivery_partner_list.push(...response.delivery_boy.map(id => mongoose.Types.ObjectId(id)));
                        }
                        where["delivery_partner"] = { $in: delivery_partner_list };


                        if (req.query.delivery_partner) {
                            let found = false;
                            for (let i = 0; i < delivery_partner_list.length; i++) {
                                if (String(delivery_partner_list[i]) == req.query.delivery_partner) {
                                    found = true;
                                    break;

                                }
                            }
                            if (!found) {
                                return res.status(200).send({
                                    status: "error",
                                    message: "Delivery partner does not exist in that lp manager",
                                    result: [],
                                });
                            } else {
                                where["delivery_partner"] = req.query.delivery_partner;
                            }
                        }



                        where["delivery_date"] = {
                            $gte: today.toDate(),
                            $lt: tmoment(tomorrow).endOf("day").toDate(),
                        };

                        where["$or"] = [
                            {
                                status: "waiting_vendor_approval",
                            },
                            {
                                status: "vendor_approved",
                            },
                            {
                                status: "ready_pickup",
                            },
                            {
                                status: "pickup_boy_assigned",
                            },
                            {
                                status: "pickup_boy_started",
                            },
                            {
                                status: "delivered_to_cargo_partner",
                            },
                            {
                                status: "cargo_off_loaded",
                            },
                            {
                                status: "cargo_delivery_started",
                            },

                            {
                                status: "received_destination_airport",
                            },
                            {
                                status: "delivered_to_delivery_partner",
                            },
                            {
                                status: "delivery_boy_assigned",
                            },
                            {
                                status: "delivery_boy_started",
                            },
                        ];

                        if (req.query.order_city && req.query.order_city != "") {
                            where["vendor_city"] = req.query.order_city;
                        }

                        //console.log(where);
                        Checkout.find(where, null, {})
                            .populate("user")
                            .populate("products.product")
                            .populate("vendor")
                            .populate("cargo_partner")
                            .populate("delivery_partner")
                            .populate("pickup_partner")
                            .populate("pickup_boy")
                            .populate("delivery_boy")
                            .populate("lp_manager")
                            .populate("lp_head")
                            .populate({
                                path: "address",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .sort({
                                created_date: -1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    result: response,
                                    message: "",
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "Lp manager not exist !!",
                            token: req.token,
                        });
                    }
                });
            } else {
                res.status(200).send({
                    status: "Please send lp_manager key !!",
                    token: req.token,
                });
            }
        }
    },
    lp_manager_pickup_partner_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");
            if (req.query.lp_manager) {
                let pickup_partner_list = [];
                let where = {};
                where["_id"] = req.query.lp_manager;
                Users.findOne(where).then((response) => {
                    if (response?.user_type == 'lp_manager') {
                        let where = {};
                        if (response) {
                            pickup_partner_list.push(...response.delivery_boy.map(id => mongoose.Types.ObjectId(id)));
                        }
                        where["pickup_partner"] = { $in: pickup_partner_list };

                        if (req.query.pickup_partner) {
                            let found = false;
                            for (let i = 0; i < pickup_partner_list.length; i++) {
                                if (String(pickup_partner_list[i]) == req.query.pickup_partner) {
                                    found = true;
                                    break;

                                }
                            }
                            if (!found) {
                                return res.status(200).send({
                                    status: "error",
                                    message: "Pickup partner does not exist in that lp manager",
                                    result: [],
                                });
                            } else {
                                where["pickup_partner"] = req.query.pickup_partner;
                            }
                        }



                        where["delivery_date"] = {
                            $gte: today.toDate(),
                            $lt: tmoment(tomorrow).endOf("day").toDate(),
                        };

                        where["status"] = {
                            $nin: [
                                "delivered",
                                "pending_payment",
                                "declined_vendor",
                                "rejected_customer",
                                "refunded",
                                "failed",
                                "cancel",
                                "on_hold",

                                "delivered_to_cargo_partner",
                                "cargo_off_loaded",
                                "cargo_delivery_started",
                                "received_destination_airport",
                                "delivered_to_delivery_partner",
                                "delivery_boy_assigned",
                                "delivery_boy_started",

                            ],
                        };
                        if (req.query.order_city && req.query.order_city != "") {
                            where["order_city"] = req.query.order_city;
                        }

                        Checkout.find(where, null, {})
                            .populate("user")
                            .populate("products.product")
                            .populate("vendor")
                            .populate("cargo_partner")
                            .populate("delivery_partner")
                            .populate("pickup_partner")
                            .populate("pickup_boy")
                            .populate("delivery_boy")
                            .populate("lp_manager")
                            .populate("lp_head")
                            .populate({
                                path: "address",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .sort({
                                created_date: -1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    result: response,
                                    message: "",
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "Lp manager not exist !!",
                            token: req.token,
                        });
                    }
                });
            } else {
                res.status(200).send({
                    status: "Please send lp_manager key !!",
                    token: req.token,
                });
            }
        }
    },

    delivery_boy_earning: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.query.id;
            Users.findOne(where).then((user_response) => {
                let where = {};
                where["delivery_boy"] = req.query.id;
                Checkout.find(where, null, {
                    limit: Number(req.query.limit),
                    skip: Number(req.query.page),
                })
                    .select("distance orderid total_weight created_date paid")
                    .sort({
                        created_date: -1,
                    })
                    .then((response) => {
                        Checkout.find(where).countDocuments(function (err, count) {
                            Checkout.aggregate([
                                {
                                    $match: {
                                        delivery_partner: mongoose.Types.ObjectId(req.query.id),
                                    },
                                },
                                {
                                    $group: {
                                        _id: "_id",
                                        totalValue: {
                                            $sum: "$distance",
                                        },
                                    },
                                },
                            ]).then((sum_res) => {
                                let result = [];
                                let i;
                                for (i = 0; i < response.length; i++) {
                                    let price_per_kg = user_response.price_per_kg;

                                    result.push({
                                        active: response[i].paid,
                                        orderid: response[i].orderid,
                                        commission: Number(price_per_kg) * Number(response[i].distance),
                                        distance: response[i].distance,
                                        _id: response[i]._id,
                                        created_date: response[i].created_date,
                                    });
                                }

                                res.status(200).send({
                                    status: "success",
                                    result: result,
                                    message: "",
                                    count: count,
                                    sum: sum_res[0] ? sum_res[0].totalValue : 0,
                                });
                            });
                        });
                    })
                    .catch((error) => {
                        res.status(200).send({
                            status: "error",
                            message: error,
                            result: [],
                        });
                    });
            });
        }
    },

    update_qr_select: function (req, res) {
        let orders = req.body.orders.split(",");
        Checkout.updateMany({ _id: { $in: orders } }, { $set: { bundle_qr: 0 } })
            .exec()
            .then(() => {
                res.status(200).send({
                    status: "success",
                    message: "Order QR status updated updated.",
                    //token: req.token,
                });
            });
    },

    financial_log: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.query.id;
            Users.findOne(where).then((user_response) => {
                let where = {};
                if (req.query.type == "delivery_boy") {
                    where["delivery_boy"] = req.query.id;
                }

                if (req.query.type == "pickup_boy") {
                    where["pickup_boy"] = req.query.id;
                }

                if (req.query.type == "cargo_partner") {
                    where["cargo_partner"] = req.query.id;
                }

                if (req.query.type == "pickup_partner") {
                    where["pickup_partner"] = req.query.id;
                }

                if (req.query.type == "delivery_partner") {
                    where["delivery_partner"] = req.query.id;
                }

                Checkout.find(where, null, {
                    limit: Number(req.query.limit),
                    skip: Number(req.query.page),
                })
                    .select("distance orderid total_weight created_date paid")
                    .sort({
                        created_date: -1,
                    })
                    .then((response) => {
                        //console.log(response);
                        Checkout.find(where).countDocuments(function (err, count) {
                            where["paid"] = 0;
                            Checkout.aggregate([
                                {
                                    $match: where,
                                },
                                {
                                    $group: {
                                        _id: "_id",
                                        totalValue: {
                                            $sum: "$distance",
                                        },
                                    },
                                },
                            ]).then((sum_res) => {
                                where["paid"] = 1;
                                Checkout.aggregate([
                                    {
                                        $match: where,
                                    },
                                    {
                                        $group: {
                                            _id: "_id",
                                            totalValue: {
                                                $sum: "$distance",
                                            },
                                        },
                                    },
                                ]).then((sum_paid) => {
                                    let result = [];
                                    let i;
                                    for (i = 0; i < response.length; i++) {
                                        let price_per_kg = user_response.price_per_kg;
                                        let rate_per_km = user_response.rate_per_km;
                                        let monthly_fixed_cost = user_response.monthly_fixed_cost;
                                        let distance = response.distance;

                                        let total_commission = Number(price_per_kg) * Number(response[i].total_weight) + Number(price_per_kg) + Number(rate_per_km) * Number(distance) + Number(monthly_fixed_cost);
                                        if (response[i].gateway == "COD") {
                                            total_commission = total_commission + Number(response[i].cod_order_cost) + Number(response[i].additional_cost1) + Number(response[i].additional_cost2);
                                        }

                                        result.push({
                                            active: response[i].paid,
                                            orderid: response[i].orderid,
                                            commission: total_commission ? total_commission : 0,
                                            distance: response[i].distance,
                                            _id: response[i]._id,
                                            created_date: response[i].created_date,
                                        });
                                    }

                                    res.status(200).send({
                                        status: "success",
                                        result: result,
                                        message: "",
                                        count: count,
                                        sum: sum_res[0] ? sum_res[0].totalValue : 0,
                                        paid: sum_paid[0] ? sum_paid[0].totalValue : 0,
                                    });
                                });
                            });
                        });
                    })
                    .catch((error) => {
                        res.status(200).send({
                            status: "error",
                            message: error,
                            result: [],
                        });
                    });
            });
        }
    },

    send_payment_link: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.query.id;
            Checkout.findOne(where)
                .populate("user")
                .populate("delivery_boy")
                .then((response) => {
                    let mobile = response.user.mobile;
                    let email = response.user.email;
                    let db_name = response.delivery_boy != null ? response.delivery_boy.full_name : "N/A";

                    let payload = {
                        merchantId: "CHARABUNISERVICESRAJARHAT",
                        transactionId: response.orderid,
                        merchantOrderId: response.orderid,
                        amount: Number(response.finalprice),
                        //mobileNumber: "8442922399",
                        expiresIn: 180,
                    };

                    let x_verify = sha256(base64.stringify(utf8.parse(JSON.stringify(payload))) + "/v3/payLink/init" + "13fea9fa-6983-47c7-9d54-8bb70bbfcf70") + "###" + 1;

                    const url = "https://mercury-uat.phonepe.com/v3/payLink/init";
                    const options = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-VERIFY": x_verify,
                        },
                        body: JSON.stringify({
                            request: base64.stringify(utf8.parse(JSON.stringify(payload))),
                        }),
                    };
                    fetch(url, options)
                        .then((res) => res.json())
                        .then((json) => {
                            let payLink = json.data.payLink;

                            if (payLink) {
                                let msg9 = "DEAR CUSTOMER, DELIVERY BOY " + db_name + " IS OUT-FOR-DELIVERY OF YOUR ORDER NO " + response.orderid + ". YOU CAN DO PAYMENT ONLINE USING THIS LINK " + payLink + ". REGARDS, TASTES2PLATE (T2P) CUSTOMER SUPPORT TEAM";

                                axios
                                    .get("https://omst5afyma.execute-api.ap-south-1.amazonaws.com/production/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg9), {})
                                    .then(function () {
                                        //console.log(response.data);
                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                    });

                                gen_custom_sms(mobile, msg9);

                                res.status(200).send({
                                    status: "success",
                                    message: "Payment link sent",
                                });
                            } else {
                                res.status(200).send({
                                    status: "error",
                                    message: "Payment not link sent",
                                });
                            }
                        })
                        .catch((err) => console.error("error:" + err));
                });
        }
    },

    send_map_link: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.query.id;
            Checkout.findOne(where)
                .populate("user")
                .populate("delivery_boy")
                .then((response) => {
                    let db_name = response.delivery_boy != null ? response.delivery_boy.full_name : "N/A";
                    let db_mobile = response.delivery_boy ? response.delivery_boy.mobile : "N/A";
                    let full_name = response.user ? response.user.full_name : "N/A";
                    if (full_name == "") {
                        full_name = "N/A";
                    }
                    GenURL(response._id).then(function (url_result) {
                        let msg12 = "DEAR " + full_name + ", DELIVERY BOY " + db_name + " IS OUT FOR DELIVERY OF YOUR ORDER NO " + response.orderid + " WITH TASTES2PLATE; HIS MOBILE NUMBER IS " + db_mobile + ". NOW, YOU CAN TRACK " + url_result + " THE DELIVERY BOY. REGARDS, TASTES2PLATE (T2P) CUSTOMER SUPPORT TEAM";
                        //console.log(msg12);
                        gen_custom_sms(response.user.mobile, msg12);
                    });

                    res.status(200).send({
                        status: "success",
                        message: "Map link sent",
                    });
                });
        }
    },

    vendor_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");

            where["delivery_date"] = {
                $gte: today.toDate(),
                $lt: tmoment(tomorrow).endOf("day").toDate(),
            };

            where["vendor"] = req.query.id;

            where["status"] = "vendor_approved";
            where["deleted"] = 0;
            Checkout.find(where, null, {})
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")

                .populate("lp_head")
                .populate("lp_manager")

                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: 1,
                })
                .then((response) => {
                    res.status(200).send({
                        status: "success",
                        result: response,
                        message: "",
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    vendor_login: function (req, res) {
        let where = {};
        where["deleted"] = 0;
        where["mobile"] = req.body.mobile;
        where["user_type"] = "vendor";
        Users.findOne(where)
            .then((response) => {
                if (response.active == 0) {
                    res.status(200).send({
                        status: "error",
                        message: "Account is inactive",
                    });
                    return;
                }

                if (response != null) {
                    gen_otp(
                        req.body.mobile,
                        res,
                        () => {
                            let where = {};
                            where["deleted"] = 0;
                            where["mobile"] = req.body.mobile;
                            Users.findOneAndUpdate(
                                where,
                                {
                                    device_token: req.body.device_token,
                                    device_type: req.body.device_type,
                                },
                                {
                                    new: true,
                                }
                            )
                                .exec()
                                .then(() => {
                                    res.status(200).send({
                                        status: "success",
                                        OTP: 0,
                                        message: "OTP has been sent to mobile number.",
                                    });
                                });
                        },
                        (errorResponse) => {
                            res.status(200).send({
                                status: "error",
                                message: errorResponse,
                                OTP: "",
                            });
                        }
                    );
                } else {
                    res.status(200).send({
                        status: "error",
                        message: "mobile number not registered",
                        OTP: "",
                    });
                }
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Invalid mobile",
                    OTP: "",
                });
            });
    },

    verify_vendor_otp: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["mobile"] = req.body.mobile;
            where["otp"] = req.body.otp;
            where["deleted"] = 0;
            where["user_type"] = "vendor";
            Users.findOne(where)
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    if (response) {
                        res.status(200).send({
                            status: "success",
                            result: response,
                            message: "Otp verified",
                        });
                    } else {
                        res.status(200).send({
                            status: "error",
                            result: [],
                            message: "Invalid OTP",
                        });
                    }
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    partner_today_order_by_product_invoice: function (req, res) {
        let where = {};
        let start = new Date();
        start.setHours(0, 0, 0, 0);

        let end = new Date();
        end.setHours(23, 59, 59, 999);

        if (req.query.vendor && req.query.vendor != "") {
            where["vendor"] = req.query.vendor;
        }

        where["delivery_date"] = { $gte: start, $lt: end };
        where["deleted"] = 0;
        Checkout.find(where)
            .populate("user")
            .populate("products.product")
            .populate("vendor")
            .populate("cargo_partner")
            .populate("delivery_partner")
            .populate("pickup_partner")
            .populate({
                path: "address",
                populate: [
                    {
                        path: "city",
                        model: "cities",
                        select: "name",
                    },
                ],
            })
            .then((response) => {
                if (response.length == 0) {
                    res.status(200).send({
                        status: "error",
                        message: "No records found",
                    });
                    return;
                }
                let html_template = "";
                let i, j;
                let products = [];
                for (i = 0; i < response.length; i++) {
                    for (j = 0; j < response[i].products.length; j++) {
                        let obj = products.find((o) => o.product === response[i].products[j].product._id);

                        if (obj) {
                            index = products.findIndex((x) => x.product === response[i].products[j].product._id);
                            products.splice(index, 1);
                            products.push({
                                product: response[i].products[j].product._id,
                                name: response[i].products[j].product.name,
                                quantity: Number(response[i].products[j].quantity) + Number(obj.quantity),
                            });
                        } else {
                            products.push({
                                product: response[i].products[j].product._id,
                                name: response[i].products[j].product.name,
                                quantity: response[i].products[j].quantity,
                            });
                        }
                    }
                }

                 html_template = "";
                html_template =
                    html_template +
                    "<!DOCTYPE html>" +
                    "<html>" +
                    "<head>" +
                    '    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
                    '    <meta name="viewport" content="width=device-width, initial-scale=1">' +
                    '    <meta http-equiv="X-UA-Compatible" content="IE=edge" />' +
                    '    <style type="text/css">' +
                    "        body," +
                    "        table," +
                    "        td," +
                    "        a {" +
                    "            -webkit-text-size-adjust: 100%;" +
                    "            -ms-text-size-adjust: 100%;" +
                    "        }" +
                    "        table," +
                    "        td {" +
                    "            mso-table-lspace: 0pt;" +
                    "            mso-table-rspace: 0pt;" +
                    "        }" +
                    "        img {" +
                    "            -ms-interpolation-mode: bicubic;" +
                    "        }" +
                    "        img {" +
                    "            border: 0;" +
                    "            height: auto;" +
                    "            line-height: 100%;" +
                    "            outline: none;" +
                    "            text-decoration: none;" +
                    "        }" +
                    "        table {" +
                    "            border-collapse: collapse !important;" +
                    "        }" +
                    "        body {" +
                    "            height: 100% !important;" +
                    "            margin: 0 !important;" +
                    "            padding: 0 !important;" +
                    "            width: 100% !important;" +
                    "        }" +
                    "        a[x-apple-data-detectors] {" +
                    "            color: inherit !important;" +
                    "            text-decoration: none !important;" +
                    "            font-size: inherit !important;" +
                    "            font-family: inherit !important;" +
                    "            font-weight: inherit !important;" +
                    "            line-height: inherit !important;" +
                    "        }" +
                    "        @media screen and (max-width: 480px) {" +
                    "            .mobile-hide {" +
                    "                display: none !important;" +
                    "            }" +
                    "            .mobile-center {" +
                    "                text-align: center !important;" +
                    "            }" +
                    "        }" +
                    '        div[style*="margin: 16px 0;"] {' +
                    "            margin: 0 !important;" +
                    "        }" +
                    "    </style>" +
                    '<body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">' +
                    '    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">' +
                    "        For what reason would it be advisable for me to think about business content? That might be little bit risky to have crew member like them." +
                    "    </div>" +
                    '    <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                    "        <tr>" +
                    '            <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">' +
                    '                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">' +
                    "                     " +
                    "                                <tr>" +
                    '                                    <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;"> <img src="https://tastes2plate.com/img/site-logo.png" width="125" height="120" style="display: block; border: 0px;" alt="tastes2plate" /><br>' +
                    '                                        <h2 style="font-size: 15px; font-weight: 800;  color: #333333; margin: 0;"> Total Product List </h2>' +
                    "                                    </td>" +
                    "                                </tr>" +
                    "                    <tr>" +
                    '                        <td align="center" style="padding: 35px 35px 20px 35px; background-color: #ffffff;" bgcolor="#ffffff">' +
                    '                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">' +
                    "                                <tr>" +
                    '                                    <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 400; line-height: 24px; padding-top: 10px;">' +
                    '                                        <p style="font-size: 12px; font-weight: 400; line-height: 24px; color: #777777;">  </p>' +
                    "                                    </td>" +
                    "                                </tr>" +
                    "" +
                    "                                <tr>" +
                    '                                    <td align="left" style="padding-top: 20px;">' +
                    '                                        <table cellspacing="0" cellpadding="0" border="0" width="100%">' +
                    "                                            <tr>" +
                    '                                                <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; "> Items </td>' +
                    '                                                <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; "> QTY </td>' +
                    "                                            </tr>";

                let a;
                for (a = 0; a < products.length; a++) {
                    html_template = html_template + '                         <tr style=" border-bottom: 1px solid rgb(238, 238, 238);">' + '                                                <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 400; line-height: 24px; padding: 3px;"> ' + products[a].name + " </td>" + '                                                <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 400; line-height: 24px; padding: 3px;"> ' + products[a].quantity + " </td>" + "                                           </tr>";
                }

                html_template = html_template + " </table>" + "                        </td>" + "                    </tr>" + "                </table>" + "            </td>" + "        </tr>" + "    </table>" + "</body>" + '</html> <div style = "display:block; clear:both; page-break-after:always;"></div>';

                axios
                    .post("https://pdf.tastes2plate.com/app/gen_pdf", {
                        html: html_template,
                    })
                    .then(function (response) {
                        let buffer = Buffer.from(response.data.buffer.data);
                        res.contentType("application/pdf");
                        res.send(buffer);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            });
    },

    partner_tomorrow_order_by_product_invoice: function (req, res) {
        let where = {};
        let start = new Date();
        start.setDate(start.getDate() + 1);
        start.setHours(0, 0, 0, 0);

        let end = new Date();
        end.setDate(end.getDate() + 1);
        end.setHours(23, 59, 59, 999);

        if (req.query.vendor && req.query.vendor != "") {
            where["vendor"] = req.query.vendor;
        }

        where["delivery_date"] = { $gte: start, $lt: end };
        where["deleted"] = 0;
        Checkout.find(where)
            .populate("user")
            .populate("products.product")
            .populate("vendor")
            .populate("cargo_partner")
            .populate("delivery_partner")
            .populate("pickup_partner")
            .populate({
                path: "address",
                populate: [
                    {
                        path: "city",
                        model: "cities",
                        select: "name",
                    },
                ],
            })
            .then((response) => {
                if (response.length == 0) {
                    res.status(200).send({
                        status: "error",
                        message: "No records found",
                    });
                    return;
                }
                let html_template = "";
                let i, j;
                let products = [];
                for (i = 0; i < response.length; i++) {
                    for (j = 0; j < response[i].products.length; j++) {
                        let obj = products.find((o) => o.product === response[i].products[j].product._id);

                        if (obj) {
                            index = products.findIndex((x) => x.product === response[i].products[j].product._id);
                            products.splice(index, 1);
                            products.push({
                                product: response[i].products[j].product._id,
                                name: response[i].products[j].product.name,
                                quantity: Number(response[i].products[j].quantity) + Number(obj.quantity),
                            });
                        } else {
                            products.push({
                                product: response[i].products[j].product._id,
                                name: response[i].products[j].product.name,
                                quantity: response[i].products[j].quantity,
                            });
                        }
                    }
                }

                 html_template = "";
                html_template =
                    html_template +
                    "<!DOCTYPE html>" +
                    "<html>" +
                    "<head>" +
                    '    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
                    '    <meta name="viewport" content="width=device-width, initial-scale=1">' +
                    '    <meta http-equiv="X-UA-Compatible" content="IE=edge" />' +
                    '    <style type="text/css">' +
                    "        body," +
                    "        table," +
                    "        td," +
                    "        a {" +
                    "            -webkit-text-size-adjust: 100%;" +
                    "            -ms-text-size-adjust: 100%;" +
                    "        }" +
                    "        table," +
                    "        td {" +
                    "            mso-table-lspace: 0pt;" +
                    "            mso-table-rspace: 0pt;" +
                    "        }" +
                    "        img {" +
                    "            -ms-interpolation-mode: bicubic;" +
                    "        }" +
                    "        img {" +
                    "            border: 0;" +
                    "            height: auto;" +
                    "            line-height: 100%;" +
                    "            outline: none;" +
                    "            text-decoration: none;" +
                    "        }" +
                    "        table {" +
                    "            border-collapse: collapse !important;" +
                    "        }" +
                    "        body {" +
                    "            height: 100% !important;" +
                    "            margin: 0 !important;" +
                    "            padding: 0 !important;" +
                    "            width: 100% !important;" +
                    "        }" +
                    "        a[x-apple-data-detectors] {" +
                    "            color: inherit !important;" +
                    "            text-decoration: none !important;" +
                    "            font-size: inherit !important;" +
                    "            font-family: inherit !important;" +
                    "            font-weight: inherit !important;" +
                    "            line-height: inherit !important;" +
                    "        }" +
                    "        @media screen and (max-width: 480px) {" +
                    "            .mobile-hide {" +
                    "                display: none !important;" +
                    "            }" +
                    "            .mobile-center {" +
                    "                text-align: center !important;" +
                    "            }" +
                    "        }" +
                    '        div[style*="margin: 16px 0;"] {' +
                    "            margin: 0 !important;" +
                    "        }" +
                    "    </style>" +
                    '<body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">' +
                    '    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">' +
                    "        For what reason would it be advisable for me to think about business content? That might be little bit risky to have crew member like them." +
                    "    </div>" +
                    '    <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                    "        <tr>" +
                    '            <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">' +
                    '                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">' +
                    "                     " +
                    "                                <tr>" +
                    '                                    <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;"> <img src="https://tastes2plate.com/img/site-logo.png" width="125" height="120" style="display: block; border: 0px;" alt="tastes2plate" /><br>' +
                    '                                        <h2 style="font-size: 15px; font-weight: 800;  color: #333333; margin: 0;"> Total Product List </h2>' +
                    "                                    </td>" +
                    "                                </tr>" +
                    "                    <tr>" +
                    '                        <td align="center" style="padding: 35px 35px 20px 35px; background-color: #ffffff;" bgcolor="#ffffff">' +
                    '                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">' +
                    "                                <tr>" +
                    '                                    <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 400; line-height: 24px; padding-top: 10px;">' +
                    '                                        <p style="font-size: 12px; font-weight: 400; line-height: 24px; color: #777777;">  </p>' +
                    "                                    </td>" +
                    "                                </tr>" +
                    "" +
                    "                                <tr>" +
                    '                                    <td align="left" style="padding-top: 20px;">' +
                    '                                        <table cellspacing="0" cellpadding="0" border="0" width="100%">' +
                    "                                            <tr>" +
                    '                                                <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; "> Items </td>' +
                    '                                                <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; "> QTY </td>' +
                    "                                            </tr>";

                let a;
                for (a = 0; a < products.length; a++) {
                    html_template = html_template + '                         <tr style=" border-bottom: 1px solid rgb(238, 238, 238);">' + '                                                <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 400; line-height: 24px; padding: 3px;"> ' + products[a].name + " </td>" + '                                                <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 400; line-height: 24px; padding: 3px;"> ' + products[a].quantity + " </td>" + "                                           </tr>";
                }

                html_template = html_template + " </table>" + "                        </td>" + "                    </tr>" + "                </table>" + "            </td>" + "        </tr>" + "    </table>" + "</body>" + '</html> <div style = "display:block; clear:both; page-break-after:always;"></div>';

                axios
                    .post("https://pdf.tastes2plate.com/app/gen_pdf", {
                        html: html_template,
                    })
                    .then(function (response) {
                        let buffer = Buffer.from(response.data.buffer.data);
                        res.contentType("application/pdf");
                        res.send(buffer);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            });
    },

    all_plan_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            if (req.query.city && req.query.city != "") {
                where["city"] = { $in: req.query.city };
            }
            where["active"] = 1;
            Plan.find(where, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.page),
            })
                .populate("city", "name")
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    res.status(200).send({
                        status: "success",
                        token: req.token,
                        result: response,
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                    });
                });
        }
    },

    assign_plan: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Users.findOne(where).then((user_response) => {
                let point = Number(user_response.subscription.point);
                let exp_date = user_response.subscription.exp_date;

                let where = {};
                where["_id"] = req.body.plan;
                Plan.findOne(where).then((response) => {
                    let plan_point = Number(response.point);
                    let total_point = point + plan_point;

                    if (exp_date == null) {
                        let future = moment().add(Number(response.day), "days").format("YYYY-MM-DD");
                    } else {
                        if (moment(exp_date).isBefore(moment(), "day")) {
                            let future = moment().add(Number(response.day), "days").format("YYYY-MM-DD");
                        } else {
                            let future = moment(exp_date).add(Number(response.day), "days").format("YYYY-MM-DD");
                        }
                    }

                    let where = {};
                    where["_id"] = req.body.id;
                    Users.findOneAndUpdate(
                        where,
                        {
                            $set: {
                                subscription: {
                                    point: total_point,
                                    exp_date: future,
                                    plan: req.body.plan,
                                    key: req.body.transactionid,
                                    updated: moment().format(),
                                },
                            },
                        },
                        {
                            new: true,
                        }
                    )
                        .exec()
                        .then(() => {
                            //console.log(response);
                            res.status(200).send({
                                status: "success",
                                message: "Plan updated",
                            });
                        });
                });
            });
        }
    },

    get_wallet_data: function (req, res) {
        let where = {};
        where["_id"] = req.query.id;
        Users.findOne(where).then((user_response) => {
            let point = user_response ? Number(user_response.subscription.point) : 0;
            let exp_date = user_response ? user_response.subscription.exp_date : null;

            if (user_response) {
                let where = {};
                where["_id"] = user_response.subscription.plan;
                Plan.findOne(where).then((response) => {
                    let plan_price = response ? response.price : "";
                    let plan_name = response ? response.name : "";
                    let min_price = response ? response.min_price : 0;
                    let max_price = response ? response.max_price : 0;
                    let discount = response ? response.discount : 0;

                    if (exp_date == null) {
                        let expired = true;
                    } else {
                        if (!moment(exp_date).isBefore(moment(), "day")) {
                            let expired = false;
                        } else {
                            let expired = true;
                        }
                    }

                    let where = {};
                    Settings.find(where)
                        .sort({
                            order: +1,
                        })
                        .then((settings_response) => {
                            res.status(200).send({
                                customer_point: point,
                                plan: {
                                    plan_name: plan_name,
                                    plan_price: plan_price,
                                    exp_date: exp_date,
                                    plan_expired: expired,
                                    cart_min_price: min_price,
                                    cart_max_price: max_price,
                                    discount_percentage: discount,
                                },
                                point_settings: {
                                    one_point_value_in_rupess: settings_response[28].value,
                                    point_redeem_minimum_order_value: settings_response[29].value,
                                    point_redeem_maximum_order_value: settings_response[30].value,
                                    max_redeem_point_per_order: settings_response[31].value,
                                },
                            });
                        });
                });
            } else {
                let where = {};
                Settings.find(where)
                    .sort({
                        order: +1,
                    })
                    .then((settings_response) => {
                        res.status(200).send({
                            customer_point: point,
                            plan: {
                                plan_name: "",
                                plan_price: "",
                                exp_date: exp_date,
                                plan_expired: true,
                                cart_min_price: 0,
                                cart_max_price: 0,
                                discount_percentage: 0,
                            },
                            point_settings: {
                                one_point_value_in_rupess: settings_response[28].value,
                                point_redeem_minimum_order_value: settings_response[29].value,
                                point_redeem_maximum_order_value: settings_response[30].value,
                                max_redeem_point_per_order: settings_response[31].value,
                            },
                        });
                    });
            }
        });
    },

    razorpay_create_order2: function (req, res) {
        //return;
        const instance = new Razorpay({
            // key_id: 'rzp_test_MZFxunnFkZMIF9',
            // key_secret: 'q7oUdSYQ3uX0ZHii7uzVCLVY',

            key_id: "rzp_live_ZLgzjgdHBJDlP8",
            key_secret: "SGAmDJNT1a6UcNyuEQIFS1ag",
        });
        try {
            const options = {
                amount: Number(req.body.amount) * 100, // amount == Rs 10
                currency: "INR",
                receipt: Number(req.body.order_id),
                payment_capture: 1,
                // 1 for automatic capture // 0 for manual capture
            };
            instance.orders.create(options, async function (err, order) {
                if (err) {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                    });
                }
                res.status(200).send({
                    status: "success",
                    result: order,
                });
                // return res.status(200).json();
            });
        } catch (err) {
            res.status(200).send({
                status: "error",
                message: "Something went wrong",
            });
        }
    },

    wallet_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["user"] = req.query.id;
            Wallet.find(where, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.page),
            })
                .then((response) => {
                    Wallet.find(where).countDocuments(function (err, count) {
                        res.status(200).send({
                            status: "success",
                            token: req.token,
                            result: response,
                            totalCount: count,
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },

    my_wallet_transaction: function (req, res) {
        let where = {};
        where["_id"] = req.query.id;
        Users.findOne(where).then((user_response) => {
            let point = user_response ? Number(user_response.subscription.point) : 0;
            let exp_date = user_response ? user_response.subscription.exp_date : null;

            Wallet.find(where, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.page),
            })
                .then((response) => {
                    Wallet.find(where).countDocuments(function (err, count) {
                        if (user_response) {
                            let where = {};
                            where["_id"] = user_response.subscription.plan;
                            Plan.findOne(where).then((response) => {
                                let plan_name = response ? response.name : "";
                                let min_price = response ? response.min_price : 0;
                                let max_price = response ? response.max_price : 0;
                                let discount = response ? response.discount : 0;

                                if (exp_date == null) {
                                    let expired = true;
                                } else {
                                    if (!moment(exp_date).isBefore(moment(), "day")) {
                                        let expired = false;
                                    } else {
                                        let expired = true;
                                    }
                                }

                                let where = {};
                                Settings.find(where)
                                    .sort({
                                        order: +1,
                                    })
                                    .then((settings_response) => {
                                        res.status(200).send({
                                            customer_point: point,
                                            plan: {
                                                plan_name: plan_name,
                                                exp_date: exp_date,
                                                plan_expired: expired,
                                                cart_min_price: min_price,
                                                cart_max_price: max_price,
                                                discount_percentage: discount,
                                            },
                                            point_settings: {
                                                one_point_value_in_rupess: settings_response[28].value,
                                                point_redeem_minimum_order_value: settings_response[29].value,
                                                point_redeem_maximum_order_value: settings_response[30].value,
                                                max_redeem_point_per_order: settings_response[31].value,
                                            },
                                            result: response,
                                            totalCount: count,
                                        });
                                    });
                            });
                        } else {
                            let where = {};
                            Settings.find(where)
                                .sort({
                                    order: +1,
                                })
                                .then((settings_response) => {
                                    res.status(200).send({
                                        customer_point: point,
                                        plan: {
                                            plan_name: "",
                                            exp_date: exp_date,
                                            plan_expired: true,
                                            cart_min_price: 0,
                                            cart_max_price: 0,
                                            discount_percentage: 0,
                                        },
                                        point_settings: {
                                            one_point_value_in_rupess: settings_response[28].value,
                                            point_redeem_minimum_order_value: settings_response[29].value,
                                            point_redeem_maximum_order_value: settings_response[30].value,
                                            max_redeem_point_per_order: settings_response[31].value,
                                        },
                                        result: response,
                                        totalCount: count,
                                    });
                                });
                        }
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        });
    },

    update_pickup_order_weight: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Checkout.findOneAndUpdate(
                where,
                {
                    pickup_weight: req.body.weight,
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    //Order Log Start

                    const authHeader = req.headers["authorization"];
                    const token = authHeader && authHeader.split(" ")[0];
                    const decodedToken = jwt.decode(token);
                    const userId = decodedToken?.user_id;

                    const orderLog = new OrderLog({
                        order: req?.body?.id || req?.query?.id,
                        updated_by_user: userId,
                        event: "PickUp order Weight",
                        event_data: "pickup_weight:-" + req.body.weight,
                        type: "Order"
                    });

                    orderLog.save(function (err) {
                        if (err) {
                            console.log(err, "ERR");
                        } else {
                            return;
                        }
                    });

                    //Order Log END
                    res.status(200).send({
                        status: "success",
                        message: "Weight updated",
                        token: req.token,
                    });
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                        token: req.token,
                    });
                });
        }
    },

    update_delivery_order_weight: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            Checkout.findOneAndUpdate(
                where,
                {
                    delivery_weight: req.body.weight,
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    //Order Log Start

                    const authHeader = req.headers["authorization"];
                    const token = authHeader && authHeader.split(" ")[0];
                    const decodedToken = jwt.decode(token);
                    const userId = decodedToken?.user_id;

                    const orderLog = new OrderLog({
                        order: req?.body?.id || req?.query?.id,
                        updated_by_user: userId,
                        event: "Delivery Order Weight",
                        event_data: "delivery_weight:- " + req.body.weight,
                        type: "Order"
                    });

                    orderLog.save(function (err) {
                        if (err) {
                            console.log(err, "ERR");
                        } else {
                            return;
                        }
                    });

                    //Order Log END
                    res.status(200).send({
                        status: "success",
                        message: "Weight updated",
                        token: req.token,
                    });
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                        token: req.token,
                    });
                });
        }
    },

    create_bundle: function (req, res) {
        let OrderBundleData = new OrderBundle({
            delivery_partner: req.body.id,
            orders: req.body.orders.split(","),
        });
        OrderBundleData.save()
            .then((response) => {
                let orders = req.body.orders.split(",");
                Checkout.updateMany({ _id: { $in: orders } }, { $set: { bundle_id: response._id } })
                    .exec()
                    .then(() => {
                        res.status(200).send({
                            status: "success",
                            message: "Bundle Created.",
                            //token: req.token,
                        });
                    });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    //token: req.token,
                });
            });
    },

    pickup_bundle_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            if (req.body.id && req.body.id != "") {
                where["pickup_partner"] = req.body.id;
            }

            if (req.body.pickup_boy && req.body.pickup_boy != "") {
                where["pickup_boy"] = req.body.pickup_boy;
            }

            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");

            where["delivery_date"] = {
                $gte: today.toDate(),
                $lt: tmoment(tomorrow).endOf("day").toDate(),
            };

            where["status"] = {
                $nin: ["delivered", "pending_payment", "declined_vendor", "rejected_customer", "refunded", "failed", "cancel", "on_hold", "delivered_to_cargo_partner", "cargo_off_loaded", "cargo_delivery_started", "received_destination_airport"],
            };

            Checkout.find(where, null, {})
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")

                .populate("lp_manager")
                .populate("lp_head")

                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    bundled = [];
                    for (let i = 0; i < response.length; i++) {
                        if (response[i].bundle_id) {
                            bundled.push(response[i].bundle_id);
                        }
                    }
                    let uniqueArray = [...new Set(bundled)];
                    let where = {};
                    where["_id"] = { $in: uniqueArray };
                    OrderBundle.find(where, null, {})
                        .populate("orders")
                        .populate("delivery_partner")
                        .then((bundle_response) => {
                            res.status(200).send({
                                status: "success",
                                result: bundle_response,
                                message: "",
                            });
                        });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    delivery_bundle_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            if (req.body.id && req.body.id != "") {
                where["delivery_partner"] = req.body.id;
            }

            if (req.body.delivery_boy && req.body.delivery_boy != "") {
                where["delivery_boy"] = req.body.delivery_boy;
            }

            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");

            where["delivery_date"] = {
                $gte: today.toDate(),
                $lt: tmoment(tomorrow).endOf("day").toDate(),
            };

            where["status"] = {
                $nin: ["delivered", "pending_payment", "declined_vendor", "rejected_customer", "refunded", "failed", "cancel", "on_hold", "delivered_to_cargo_partner", "cargo_off_loaded", "cargo_delivery_started", "received_destination_airport", "pickup_boy_assigned", "pickup_boy_started"],
            };

            Checkout.find(where, null, {})
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")

                .populate("lp_manager")
                .populate("lp_head")

                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    bundled = [];
                    for (let i = 0; i < response.length; i++) {
                        if (response[i].bundle_id) {
                            bundled.push(response[i].bundle_id);
                        }
                    }
                    let uniqueArray = [...new Set(bundled)];
                    let where = {};
                    where["_id"] = { $in: uniqueArray };
                    OrderBundle.find(where, null, {})
                        .populate("orders")
                        .populate("delivery_partner")
                        .then((bundle_response) => {
                            res.status(200).send({
                                status: "success",
                                result: bundle_response,
                                message: "",
                            });
                        });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    get_office_box: function (req, res) {
        let where = {};
        where["_id"] = req.body.id;
        Users.findOne(where).then((user_response) => {
            let city = user_response ? user_response.customer_support_city : null;
            let where = {};
            where["city"] = { $in: city };
            Office.find(where, null, {}).then((office_response) => {
                let i;
                let arr = [];
                for (i = 0; i < office_response.length; i++) {
                    if (office_response[i].bag_no) {
                        let j;
                        for (j = 0; j < office_response[i].bag_no.length; j++) {
                            arr.push(office_response[i].bag_no[j]);
                        }
                    }
                }
                let uniqueArray = [...new Set(arr)];
                res.status(200).send({
                    status: "success",
                    result: uniqueArray,
                    message: "",
                });
            });
        });
    },

    create_box: function (req, res) {
        let OrderBoxData = new OrderBox({
            delivery_partner: req.body.id,
            bag: req.body.bag,
            bundles: req.body.bundles.split(","),
        });
        OrderBoxData.save()
            .then((boxresponse) => {
                let bundles = req.body.bundles.split(",");
                OrderBundle.updateMany({ _id: { $in: bundles } }, { $set: { box_id: boxresponse._id, bag: req.body.bag } })
                    .exec()
                    .then(() => {
                        let bundles = req.body.bundles.split(",");
                        Checkout.updateMany({ bundle_id: { $in: bundles } }, { $set: { box_id: boxresponse._id, bag: req.body.bag } })
                            .exec()
                            .then(() => {
                                let where = {};
                                where["bag_no"] = { $in: req.body.bag };
                                Office.findOne(where, null, {}).then((office_response) => {
                                    let where = {};
                                    where["bundle_id"] = req.body.bundles.split(",")[0];
                                    Checkout.findOne(where, null, {}).then((checkout_response) => {
                                        // Pickup City
                                        let bags = office_response.bag_no;
                                        let index = bags.indexOf(req.body.bag);
                                        bags.splice(index, 1);

                                        let where = {};
                                        where["_id"] = office_response._id;
                                        Office.findOneAndUpdate(where, { bag_no: bags }, { new: true })
                                            .exec()
                                            .then(() => { });

                                        // Delivery city
                                         where = {};
                                        where["city"] = checkout_response.order_city;
                                        Office.findOne(where, null, {}).then((office_response2) => {
                                            let bags = office_response2.bag_no;
                                            bags.push(req.body.bag);

                                            let where = {};
                                            where["_id"] = office_response2._id;
                                            Office.findOneAndUpdate(where, { bag_no: bags }, { new: true })
                                                .exec()
                                                .then(() => { });
                                        });
                                    });
                                });

                                res.status(200).send({
                                    status: "success",
                                    message: "Box Created.",
                                    //token: req.token,
                                });
                            });
                    });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    //token: req.token,
                });
            });
    },

    pickup_box_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            if (req.body.id && req.body.id != "") {
                where["pickup_partner"] = req.body.id;
            }

            if (req.body.pickup_boy && req.body.pickup_boy != "") {
                where["pickup_boy"] = req.body.pickup_boy;
            }

            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");

            where["delivery_date"] = {
                $gte: today.toDate(),
                $lt: tmoment(tomorrow).endOf("day").toDate(),
            };

            where["status"] = {
                $nin: ["delivered", "pending_payment", "declined_vendor", "rejected_customer", "refunded", "failed", "cancel", "on_hold", "delivered_to_cargo_partner", "cargo_off_loaded", "cargo_delivery_started", "received_destination_airport", "delivered_to_delivery_partner", "delivery_boy_assigned", "delivery_boy_started", "pickup_boy_assigned", "pickup_boy_started"],
            };

            Checkout.find(where, null, {})
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")

                .populate("lp_manager")
                .populate("lp_head")

                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    bundled = [];
                    for (let i = 0; i < response.length; i++) {
                        if (response[i].box_id) {
                            bundled.push(response[i].box_id);
                        }
                    }

                    let uniqueArray = [...new Set(bundled)];
                    let where = {};
                    where["_id"] = { $in: uniqueArray };
                    OrderBox.find(where, null, {})
                        .populate({
                            path: "bundles",
                            populate: [
                                {
                                    path: "orders",
                                    model: "checkouts",
                                    select: "orderid",
                                },
                            ],
                        })
                        .then((box_response) => {
                            res.status(200).send({
                                status: "success",
                                result: box_response,
                                message: "",
                            });
                        });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    delivery_box_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            if (req.body.id && req.body.id != "") {
                where["delivery_partner"] = req.body.id;
            }

            if (req.body.delivery_boy && req.body.delivery_boy != "") {
                where["delivery_boy"] = req.body.delivery_boy;
            }

            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(1, "days");

            where["delivery_date"] = {
                $gte: today.toDate(),
                $lt: tmoment(tomorrow).endOf("day").toDate(),
            };

            where["status"] = {
                $nin: ["delivered", "pending_payment", "declined_vendor", "rejected_customer", "refunded", "failed", "cancel", "on_hold", "delivered_to_cargo_partner", "cargo_off_loaded", "cargo_delivery_started", "received_destination_airport"],
            };

            Checkout.find(where, null, {})
                .populate("user")
                .populate("products.product")
                .populate("vendor")
                .populate("cargo_partner")
                .populate("delivery_partner")
                .populate("pickup_partner")
                .populate("pickup_boy")
                .populate("delivery_boy")

                .populate("lp_manager")
                .populate("lp_head")

                .populate({
                    path: "address",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    bundled = [];
                    for (let i = 0; i < response.length; i++) {
                        if (response[i].box_id) {
                            bundled.push(response[i].box_id);
                        }
                    }

                    let uniqueArray = [...new Set(bundled)];
                    let where = {};
                    where["_id"] = { $in: uniqueArray };
                    OrderBox.find(where, null, {})
                        .populate({
                            path: "bundles",
                            populate: [
                                {
                                    path: "orders",
                                    model: "checkouts",
                                    select: "orderid",
                                },
                            ],
                        })
                        .then((box_response) => {
                            res.status(200).send({
                                status: "success",
                                result: box_response,
                                message: "",
                            });
                        });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    delete_bundle: function (req, res) {
        let where = {};
        where["bundle_id"] = req.body.id;
        Checkout.updateMany(where, { bundle_id: null, box_id: null }, { new: true })
            .exec()
            .then(() => { });

         where = {};
        where["_id"] = req.body.id;
        OrderBundle.deleteOne(where)
            .then(() => {
                res.status(200).send({
                    status: "success",
                    token: req.token,
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    token: req.token,
                });
            });
    },

    delete_box: function (req, res) {
        let where = {};
        where["box_id"] = req.body.id;
        where["$or"] = [
            {
                user_type: "delivered_to_cargo_partner",
            },
            {
                user_type: "cargo_off_loaded",
            },
            {
                user_type: "cargo_delivery_started",
            },
            {
                user_type: "received_destination_airport",
            },
            {
                user_type: "delivered_to_delivery_partner",
            },
            {
                user_type: "delivery_boy_assigned",
            },
            {
                user_type: "delivery_boy_started",
            },
            {
                user_type: "delivered",
            },
            {
                user_type: "cancel",
            },
            {
                user_type: "failed",
            },
            {
                user_type: "refunded",
            },
            {
                user_type: "rejected_customer",
            },
            {
                user_type: "declined_vendor",
            },
        ];
        Checkout.find(where).countDocuments(function (err, count) {
            if (count > 0) {
                res.status(200).send({
                    status: "error",
                    message: "one or more order have out reach of pickup partner",
                    token: req.token,
                });
            } else {
                let where = {};
                where["box_id"] = req.body.id;
                Checkout.updateMany(where, { bundle_id: null, box_id: null }, { new: true })
                    .exec()
                    .then(() => {
                        let where = {};
                        where["_id"] = req.body.id;
                        OrderBox.findOne(where, null, {}).then((box_response) => {
                            let where = {};
                            where["bag_no"] = { $in: box_response.bag };
                            Office.findOne(where, null, {}).then((office_response) => {
                                // Pickup City
                                let bags = office_response.bag_no;
                                let index = bags.indexOf(box_response.bag);
                                bags.splice(index, 1);

                                 where = {};
                                where["_id"] = office_response._id;
                                Office.findOneAndUpdate(where, { bag_no: bags }, { new: true })
                                    .exec()
                                    .then(() => { });

                                // Delivery city
                                let where = {};
                                where["bundle_id"] = req.body.id;
                                Office.findOne(where, null, {}).then((office_response2) => {
                                    let bags = office_response2.bag_no;
                                    bags.push(box_response.bag);

                                    let where = {};
                                    where["_id"] = office_response2._id;
                                    Office.findOneAndUpdate(where, { bag_no: bags }, { new: true })
                                        .exec()
                                        .then(() => { });
                                });
                            });
                        });
                    });

                 where = {};
                where["_id"] = req.body.id;
                OrderBox.deleteOne(where)
                    .then(() => {
                        res.status(200).send({
                            status: "success",
                            token: req.token,
                        });
                    })
                    .catch((error) => {
                        res.status(200).send({
                            status: "error",
                            message: error,
                            token: req.token,
                        });
                    });
            }
        });
    },

    suggestion: function (req, res) {
        let where = {};
        where["deleted"] = 0;
        where["active"] = 1;
        where["name"] = {
            $regex: ".*" + req.query.search + ".*",
            $options: "i",
        };
        if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != NaN && req.query.taste != "NaN" && req.query.taste != "") {
            if (req.query.taste == 0 || req.query.taste == 1) {
                where["taste"] = Number(req?.query?.taste);
            }
        };
        Products.find(where, null, {
            limit: 10,
        }).then((user_response) => {
            let arr = [];

            for (let i = 0; i < user_response.length; i++) {
                arr.push({
                    name: user_response[i].name,
                    value: user_response[i].name,
                });
            }

            res.status(200).send({
                status: "success",
                result: arr,
                message: "",
            });
        });
    },

    all_delivery_status: function (req, res) {
        res.status(200).send({
            status: "success",
            message: "",
            result: {
                deleted: "Deleted",
                pending_payment: "Pending payment",
                waiting_vendor_approval: "Processing",
                vendor_approved: "Accepted By Vendor",
                on_hold: "On hold",
                ready_pickup: "Product Ready to pick up at Vendor place",
                pickup_boy_assigned: "Pickup boy assigned",
                pickup_boy_started: "Picked up by Logistic Partner",

                delivered_to_cargo_partner: "Received at Origin Airport",
                cargo_off_loaded: "Cargo off loaded",
                cargo_delivery_started: "Cargo loaded to the Flight",
                received_destination_airport: "Received at Destination Airport",
                delivered_to_delivery_partner: "Handover to Delivery Partner",
                delivery_boy_assigned: "Delivery boy assign",
                delivery_boy_started: "Out for delivery",
                pickup_boy_assigned: "Pickup man assign",
                pickup_boy_started: "Pickup boy started",
                delivered: "Delivered",
                cancel: "Cancel",
                failed: "Failed",
                refunded: "Refunded",
                rejected_customer: "Rejection by customers",
                declined_vendor: "Declined by vendor",
                complimentary: "Complimentary",
            },
        });
    },

    partner_status_change: async function (req, res) {
        let status = req.body.status.split(",");
        let ids = req.body.id.split(",");
        let by = req.body.by.split(",");

        for (let i = 0; i < ids.length; i++) {
            console.log(ids[i], "IDSS")
            let order_msg = "Order status has been changed to " + status[i] + " by " + by[i];

            let ordernote = new OrderNote({
                note: order_msg,
                order: ids[i],
            });
            ordernote.save(function () { });

            // let where = {};
            // where["_id"] = ids[i];

            let where1 = {};
            where1["_id"] = ids[i];
            where1["status"] = status[i];

            Checkout.findOne(where1).then(async (respon) => {
                if (respon != null) {
                    return;
                } else {
                    await Checkout.findOneAndUpdate(
                        { _id: ids[i] },
                        {
                            status: status[i],
                        },
                        {
                            new: true,
                        }
                    )
                        .exec()
                        .then(async () => {
                            let where = {};
                            where["_id"] = ids[i];
                            await Checkout.findOne(where)
                                .populate("user")
                                .populate("delivery_boy")
                                .then(async (response) => {
                                    if (response.user.first_time == 1) {
                                        let where = {};
                                        Settings.find(where).then((settings_response) => {
                                            let signup_bonus_sender = settings_response[32].value;
                                            let sender = response.user.reffer_by;

                                            let where = {};
                                            where["mobile"] = sender;
                                            Users.findOne(where).then((sender_response) => {
                                                let point = sender_response.subscription.point;
                                                let new_point = Number(point) + Number(signup_bonus_sender);
                                                let where = {};
                                                where["mobile"] = sender;
                                                Users.findOneAndUpdate(
                                                    where,
                                                    {
                                                        subscription: {
                                                            point: new_point,
                                                        },
                                                    },
                                                    {
                                                        new: true,
                                                    }
                                                )
                                                    .exec()
                                                    .then((sender_response) => {
                                                        let Walletdata = new Wallet({
                                                            user: sender_response._id,
                                                            point: Number(signup_bonus_sender),
                                                            type: 1,
                                                            note: "Referral signup bonus",
                                                        });
                                                        Walletdata.save(function () { });

                                                        let where = {};
                                                        where["_id"] = response._id;
                                                        Users.findOneAndUpdate(
                                                            where,
                                                            {
                                                                first_time: 0,
                                                            },
                                                            {
                                                                new: true,
                                                            }
                                                        )
                                                            .exec()
                                                            .then(() => { });
                                                    });
                                            });
                                        });
                                    }

                                    let mobile = response.user.mobile;
                                    let email = response.user.email;
                                    let name = response.user.full_name != "" ? response.user.full_name : "User";

                                    let dname = response.delivery_boy && response.delivery_boy.full_name != "" ? response.user.full_name : "Not Available";
                                    let dmobile = response.delivery_boy && response.delivery_boy.mobile != "" ? response.user.mobile : "Not Available";

                                    if (status[i] == "pending_payment") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to PENDING-PAYMENT. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to PENDING-PAYMENT. Thanks, TASTES2PLATE";
                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "PENDING-PAYMENT"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "PENDING-PAYMENT" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "waiting_vendor_approval") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to PROCESSING. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear " + name + ", your order no " + response.orderid + " status is changed to PROCESSING. Thanks, TASTES2PLATE";
                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "PROCESSING"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "PROCESSING" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "on_hold") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to HOLD. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to HOLD. Thanks, TASTES2PLATE";
                                        await CodPayment.findOneAndRemove({ number: response.orderid })
                                            .exec()
                                            .then(() => {
                                                return;
                                            }).catch((error) => {
                                                console.log((error));
                                            });
                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "HOLD"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "HOLD" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "ready_pickup") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to READY-TO-PICKUP. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to READY-TO-PICKUP. Thanks, TASTES2PLATE";
                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "READY-TO-PICKUP"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "READY-TO-PICKUP" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "pickup_boy_assigned") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to PICKUP-BOY-ASSIGNED. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to PICKUP-BOY-ASSIGNED. Thanks, TASTES2PLATE";
                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "PICK-UP-BOY-ASSIGNED"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "PICK-UP-BOY-ASSIGNED" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "pickup_boy_started") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to PICKUP-BOY-STARTED. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to PICKUP-BOY-STARTED. Thanks, TASTES2PLATE";
                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "ORDER-PICKED-UP"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "ORDER-PICKED-UP" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "delivered_to_cargo_partner") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to DELIVERED-TO-CARGO-PARTNER. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to DELIVERED-TO-CARGO-PARTNER. Thanks, TASTES2PLATE";

                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "ORDER-RECEIVED-AT-ORGIN-AIRPORT"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "ORDER-RECEIVED-AT-ORGIN-AIRPORT" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "cargo_off_loaded") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to CARGO-OFF-LOADED. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to CARGO-OFF-LOADED. Thanks, TASTES2PLATE";

                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "ORDER-RECEIVED-AT-DESTINATION-AIRPORT"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "ORDER-RECEIVED-AT-DESTINATION-AIRPORT" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "cargo_delivery_started") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to CARGO-LOADED-TO-FLIGHT. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to CARGO-LOADED-TO-FLIGHT. Thanks, TASTES2PLATE";

                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "CARGO-LOADED-TO-FLIGHT"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "CARGO-LOADED-TO-FLIGHT" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "received_destination_airport") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to RECEIVED-AT-DESTINATION-AIRPORT. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to RECEIVED-AT-DESTINATION-AIRPORT. Thanks, TASTES2PLATE";

                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "ORDER-RECEIVED-AT-DESTINATION-AIRPORT"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "ORDER-RECEIVED-AT-DESTINATION-AIRPORT" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "delivered_to_delivery_partner") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to HANDED-OVER-TO-DELIVERY-PARTNER. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to HANDED-OVER-TO-DELIVERY-PARTNER. Thanks, TASTES2PLATE";

                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "ORDER-REACHED-AT-DESTINATION-CENTER"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "ORDER-REACHED-AT-DESTINATION-CENTER" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "delivery_boy_assigned") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to DELIVERY-BOY-ASSIGNED. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to DELIVERY-BOY-ASSIGNED. Thanks, TASTES2PLATE";
                                        await gen_custom_sms(mobile, msg);

                                        let db_name = response.delivery_boy != null ? response.delivery_boy.full_name : "N/A";
                                        let msg2 = "Dear CUSTOMER, Delivery Boy " + db_name + " is assigned for your ORDER NO # " + response.orderid + ". Regards, TASTES2PLATE CUSTOMER SUPPORT TEAM";
                                        await gen_custom_sms(mobile, msg2);

                                        let msg5 = "DEAR CUSTOMER, PLEASE HELP US BY CHECKING THE QUALITY OF FOOD AT THE TIME OF DELIVERY. AFTER ACCEPTING THE DELIVERY, ANY COMPLAIN REGARDING FOOD QUALITY WILL BE DIFFICULT TO ASCERTAIN. Tastes2plate CC Team";
                                        await gen_custom_sms(mobile, msg5);

                                         msg = "Dear sir, please put the packet in boiling water for 5 minutes if Biryani is in packet. For other food items, this is not required. Regards, T2P";
                                        await gen_custom_sms(mobile, msg);
                                        await SendWATI("boiling_water_md", parameters, mobile);
                                        await SendWATI("food_complain", parameters, mobile);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "DELIVERY-BOY-ASSIGNED"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "DELIVERY-BOY-ASSIGNED" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "delivery_boy_started") {
                                        let payload = {
                                            merchantId: "CHARABUNISERVICESRAJARHAT",
                                            transactionId: response.orderid,
                                            merchantOrderId: response.orderid,
                                            amount: response.finalprice,
                                            //"mobileNumber":"7065265407",
                                            expiresIn: 180,
                                        };

                                        let x_verify = sha256(base64.stringify(utf8.parse(JSON.stringify(payload))) + "/v3/payLink/init" + "5b6a2591-2b28-4840-a5ac-762a5fbfb6d6") + "###" + 1;

                                        const url = "https://mercury-t2.phonepe.com/v3/payLink/init";
                                        const options = {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "X-VERIFY": x_verify,
                                            },
                                            body: JSON.stringify({
                                                request: base64.stringify(utf8.parse(JSON.stringify(payload))),
                                            }),
                                        };
                                        fetch(url, options)
                                            .then((res) => res.json())
                                            .then((json) => {
                                                //console.log(json);
                                                let payLink = json.data.payLink;
                                                if (payLink) {
                                                    let msg9 = "DEAR CUSTOMER, DELIVERY BOY " + db_name + " IS OUT-FOR-DELIVERY OF YOUR ORDER NO " + response.orderid + ". YOU CAN DO PAYMENT ONLINE USING THIS LINK " + payLink + ". REGARDS, TASTES2PLATE (T2P) CUSTOMER SUPPORT TEAM";

                                                    axios
                                                        .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg9), {})
                                                        .then(function () {
                                                            //console.log(response.data);
                                                        })
                                                        .catch(function (error) {
                                                            console.log(error);
                                                        });

                                                    gen_custom_sms(mobile, msg9);
                                                }
                                            })
                                            .catch((err) => console.error("error:" + err));

                                        let db_name = response.delivery_boy ? response.delivery_boy.full_name : "N/A";
                                        let db_mobile = response.delivery_boy ? response.delivery_boy.mobile : "N/A";

                                        gen_order_otp2(
                                            mobile,
                                            response._id,
                                            res,
                                            (successResponse) => {
                                                let msg = encodeURI("Dear customer, your OTP for Delivery of your order no " + response.orderid + " is " + successResponse + ". Please provide it to the delivery boy " + db_name + " at the time of delivery. Thanks, tastes2plate (t2p)");
                                                gen_custom_sms(mobile, msg);

                                                let parameters = [
                                                    response.orderid,
                                                    successResponse,
                                                    db_name
                                                    // { name: "1", value: response.orderid },
                                                    // { name: "2", value: successResponse },
                                                    // { name: "3", value: db_name },
                                                ];
                                                SendWATI("delivery_customer_otp", parameters, mobile);
                                            },
                                            (errorResponse) => {
                                                res.status(200).send({
                                                    status: "error",
                                                    message: errorResponse,
                                                    OTP: "",
                                                });
                                            }
                                        );

                                        GenURL(response._id).then(function (url_result) {
                                            let msg12 = "DEAR CUSTOMER, DELIVERY BOY " + db_name + " IS OUT FOR DELIVERY OF YOUR ORDER NO " + response.orderid + " WITH TASTES2PLATE; HIS MOBILE NUMBER IS " + db_mobile + ". NOW, YOU CAN TRACK " + url_result + " THE DELIVERY BOY. REGARDS, TASTES2PLATE (T2P) CUSTOMER SUPPORT TEAM";
                                            gen_custom_sms(mobile, msg12);
                                        });

                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to OUT-FOR-DELIVERY. Thanks, TASTES2PLATE";
                                        await gen_custom_sms(mobile, msg);

                                         db_name = response.delivery_boy ? response.delivery_boy.full_name : "N/A";
                                         db_mobile = response.delivery_boy ? response.delivery_boy.mobile : "N/A";

                                        let db_image = response.delivery_boy && response.delivery_boy.profile_image != "" ? ' <img src="' + response.delivery_boy.profile_image + '" width="125" height="120" style="display: block; border: 0px; margin-bottom: 15%;" alt="tastes2plate" />' : "";
                                        let msg4 = "DEAR CUSTOMER, DELIVERY BOY " + db_name + " IS OUT FOR DELIVERY FOR YOUR ORDER NO " + response.orderid + " AND HIS MOBILE NUMBER IS " + db_mobile + ". <br/> <div> " + db_image + "</div> <br/><br/><br/>  ";
                                        //console.log(msg4);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg4), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        //let msg = "Dear CUSTOMER, your order no "+response.orderid+" status is changed to OUT-FOR-DELIVERY. Thanks, TASTES2PLATE";
                                         msg = "DEAR CUSTOMER, DELIVERY BOY " + dname + " IS OUT FOR DELIVERY OF YOUR ORDER NO " + response.orderid + " WITH TASTES2PLATE; HIS MOBILE NUMBER IS " + dmobile + ". NOW, YOU CAN TRACK CUSTOMER THE DELIVERY BOY. REGARDS, TASTES2PLATE (T2P) CUSTOMER SUPPORT TEAM";
                                        await gen_custom_sms(mobile, msg);

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "OUT-FOR-DELIVERY"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "OUT-FOR-DELIVERY" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "pickup_boy_assigned") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to PICKUP-MAN-ASSIGNED. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to PICKUP-MAN-ASSIGNED. Thanks, TASTES2PLATE";

                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "PICKUP-MAN-ASSIGNED"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "PICKUP-MAN-ASSIGNED" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "pickup_boy_started") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to PICKUP-BOY-STARTED. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to PICKUP-BOY-STARTED. Thanks, TASTES2PLATE";

                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "PICKUP-BOY-STARTED"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "PICKUP-BOY-STARTED" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "delivered") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to DELIVERED. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to DELIVERED. Thanks, TASTES2PLATE";

                                        let msg2 = "Dear Sir/Madam, thanks for the order & supporting us. Your review to our services will motivate us and for continuous improvement in service. Kindly review us at Google Play at https://play.google.com/store/apps/details?id=me.taste2plate.app.customer or Apple app store at https://apps.apple.com/in/app/t2p-tastes2plate/id1534333151 . Thanking you. Regards, Tastes2plate";

                                        await gen_custom_sms(mobile, msg);
                                        await gen_custom_sms(mobile, msg2);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        let ordernote2 = new OrderNote({
                                            note: msg2,
                                            order: ids[i],
                                        });
                                        await ordernote2.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg2), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "DELIVERED"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "DELIVERED" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);

                                        let parameters2 = [
                                            "https://play.google.com/store/apps/details?id=me.taste2plate.app.customer",
                                            "https://apps.apple.com/in/app/t2p-tastes2plate/id1534333151"
                                            // { name: "1", value: "https://play.google.com/store/apps/details?id=me.taste2plate.app.customer" },
                                            // { name: "2", value: "https://apps.apple.com/in/app/t2p-tastes2plate/id1534333151" },
                                        ];
                                        await SendWATI("post_delivered_review_msg", parameters2, mobile);
                                    }

                                    else if (status[i] == "cancel") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to CANCELLED. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to CANCELLED. Thanks, TASTES2PLATE";
                                        CodPayment.findOneAndRemove({ number: response.orderid })
                                            .exec()
                                            .then(() => {
                                                return;
                                            }).catch((error) => {
                                                console.log((error));
                                            });

                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "CANCELLED"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "CANCELLED" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "failed") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to FAILED. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to FAILED. Thanks, TASTES2PLATE";
                                        await CodPayment.findOneAndRemove({ number: response.orderid })
                                            .exec()
                                            .then(() => {
                                                return;
                                            }).catch((error) => {
                                                console.log((error));
                                            });
                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "FAILED"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "FAILED" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "refunded") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to REFUNDED. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to REFUNDED. Thanks, TASTES2PLATE";

                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "REFUNDED"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "REFUNDED" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "rejected_customer") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to REJECTED-BY-CUSTOMER. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to REJECTED-BY-CUSTOMER. Thanks, TASTES2PLATE";

                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "REJECTED-BY-CUSTOMER"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "REJECTED-BY-CUSTOMER" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "declined_vendor") {
                                        //let msg = "Dear sir / madam, status of your order no "+response.orderid+" with TASTES2PLATE is changed to DECLINED-BY-VENDOR. Thanks for showing confidence with T2P. Regards, T2P Logistics Management Team";
                                        let msg = "Dear CUSTOMER, your order no " + response.orderid + " status is changed to DECLINED-BY-VENDOR. Thanks, TASTES2PLATE";

                                        await gen_custom_sms(mobile, msg);
                                        let ordernote = new OrderNote({
                                            note: msg,
                                            order: ids[i],
                                        });
                                        await ordernote.save(function () { });

                                        axios
                                            .get("https://webapi.tastes2plate.com/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg), {})
                                            .then(function () {
                                                //console.log(response.data);
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                            });

                                        let parameters = [
                                            "CUSTOMER",
                                            response.orderid,
                                            "DECLINED-BY-VENDOR"
                                            // { name: "1", value: "CUSTOMER" },
                                            // { name: "2", value: response.orderid },
                                            // { name: "3", value: "DECLINED-BY-VENDOR" },
                                        ];
                                        await SendWATI("order_update", parameters, mobile);
                                    }

                                    else if (status[i] == "vendor_approved") {
                                        let msg = "DEAR CUSTOMER, PLEASE HELP US BY CHECKING THE QUALITY OF FOOD AT THE TIME OF DELIVERY. AFTER ACCEPTING THE DELIVERY, ANY COMPLAIN REGARDING FOOD QUALITY WILL BE DIFFICULT TO ASCERTAIN. Tastes2plate CC Team";
                                        await gen_custom_sms(mobile, msg);

                                        let parameters = [
                                            "CUSTOMER"
                                            // { name: "1", value: "CUSTOMER" }
                                        ];
                                        await SendWATI("food_quality_check", parameters, mobile);

                                         msg = "Dear sir, please put the packet in boiling water for 5 minutes if Biryani is in packet. For other food items, this is not required. Regards, T2P";
                                        await gen_custom_sms(mobile, msg);
                                        await SendWATI("boiling_water_md", parameters, mobile);
                                        await SendWATI("food_complain", parameters, mobile);
                                    }
                                    return;
                                });
                        });
                }
            })
        }
        res.status(200).send({
            status: "success",
            message: "Status Updated SucessFully",
        });
    },

    update_pickup_distance: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let updatedata = {};
            updatedata["pickup_distance"] = req.body.pickup_distance;
            let where = {};
            where["_id"] = req.body.id;
            Checkout.findOneAndUpdate(where, updatedata, {
                new: true,
            })
                .exec()
                .then(() => {
                    let where = {};
                    where["_id"] = req.body.id;
                    Checkout.findOne(where).then((response) => {
                        // Give commission to pickup partners //
                        let pickup_boy = response.pickup_boy;

                        let distance = response.pickup_distance;
                        let total_weight = response.total_weight;

                        let tip_price = response?.tip_price ? response?.tip_price : 0;

                        let where = {};
                        where["_id"] = pickup_boy;
                        Users.findOne(where).then((user_response) => {
                            let price_per_kg = user_response.price_per_kg ? user_response.price_per_kg : 0;
                            let price_per_pack = user_response.price_per_pack ? user_response.price_per_pack : 0;
                            let rate_per_km = user_response.rate_per_km ? user_response.rate_per_km : 0;
                            let total_commission = Number(distance) * Number(rate_per_km) + Number(price_per_pack) + Number(total_weight) * Number(price_per_kg);

                            FinancialLog.findOne({ order: response._id }).then(respon => {
                                if (respon != null) {
                                    return;
                                } else {
                                    let FinancialLogData = new FinancialLog({
                                        order: response._id,
                                        partner: pickup_boy,
                                        commission: Number(total_commission) + Number(tip_price),
                                        total_weight: total_weight,
                                        distance: distance,
                                        tip_price: tip_price
                                    });

                                    FinancialLogData.save(function () { });
                                }
                            });
                        });

                        // Give commission to partners end //
                    });

                    res.status(200).send({
                        status: "success",
                        message: "Distance updated",
                    });
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                    });
                });
        }
    },

    update_delivery_distance: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let updatedata = {};
            updatedata["delivery_distance"] = req.body.delivery_distance;
            let where = {};
            where["_id"] = req.body.id;
            Checkout.findOneAndUpdate(where, updatedata, {
                new: true,
            })
                .exec()
                .then(() => {
                    let where = {};
                    where["_id"] = req.body.id;
                    Checkout.findOne(where).then((response) => {
                        // Give commission to pickup partners //
                        let delivery_boy = response.delivery_boy;

                        let distance = response.delivery_distance;
                        let total_weight = response.total_weight;
                        let tip_price = response?.tip_price ? response?.tip_price : 0;

                        let where = {};
                        where["_id"] = delivery_boy;
                        Users.findOne(where).then((user_response) => {
                            let price_per_kg = user_response.price_per_kg;
                            let price_per_pack = user_response.price_per_pack;
                            let rate_per_km = user_response.rate_per_km;
                            let total_commission = Number(distance) * Number(rate_per_km) + Number(price_per_pack) + Number(total_weight) * Number(price_per_kg);

                            FinancialLog.findOne({ order: response._id }).then(respon => {
                                if (respon != null) {
                                    return;
                                } else {
                                    let FinancialLogData = new FinancialLog({
                                        order: response._id,
                                        partner: delivery_boy,
                                        commission: Number(total_commission) + Number(tip_price),
                                        total_weight: total_weight,
                                        distance: distance,
                                        tip_price: tip_price
                                    });

                                    FinancialLogData.save(function () { });
                                }
                            });
                        });

                        // Give commission to partners end //
                    });

                    res.status(200).send({
                        status: "success",
                        message: "Distance updated",
                    });
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                    });
                });
        }
    },

    all_financial_log: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            if (req.query.partner && req.query.partner != "") {
                where["partner"] = req.query.partner;
            }

            if (req.query.type && req.query.type != "") {
                where["type"] = req.query.type;
            }

            if (req.query.start_date && req.query.start_date != "" && req.query.end_date && req.query.end_date != "") {
                let start = moment(moment(req.query.start_date).startOf("day")).toISOString();
                let end = moment(moment(req.query.end_date).endOf("day")).toISOString();

                where["created_date"] = {
                    $gte: new Date(start),
                    $lt: new Date(end),
                };
            }

            FinancialLog.find(where, null, {
                limit: Number(req.query.limit),
                skip: Number(req.query.page),
            })
                .populate("order")
                .populate("partner")
                .sort({
                    created_date: -1,
                })
                .then((response) => {
                    FinancialLog.find(where).countDocuments(function () {
                        FinancialLog.find(where).countDocuments(function (err, count) {
                            let where = {};
                            if (req.query.partner && req.query.partner != "") {
                                where["partner"] = mongoose.Types.ObjectId(req.query.partner);
                            }

                            if (req.query.type && req.query.type != "") {
                                where["type"] = req.query.type;
                            }

                            if (req.query.start_date && req.query.start_date != "" && req.query.end_date && req.query.end_date != "") {
                                let start = moment(moment(req.query.start_date).startOf("day")).toISOString();
                                let end = moment(moment(req.query.end_date).endOf("day")).toISOString();

                                where["created_date"] = {
                                    $gte: new Date(start),
                                    $lt: new Date(end),
                                };
                            }

                            where["type"] = "IN";

                            FinancialLog.aggregate([
                                { $match: where },
                                {
                                    $group: {
                                        _id: "_id",
                                        sum: { $sum: { $toDouble: "$commission" } },
                                    },
                                },
                            ]).then((commission_earn) => {
                                let where = {};
                                if (req.query.partner && req.query.partner != "") {
                                    where["partner"] = mongoose.Types.ObjectId(req.query.partner);
                                }

                                if (req.query.type && req.query.type != "") {
                                    where["type"] = req.query.type;
                                }

                                if (req.query.start_date && req.query.start_date != "" && req.query.end_date && req.query.end_date != "") {
                                    let start = moment(moment(req.query.start_date).startOf("day")).toISOString();
                                    let end = moment(moment(req.query.end_date).endOf("day")).toISOString();

                                    where["created_date"] = {
                                        $gte: new Date(start),
                                        $lt: new Date(end),
                                    };
                                }

                                where["type"] = "OUT";
                                FinancialLog.aggregate([
                                    { $match: where },
                                    {
                                        $group: {
                                            _id: "_id",
                                            sum: { $sum: { $toDouble: "$commission" } },
                                        },
                                    },
                                ]).then((commission_out) => {
                                    res.status(200).send({
                                        status: "success",
                                        result: response,
                                        message: "",
                                        count: count,
                                        commission_earn: commission_earn[0] ? commission_earn[0].sum : 0,
                                        commission_out: commission_out[0] ? commission_out[0].sum : 0,
                                    });
                                });
                            });
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        result: [],
                    });
                });
        }
    },

    customer_open_order: function (req, res) {
        let where = {};
        Settings.find(where)
            .sort({ _id: 1 })
            .then(() => {
                Checkout.aggregate([
                    {
                        $match: {
                            user: mongoose.Types.ObjectId(req.query.user),
                            gateway: "COD",
                            status: { $ne: "delivered" },
                            //status: "delivered",
                        },
                    },
                    {
                        $group: {
                            _id: "_id",
                            totalValue: {
                                $sum: {
                                    $toDouble: "$finalprice",
                                },
                            },
                        },
                    },
                ]).then((sum_res) => {
                    if (sum_res[0]) {
                        res.status(200).send({
                            status: "success",
                            result: sum_res[0].totalValue,
                        });
                    } else {
                        res.status(200).send({
                            status: "success",
                            result: 0,
                        });
                    }
                });
            });
    },

    add_tarvel_log: function (req, res) {
        if (!req.body.boy || req.body.boy == "") {
            res.status(200).send({
                status: "error",
                result: "Partner is required.",
            });
            return false;
        }

        if (!req.body.distance || req.body.distance == "") {
            res.status(200).send({
                status: "error",
                message: "Distance is required.",
            });
            return false;
        }

        let boy = req.body.boy;
        let where = {};
        where["_id"] = boy;
        Users.findOne(where).then((user_response) => {
            let price_per_km_without_order = user_response.price_per_km_without_order;
            let commission = Number(price_per_km_without_order) * Number(req.body.distance);

            FinancialLog.findOne({ order: req.body.order }).then(respon => {
                if (respon != null) {
                    res.status(200).send({
                        status: "success",
                        message: "Travel log for this order is already in record",
                        travelid: respon._id,
                    });
                } else {
                    if (req.body.order) {
                        Checkout.findOne({
                            _id: req.body.order
                        }).then((respon_chcekout) => {
                            let tip_price = respon_chcekout?.tip_price ? respon_chcekout?.tip_price : 0;

                            let FinancialLogData = new FinancialLog({
                                order: req.body.order && req.body.order != "" ? req.body.order : null,
                                partner: boy,
                                commission: Number(commission) + Number(tip_price),
                                total_weight: 0,
                                distance: req.body.distance,

                                start_address: req.body.start_address,
                                end_address: req.body.end_address,
                                tip_price: tip_price
                            });

                            FinancialLogData.save(function (err, response) {
                                res.status(200).send({
                                    status: "success",
                                    message: "Travel log added",
                                    travelid: response._id,
                                });
                            });
                        })
                    } else {
                        let FinancialLogData = new FinancialLog({
                            order: req.body.order && req.body.order != "" ? req.body.order : null,
                            partner: boy,
                            commission: commission,
                            total_weight: 0,
                            distance: req.body.distance,

                            start_address: req.body.start_address,
                            end_address: req.body.end_address,
                        });

                        FinancialLogData.save(function (err, response) {
                            res.status(200).send({
                                status: "success",
                                message: "Travel log added",
                                travelid: response._id,
                            });
                        });
                    }
                }
            })
        });
    },

    end_tarvel_log: function (req, res) {
        if (!req.body.travelid || req.body.travelid == "") {
            res.status(200).send({
                status: "error",
                result: "Travel id is required.",
            });
            return false;
        }

        let where = {};
        where["_id"] = req.body.travelid;

        if (req.body.end_address != "") {
            FinancialLog.findOneAndUpdate(
                where,
                {
                    end_date: new Date(),
                    end_address: req.body.end_address,
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    res.status(200).send({
                        status: "success",
                        message: "Data updated",
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error.message,
                    });
                });
        } else {
            FinancialLog.findOneAndUpdate(
                where,
                {
                    end_date: new Date(),
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    res.status(200).send({
                        status: "success",
                        message: "Data updated",
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error.message,
                    });
                });
        }
    },

    account_delete_request: function (req, res) {
        if (!req.body.id || req.body.id == "") {
            res.status(200).send({
                status: "error",
                result: "User _id is required.",
            });
            return false;
        }

        let id = req.body.id;
        let where = {};
        where["_id"] = id;
        Users.findOne(where).then((user_response) => {
            if (!user_response) {
                res.status(200).send({
                    status: "error",
                    result: "Account not found.",
                });
            } else {
                let transporter = nodemailer.createTransport({
                    host: SMTP_HOST,
                    port: SMTP_PORT,
                    //secure: process.env.SMTP_SECURE, // true for 465, false for other ports
                    auth: {
                        user: SMTP_USERNAME, // generated ethereal user
                        pass: SMTP_PASSWORD, // generated ethereal password
                    },
                });

                transporter
                    .sendMail({
                        from: EMAIL_FROM, // sender address
                        to: "satyajit9830@gmail.com", // list of receivers
                        subject: "Account Delete Request", // Subject line
                        html: "Email: " + user_response.email + " <br/> Mobile: " + user_response.mobile, // html body
                    })
                    .then((success) => {
                        console.log(success);
                        res.status(200).send({
                            status: "message",
                            result: "Request received",
                        });
                    })
                    .catch((error) => {
                        res.status(200).send({
                            status: "error",
                            result: error.message,
                        });
                    });
            }
        });
    },
    new_login: async function (req, res) {
        let where = {};
        where["deleted"] = 0;
        where["mobile"] = req.body.mobile;
        where["user_type"] = "customer";
        // console.log(req.body)

        // For 24 hours
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        try {
            const query = req.body.ip
                ? { ip: req.body.ip, createdAt: { $gte: twentyFourHoursAgo }, active: 0 }
                : { mobile: req.body.mobile, createdAt: { $gte: twentyFourHoursAgo }, active: 0 };


            const otp_qty = await ipLog.countDocuments(query);

            let query2 = req.body.ip
                ? { ip: req.body.ip }
                : { mobile: req.body.mobile }

            const total_qty = await ipLog.countDocuments(query2);


            if (otp_qty < 100) {
                Users.findOne(where)
                    .then((response) => {
                        if (response?.active == 0) {
                            res.status(200).send({
                                status: "error",
                                message: "Account is inactive",
                            });
                            return;
                        }

                        if (response != null) {
                            gen_otp(
                                req.body.mobile,
                                res,
                                async (successResponse) => {
                                    let where = {};
                                    where["deleted"] = 0;
                                    where["mobile"] = req.body.mobile;

                                    // try {
                                    //     const response = await axios.get(`https://ipapi.co/${req.body.user_ip}/json`);
                                    //     ip_details = response.data || {};
                                    // } catch (axiosError) {
                                    //     console.error('Error fetching IP details:', axiosError);
                                    // }

                                    // Extract only the base path from the URL

                                    // Use geoip to get location info based on IP address as a fallback
                                    const geo = geoip.lookup(req.body.user_ip);
                                    const country = geo?.country || '';
                                    const state = geo?.region || '';
                                    const city = geo?.city || '';

                                    let a = new ipLog({
                                        ip: req.body.user_ip,
                                        mobile: req.body.mobile,
                                        quantity: Number(total_qty ? total_qty : 0) + 1,
                                        state: state,
                                        country: country,
                                        city: city,
                                    })

                                    a.save();
                                    ipLog.updateMany({ mobile: req.body.mobile }, { $set: { active: 0 } }).exec();

                                    Users.findOneAndUpdate(
                                        where,
                                        {
                                            device_token: req.body.device_token,
                                            device_type: req.body.device_type,
                                        },
                                        {
                                            new: true,
                                        }
                                    )
                                        .exec()
                                        .then((response) => {
                                            res.status(200).send({
                                                status: "success",
                                                OTP: successResponse,
                                                message: "OTP has been sent to mobile number.",
                                                new_user: response?.email ? false : true
                                            });
                                        });
                                },
                                (errorResponse) => {
                                    res.status(200).send({
                                        status: "error",
                                        message: errorResponse,
                                        OTP: "",
                                    });
                                }
                            );
                        } else {
                            let userdata = new Users({
                                // email: req.body.email,
                                mobile: req.body.mobile,
                                user_type: "customer",
                                active: 1,
                                // email_verified: 0,
                                profile_image: "",
                                device_token: req.body.device_token,
                                device_type: req.body.device_type,
                                reffer_by: req.body.reffer_by,
                                first_time: req.body.reffer_by != "" ? 1 : 0,
                            });

                            //console.log(userdata)

                            userdata.save(function (err, response) {
                                if (err) {
                                    res.status(200).send({
                                        status: "error",
                                        message: err,
                                        result: [],
                                        OTP: "",
                                    });
                                } else {
                                    gen_otp(
                                        req.body.mobile,
                                        res,
                                        async () => {
                                            // try {
                                            //     const response = await axios.get(`https://ipapi.co/${req.body.user_ip}/json`);
                                            //     ip_details = response.data || {};
                                            // } catch (axiosError) {
                                            //     console.error('Error fetching IP details:', axiosError);
                                            // }

                                            // Extract only the base path from the URL

                                            // Use geoip to get location info based on IP address as a fallback
                                            const geo = geoip.lookup(req.body.user_ip);
                                            const country = geo?.country || '';
                                            const state = geo?.region || '';
                                            const city = geo?.city || '';

                                            let a = new ipLog({
                                                ip: req.body.user_ip,
                                                mobile: req.body.mobile,
                                                quantity: Number(total_qty ? total_qty : 0) + 1,
                                                state: state,
                                                country: country,
                                                city: city,

                                            })

                                            a.save();
                                            ipLog.updateMany({ mobile: req.body.mobile }, { $set: { active: 0 } }).exec();

                                            res.status(200).send({
                                                status: "success",
                                                OTP: "",
                                                message: "OTP has been sent to mobile number.",
                                                result: response?._id,
                                                new_user: true
                                            });

                                            let where = {};
                                            Settings.find(where)
                                                .sort({
                                                    order: +1,
                                                })
                                                .then((response) => {
                                                    let signup_bonus_reciver = response[33]?.value;
                                                    let where = {};
                                                    where["mobile"] = req.body.mobile;
                                                    Users.findOneAndUpdate(
                                                        where,
                                                        {
                                                            subscription: {
                                                                point: signup_bonus_reciver,
                                                            },
                                                        },
                                                        {
                                                            new: true,
                                                        }
                                                    )
                                                        .exec()
                                                        .then((response) => {
                                                            let Walletdata = new Wallet({
                                                                user: response._id,
                                                                point: Number(signup_bonus_reciver),
                                                                type: 1,
                                                                note: "Referral signup bonus",
                                                            });
                                                            Walletdata.save(function () { });
                                                        });
                                                });
                                        },
                                        (errorResponse) => {
                                            res.status(200).send({
                                                status: "error",
                                                message: errorResponse,
                                                result: [],
                                                OTP: "",
                                            });
                                        }
                                    );
                                }
                            });
                            // res.status(200).send({
                            //     status: "error",
                            //     message: "mobile number not registered",
                            //     OTP: "",
                            // });
                        }
                    })
                    .catch((err) => {
                        res.status(200).send({
                            status: "error",
                            message: "Invalid mobile",
                            OTP: "",
                            error: err
                        });
                    });
            } else {
                res.status(200).send({
                    status: "error",
                    message: "You have exceeded permessible limit of OTP and it is blocked forever. Please contact us on WhatsApp at 8100709627 to resume the service",
                });
            }
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).send('Internal server error');
        }
    },
    calculate_checkout_distance: function (req, res) {
        if (!req.body.address) {
            res.status(200).send({
                status: "error",
                message: "Please provide address",
            });
        } else if (!req.body.product) {
            res.status(200).send({
                status: "error",
                message: "Please provide product",
            });
        }
        if (req.body.address) {
            Address.findOne({ _id: req.body.address }).then((address_response) => {
                let lat1 = address_response?.position?.coordinates[0] ? address_response?.position?.coordinates[0] : 0;
                let lon1 = address_response?.position?.coordinates[1] ? address_response?.position?.coordinates[1] : 0;
                Office.findOne({ city: address_response?.city }).then((address_office) => {
                    let lat2 = address_office?.position?.coordinates[0] ? address_office?.position?.coordinates[0] : 0;
                    let lon2 = address_office?.position?.coordinates[1] ? address_office?.position?.coordinates[1] : 0;
                    // console.log(lat1, lat2, lon1, lon2,address_response?.city, office_response?.position)
                    let distance1 = latLonDistanceCalculate(lat1, lon1, lat2, lon2);

                    Products.findOne({ _id: req.body.product }).then((product_reponse) => {
                        Office.findOne({ city: product_reponse?.city })
                            .then(office_response => {
                                let lat3 = office_response?.position?.coordinates[0] ? office_response?.position?.coordinates[0] : 0;
                                let lon3 = office_response?.position?.coordinates[1] ? office_response?.position?.coordinates[1] : 0;
                                // console.log(lat1, lat2, lon1, lon2,address_response?.city, office_response?.position)
                                let distance2 = latLonDistanceCalculate(lat2, lon2, lat3, lon3);
                                let distance = Number(distance1) + Number(distance2)
                                res.status(200).send({
                                    status: "success",
                                    message: "",
                                    distance: distance ? Number(distance?.toFixed(2)) : 0,
                                    office_office: distance1 ? Number(distance1?.toFixed(2)) : 0,
                                    office_home: distance2 ? Number(distance2?.toFixed(2)) : 0
                                });
                            })
                    })
                })
            })
        }
    },
    fetch_city_using_zip: function (req, res) {
        if (req.body.name) {
            let where = {};
            where["deleted"] = 0;
            where["active"] = 1;
            where["name"] = req.body.name;

            ZipModel.findOne(where)
                .then(response => {
                    let where1 = {};
                    where1["deleted"] = 0;
                    where1["active"] = 1;
                    where1["ps"] = {
                        $ne: "product",
                    };
                    where1["_id"] = response?.city
                    City.findOne(where1).then(city_res => {
                        if (city_res) {
                            res.status(200).send({
                                status: "success",
                                message: "",
                                result: city_res
                            });
                        } else {
                            res.status(200).send({
                                status: "error",
                                message: "Sorry!! We didn't delivered in your city.",
                                result: city_res
                            });
                        }
                    })
                }).catch((err) => console.log(err));
        } else if (req.body.address) {
            let where = {};
            where["deleted"] = 0;
            where["active"] = 1;
            where["name"] = req.body.name;

            Address.findOne({ _id: req.body.address })
                .populate("city")
                .then((address_response) => {
                    let where1 = {};
                    where1["deleted"] = 0;
                    where1["active"] = 1;
                    where1["ps"] = {
                        $ne: "product",
                    };
                    where1["_id"] = address_response?.city;
                    var address_response = address_response;

                    City.findOne(where1).then(city_res => {
                        if (city_res) {
                            res.status(200).send({
                                status: "success",
                                message: "",
                                result: city_res,
                                address: address_response
                            });
                        } else {
                            res.status(200).send({
                                status: "error",
                                message: "Sorry!! We didn't delivered in your city.",
                                result: city_res
                            });
                        }
                    })
                })
        } else {
            res.status(200).send({
                status: "error",
                message: "Sorry!! We didn't delivered in your city."
            });
        }

    },
    fetchCheckoutDistanceForDesktop: function (req, res) {
        Address.findOne({ user: req.body.user }).then((address_response) => {
            let address = address_response;
            let lat1 = address_response?.position?.coordinates[0] ? address_response?.position?.coordinates[0] : 0;
            let lon1 = address_response?.position?.coordinates[1] ? address_response?.position?.coordinates[1] : 0;
            Office.findOne({ city: address_response?.city }).then((address_office) => {
                let lat2 = address_office?.position?.coordinates[0] ? address_office?.position?.coordinates[0] : 0;
                let lon2 = address_office?.position?.coordinates[1] ? address_office?.position?.coordinates[1] : 0;
                // console.log(lat1, lat2, lon1, lon2,address_response?.city, office_response?.position)
                let distance1 = latLonDistanceCalculate(lat1, lon1, lat2, lon2);
                Cart.findOne({ user: req.body.user }).then(cart_response => {
                    let cart = cart_response;
                    Products.findOne({ _id: cart_response?.product }).then((product_reponse) => {
                        Office.findOne({ city: product_reponse?.city })
                            .then(office_response => {
                                let lat3 = office_response?.position?.coordinates[0] ? office_response?.position?.coordinates[0] : 0;
                                let lon3 = office_response?.position?.coordinates[1] ? office_response?.position?.coordinates[1] : 0;
                                // console.log(lat1, lat2, lon1, lon2,address_response?.city, office_response?.position)
                                let distance2 = latLonDistanceCalculate(lat2, lon2, lat3, lon3);
                                let distance = Number(distance1) + Number(distance2)
                                res.status(200).send({
                                    status: "success",
                                    message: "",
                                    distance: distance ? Number(distance?.toFixed(2)) : 0,
                                    office_office: distance1 ? Number(distance1?.toFixed(2)) : 0,
                                    office_home: distance2 ? Number(distance2?.toFixed(2)) : 0,
                                    address: address,
                                    cart: cart
                                });
                            })
                    })
                })
            })
        })
    },
    GharKakhanaCartCreate: function (req, res) {
        let cart = new GharKakhanaCart({
            user: req.body.userId,
            name: req.body.product,
            category: req.body.category,
            sub_category: req.body.sub_category,
            weight: req.body.weight
        });
        cart.save(function (err, response) {
            if (err) {
                res.status(200).send({
                    status: "error",
                    message: err,
                    result: [],
                    OTP: "",
                });
            } else {
                res.status(200).send({
                    status: "success",
                    message: "Ghar ka khana product added to cart.",
                    data: response
                });
            }
        })
    },
    gharKakhanaFetchCart: function (req, res) {
        GharKakhanaCart.find({ user: req.body.user })
            .then(response => {
                res.status(200).send({
                    status: "success",
                    message: "Cart data found",
                    result: response
                });
            }).catch(() => console.log("Ghar Ka Khana fetch Cart error"))
    },
     gharKakhanaPreviewCheckout: function (req, res) {
        var userId = req.body.userId;
        //var cartPrice = req.body.cartprice
        var where = {};
        where["_id"] = userId;
        Users.findOne(where).then((user_response) => {
            if (user_response?.login_active == 0) {
                res.status(200).send({
                    status: "error",
                    message: "Your account is deactivated by admin",
                    result: [],
                });
                return;
            };


            var d = new Date();
            var d = d.getDay();
            var orderId = "A2A-" + Math.floor(Date.now() / 1000);
            Settings.find()
                .sort("order")
                .then((settings_response) => {
                    var pick_up_free_distance = settings_response[51]?.value;
                    // var multiplier_for_pickup = settings_response[52]?.value;
                    var multiplier_for_pickup = "";
                    var delivery_free_distance = settings_response[53]?.value;
                    // var multiplier_for_delivery = settings_response[54]?.value;
                    var multiplier_for_delivery = "";
                    var ghar_ka_khana_multiplier_price_500gm = settings_response[55]?.value;
                    var ghar_ka_khana_multiplier_price_1kg = settings_response[56]?.value;
                    var ghar_ka_khana_cgst = settings_response[57]?.value;
                    var ghar_ka_khana_sgst = settings_response[58]?.value;
                    var ghar_ka_khana_igst = settings_response[59]?.value;
                    var ghar_ka_khana_multiplier_price_500gm_express = settings_response[60]?.value;
                    var ghar_ka_khana_multiplier_price_1kg_express = settings_response[61]?.value;
                    var ghar_ka_khana_minimum_paid_amount_in_percentage = settings_response[62]?.value;


                    var total_weight = 0;
                    var total_price = 0;

                    var pickup_price = 0;
                    var pickup_distance = 0;

                    var delivery_price = 0;
                    var delivery_distance = 0;

                    var category_cost = 0;
                    var sub_category_cost = 0;
                    var shipping_price = 0;
                    var prepaid_amount = 0;

                    var products = [];
                    var source_address = {};
                    var destination_addresses = {};

                    var cgst = 0;
                    var sgst = 0;
                    var igst = 0;
                    // console.log(req.body)

                    Address.findOne({ _id: req.body.source_location }).populate('city')
                        .then(source_response => {
                            source_address = source_response;
                            multiplier_for_pickup = source_response?.city?.extra_delivery_charges;
                            var lat1 = source_response?.position?.coordinates[0] ? source_response?.position?.coordinates[0] : 0;
                            var lon1 = source_response?.position?.coordinates[1] ? source_response?.position?.coordinates[1] : 0;
                            Office.findOne({ city: source_response?.city })
                                .then(offc_resp => {
                                    var lat2 = offc_resp?.position?.coordinates[0] ? offc_resp?.position?.coordinates[0] : 0;
                                    var lon2 = offc_resp?.position?.coordinates[1] ? offc_resp?.position?.coordinates[1] : 0;
                                    var distance1 = latLonDistanceCalculate(lat1, lon1, lat2, lon2);
                                    pickup_distance = distance1;

                                    Address.findOne({ _id: req.body.destination_location }).populate('city')
                                        .then(destination_response => {
                                            destination_addresses = destination_response;
                                            multiplier_for_delivery = destination_response?.city?.extra_delivery_charges;
                                            var lat1 = destination_response?.position?.coordinates[0] ? destination_response?.position?.coordinates[0] : 0;
                                            var lon1 = destination_response?.position?.coordinates[1] ? destination_response?.position?.coordinates[1] : 0;
                                            Office.findOne({ city: destination_response?.city })
                                                .then(offc_resp => {
                                                    var lat2 = offc_resp?.position?.coordinates[0] ? offc_resp?.position?.coordinates[0] : 0;
                                                    var lon2 = offc_resp?.position?.coordinates[1] ? offc_resp?.position?.coordinates[1] : 0;
                                                    var distance2 = latLonDistanceCalculate(lat1, lon1, lat2, lon2);
                                                    delivery_distance = distance2;

                                                    GharKakhanaCart.find({ user: req.body.userId })
                                                        .populate("category sub_category")
                                                        .then(cart_response => {
                                                            for (var i = 0; i < cart_response?.length; i++) {
                                                                total_weight = total_weight + Number(cart_response[i].weight);
                                                                if (cart_response[i].category?.additional_cost) {
                                                                    category_cost = category_cost + Number(cart_response[i].category.additional_cost);
                                                                }
                                                                if (cart_response[i].sub_category?.additional_cost) {
                                                                    sub_category_cost = sub_category_cost + Number(cart_response[i].sub_category.additional_cost);
                                                                }
                                                                products.push({
                                                                    name: cart_response[i].name,
                                                                    weight: cart_response[i].weight,
                                                                    category: cart_response[i].category._id,
                                                                    sub_category: cart_response[i].sub_category._id
                                                                });
                                                            };
                                                            if (pickup_distance) {
                                                                if (Number(pickup_distance) > Number(pick_up_free_distance)) {
                                                                    pickup_price = (Number(pickup_distance) - Number(pick_up_free_distance)).toFixed(2) * Number(multiplier_for_pickup);
                                                                }
                                                            }
                                                            if (delivery_distance) {
                                                                if (Number(delivery_distance) > Number(delivery_free_distance)) {
                                                                    delivery_price = (Number(delivery_distance) - Number(delivery_free_distance)).toFixed(2) * Number(multiplier_for_delivery);
                                                                }
                                                            }
                                                            if (total_weight > .5) {
                                                                if (req.body.delivery_type === "express") {
                                                                    total_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg_express))) + (category_cost + sub_category_cost)) + pickup_price + delivery_price;
                                                                    shipping_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg_express))) + (category_cost + sub_category_cost));
                                                                } else {
                                                                    total_price = Number(ghar_ka_khana_multiplier_price_500gm) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg))) + (category_cost + sub_category_cost)) + pickup_price + delivery_price;
                                                                    shipping_price = Number(ghar_ka_khana_multiplier_price_500gm) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg))) + (category_cost + sub_category_cost));
                                                                }
                                                            } else if (total_weight <= .5) {
                                                                if (req.body.delivery_type === "express") {
                                                                    total_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + category_cost + sub_category_cost + pickup_price + delivery_price;
                                                                    shipping_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + category_cost + sub_category_cost;
                                                                } else {
                                                                    total_price = Number(ghar_ka_khana_multiplier_price_500gm) + category_cost + sub_category_cost + pickup_price + delivery_price;
                                                                    shipping_price = Number(ghar_ka_khana_multiplier_price_500gm) + category_cost + sub_category_cost;
                                                                }
                                                            }
                                                            CutOffTime.findOne({ start_city: source_response?.city, end_city: destination_response?.city }, null, {})
                                                                .sort({
                                                                    created_date: -1,
                                                                })
                                                                .then((cutoff_response) => {
                                                                    if (cutoff_response == null) {
                                                                        res.status(200).send({
                                                                            status: "error",
                                                                            message: "We are not delivering to your city",
                                                                            // result: response,
                                                                        });
                                                                        return;
                                                                    }
                                                                    // var current_time = moment.tz("Asia/Kolkata").unix();
                                                                    var delivery_timeslot;
                                                                    var delivery_dat;
                                                                    var remarks = cutoff_response.remarks;
                                                                    var express_remarks = cutoff_response.express_remarks;

                                                                    if (req.body.pickup_date && req.body.pickup_time) {
                                                                        function convertTo24Hour(time12h) {
                                                                            const [time, modifier] = time12h?.split(' ');
                                                                            let [hours, minutes] = time?.split(':');
                                                                            if (hours === '12') { hours = '00' };
                                                                            if (modifier === 'PM') { hours = parseInt(hours, 10) + 12; }
                                                                            return `${hours}:${minutes}`;
                                                                        }



                                                                        const timeString = req.body.pickup_time;
                                                                        const pickupDate = req.body.pickup_date;
                                                                        const [startTime, endTime] = timeString.split(' - ');
                                                                        let combinedDateTime = new Date(pickupDate + " " + endTime);
                                                                        let converted_pickup_time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(combinedDateTime);

                                                                        const endTime24 = convertTo24Hour(endTime);



                                                                        var today = new Date();
                                                                        var dd = String(today.getDate() + 1).padStart(2, "0");

                                                                        var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
                                                                        var yyyy = today.getFullYear();
                                                                        today = mm + "/" + dd + "/" + yyyy;

                                                                        ////////////
                                                                        var express_cut_of_time_first = today + " " + cutoff_response.express_cut_of_time_first + ":00";
                                                                        express_cut_of_time_first = Date.parse(express_cut_of_time_first) / 1000;
                                                                        var express_cut_of_time_second = today + " " + cutoff_response.express_cut_of_time_second + ":00";
                                                                        express_cut_of_time_second = Date.parse(express_cut_of_time_second) / 1000;


                                                                        // if (current_time < express_cut_of_time_second) {
                                                                        //     var timeslot = "Afternoon";
                                                                        // }
                                                                        // if (current_time < express_cut_of_time_first) {
                                                                        //     var timeslot = "Night";
                                                                        // } else {
                                                                        //     var timeslot = "Night";
                                                                        // };
                                                                        function timeToMinutes(time) {
                                                                            const [hours, minutes] = time.split(':').map(Number);
                                                                            return hours * 60 + minutes;
                                                                        };

                                                                        // Function to convert total minutes back to HH:mm format
                                                                        function minutesToTime(minutes) {
                                                                            const hours = Math.floor(minutes / 60);
                                                                            const mins = minutes % 60;
                                                                            return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
                                                                        };

                                                                        function adjustedDeliveryDate(deliveryDate, adjustedTime) {
                                                                            const year = deliveryDate.getFullYear();
                                                                            const month = String(deliveryDate.getMonth() + 1).padStart(2, '0');
                                                                            const day = String(deliveryDate.getDate()).padStart(2, '0');
                                                                            const inputTime = moment.tz(adjustedTime, 'HH:mm', 'Asia/Kolkata');
                                                                            const utcTime = inputTime.clone().utc();

                                                                            // Format UTC time as required
                                                                            const formattedUTC = `${year}-${month}-${day}T${utcTime.format('HH:mm')}:00.000Z`;
                                                                            return formattedUTC;
                                                                        }


                                                                        function getTimeInMinutes(timeString) {
                                                                            const [hours, minutes] = timeString.split(':').map(Number);
                                                                            return hours * 60 + minutes;
                                                                        }

                                                                        var express_shipping = 0 // Number(cutoff_response.express_delivery_cost) * Number(total_weight);
                                                                        var normal_shipping = 0 //Number(cutoff_response.normal_delivery_cost) * Number(total_weight);
                                                                        if (req.body.delivery_type === "express") {
                                                                            total_price = Number(total_price) + Number(express_shipping);
                                                                            if (getTimeInMinutes(converted_pickup_time) <= getTimeInMinutes(cutoff_response.express_cut_of_time_first)) {
                                                                                var adjustedTime = cutoff_response.express_final_delivery_time_first
                                                                                delivery_timeslot = cutoff_response.timeslot_first;
                                                                            }
                                                                            else {
                                                                                var adjustedTime = cutoff_response.express_final_delivery_time_second
                                                                                var daysToAdd = 1
                                                                                delivery_timeslot = cutoff_response.timeslot_second;

                                                                            }

                                                                            // const { adjustedTime, daysToAdd } = addTimes(endTime24, cutoff_response.express_cut_of_time_first);
                                                                            let deliveryDate = new Date(req.body.pickup_date);
                                                                            if (daysToAdd > 0) {
                                                                                deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
                                                                            }
                                                                            delivery_dat = adjustedDeliveryDate(deliveryDate, adjustedTime);
                                                                        } else {

                                                                            total_price = Number(total_price) + Number(normal_shipping);
                                                                            if (getTimeInMinutes(converted_pickup_time) <= getTimeInMinutes(cutoff_response.cut_of_time)) {
                                                                                var adjustedTime = cutoff_response.final_delivery_time
                                                                                var daysToAdd = 1
                                                                                delivery_timeslot = cutoff_response.timeslot;


                                                                            }
                                                                            if (getTimeInMinutes(converted_pickup_time) > getTimeInMinutes(cutoff_response.cut_of_time)) {
                                                                                var adjustedTime = cutoff_response.final_delivery_time
                                                                                var daysToAdd = 2
                                                                                delivery_timeslot = cutoff_response.timeslot;

                                                                            }
                                                                            // const { adjustedTime, daysToAdd } = addTimes(endTime24, cutoff_response.cut_of_time);
                                                                            let deliveryDate = new Date(req.body.pickup_date);
                                                                            if (daysToAdd > 0) {
                                                                                deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
                                                                            }
                                                                            delivery_dat = adjustedDeliveryDate(deliveryDate, adjustedTime);
                                                                        };
                                                                    }
                                                                    // else{
                                                                    //     var express_shipping = Number(cutoff_response.express_delivery_cost) * Number(total_weight);
                                                                    //     var normal_shipping = Number(cutoff_response.normal_delivery_cost) * Number(total_weight);
                                                                    //     if (req.body.delivery_type === "express") {
                                                                    //         total_price = Number(total_price) + Number(express_shipping)
                                                                    //     } else  {
                                                                    //       total_price = Number(total_price) + Number(normal_shipping);

                                                                    //     };
                                                                    // }

                                                                    if (source_address && source_address.city == "6040eae14a4b6c0008fe1aff") {
                                                                        cgst = (Number(total_price) * Number(ghar_ka_khana_cgst)) / 100;
                                                                        sgst = (Number(total_price) * Number(ghar_ka_khana_sgst)) / 100;
                                                                    } else {
                                                                        igst = (Number(total_price) * Number(ghar_ka_khana_igst)) / 100;
                                                                    }

                                                                    var where = {};
                                                                    where["service_zipcode"] = {
                                                                        $regex: source_address?.pincode,
                                                                    };
                                                                    where["user_type"] = "delivery_partner";
                                                                    where["deleted"] = 0;
                                                                    Users.findOne(where).then((vendor_response) => {
                                                                        if (vendor_response === null) {
                                                                            res.status(200).send({
                                                                                status: "error",
                                                                                message: "Pickup is not available at this location.",
                                                                                where: source_address?.pincode
                                                                            });
                                                                            return;
                                                                        }
                                                                        var where = {};
                                                                        where["service_zipcode"] = {
                                                                            $regex: destination_addresses?.pincode,
                                                                        };
                                                                        where["user_type"] = "delivery_partner";
                                                                        where["deleted"] = 0;
                                                                        Users.findOne(where).then((delivery_response) => {
                                                                            if (delivery_response === null) {
                                                                                if (vendor_response === null) {
                                                                                    res.status(200).send({
                                                                                        status: "error",
                                                                                        message: "Delivery is not available at this location.",
                                                                                        where: where
                                                                                    });
                                                                                    return;
                                                                                }
                                                                            }


                                                                            total_price = Math.round(total_price + Number(cgst) + Number(sgst) + Number(igst))
                                                                            prepaid_amount = (Number(total_price) * Number(ghar_ka_khana_minimum_paid_amount_in_percentage)) / 100;
                                                                            var remaining_amount = Number(total_price) - Number(prepaid_amount);
                                                                            GharKakhanaCart.find({ user: req.body.userId })
                                                                                .then(response => {
                                                                                    res.status(200).send({
                                                                                        status: "success",
                                                                                        message: "Cart data found",
                                                                                        result: response,
                                                                                        shipping_price: shipping_price,
                                                                                        delivery_date: delivery_dat ? delivery_dat : "",
                                                                                        delivery_timeslot: delivery_timeslot ? delivery_timeslot : "",
                                                                                        total_price: total_price,
                                                                                        total_weight: total_weight?.toFixed(2),
                                                                                        pickup_price: pickup_price,
                                                                                        delivery_price: delivery_price,
                                                                                        pickup_distance: pickup_distance?.toFixed(2),
                                                                                        delivery_distance: delivery_distance?.toFixed(2),
                                                                                        cgst: cgst?.toFixed(2),
                                                                                        sgst: sgst?.toFixed(2),
                                                                                        igst: igst?.toFixed(2),
                                                                                        multiplier_for_pickup: multiplier_for_pickup,
                                                                                        pick_up_free_distance: pick_up_free_distance,
                                                                                        multiplier_for_delivery: multiplier_for_delivery,
                                                                                        delivery_free_distance: delivery_free_distance,
                                                                                        remarks: req.body.delivery_type === "express" ? express_remarks : remarks,
                                                                                        prepaid_amount: prepaid_amount?.toFixed(2),
                                                                                        prepaid_amount_percentage: ghar_ka_khana_minimum_paid_amount_in_percentage,
                                                                                        remaining_amount: remaining_amount

                                                                                    })
                                                                                }).catch(err => console.log("Ghar Ka Khana fetch Cart error"))

                                                                        })
                                                                    })
                                                                });

                                                        })
                                                });
                                        })
                                });
                        });
                })
        });
    },
    gharKakhanaDeleteCart: function (req, res) {
        GharKakhanaCart.findOneAndRemove({ _id: req.body.id })
            .exec()
            .then(() => {
                res.status(200).send({
                    status: "success",
                    message: "Cart data deleted",
                });
            }).catch(() => console.log("Ghar Ka Khana delete Cart error"))
    },
     gharKaKhanaOrdersCreate: function (req, res) {
        var userId = req.body.userId;
        //var cartPrice = req.body.cartprice
        var where = {};
        where["_id"] = userId;
        Users.findOne(where).then((user_response) => {
            if (user_response?.login_active == 0) {
                res.status(200).send({
                    status: "error",
                    message: "Your account is deactivated by admin",
                    result: [],
                });
                return;
            };


            var date = new Date();
            var d = date.getDay();
            var orderId = "A2A-" + Math.floor(Date.now() / 1000);
            Settings.find()
                .sort("order")
                .then((settings_response) => {
                    var pick_up_free_distance = settings_response[51]?.value;
                    // var multiplier_for_pickup = settings_response[52]?.value;
                    var multiplier_for_pickup = "";
                    var delivery_free_distance = settings_response[53]?.value;
                    // var multiplier_for_delivery = settings_response[54]?.value;
                    var multiplier_for_delivery = "";
                    var ghar_ka_khana_multiplier_price_500gm = settings_response[55]?.value;
                    var ghar_ka_khana_multiplier_price_1kg = settings_response[56]?.value;
                    var ghar_ka_khana_cgst = settings_response[57]?.value;
                    var ghar_ka_khana_sgst = settings_response[58]?.value;
                    var ghar_ka_khana_igst = settings_response[59]?.value;
                    var ghar_ka_khana_multiplier_price_500gm_express = settings_response[60]?.value;
                    var ghar_ka_khana_multiplier_price_1kg_express = settings_response[61]?.value;

                    var total_weight = 0;
                    var total_price = 0;
                    var customer_mobile = user_response.mobile;

                    var pickup_price = 0;
                    var pickup_distance = 0;

                    var delivery_price = 0;
                    var delivery_distance = 0;

                    var category_cost = 0;
                    var sub_category_cost = 0;

                    var products = [];
                    var source_address = {};
                    var destination_addresses = {};

                    var cgst = 0;
                    var sgst = 0;
                    var igst = 0;

                    Address.findOne({ _id: req.body.source_location }).populate('city')
                        .then(source_response => {
                            source_address = source_response;
                            multiplier_for_pickup = source_response?.city?.extra_delivery_charges;

                            var lat1 = source_response?.position?.coordinates[0] ? source_response?.position?.coordinates[0] : 0;
                            var lon1 = source_response?.position?.coordinates[1] ? source_response?.position?.coordinates[1] : 0;
                            Office.findOne({ city: source_response.city })
                                .then(offc_resp => {
                                    var lat2 = offc_resp?.position?.coordinates[0] ? offc_resp?.position?.coordinates[0] : 0;
                                    var lon2 = offc_resp?.position?.coordinates[1] ? offc_resp?.position?.coordinates[1] : 0;
                                    var distance1 = latLonDistanceCalculate(lat1, lon1, lat2, lon2);
                                    pickup_distance = distance1;

                                    Address.findOne({ _id: req.body.destination_location }).populate('city')
                                        .then(destination_response => {
                                            destination_addresses = destination_response;
                                            multiplier_for_delivery = destination_response?.city?.extra_delivery_charges;
                                            var lat1 = destination_response?.position?.coordinates[0] ? destination_response?.position?.coordinates[0] : 0;
                                            var lon1 = destination_response?.position?.coordinates[1] ? destination_response?.position?.coordinates[1] : 0;
                                            Office.findOne({ city: destination_response.city })
                                                .then(offc_resp => {
                                                    var lat2 = offc_resp?.position?.coordinates[0] ? offc_resp?.position?.coordinates[0] : 0;
                                                    var lon2 = offc_resp?.position?.coordinates[1] ? offc_resp?.position?.coordinates[1] : 0;
                                                    var distance2 = latLonDistanceCalculate(lat1, lon1, lat2, lon2);
                                                    delivery_distance = distance2;

                                                    GharKakhanaCart.find({ user: req.body.userId })
                                                        .populate("category sub_category")
                                                        .then(cart_response => {
                                                            for (var i = 0; i < cart_response?.length; i++) {
                                                                total_weight = total_weight + Number(cart_response[i].weight);
                                                                if (cart_response[i].category?.additional_cost) {
                                                                    category_cost = category_cost + Number(cart_response[i].category.additional_cost);
                                                                }
                                                                if (cart_response[i].sub_category?.additional_cost) {
                                                                    sub_category_cost = sub_category_cost + Number(cart_response[i].sub_category.additional_cost);
                                                                }
                                                                products.push({
                                                                    name: cart_response[i].name,
                                                                    weight: cart_response[i].weight,
                                                                    category: cart_response[i].category._id,
                                                                    sub_category: cart_response[i].sub_category._id
                                                                });
                                                            };
                                                            if (pickup_distance) {
                                                                if (Number(pickup_distance) > Number(pick_up_free_distance)) {
                                                                    pickup_price = (Number(pickup_distance) - Number(pick_up_free_distance)).toFixed(2) * multiplier_for_pickup;
                                                                }
                                                            }
                                                            if (delivery_distance) {
                                                                if (Number(delivery_distance) > Number(delivery_free_distance)) {
                                                                    delivery_price = (Number(delivery_distance) - Number(delivery_free_distance)).toFixed(2) * multiplier_for_delivery;
                                                                }
                                                            }
                                                            if (total_weight > .5) {
                                                                if (req.body.delivery_type === "express") {
                                                                    total_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg_express))) + (category_cost + sub_category_cost)) + pickup_price + delivery_price;
                                                                    shipping_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg_express))) + (category_cost + sub_category_cost));

                                                                    // total_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg))) + (category_cost + sub_category_cost)) + pickup_price + delivery_price;
                                                                } else {
                                                                    total_price = Number(ghar_ka_khana_multiplier_price_500gm) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg))) + (category_cost + sub_category_cost)) + pickup_price + delivery_price;
                                                                    shipping_price = Number(ghar_ka_khana_multiplier_price_500gm) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg))) + (category_cost + sub_category_cost));
                                                                }
                                                            } else if (total_weight <= .5) {

                                                                if (req.body.delivery_type === "express") {
                                                                    total_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + category_cost + sub_category_cost + pickup_price + delivery_price;
                                                                    shipping_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + category_cost + sub_category_cost;
                                                                } else {
                                                                    total_price = Number(ghar_ka_khana_multiplier_price_500gm) + category_cost + sub_category_cost + pickup_price + delivery_price;
                                                                    shipping_price = Number(ghar_ka_khana_multiplier_price_500gm) + category_cost + sub_category_cost;
                                                                }
                                                            }
                                                            CutOffTime.findOne({ start_city: source_response?.city, end_city: destination_response?.city }, null, {})
                                                                .sort({
                                                                    created_date: -1,
                                                                })
                                                                .then((cutoff_response) => {
                                                                    if (cutoff_response == null) {
                                                                        res.status(200).send({
                                                                            status: "error",
                                                                            message: "We are not delivering to your city",
                                                                            // result: response,
                                                                        });
                                                                        return;
                                                                    }
                                                                    // var current_time = moment.tz("Asia/Kolkata").unix();




                                                                    const timeString = req.body.pickup_time;
                                                                    const pickupDate = req.body.pickup_date;

                                                                    const [startTime, endTime] = timeString.split(' - ');
                                                                    var combinedDateTime = new Date(pickupDate + " " + endTime);
                                                                    var converted_pickup_time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(combinedDateTime);


                                                                    var today = new Date();
                                                                    var dd = String(today.getDate() + 1).padStart(2, "0");

                                                                    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
                                                                    var yyyy = today.getFullYear();
                                                                    today = mm + "/" + dd + "/" + yyyy;

                                                                    ////////////
                                                                    var express_cut_of_time_first = today + " " + cutoff_response.express_cut_of_time_first + ":00";
                                                                    express_cut_of_time_first = Date.parse(express_cut_of_time_first) / 1000;
                                                                    var express_cut_of_time_second = today + " " + cutoff_response.express_cut_of_time_second + ":00";
                                                                    express_cut_of_time_second = Date.parse(express_cut_of_time_second) / 1000;


                                                                    // if (current_time < express_cut_of_time_second) {
                                                                    //     var timeslot = "Afternoon";
                                                                    // }
                                                                    // if (current_time < express_cut_of_time_first) {
                                                                    //     var timeslot = "Night";
                                                                    // } else {
                                                                    //     var timeslot = "Night";
                                                                    // };
;

                                                                    // Function to convert total minutes back to HH:mm format
;

                                                                    function adjustedDeliveryDate(deliveryDate, adjustedTime) {
                                                                        const year = deliveryDate.getFullYear();
                                                                        const month = String(deliveryDate.getMonth() + 1).padStart(2, '0');
                                                                        const day = String(deliveryDate.getDate()).padStart(2, '0');
                                                                        const inputTime = moment.tz(adjustedTime, 'HH:mm', 'Asia/Kolkata');
                                                                        const utcTime = inputTime.clone().utc();

                                                                        // Format UTC time as required
                                                                        const formattedUTC = `${year}-${month}-${day}T${utcTime.format('HH:mm')}:00.000Z`;
                                                                        return formattedUTC;
                                                                    }

                                                                    function getTimeInMinutes(timeString) {
                                                                        const [hours, minutes] = timeString.split(':').map(Number);
                                                                        return hours * 60 + minutes;
                                                                    }

                                                                    var express_shipping = 0//Number(cutoff_response.express_delivery_cost) * Number(total_weight);
                                                                    var normal_shipping = 0//Number(cutoff_response.normal_delivery_cost) * Number(total_weight);
                                                                    var delivery_timeslot;
                                                                    var delivery_dat;

                                                                    if (req.body.delivery_type === "express") {
                                                                        total_price = Number(total_price) + Number(express_shipping);
                                                                        if (getTimeInMinutes(converted_pickup_time) <= getTimeInMinutes(cutoff_response.express_cut_of_time_first)) {
                                                                            var adjustedTime = cutoff_response.express_final_delivery_time_first;
                                                                            delivery_timeslot = cutoff_response.timeslot_first;


                                                                        }
                                                                        else {
                                                                            var adjustedTime = cutoff_response.express_final_delivery_time_second
                                                                            var daysToAdd = 1
                                                                            delivery_timeslot = cutoff_response.timeslot_second;

                                                                        }

                                                                        // const { adjustedTime, daysToAdd } = addTimes(endTime24, cutoff_response.express_cut_of_time_first);
                                                                        var deliveryDate = new Date(req.body.pickup_date);
                                                                        if (daysToAdd > 0) {
                                                                            deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
                                                                        }
                                                                        delivery_dat = adjustedDeliveryDate(deliveryDate, adjustedTime);
                                                                    } else {
                                                                        total_price = Number(total_price) + Number(normal_shipping);
                                                                        if (getTimeInMinutes(converted_pickup_time) <= getTimeInMinutes(cutoff_response.cut_of_time)) {
                                                                            var adjustedTime = cutoff_response.final_delivery_time
                                                                            var daysToAdd = 1
                                                                            delivery_timeslot = cutoff_response.timeslot;


                                                                        }
                                                                        if (getTimeInMinutes(converted_pickup_time) > getTimeInMinutes(cutoff_response.cut_of_time)) {
                                                                            var adjustedTime = cutoff_response.final_delivery_time
                                                                            var daysToAdd = 2
                                                                            delivery_timeslot = cutoff_response.timeslot;

                                                                        }
                                                                        // const { adjustedTime, daysToAdd } = addTimes(endTime24, cutoff_response.cut_of_time);
                                                                        var deliveryDate = new Date(req.body.pickup_date);
                                                                        if (daysToAdd > 0) {
                                                                            deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
                                                                        }
                                                                        delivery_dat = adjustedDeliveryDate(deliveryDate, adjustedTime);
                                                                    };
                                                                    if (source_address && source_address.city == "6040eae14a4b6c0008fe1aff") {
                                                                        cgst = (Number(total_price) * Number(ghar_ka_khana_cgst)) / 100;
                                                                        sgst = (Number(total_price) * Number(ghar_ka_khana_sgst)) / 100;
                                                                    } else {
                                                                        igst = (Number(total_price) * Number(ghar_ka_khana_igst)) / 100;
                                                                    }
                                                                    var where = {};
                                                                    where["service_zipcode"] = {
                                                                        $regex: source_address?.pincode,
                                                                    };
                                                                    where["user_type"] = "delivery_partner";
                                                                    where["deleted"] = 0;
                                                                    Users.findOne(where).then((vendor_response) => {
                                                                        if (vendor_response === null) {
                                                                            res.status(200).send({
                                                                                status: "error",
                                                                                message: "Pickup is not available at this location.",
                                                                                where: source_address?.pincode
                                                                            });
                                                                            return;
                                                                        }
                                                                        var where = {};
                                                                        where["service_zipcode"] = {
                                                                            $regex: destination_addresses?.pincode,
                                                                        };
                                                                        where["user_type"] = "delivery_partner";
                                                                        where["deleted"] = 0;
                                                                        Users.findOne(where).then((delivery_response) => {
                                                                            if (delivery_response === null) {

                                                                                res.status(200).send({
                                                                                    status: "error",
                                                                                    message: "Delivery is not available at this location.",
                                                                                    where: where
                                                                                });
                                                                                return;
                                                                            }
                                                                            where["multiple_city"] = { $in: [destination_response.city] };
                                                                            where["user_type"] = "lp_head";
                                                                            where["deleted"] = 0;
                                                                            Users.findOne(where).then((lp_head_response) => {

                                                                                var where = {};
                                                                                where["multiple_city"] = { $in: [destination_response.city] };
                                                                                where["user_type"] = "lp_manager";
                                                                                where["service_zipcode"] = {
                                                                                    $regex: destination_addresses?.pincode,
                                                                                };
                                                                                where["deleted"] = 0;
                                                                                Users.findOne(where).then((lp_manager_response) => {

                                                                                    total_price = Math.round(total_price + Number(cgst) + Number(sgst) + Number(igst))
                                                                                    if (req.body.paid_amount) {
                                                                                        var dues_amount = Number(total_price) - Number(req.body.paid_amount);

                                                                                    }

                                                                                    var where1 = {};
                                                                                    where1["user"] = req.body.userId;
                                                                                    where1["status"] = "delivered";
                                                                                    GharKakhanaOrders.find(where1).countDocuments(function (err, orcount) {
                                                                                        var order = new GharKakhanaOrders({
                                                                                            orderid: orderId,
                                                                                            status: "booking_confirmed",
                                                                                            user: req.body.userId,
                                                                                            source_location: req.body.source_location,
                                                                                            destination_location: req.body.destination_location,
                                                                                            products: products,
                                                                                            shipping_price: shipping_price,
                                                                                            remarks: req.body.remarks,
                                                                                            pickup_date: req.body.pickup_date,
                                                                                            pickup_time: req.body.pickup_time,
                                                                                            delivery_type: req.body.delivery_type,
                                                                                            delivery_date: delivery_dat,
                                                                                            delivery_timeslot: delivery_timeslot,
                                                                                            total_price: total_price.toFixed(2),
                                                                                            total_weight: total_weight?.toFixed(2),
                                                                                            pickup_price: pickup_price,
                                                                                            delivery_price: delivery_price,
                                                                                            pickup_distance: pickup_distance?.toFixed(2),
                                                                                            delivery_distance: delivery_distance?.toFixed(2),
                                                                                            order_confirmation: 1,
                                                                                            pickup_partner: vendor_response?._id ? vendor_response?._id : null,
                                                                                            delivery_partner: delivery_response?._id,
                                                                                            cgst: cgst?.toFixed(2),
                                                                                            sgst: sgst?.toFixed(2),
                                                                                            igst: igst?.toFixed(2),
                                                                                            multiplier_for_pickup: multiplier_for_pickup,
                                                                                            pick_up_free_distance: pick_up_free_distance,
                                                                                            multiplier_for_delivery: multiplier_for_delivery,
                                                                                            delivery_free_distance: delivery_free_distance,
                                                                                            source_city: source_response?.city,
                                                                                            destination_city: destination_response?.city,
                                                                                            paid_amount: req.body.paid_amount,
                                                                                            dues_amount: dues_amount?.toFixed(2),
                                                                                            order_count: Number(orcount ? orcount : 0) + 1,
                                                                                            browser: req.body.browser ? req.body.browser : "",
                                                                                            transactionid: req.body?.transactionid,
                                                                                            gateway: req.body.gateway,
                                                                                            lp_head: lp_head_response?._id,
                                                                                            lp_manager: lp_manager_response?._id,
                                                                                            shop_id: req.body?.shop_id,
                                                                                            otp: Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111


                                                                                        });
                                                                                        order.save(function (err, response) {
                                                                                            if (err) {
                                                                                                res.status(200).send({
                                                                                                    status: "error",
                                                                                                    message: err,
                                                                                                    result: [],
                                                                                                    OTP: "",
                                                                                                });
                                                                                            } else {

                                                                                                GharKakhanaCart.deleteMany({ user: req.body.userId }, function (err, result) {

                                                                                                    if (result) {
                                                                                                        var parameters = [
                                                                                                            orderId,
                                                                                                            moment(moment(delivery_dat)).format("YYYY-MM-DD"),
                                                                                                            delivery_timeslot
                                                                                                        ];
                                                                                                        SendWATI("booking_confirmation_em", parameters, customer_mobile);
                                                                                                        res.status(200).send({
                                                                                                            status: "success",
                                                                                                            message: "Ghar ka khana order booked.",
                                                                                                            data: response,
                                                                                                            normal_remarks: cutoff_response?.remarks,
                                                                                                            express_remarks: cutoff_response?.express_remarks
                                                                                                        });
                                                                                                    }
                                                                                                    if (err) {
                                                                                                        res.status(200).send({
                                                                                                            status: "error",
                                                                                                            message: "error in data devare",
                                                                                                            error: err
                                                                                                        });
                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        });
                                                                                    });




                                                                                });
                                                                            });
                                                                        });
                                                                    })


                                                                    // res.status(200).send({
                                                                    //     status: "success",
                                                                    //     message: "Ghar ka khana order booked.",
                                                                    //     total: Math.round(total_price),
                                                                    //     total_weight: total_weight,
                                                                    //     category_cost: category_cost,
                                                                    //     sub_category_cost: sub_category_cost,
                                                                    //     pickup_price: pickup_price,
                                                                    //     delivery: delivery_price,
                                                                    //     cart_response: cart_response
                                                                    // });
                                                                });

                                                        })
                                                });
                                        })
                                });
                        });
                })
        });
    },
    ghar_ka_khana_confirm_checkout: function (req, res) {
        GharKakhanaOrders.findOne({ _id: req.body.id })
            .populate("source_location destination_location")
            .then(order_response => {
                let order_respons = order_response;
                let where = {};
                where["service_zipcode"] = {
                    $regex: order_respons?.source_location?.pincode,
                };
                where["user_type"] = "pickup_partner";
                where["deleted"] = 0;
                Users.findOne(where).then((vendor_response) => {
                    let where = {};
                    if (vendor_response === null) {
                        res.status(200).send({
                            status: "error",
                            message: "Pickup is not available at this location.",
                        });
                        return;
                    }
                    where["service_zipcode"] = {
                        $regex: order_respons?.destination_location?.pincode,
                    };
                    where["user_type"] = "delivery_partner";
                    where["deleted"] = 0;
                    Users.findOne(where).then((delivery_response) => {
                        if (delivery_response === null) {
                            if (vendor_response === null) {
                                res.status(200).send({
                                    status: "error",
                                    message: "Delivery is not available at this location.",
                                    where: order_respons?.destination_location?.pincode
                                });
                                return;
                            }
                        }

                        GharKakhanaOrders.findOneAndUpdate({ _id: req.body.id },
                            {
                                order_confirmation: 1,
                                pickup_partner: vendor_response?._id ? vendor_response?._id : null,
                                delivery_partner: delivery_response?._id
                            },
                            {
                                new: true,
                            })
                            .exec()
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    message: "Order has been created successfully.",
                                    result: response,
                                });
                            }).catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });
                    });
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    result: [],
                });
            });
    },

    ghar_ka_khana_category_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["active"] = 1;
            where["deleted"] = 0;
            where["parent"] = { $ne: null }
            // console.log("SDA", where)
            GharKaKhanaCategories.find(where)
                .populate("parent", "name")
                .sort("name")
                .then((response) => {
                    GharKaKhanaCategories.find(where).countDocuments(function (err, count) {
                        res.status(200).send({
                            status: "success",
                            result: response,
                            totalCount: count,
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },
    delete_user_data: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            // where["_id"] = req.body.id;
            // console.log(req.body, "BODY")
            Users.findOneAndUpdate(
                { _id: req.body.id },
                {
                    deleted: 1,
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    res.status(200).send({
                        status: "success",
                        message: "User data is successfully deleted.",
                    });
                }).catch(err => console.log(err))
        }
    },
    ghar_ka_khana_fetch_orders_pickup_partner: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            if (req.query.pickup_city) {
                where['source_location'] = req.query.pickup_city;
            }
            if (req.query.destination_location) {
                where['destination_location'] = req.query.destination_location;
            }
            if (req.query.start_date && req.query.start_date != "" && req.query.end_date && req.query.end_date != "") {
                // let start = moment(moment(req.query.start_date)).subtract(1, "days").format("YYYY-MM-DD");
                // let end = moment(moment(req.query.end_date)).add(1, "days").format("YYYY-MM-DD");

                let start = moment(moment(req.query.start_date).startOf("day")).toISOString();
                let end = moment(moment(req.query.end_date).endOf("day")).toISOString();

                where["delivery_date"] = {
                    $gte: new Date(start),
                    $lt: new Date(end),
                };
            }
            if (req.query.orderid) {
                where["orderid"] = req.query.orderid
            }
            if (req.query.delivery_type) {
                where["delivery_type"] = req.query.delivery_type;
            };
            where['pickup_partner'] = req.query.pickup_partner;

            where["$or"] = [
                {
                    status: "booking_confirmed",
                },
                {
                    status: "pickup_boy_assigned",
                },
                {
                    status: "order_initiated",
                },
                {
                    status: "pickup_boy_started",
                },

            ];

            where["deleted"] = 0;
            GharKakhanaOrders.find(where, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.page),
            }).sort("-createdAt")
                .populate("user")
                .populate("source_location")
                .populate("products.category")
                .populate("products.sub_category")
                .populate("destination_location")
                .populate("lp_manager")
                .populate("lp_head")
                .populate("pickup_partner pickup_boy delivery_partner delivery_boy")
                .populate({
                    path: "source_location",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .populate({
                    path: "destination_location",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .then(response => {
                    GharKakhanaOrders.find(where).countDocuments(function (err, count) {
                        if (err) {
                            console.log(err)
                        }
                        // console.log(where)
                        res.status(200).send({
                            status: "success",
                            result: response,
                            totalCount: count,
                        });
                    })
                })
                .catch(err => console.log(err));
        }
    },
    ghar_ka_khana_fetch_orders_delivery_partner: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            if (req.query.pickup_city) {
                where['source_location'] = req.query.pickup_city;
            }
            if (req.query.destination_location) {
                where['destination_location'] = req.query.destination_location;
            }
            if (req.query.start_date && req.query.start_date != "" && req.query.end_date && req.query.end_date != "") {
                // let start = moment(moment(req.query.start_date)).subtract(1, "days").format("YYYY-MM-DD");
                // let end = moment(moment(req.query.end_date)).add(1, "days").format("YYYY-MM-DD");

                let start = moment(moment(req.query.start_date).startOf("day")).toISOString();
                let end = moment(moment(req.query.end_date).endOf("day")).toISOString();

                where["delivery_date"] = {
                    $gte: new Date(start),
                    $lt: new Date(end),
                };
            }
            if (req.query.orderid) {
                where["orderid"] = req.query.orderid
            }
            if (req.query.delivery_type) {
                where["delivery_type"] = req.query.delivery_type;
            };
            where['delivery_partner'] = req.query.delivery_partner;

            where["$or"] = [
                {
                    status: "booking_confirmed",
                },
                {
                    status: "pickup_boy_assigned",
                },
                {
                    status: "order_initiated",
                },
                {
                    status: "pickup_boy_started",
                },
                {
                    status: "order_picked_up",
                },
                {
                    status: "delivered_to_cargo_partner",
                },
                {
                    status: "received_destination_airport",
                },
                {
                    status: "delivered_to_delivery_partner",
                },

                {
                    status: "delivery_boy_assigned",
                },
                {
                    status: "delivered_to_delivery_partner",
                },

                {
                    status: "delivery_boy_started",
                },
                {
                    status: "order_confirmed",
                },
            ];

            where["deleted"] = 0;
            GharKakhanaOrders.find(where, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.page),
            }).sort("-createdAt")
                .populate("user")
                .populate("source_location")
                .populate("products.category")
                .populate("products.sub_category")
                .populate("destination_location")
                .populate("lp_manager")
                .populate("lp_head")
                .populate("pickup_partner pickup_boy delivery_partner delivery_boy")
                .populate({
                    path: "source_location",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .populate({
                    path: "destination_location",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .then(response => {
                    GharKakhanaOrders.find(where).countDocuments(function (err, count) {
                        if (err) {
                            console.log(err)
                        }
                        res.status(200).send({
                            status: "success",
                            result: response,
                            totalCount: count,
                        });
                    })
                })
                .catch(err => console.log(err));
        }
    },
    ghar_ka_khana_fetch_orders_pickup_boy: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            // where["pickup_date"] = {
            //     $gte: today.toDate(),
            //     $lt: tomorrowEnd.toDate(),
            // };
            if (req.query.pickup_city) {
                where['source_location'] = req.query.pickup_city;
            }
            if (req.query.destination_location) {
                where['destination_location'] = req.query.destination_location;
            }
            if (req.query.start_date && req.query.start_date != "" && req.query.end_date && req.query.end_date != "") {
                // let start = moment(moment(req.query.start_date)).subtract(1, "days").format("YYYY-MM-DD");
                // let end = moment(moment(req.query.end_date)).add(1, "days").format("YYYY-MM-DD");

                let start = moment(moment(req.query.start_date).startOf("day")).toISOString();
                let end = moment(moment(req.query.end_date).endOf("day")).toISOString();

                where["delivery_date"] = {
                    $gte: new Date(start),
                    $lt: new Date(end),
                };
            }
            if (req.query.orderid) {
                where["orderid"] = req.query.orderid
            }
            if (req.query.delivery_type) {
                where["delivery_type"] = req.query.delivery_type;
            };

            where["$or"] = [
                {
                    status: "booking_confirmed",
                },
                {
                    status: "pickup_boy_assigned",
                },
                {
                    status: "order_initiated",
                },
                {
                    status: "pickup_boy_started",
                },


            ];


            where['pickup_boy'] = req.query.pickup_boy;

            where["deleted"] = 0;

            // console.log(where,"WHEREEE")
            GharKakhanaOrders.find(where, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.page),
            }).sort("-createdAt")
                .populate("user")
                .populate("source_location")
                .populate("products.category")
                .populate("products.sub_category")
                .populate("destination_location")
                .populate("pickup_partner pickup_boy delivery_partner delivery_boy")
                .populate("lp_head")
                .populate("lp_manager")
                .populate({
                    path: "source_location",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .populate({
                    path: "destination_location",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .then(response => {
                    GharKakhanaOrders.find(where).countDocuments(function (err, count) {
                        if (err) {
                            console.log(err)
                        }
                        // console.log(where)
                        res.status(200).send({
                            status: "success",
                            result: response,
                            totalCount: count,
                        });
                    })
                })
                .catch(err => console.log(err));
        }
    },
    ghar_ka_khana_fetch_orders_delivery_boy: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            // where["delivery_date"] = {
            //     $gte: today.toDate(),
            //     $lt: tmoment(tomorrow).endOf("day").toDate(),
            // };
            if (req.query.pickup_city) {
                where['source_location'] = req.query.pickup_city;
            }
            if (req.query.destination_location) {
                where['destination_location'] = req.query.destination_location;
            }

            if (req.query.orderid) {
                where["orderid"] = req.query.orderid
            }
            if (req.query.delivery_type) {
                where["delivery_type"] = req.query.delivery_type;
            };

            where["$or"] = [
                {
                    status: "booking_confirmed",
                },
                {
                    status: "pickup_boy_assigned",
                },
                {
                    status: "order_initiated",
                },
                {
                    status: "pickup_boy_started",
                },
                {
                    status: "order_picked_up",
                },
                {
                    status: "delivered_to_cargo_partner",
                },
                {
                    status: "received_destination_airport",
                },
                {
                    status: "delivered_to_delivery_partner",
                },

                {
                    status: "delivery_boy_assigned",
                },
                {
                    status: "delivered_to_delivery_partner",
                },

                {
                    status: "delivery_boy_started",
                },
                {
                    status: "order_confirmed",
                },
            ];

            where['delivery_boy'] = req.query.delivery_boy;

            where["deleted"] = 0;
            GharKakhanaOrders.find(where, null, {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.page),
            }).sort("-createdAt")
                .populate("user")
                .populate("source_location")
                .populate("products.category")
                .populate("products.sub_category")
                .populate("destination_location")
                .populate("pickup_partner pickup_boy delivery_partner delivery_boy")
                .populate("lp_head")
                .populate("lp_manager")
                .populate({
                    path: "source_location",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .populate({
                    path: "destination_location",
                    populate: [
                        {
                            path: "city",
                            model: "cities",
                            select: "name",
                        },
                        {
                            path: "state",
                            model: "states",
                            select: "name",
                        },
                    ],
                })
                .then(response => {
                    GharKakhanaOrders.find(where).countDocuments(function (err, count) {
                        if (err) {
                            console.log(err)
                        }
                        // console.log(where)
                        res.status(200).send({
                            status: "success",
                            result: response,
                            totalCount: count,
                        });
                    })
                })
                .catch(err => console.log(err));
        }
    },
    ghar_ka_khana_update_pickup_partner: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                // token: req.token,
            });
        } else {
            GharKakhanaOrders.findOneAndUpdate(
                { _id: req.body.id },
                {
                    pickup_boy: req.body.pickup_boy,
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    res.status(200).send({
                        status: "success",
                        message: "Pick boy has been assigned.",
                    });
                })
                .catch(err => console.log(err));
        }
    },
    ghar_ka_khana_update_delivery_partner: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                // token: req.token,
            });
        } else {
            GharKakhanaOrders.findOneAndUpdate(
                { _id: req.body.id },
                {
                    delivery_boy: req.body.delivery_boy,
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    res.status(200).send({
                        status: "success",
                        message: "Delivery boy has been assigned.",
                    });
                })
                .catch(err => console.log(err));
        }
    },
    ghar_ka_khana_checking_express_delivery: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                // token: req.token,
            });
        } else {
            Address.findOne({ _id: req.body.source_location }).then((source_response) => {
                Address.findOne({ _id: req.body.destination_location }).then((destination_response) => {
                    CutOffTime.findOne({ start_city: source_response?.city, end_city: destination_response?.city, deleted: 0 }, null, {})
                        .sort({
                            created_date: -1,
                        })
                        .then((cutoff_response) => {
                            if (cutoff_response == null) {
                                res.status(200).send({
                                    status: "error",
                                    message: "Express delivery is not avilable !!",
                                    express: false
                                    // result: response,
                                });
                                return;
                            } else {
                                if (cutoff_response?.express === true) {
                                    res.status(200).send({
                                        status: "success",
                                        message: "Express delivery is avilable !!",
                                        express: true
                                    })
                                } else {
                                    res.status(200).send({
                                        status: "error",
                                        message: "Express delivery is not Avilable !!",
                                        express: false
                                        // result: response,
                                    });
                                }

                            }

                        })

                })

            })
        }
    },
    ghar_ka_khana_customer_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                // token: req.token,
            });
        } else {
            let where = {};
            where["user"] = req.query.id;
            where['order_confirmation'] = 1;
            where['deleted'] = 0;
            // console.log(req.body);
            GharKakhanaOrders.find(where, null, {
                limit: Number(req.query.per_page),
                skip: Number(req.query.page),
            }).sort({
                createdAt: -1,
            })
                .then(response => {
                    res.status(200).send({
                        status: "success",
                        message: "Ghar khana order found",
                        result: response,
                    });
                }).catch(err => console.log(err));
        }
    },
      ghar_ka_khana_order_updated_by_weight: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
            });
        } else {
            var orderId = req.body.orderId;
            var where = {};
            where["orderid"] = orderId;
            GharKakhanaOrders.findOne(where).then((order_response) => {
                if (order_response == null) {
                    res.status(200).send({
                        status: "error",
                        message: "orderID id incorrect !!",
                        result: [],
                    });
                    return;
                };

                Settings.find()
                .sort("order")
                .then((settings_response) => {
                    var pick_up_free_distance = settings_response[51]?.value;
                    var multiplier_for_pickup = "";
                    var delivery_free_distance = settings_response[53]?.value;
                    var multiplier_for_delivery = "";
                    var ghar_ka_khana_multiplier_price_500gm = settings_response[55]?.value;
                    var ghar_ka_khana_multiplier_price_1kg = settings_response[56]?.value;
                    var ghar_ka_khana_cgst = settings_response[57]?.value;
                    var ghar_ka_khana_sgst = settings_response[58]?.value;
                    var ghar_ka_khana_igst = settings_response[59]?.value;
                    var ghar_ka_khana_multiplier_price_500gm_express = settings_response[60]?.value;
                    var ghar_ka_khana_multiplier_price_1kg_express = settings_response[61]?.value;

                    var total_weight = 0;
                    var total_price = 0;
                    var pickup_price = 0;
                    var pickup_distance = 0;
                    var delivery_price = 0;
                    var delivery_distance = 0;
                    var category_cost = 0;
                    var sub_category_cost = 0;
                    var shipping_price = 0;
                    var products = [];
                    var source_address = {};
                    var destination_addresses = {};
                    var cgst = 0;
                    var sgst = 0;
                    var igst = 0;

                    // Calculate total weight from request products
                    req?.body?.products?.forEach((product) => {
                        total_weight += Number(product?.weight);
                        products.push({
                            name: product.name,
                            weight: product.weight,
                            category: product.category,
                            sub_category: product.sub_category
                        });
                    });

                    Address.findOne({ _id: order_response.source_location }).populate('city')
                        .then(source_response => {
                            source_address = source_response;
                            multiplier_for_pickup = source_response?.city?.extra_delivery_charges;

                            var lat1 = source_response?.position?.coordinates[0] ? source_response?.position?.coordinates[0] : 0;
                            var lon1 = source_response?.position?.coordinates[1] ? source_response?.position?.coordinates[1] : 0;
                            Office.findOne({ city: source_response.city })
                                .then(offc_resp => {
                                    var lat2 = offc_resp?.position?.coordinates[0] ? offc_resp?.position?.coordinates[0] : 0;
                                    var lon2 = offc_resp?.position?.coordinates[1] ? offc_resp?.position?.coordinates[1] : 0;
                                    var distance1 = latLonDistanceCalculate(lat1, lon1, lat2, lon2);
                                    pickup_distance = distance1;

                                    Address.findOne({ _id: order_response.destination_location }).populate('city')
                                        .then(destination_response => {
                                            destination_addresses = destination_response;
                                            multiplier_for_delivery = destination_response?.city?.extra_delivery_charges;
                                            var lat1 = destination_response?.position?.coordinates[0] ? destination_response?.position?.coordinates[0] : 0;
                                            var lon1 = destination_response?.position?.coordinates[1] ? destination_response?.position?.coordinates[1] : 0;
                                            Office.findOne({ city: destination_response.city })
                                                .then(offc_resp => {
                                                    var lat2 = offc_resp?.position?.coordinates[0] ? offc_resp?.position?.coordinates[0] : 0;
                                                    var lon2 = offc_resp?.position?.coordinates[1] ? offc_resp?.position?.coordinates[1] : 0;
                                                    var distance2 = latLonDistanceCalculate(lat1, lon1, lat2, lon2);
                                                    delivery_distance = distance2;

                                                    if (pickup_distance) {
                                                        if (Number(pickup_distance) > Number(pick_up_free_distance)) {
                                                            pickup_price = (Number(pickup_distance) - Number(pick_up_free_distance)).toFixed(2) * multiplier_for_pickup;
                                                        }
                                                    }
                                                    if (delivery_distance) {
                                                        if (Number(delivery_distance) > Number(delivery_free_distance)) {
                                                            delivery_price = (Number(delivery_distance) - Number(delivery_free_distance)).toFixed(2) * multiplier_for_delivery;
                                                        }
                                                    }

                                                    if (total_weight > .5) {
                                                        if (order_response.delivery_type === "express") {
                                                            total_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg_express))) + (category_cost + sub_category_cost)) + pickup_price + delivery_price;
                                                            shipping_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg_express))) + (category_cost + sub_category_cost));
                                                        } else {
                                                            total_price = Number(ghar_ka_khana_multiplier_price_500gm) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg))) + (category_cost + sub_category_cost)) + pickup_price + delivery_price;
                                                            shipping_price = Number(ghar_ka_khana_multiplier_price_500gm) + (((Number(total_weight) - .5) * (Number(ghar_ka_khana_multiplier_price_1kg))) + (category_cost + sub_category_cost));
                                                        }
                                                    } else if (total_weight <= .5) {
                                                        if (order_response.delivery_type === "express") {
                                                            total_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + category_cost + sub_category_cost + pickup_price + delivery_price;
                                                            shipping_price = Number(ghar_ka_khana_multiplier_price_500gm_express) + category_cost + sub_category_cost;
                                                        } else {
                                                            total_price = Number(ghar_ka_khana_multiplier_price_500gm) + category_cost + sub_category_cost + pickup_price + delivery_price;
                                                            shipping_price = Number(ghar_ka_khana_multiplier_price_500gm) + category_cost + sub_category_cost;
                                                        }
                                                    }

                                                    if (source_address && source_address.city == "6040eae14a4b6c0008fe1aff") {
                                                        cgst = (Number(total_price) * Number(ghar_ka_khana_cgst)) / 100;
                                                        sgst = (Number(total_price) * Number(ghar_ka_khana_sgst)) / 100;
                                                    } else {
                                                        igst = (Number(total_price) * Number(ghar_ka_khana_igst)) / 100;
                                                    }

                                                    total_price = Math.round(total_price + Number(cgst) + Number(sgst) + Number(igst));
                                                    var dues_amount = Number(total_price) - Number(order_response.paid_amount);

                                                    GharKakhanaOrders.findOneAndUpdate(
                                                        where,
                                                        {
                                                            products: products,
                                                            total_price: total_price.toFixed(2),
                                                            dues_amount: dues_amount.toFixed(2),
                                                            shipping_price: shipping_price,
                                                            total_weight: total_weight?.toFixed(2),
                                                            pickup_price: pickup_price,
                                                            delivery_price: delivery_price,
                                                            pickup_distance: pickup_distance?.toFixed(2),
                                                            delivery_distance: delivery_distance?.toFixed(2),
                                                            cgst: cgst?.toFixed(2),
                                                            sgst: sgst?.toFixed(2),
                                                            igst: igst?.toFixed(2),
                                                            multiplier_for_pickup: multiplier_for_pickup,
                                                            pick_up_free_distance: pick_up_free_distance,
                                                            multiplier_for_delivery: multiplier_for_delivery,
                                                            delivery_free_distance: delivery_free_distance,
                                                            status: "order_initiated",
                                                        },
                                                        { new: true }
                                                    )
                                                    .then((response) => {
                                                        if (response) {
                                                            res.status(200).send({
                                                                status: "success",
                                                                data: response,
                                                                message: "Order Updated Successfully."
                                                            });
                                                        } else {
                                                            res.status(200).send({
                                                                status: "error",
                                                                message: "Order not found."
                                                            });
                                                        }
                                                    })
                                                    .catch(err => {
                                                        console.error(err);
                                                        res.status(200).send({
                                                            status: "error",
                                                            message: "Update failed."
                                                        });
                                                    });
                                                });
                                        });
                                });
                        });
                });
            });
        }
    },
    ghar_ka_khana_order_delivered: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),

            });
        } else {
            let updatedata = {};

            updatedata["status"] = "delivered";
            updatedata["otp"] = "";

            if (req.body.gateway && req.body.gateway.trim() != "") {
                updatedata["gateway"] = req.body.gateway;
            }
            if (req.body.transactionid && req.body.transactionid.trim() != "") {
                updatedata["transactionid"] = req.body.transactionid;
            }


            let where = {};
            where["_id"] = req.body.id;
            GharKakhanaOrders.findOne(where)
                .populate('user')
                .then((response) => {
                    if (req.body.paid_amount && req.body.paid_amount.trim() != "") {
                        updatedata["second_paid_amount"] = req.body.paid_amount;
                        updatedata["dues_amount"] = response?.dues_amount - req.body?.paid_amount;
                        if (response?.dues_amount - req.body?.paid_amount < 1) {
                            updatedata["second_time_payment_status"] = 0;

                        }
                    }
                    if (response.otp == req.body.otp) {
                        let where = {};
                        where["_id"] = req.body.id;
                        GharKakhanaOrders.findOneAndUpdate(
                            where,
                            updatedata,
                            {
                                new: true
                            }
                        ).exec((err, updatedOrder) => {
                            if (err) {
                                // Handle error
                                return res.status(500).send({
                                    status: "error",
                                    message: "An error occurred while processing the request.",
                                });
                            }

                            let parameters = [
                                "CUSTOMER",
                                response.orderid,
                                "DELIVERED"
                                // { name: "1", value: "CUSTOMER" },
                                // { name: "2", value: response.orderid },
                                // { name: "3", value: "DELIVERED" },
                            ];
                            SendWATI("order_update", parameters, response.user.mobile);




                            res.status(200).send({
                                status: "success",
                                message: "order delivered",
                                result: updatedOrder,
                            });
                        });
                    } else {
                        res.status(200).send({
                            status: "error",
                            message: "Invalid OTP",
                        });
                    }

                });


        }
    },
    ghar_ka_khana_pickup_boy_order_start: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;
            GharKakhanaOrders.findOneAndUpdate(
                where,
                {
                    status: "pickup_boy_started",
                },
                {
                    new: true,
                }
            )
                .exec()
                .then(() => {
                    const authHeader = req.headers["authorization"];
                    const token = authHeader && authHeader.split(" ")[0];
                    const decodedToken = jwt.decode(token);
                    const userId = decodedToken?.user_id;

                    const orderLog = new OrderLog({
                        ghar_ka_khana_order: req?.body?.id || req?.query?.id,
                        updated_by_user: userId,
                        event: "Picup boy Status Changed",
                        event_data: "pickup_boy_started",
                        type: "Order"
                    });

                    orderLog.save(function (err) {
                        if (err) {
                            return;
                        } else {
                            return;
                        }
                    })

                    res.status(200).send({
                        status: "success",
                        message: "Picup boy journey started",
                    });
                })
                .catch(() => {
                    res.status(200).send({
                        status: "error",
                        message: "Something went wrong",
                    });
                });
        }
    },
    ghar_ka_khana_pickup_boy_picked_order: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let updatedata = {};

            updatedata["status"] = "order_picked_up";
            const otp = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
            updatedata["otp"] = otp;
            if (req.body.gateway && req.body.gateway.trim() != "") {
                updatedata["gateway"] = req.body.gateway;
            }
            if (req.body.transactionid && req.body.transactionid.trim() != "") {
                updatedata["transactionid"] = req.body.transactionid;
            }
            let where = {};
            where["_id"] = req.body.id;
            GharKakhanaOrders.findOne(where)
                .populate('user')
                .then((response) => {
                    if (req.body.paid_amount && req.body.paid_amount.trim() != "") {
                        updatedata["second_paid_amount"] = req.body.paid_amount;
                        updatedata["dues_amount"] = response?.dues_amount - req.body?.paid_amount;
                        if (response?.dues_amount - req.body?.paid_amount < 1) {
                            updatedata["second_time_payment_status"] = 0;

                        }
                    }
                    if (response.otp == req.body.otp) {
                        let where = {};
                        where["_id"] = req.body.id;
                        GharKakhanaOrders.findOneAndUpdate(
                            where,
                            updatedata,
                            {
                                new: true
                            }
                        ).exec((err, updatedOrder) => {
                            if (err) {
                                // Handle error
                                return res.status(500).send({
                                    status: "error",
                                    message: "An error occurred while processing the request.",
                                });
                            }

                            let parameters = [
                                "CUSTOMER",
                                response.orderid,
                                "PICKED-UP"
                                // { name: "1", value: "CUSTOMER" },
                                // { name: "2", value: response.orderid },
                                // { name: "3", value: "DELIVERED" },
                            ];
                            SendWATI("order_update", parameters, response.user.mobile);




                            res.status(200).send({
                                status: "success",
                                message: "order picked up",
                                result: updatedOrder,
                            });
                        });
                    } else {
                        res.status(200).send({
                            status: "error",
                            message: "Invalid OTP",
                        });
                    }

                });


        }
    },
    ghar_ka_khana_delivery_boy_order_start: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.body.id;

            let where1 = {};
            where1["_id"] = req.body.id;
            where1["status"] = "delivery_boy_started";
            GharKakhanaOrders.findOne(where1).then(respon => {
                if (respon != null) {
                    res.status(200).send({
                        status: "success",
                        message: "Picup boy journey already started",
                        // token: decodedToken ? "Token Found" : "Token Not found"
                    });
                    // return ;
                } else {
                    GharKakhanaOrders.findOneAndUpdate(
                        where,
                        {
                            status: "delivery_boy_started",
                        },
                        {
                            new: true,
                        }
                    )
                        .exec()
                        .then(() => {
                            let where = {};
                            where["_id"] = req.body.id || req?.query?.id;

                            //ORder Log
                            const authHeader = req.headers["authorization"];
                            const token = authHeader && authHeader.split(" ")[0];
                            const decodedToken = jwt.decode(token);
                            const userId = decodedToken?.user_id;

                            const orderLog = new OrderLog({
                                ghar_ka_khana_order: req?.body?.id || req?.query?.id,
                                updated_by_user: req.body.user_id || req?.query?.user_id ? req.body.user_id || req?.query?.user_id : userId,
                                event: "Delivery Boy Order Started Status",
                                event_data: "delivery_boy_started",
                                type: "Order"
                            });

                            orderLog.save(function (err) {
                                if (err) {
                                    console.log(err, "ERR");
                                } else {
                                    return;
                                }
                            })

                            //ORder Log END

                            GharKakhanaOrders.findOne(where)
                                .populate("user")
                                .populate("delivery_boy")
                                .then((response) => {
                                    let mobile = response.user.mobile;
                                    let email = response.user.email;
                                    let db_name = response.delivery_boy != null ? response.delivery_boy.full_name : "N/A";

                                    res.status(200).send({
                                        status: "success",
                                        message: "Picup boy journey started",
                                        token: decodedToken ? "Token Found" : "Token Not found"
                                    });

                                    GenURL(response._id).then(function (url_result) {
                                        let msg12 = "DEAR CUSTOMER, DELIVERY BOY " + db_name + " IS OUT FOR DELIVERY OF YOUR ORDER NO " + response.orderid + " WITH TASTES2PLATE; HIS MOBILE NUMBER IS " + response.delivery_boy.mobile + ". NOW, YOU CAN TRACK " + url_result + " THE DELIVERY BOY. REGARDS, TASTES2PLATE (T2P) CUSTOMER SUPPORT TEAM";
                                        //console.log(msg12);
                                        gen_custom_sms(mobile, msg12);
                                    });

                                    let dmobile = response.delivery_boy && response.delivery_boy.mobile != "" ? response.user.mobile : "Not Available";

                                    let parameters = [
                                        "CUSTOMER",
                                        db_name,
                                        response.orderid,
                                        response.delivery_boy.mobile
                                        // { name: "1", value: "CUSTOMER" },
                                        // { name: "2", value: db_name },
                                        // { name: "3", value: response.orderid },
                                        // { name: "4", value: response.delivery_boy.mobile },
                                    ];
                                    SendWATI("delivery_boy_out_for_delivery", parameters, mobile);

                                    let msg3 = "DEAR CUSTOMER, DELIVERY BOY " + db_name + " IS OUT FOR DELIVERY FOR YOUR ORDER NO " + response.orderid + " WITH TASTES2PLATE; HIS MOBILE NUMBER IS " + response.delivery_boy.mobile + ". YOU CAN NOW TRACK THE DELIVERY BOY REGARDS, TASTES2PLATE (T2P) CUSTOMER SUPPORT TEAM";
                                    gen_custom_sms(mobile, msg3);

                                    let db_image = response.delivery_boy.profile_image && response.delivery_boy.profile_image != "" ? ' <img src="' + response.delivery_boy.profile_image + '" width="125" height="120" style="display: block; border: 0px; margin-bottom: 15%;" alt="tastes2plate" />' : "";
                                    let msg4 = "DEAR CUSTOMER, DELIVERY BOY " + db_name + " IS OUT FOR DELIVERY FOR YOUR ORDER NO " + response.orderid + " AND HIS MOBILE NUMBER IS " + dmobile + ". " + db_image + "";

                                    axios
                                        .get("https://omst5afyma.execute-api.ap-south-1.amazonaws.com/production/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg4), {})
                                        .then(function () {
                                            //console.log(response.data);
                                        })
                                        .catch(function (error) {
                                            console.log(error);
                                        });

                                    let payload = {
                                        merchantId: "CHARABUNISERVICESRAJARHAT",
                                        transactionId: response.orderid,
                                        merchantOrderId: response.orderid,
                                        amount: response.finalprice,
                                        //"mobileNumber":"7065265407",
                                        expiresIn: 180,
                                    };

                                    let x_verify = sha256(base64.stringify(utf8.parse(JSON.stringify(payload))) + "/v3/payLink/init" + "5b6a2591-2b28-4840-a5ac-762a5fbfb6d6") + "###" + 1;

                                    const url = "https://mercury-t2.phonepe.com/v3/payLink/init";
                                    const options = {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "X-VERIFY": x_verify,
                                        },
                                        body: JSON.stringify({
                                            request: base64.stringify(utf8.parse(JSON.stringify(payload))),
                                        }),
                                    };
                                    fetch(url, options)
                                        .then((res) => res.json())
                                        .then((json) => {
                                            //console.log(json);
                                            let payLink = json.data.payLink;
                                            if (payLink) {
                                                let msg9 = "DEAR CUSTOMER, DELIVERY BOY " + db_name + " IS OUT-FOR-DELIVERY OF YOUR ORDER NO " + response.orderid + ". YOU CAN DO PAYMENT ONLINE USING THIS LINK " + payLink + ". REGARDS, TASTES2PLATE (T2P) CUSTOMER SUPPORT TEAM";

                                                axios
                                                    .get("https://omst5afyma.execute-api.ap-south-1.amazonaws.com/production/admin/send_email_template?email=" + email + "&msg=" + encodeURI(msg9), {})
                                                    .then(function () {
                                                        //console.log(response.data);
                                                    })
                                                    .catch(function (error) {
                                                        console.log(error);
                                                    });

                                                gen_custom_sms(mobile, msg9);
                                            }
                                        })
                                        .catch((err) => console.error("error:" + err));
                                });
                        })
                        .catch(() => {
                            res.status(200).send({
                                status: "error",
                                message: "Something went wrong",
                            });
                        });
                };
            });
        }
    },
    ghar_ka_khana_send_otp_to_customer: function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        }

        GharKakhanaOrders.findOne({ _id: req.body.id })
            .populate("user")
            .populate("delivery_boy")
            .then((response) => {
                const dboy_name = response.delivery_boy ? response.delivery_boy.full_name : "N/A";
                gen_ghar_ka_khana_order_otp2(
                    response.user.mobile,
                    req.body.id,
                    res,
                    (successResponse, errorResponse) => {
                        if (errorResponse) {
                            return res.status(500).json({
                                status: "error",
                                message: errorResponse,
                                OTP: "",
                            });
                        }

                        const parameters = [
                            response.orderid,
                            successResponse,
                            dboy_name
                        ];

                        SendWATI("delivery_customer_otp", parameters, response.user.mobile);

                        res.status(200).json({
                            status: "success",
                            OTP: successResponse, // Update with the actual OTP value if available
                            message: "OTP has been sent to customer.",
                        });
                    }
                );
            })
            .catch((error) => {
                res.status(500).json({
                    status: "error",
                    message: error.message,
                    result: [],
                });
            });
    },
    ghar_ka_khana_final_payment_confirm: function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        }

        let where = {};
        where["_id"] = req.body.id;
        GharKakhanaOrders.findOne(where)
            .populate('user')
            .exec((err, response) => {
                if (err) {
                    return res.status(500).send({
                        status: "error",
                        message: "An error occurred while processing the request.",
                    });
                }

                GharKakhanaOrders.findOneAndUpdate(
                    where,
                    {
                        second_time_payment_status: 0,
                        second_gateway: req.body?.gateway,
                        second_transactionid: req.body?.transactionid,
                        second_paid_amount: req.body?.paid_amount,
                        dues_amount: response?.dues_amount - req.body?.paid_amount,
                        status: 'order_confirmed'
                    },
                    {
                        new: true
                    }
                ).exec((err, updatedOrder) => {
                    if (err) {
                        // Handle error
                        return res.status(500).send({
                            status: "error",
                            message: "An error occurred while processing the request.",
                        });
                    }

                    let parameters = [
                        response.orderid,
                        moment(moment(response.delivery_date)).format("YYYY-MM-DD"),
                        response.delivery_timeslot
                    ];
                    SendWATI("order_confirmation_em", parameters, response.user.mobile);



                    res.status(200).send({
                        status: "success",
                        message: "order confirmed",
                        result: updatedOrder,
                    });
                });
            });
    },




    //google map suggestion
    google_map_auto_suggestion: async function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),

            });
        } else {
            const input = req.query.input;
            const apiKey = 'AIzaSyBBjM-pHA9jtke6FEm7lZhJGz5t0FMWWMQ';
            const countryFilter = 'country:IN'

            try {
                const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${apiKey}&components=${countryFilter}`, {

                });

                res.json(response.data);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    },
    google_map_place_deatials: async function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),

            });
        } else {
            const apiKey = 'AIzaSyBBjM-pHA9jtke6FEm7lZhJGz5t0FMWWMQ';
            const placeId = req?.query?.placeId;

            try {
                const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}`, {

                });

                res.json(response.data);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    },
    ghar_ka_kahana_slider_list: function (req, res) {
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
            where["active"] = 1;

            GharkaKhanaSliders.find(where)
                // .populate("city", "name")
                .sort("name")
                .then((response) => {
                    GharkaKhanaSliders.find(where).countDocuments(function (err, count) {
                        res.status(200).send({
                            status: "success",
                            token: req.token,
                            result: response,
                            totalCount: count,
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },
    // lp head 
    lp_head_inside_delivery_agent_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.query.id;
            Users.findOne(where)
                .select("delivery_partner")
                .select("user_type")
                .populate("delivery_partner")
                .then((response) => {
                    if (response?.user_type !== 'lp_head') {
                        res.status(200).send({
                            status: "error",
                            message: "user_type_invalid",
                            token: req.token,
                        });
                    }
                    res.status(200).send({
                        status: "success",
                        token: req.token,
                        result: response,
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },
    lp_head_inside_delivery_boy_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.query.id;
            Users.findOne(where)
                .select("delivery_boy")
                .select("user_type")
                .populate("delivery_boy")
                .then((response) => {
                    if (response?.user_type !== 'lp_head') {
                        res.status(200).send({
                            status: "error",
                            message: "user_type_invalid",
                            token: req.token,
                        });
                    }
                    res.status(200).send({
                        status: "success",
                        token: req.token,
                        result: response,
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },
    lp_head_add_lp_manager: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            where["_id"] = req.query.id;
            Users.findOne(where)
                .select("lp_manager")
                .select("user_type")
                .populate("lp_manager")
                .then((response) => {
                    if (response?.user_type !== 'lp_head') {
                        res.status(200).send({
                            status: "error",
                            message: "user_type_invalid",
                            token: req.token,
                        });
                    } else {
                        // Check if req.body.lp_manager is an array and not empty
                        if (Array.isArray(req.body.lp_manager) && req.body.lp_manager.length > 0) {
                            response.lp_manager = response.lp_manager.concat(req.body.lp_manager);

                            response.save()
                                .then((updatedUser) => {
                                    res.status(200).send({
                                        status: "success",
                                        token: req.token,
                                        result: updatedUser,
                                    });
                                })
                                .catch(() => {
                                    res.status(200).send({
                                        status: "error",
                                        message: "Error updating lp_manager",
                                        token: req.token,
                                    });
                                });
                        } else {
                            res.status(200).send({
                                status: "error",
                                message: "lp_manager array is empty or not provided",
                                token: req.token,
                            });
                        }
                    }
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },
    ghar_ka_khana_lp_head_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(2, "days");
            if (req.query.lp_head) {

                // let lp_manager_list = [];
                let delivery_partner_list = [];
                let where = {};
                where["_id"] = req.query.lp_head;
                Users.findOne(where).populate('lp_manager').then((response) => {
                    if (response?.user_type == "lp_head") {
                        let where = {};
                        let i;
                        if (response) {
                            for (i = 0; i < response.lp_manager.length; i++) {
                                // lp_manager_list.push(mongoose.Types.ObjectId(response.lp_manager[i]._id));
                                delivery_partner_list.push(...response.lp_manager[i].delivery_boy.map(id => mongoose.Types.ObjectId(id)));

                            }
                        }

                        // where["lp_manager"] = { $in: lp_manager_list };
                        // where["lp_head"] =req.query.lp_head;
                        where["delivery_partner"] = { $in: delivery_partner_list };
                        where["delivery_date"] = {
                            $gte: today.toDate(),
                            $lt: tmoment(tomorrow).endOf("day").toDate(),
                        };

                        where["$or"] = [
                            {
                                status: "booking_confirmed",
                            },
                            {
                                status: "order_confirmed",
                            },
                            {
                                status: "order_initiated",
                            },
                            {
                                status: "pickup_boy_assigned",
                            },
                            {
                                status: "pickup_boy_started",
                            },
                            {
                                status: "delivered_to_cargo_partner",
                            },
                            {
                                status: "cargo_off_loaded",
                            },
                            {
                                status: "cargo_delivery_started",
                            },

                            {
                                status: "received_destination_airport",
                            },
                            {
                                status: "delivered_to_delivery_partner",
                            },
                            {
                                status: "delivery_boy_assigned",
                            },
                            {
                                status: "delivery_boy_started",
                            },
                        ];

                        GharKakhanaOrders.find(where, null, {})
                            .populate("user")
                            .populate("products.category")
                            .populate("products.sub_category")
                            .populate("delivery_partner")
                            .populate("pickup_partner")
                            .populate("pickup_boy")
                            .populate("delivery_boy")
                            .populate("lp_manager")
                            .populate("lp_head")
                            .populate({
                                path: "source_location",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .populate({
                                path: "destination_location",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .sort({
                                created_date: -1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    result: response,
                                    message: "",
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "error",
                            msg: "Lp Head Not Exist !!"
                        });

                    }
                });

            } else {
                res.status(200).send({
                    status: "please send lp_head key !!",
                    token: req.token,
                });
            }
        }
    },
    lp_head_order_assign_delivery_partner: async function (req, res) {
        try {

            if (response?.user_type !== 'lp_head') {
                res.status(200).send({
                    status: "error",
                    message: "user_type_invalid",
                    token: req.token,
                });
            }

            const where = {};
            where["_id"] = req.body.id;
            await Checkout.findOneAndUpdate(
                where,
                { delivery_partner: req.body.delivery_partner },
                { new: true }
            ).exec();

            const authHeader = req.headers["authorization"];
            const token = authHeader && authHeader.split(" ")[0];
            const decodedToken = jwt.decode(token);
            const userId = decodedToken?.user_id;

            const orderLog = new OrderLog({
                order: req.body.id,
                updated_by_user: req.body.user_id || req?.query?.user_id || userId,
                event: "Delivery Partner Assigned",
                event_data: "Delivery Partner :- " + req.body.delivery_partner,
                type: "Order"
            });

            await orderLog.save();


            res.status(200).send({
                status: "success",
                message: "Delivery Partner assigned",
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    lp_head_order_assign_delivery_boy: async function (req, res) {
        try {

            if (response?.user_type !== 'lp_head') {
                res.status(200).send({
                    status: "error",
                    message: "user_type_invalid",
                    token: req.token,
                });
            }

            const where = {};
            where["_id"] = req.body.id;
            await Checkout.findOneAndUpdate(
                where,
                { delivery_boy: req.body.delivery_boy },
                { new: true }
            ).exec();

            const authHeader = req.headers["authorization"];
            const token = authHeader && authHeader.split(" ")[0];
            const decodedToken = jwt.decode(token);
            const userId = decodedToken?.user_id;

            const orderLog = new OrderLog({
                order: req.body.id,
                updated_by_user: req.body.user_id || req?.query?.user_id || userId,
                event: "Delivery Boy Assigned",
                event_data: "Delivery Boy :- " + req.body.delivery_boy,
                type: "Order"
            });

            await orderLog.save();


            res.status(200).send({
                status: "success",
                message: "Delivery Boy assigned",
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    ghar_ka_khana_lp_head_pickup_partner_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(2, "days");
            if (req.query.lp_head) {
                let pickup_partner_list = [];
                let lp_manager_list = [];

                let where = {};
                where["_id"] = req.query.lp_head;
                Users.findOne(where).populate('lp_manager').then(async (response) => {
                    if (response?.user_type == 'lp_head') {

                        let where = {};
                        if (response) {
                            for (let i = 0; i < response.lp_manager.length; i++) {
                                lp_manager_list.push(mongoose.Types.ObjectId(response.lp_manager[i]._id));
                                pickup_partner_list.push(...response.lp_manager[i].delivery_boy.map(id => mongoose.Types.ObjectId(id)));

                            }
                        }
                        if (req.query.lp_manager) {
                            let found = false;
                            for (let i = 0; i < lp_manager_list.length; i++) {
                                if (String(lp_manager_list[i]) == req.query.lp_manager) {
                                    found = true;
                                    break;

                                }
                            }
                            if (!found) {
                                return res.status(200).send({
                                    status: "error",
                                    message: "Lp Manager does not exist in that lp head",
                                    result: [],
                                });
                            } else {
                                pickup_partner_list = [];
                                where["_id"] = req.query.lp_manager;
                                await Users.findOne({ _id: req.query.lp_manager }).then((response) => {
                                    if (response) {
                                        pickup_partner_list.push(...response.delivery_boy.map(id => mongoose.Types.ObjectId(id)));
                                    }

                                });

                            }



                        }
                         where = {};
                        where["pickup_partner"] = { $in: pickup_partner_list };

                        if (req.query.pickup_partner) {
                            let found = false;
                            for (let i = 0; i < pickup_partner_list.length; i++) {
                                if (String(pickup_partner_list[i]) == req.query.pickup_partner) {
                                    found = true;
                                    break;

                                }
                            }
                            if (!found) {
                                return res.status(200).send({
                                    status: "error",
                                    message: "Pickup partner does not exist in that lp head",
                                    result: [],
                                });
                            } else {
                                where["pickup_partner"] = req.query.pickup_partner;
                            }
                        }



                        where["delivery_date"] = {
                            $gte: today.toDate(),
                            $lt: tmoment(tomorrow).endOf("day").toDate(),
                        };
                        where["status"] = {
                            $nin: [
                                "delivered",
                                "pending_payment",
                                "declined_vendor",
                                "rejected_customer",
                                "refunded",
                                "failed",
                                "cancel",
                                "on_hold",

                                "delivered_to_cargo_partner",
                                "cargo_off_loaded",
                                "cargo_delivery_started",
                                "received_destination_airport",
                                "delivered_to_delivery_partner",
                                "delivery_boy_assigned",
                                "delivery_boy_started",

                            ],
                        };
                        if (req.query.order_city && req.query.order_city != "") {
                            where["destination_city"] = req.query.order_city;
                        }
                        GharKakhanaOrders.find(where, null, {})
                            .populate("user")
                            .populate("products.category")
                            .populate("products.sub_category")
                            .populate("delivery_partner")
                            .populate("pickup_partner")
                            .populate("pickup_boy")
                            .populate("delivery_boy")
                            .populate("lp_manager")
                            .populate("lp_head")
                            .populate({
                                path: "source_location",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .populate({
                                path: "destination_location",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .sort({
                                created_date: -1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    result: response,
                                    message: "",
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });

                    } else {
                        res.status(200).send({
                            status: "Lp head not exist !!",
                            token: req.token,
                        });
                    }
                });
            } else {
                res.status(200).send({
                    status: "Please send lp_head as a key !!",
                    token: req.token,
                });
            }
        }
    },
    ghar_ka_khana_lp_head_delivery_partner_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(2, "days");
            if (req.query.lp_head) {
                let delivery_partner_list = [];
                let lp_manager_list = [];
                let where = {};
                where["_id"] = req.query.lp_head;
                Users.findOne(where).populate('lp_manager').then(async (response) => {
                    if (response?.user_type == 'lp_head') {

                        let where = {};
                        if (response) {
                            for (let i = 0; i < response.lp_manager.length; i++) {
                                lp_manager_list.push(mongoose.Types.ObjectId(response.lp_manager[i]._id));
                                delivery_partner_list.push(...response.lp_manager[i].delivery_boy.map(id => mongoose.Types.ObjectId(id)));

                            }
                        }
                        if (req.query.lp_manager) {
                            let found = false;
                            for (let i = 0; i < lp_manager_list.length; i++) {
                                if (String(lp_manager_list[i]) == req.query.lp_manager) {
                                    found = true;
                                    break;

                                }
                            }
                            if (!found) {
                                return res.status(200).send({
                                    status: "error",
                                    message: "Lp Manager does not exist in that lp head",
                                    result: [],
                                });
                            } else {
                                delivery_partner_list = [];
                                await Users.findOne({ _id: req.query.lp_manager }).then((response) => {
                                    if (response) {

                                        delivery_partner_list.push(...response.delivery_boy.map(id => mongoose.Types.ObjectId(id)));
                                    }

                                });

                            }



                        }
                         where = {};
                        where["delivery_partner"] = { $in: delivery_partner_list };


                        if (req.query.delivery_partner) {

                            let found = false;
                            for (let i = 0; i < delivery_partner_list.length; i++) {
                                if (String(delivery_partner_list[i]) == req.query.delivery_partner) {
                                    found = true;
                                    break;

                                }
                            }
                            if (!found) {
                                return res.status(200).send({
                                    status: "error",
                                    message: "Delivery partner does not exist in that lp head",
                                    result: [],
                                });
                            } else {
                                where["delivery_partner"] = req.query.delivery_partner;
                            }
                        }



                        where["delivery_date"] = {
                            $gte: today.toDate(),
                            $lt: tmoment(tomorrow).endOf("day").toDate(),
                        };
                        where["$or"] = [
                            {
                                status: "booking_confirmed",
                            },
                            {
                                status: "order_confirmed",
                            },
                            {
                                status: "order_initiated",
                            },
                            {
                                status: "pickup_boy_assigned",
                            },
                            {
                                status: "pickup_boy_started",
                            },
                            {
                                status: "delivered_to_cargo_partner",
                            },
                            {
                                status: "cargo_off_loaded",
                            },
                            {
                                status: "cargo_delivery_started",
                            },

                            {
                                status: "received_destination_airport",
                            },
                            {
                                status: "delivered_to_delivery_partner",
                            },
                            {
                                status: "delivery_boy_assigned",
                            },
                            {
                                status: "delivery_boy_started",
                            },
                        ];

                        if (req.query.order_city && req.query.order_city != "") {
                            where["source_city"] = req.query.order_city;
                        }

                        //console.log(where);
                        GharKakhanaOrders.find(where, null, {})
                            .populate("user")
                            .populate("products.category")
                            .populate("products.sub_category")
                            .populate("delivery_partner")
                            .populate("pickup_partner")
                            .populate("pickup_boy")
                            .populate("delivery_boy")
                            .populate("lp_manager")
                            .populate("lp_head")
                            .populate({
                                path: "source_location",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .populate({
                                path: "destination_location",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .sort({
                                created_date: -1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    result: response,
                                    message: "",
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });

                    } else {
                        res.status(200).send({
                            status: "Lp head not exist !!",
                            token: req.token,
                        });
                    }
                });
            } else {
                res.status(200).send({
                    status: "Please send lp_head key !!",
                    token: req.token,
                });
            }
        }
    },

    // lp manager

    ghar_ka_khana_lp_manager_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(2, "days");
            if (req.query.lp_manager) {
                let delivery_partner_list = [];
                let where = {};
                where["_id"] = req.query.lp_manager;
                Users.findOne(where).then((response) => {
                    if (response?.user_type == 'lp_manager') {

                        let where = {};
                        if (response) {
                            delivery_partner_list.push(...response.delivery_boy.map(id => mongoose.Types.ObjectId(id)));
                        }


                        where["delivery_partner"] = { $in: delivery_partner_list };
                        where["lp_manager"] = req.query.lp_manager;

                        where["delivery_date"] = {
                            $gte: today.toDate(),
                            $lt: tmoment(tomorrow).endOf("day").toDate(),
                        };

                        where["$or"] = [
                            {
                                status: "booking_confirmed",
                            },
                            {
                                status: "order_confirmed",
                            },
                            {
                                status: "order_initiated",
                            },
                            {
                                status: "pickup_boy_assigned",
                            },
                            {
                                status: "pickup_boy_started",
                            },
                            {
                                status: "delivered_to_cargo_partner",
                            },
                            {
                                status: "cargo_off_loaded",
                            },
                            {
                                status: "cargo_delivery_started",
                            },

                            {
                                status: "received_destination_airport",
                            },
                            {
                                status: "delivered_to_delivery_partner",
                            },
                            {
                                status: "delivery_boy_assigned",
                            },
                            {
                                status: "delivery_boy_started",
                            },
                        ];
                        //console.log(where);
                        GharKakhanaOrders.find(where, null, {})
                            .populate("user")
                            .populate("products.category")
                            .populate("products.sub_category")
                            .populate("delivery_partner")
                            .populate("pickup_partner")
                            .populate("pickup_boy")
                            .populate("delivery_boy")
                            .populate("lp_manager")
                            .populate("lp_head")
                            .populate({
                                path: "source_location",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .populate({
                                path: "destination_location",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .sort({
                                created_date: -1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    result: response,
                                    message: "",
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "Lp manager not exist !!",
                            token: req.token,
                        });
                    }
                });

            } else {
                res.status(200).send({
                    status: "Please send lp_manager key!!",
                    token: req.token,
                });
            }
        }
    },
    lp_manager_order_assign_delivery_partner: async function (req, res) {
        try {

            if (response?.user_type !== 'lp_manager') {
                res.status(200).send({
                    status: "error",
                    message: "user_type_invalid",
                    token: req.token,
                });
            }
            const where = {};
            where["_id"] = req.body.id;;
            await Checkout.findOneAndUpdate(
                where,
                { delivery_partner: req.body.delivery_partner },
                { new: true }
            ).exec();

            const authHeader = req.headers["authorization"];
            const token = authHeader && authHeader.split(" ")[0];
            const decodedToken = jwt.decode(token);
            const userId = decodedToken?.user_id;

            const orderLog = new OrderLog({
                order: req.body.id,
                updated_by_user: req.body.user_id || req?.query?.user_id || userId,
                event: "Delivery Partner Assigned",
                event_data: "Delivery Partner :- " + req.body.delivery_partner,
                type: "Order"
            });

            await orderLog.save();


            res.status(200).send({
                status: "success",
                message: "Delivery Partner assigned",
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    lp_manager_order_assign_delivery_boy: async function (req, res) {
        try {

            if (response?.user_type !== 'lp_manager') {
                res.status(200).send({
                    status: "error",
                    message: "user_type_invalid",
                    token: req.token,
                });
            }

            const where = {};
            where["_id"] = req.body.id;
            await Checkout.findOneAndUpdate(
                where,
                { delivery_boy: req.body.delivery_boy },
                { new: true }
            ).exec();

            const authHeader = req.headers["authorization"];
            const token = authHeader && authHeader.split(" ")[0];
            const decodedToken = jwt.decode(token);
            const userId = decodedToken?.user_id;

            const orderLog = new OrderLog({
                order: req.body.id,
                updated_by_user: req.body.user_id || req?.query?.user_id || userId,
                event: "Delivery Boy Assigned",
                event_data: "Delivery Boy :- " + req.body.delivery_boy,
                type: "Order"
            });

            await orderLog.save();


            res.status(200).send({
                status: "success",
                message: "Delivery Boy assigned",
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                status: "error",
                message: "Internal Server Error",
            });
        }
    },
    ghar_ka_khana_lp_manager_delivery_partner_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(2, "days");
            if (req.query.lp_manager) {
                let delivery_partner_list = [];
                let where = {};
                where["_id"] = req.query.lp_manager;
                Users.findOne(where).then((response) => {
                    if (response?.user_type == 'lp_manager') {

                        let where = {};
                        if (response) {
                            delivery_partner_list.push(...response.delivery_boy.map(id => mongoose.Types.ObjectId(id)));
                        }
                        where["delivery_partner"] = { $in: delivery_partner_list };


                        if (req.query.delivery_partner) {
                            let found = false;
                            for (let i = 0; i < delivery_partner_list.length; i++) {
                                if (String(delivery_partner_list[i]) == req.query.delivery_partner) {
                                    found = true;
                                    break;

                                }
                            }
                            if (!found) {
                                return res.status(200).send({
                                    status: "error",
                                    message: "Delivery partner does not exist in that lp manager",
                                    result: [],
                                });
                            } else {
                                where["delivery_partner"] = req.query.delivery_partner;
                            }
                        }

                        where["delivery_date"] = {
                            $gte: today.toDate(),
                            $lt: tmoment(tomorrow).endOf("day").toDate(),
                        };

                        where["$or"] = [
                            {
                                status: "booking_confirmed",
                            },
                            {
                                status: "order_confirmed",
                            },
                            {
                                status: "order_initiated",
                            },
                            {
                                status: "pickup_boy_assigned",
                            },
                            {
                                status: "pickup_boy_started",
                            },
                            {
                                status: "delivered_to_cargo_partner",
                            },
                            {
                                status: "cargo_off_loaded",
                            },
                            {
                                status: "cargo_delivery_started",
                            },

                            {
                                status: "received_destination_airport",
                            },
                            {
                                status: "delivered_to_delivery_partner",
                            },
                            {
                                status: "delivery_boy_assigned",
                            },
                            {
                                status: "delivery_boy_started",
                            },
                        ];

                        if (req.query.order_city && req.query.order_city != "") {
                            where["source_city"] = req.query.order_city;
                        }
                        //console.log(where);
                        GharKakhanaOrders.find(where, null, {})
                            .populate("user")
                            .populate("products.category")
                            .populate("products.sub_category")
                            .populate("delivery_partner")
                            .populate("pickup_partner")
                            .populate("pickup_boy")
                            .populate("delivery_boy")
                            .populate("lp_manager")
                            .populate("lp_head")
                            .populate({
                                path: "source_location",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .populate({
                                path: "destination_location",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .sort({
                                created_date: -1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    result: response,
                                    message: "",
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });
                    } else {
                        res.status(200).send({
                            status: "Lp manager not exist !!",
                            token: req.token,
                        });
                    }
                });
            } else {
                res.status(200).send({
                    status: " Please send lp_manager key !!",
                    token: req.token,
                });
            }
        }
    },
    ghar_ka_khana_lp_manager_pickup_partner_order_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};
            const today = tmoment().startOf("day");
            const tomorrow = today.clone().add(2, "days");
            if (req.query.lp_manager) {
                let pickup_partner_list = [];
                let where = {};
                where["_id"] = req.query.lp_manager;
                Users.findOne(where).then((response) => {
                    if (response?.user_type == 'lp_manager') {

                        let where = {};
                        if (response) {
                            pickup_partner_list.push(...response.delivery_boy.map(id => mongoose.Types.ObjectId(id)));
                        }
                        where["pickup_partner"] = { $in: pickup_partner_list };

                        if (req.query.pickup_partner) {
                            let found = false;
                            for (let i = 0; i < pickup_partner_list.length; i++) {
                                if (String(pickup_partner_list[i]) == req.query.pickup_partner) {
                                    found = true;
                                    break;

                                }
                            }
                            if (!found) {
                                return res.status(200).send({
                                    status: "error",
                                    message: "Pickup partner does not exist in that lp manager",
                                    result: [],
                                });
                            } else {
                                where["pickup_partner"] = req.query.pickup_partner;
                            }
                        }


                        where["delivery_date"] = {
                            $gte: today.toDate(),
                            $lt: tmoment(tomorrow).endOf("day").toDate(),
                        };

                        where["status"] = {
                            $nin: [
                                "delivered",
                                "pending_payment",
                                "declined_vendor",
                                "rejected_customer",
                                "refunded",
                                "failed",
                                "cancel",
                                "on_hold",

                                "delivered_to_cargo_partner",
                                "cargo_off_loaded",
                                "cargo_delivery_started",
                                "received_destination_airport",
                                "delivered_to_delivery_partner",
                                "delivery_boy_assigned",
                                "delivery_boy_started",

                            ],
                        };
                        if (req.query.order_city && req.query.order_city != "") {
                            where["destination_city"] = req.query.order_city;
                        }

                        GharKakhanaOrders.find(where, null, {})
                            .populate("user")
                            .populate("products.category")
                            .populate("products.sub_category")
                            .populate("vendor")
                            .populate("cargo_partner")
                            .populate("delivery_partner")
                            .populate("pickup_partner")
                            .populate("pickup_boy")
                            .populate("delivery_boy")
                            .populate("lp_manager")
                            .populate("lp_head")
                            .populate({
                                path: "source_location",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .populate({
                                path: "destination_location",
                                populate: [
                                    {
                                        path: "city",
                                        model: "cities",
                                        select: "name",
                                    },
                                    {
                                        path: "state",
                                        model: "states",
                                        select: "name",
                                    },
                                ],
                            })
                            .sort({
                                created_date: -1,
                            })
                            .then((response) => {
                                res.status(200).send({
                                    status: "success",
                                    result: response,
                                    message: "",
                                });
                            })
                            .catch((error) => {
                                res.status(200).send({
                                    status: "error",
                                    message: error,
                                    result: [],
                                });
                            });



                    } else {
                        res.status(200).send({
                            status: "Lp manager not exist !!",
                            token: req.token,
                        });
                    }
                });
            } else {
                res.status(200).send({
                    status: "Please send lp_manager key !!",
                    token: req.token,
                });
            }
        }
    },
    reorder_product_from_checkout: async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        }

        try {
            const checkout = await Checkout.findOne({ _id: req.body.id });
            if (!checkout) {
                return res.status(404).json({
                    status: "error",
                    message: "Checkout not found",
                });
            }

            const products = checkout.products;
            let different_city = false;

            for (const item of products) {
                const product = item.product;
                const user = item.user;
                const quantity = item.quantity;
                const total_price = item.price;

                const productDoc = await Products.findOne({ _id: product });
                if (!productDoc) {
                    continue;
                }


                // if (userCartCount !== cityCartCount) {
                //     different_city = true;
                //     break;
                // }

                const existingProduct = await Cart.find({ user: user });
                // console.log(existingProduct, "EP", user)

                if (existingProduct) {
                    for (const item of existingProduct) {
                        let WishData = new Wish({
                            user: user,
                            product: item.product,
                        });
                        // console.log(existingProduct, WishData)
                        WishData.save();
                    }
                    Cart.deleteMany({
                        user: user
                    }).then(rem_response => {
                        // console.log("removed", rem_response)
                        if (rem_response) {
                            const newCartItem = new Cart({
                                user: user,
                                product: product,
                                productname: productDoc.name,
                                category: productDoc.category,
                                sub_category: productDoc.sub_category,
                                cuisine: productDoc.cuisine,
                                brand: productDoc.brand,
                                vendor: productDoc.vendor,
                                quantity: quantity,
                                city: productDoc.city,
                                price: total_price,
                            });
                            newCartItem.save();
                        }
                    }).catch(err => console.log(err))
                } else if (!existingProduct) {
                    const newCartItem = new Cart({
                        user: user,
                        product: product,
                        productname: productDoc.name,
                        category: productDoc.category,
                        sub_category: productDoc.sub_category,
                        cuisine: productDoc.cuisine,
                        brand: productDoc.brand,
                        vendor: productDoc.vendor,
                        quantity: quantity,
                        city: productDoc.city,
                        price: total_price,
                    });
                    await newCartItem.save();
                }
            }

            if (different_city) {
                return res.status(200).json({
                    status: "error",
                    message: "Cart includes product(s) from other cities.",
                });
            } else {
                return res.status(200).json({
                    status: "success",
                    message: "Items added to cart",
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message,
            });
        }
    },
    new_get_order_invoice: function (req, res) {
        let where = {};
        where["_id"] = req.query.id;
        Checkout.findOne(where)
            .populate("user")
            .populate("products.product")
            .populate("vendor")
            .populate("cargo_partner")
            .populate("delivery_partner")
            .populate("pickup_partner")
            .populate({
                path: "address",
                populate: [
                    {
                        path: "city",
                        model: "cities",
                        select: "name",
                    },
                ],
            })
            .then((response) => {
                let html_template =
                    "<!DOCTYPE html>" +
                    "<html>" +
                    "<head>" +
                    "    <title></title>" +
                    '    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
                    '    <meta name="viewport" content="width=device-width, initial-scale=1">' +
                    '    <meta http-equiv="X-UA-Compatible" content="IE=edge" />' +
                    '    <style type="text/css">' +
                    "        body," +
                    "        table," +
                    "        td," +
                    "        a {" +
                    "            -webkit-text-size-adjust: 100%;" +
                    "            -ms-text-size-adjust: 100%;" +
                    "        }" +
                    "        table," +
                    "        td {" +
                    "            mso-table-lspace: 0pt;" +
                    "            mso-table-rspace: 0pt;" +
                    "        }" +
                    "        img {" +
                    "            -ms-interpolation-mode: bicubic;" +
                    "        }" +
                    "        img {" +
                    "            border: 0;" +
                    "            height: auto;" +
                    "            line-height: 100%;" +
                    "            outline: none;" +
                    "            text-decoration: none;" +
                    "        }" +
                    "        table {" +
                    "            border-collapse: collapse !important;" +
                    "        }" +
                    "        body {" +
                    "            height: 100% !important;" +
                    "            margin: 0 !important;" +
                    "            padding: 0 !important;" +
                    "            width: 100% !important;" +
                    "        }" +
                    "        a[x-apple-data-detectors] {" +
                    "            color: inherit !important;" +
                    "            text-decoration: none !important;" +
                    "            font-size: inherit !important;" +
                    "            font-family: inherit !important;" +
                    "            font-weight: inherit !important;" +
                    "            line-height: inherit !important;" +
                    "        }" +
                    "        @media screen and (max-width: 480px) {" +
                    "            .mobile-hide {" +
                    "                display: none !important;" +
                    "            }" +
                    "            .mobile-center {" +
                    "                text-align: center !important;" +
                    "            }" +
                    "        }" +
                    '        div[style*="margin: 16px 0;"] {' +
                    "            margin: 0 !important;" +
                    "        }" +
                    "    </style>" +
                    '<body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">' +
                    '    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">' +
                    "        For what reason would it be advisable for me to think about business content? That might be little bit risky to have crew member like them." +
                    "    </div>" +
                    '    <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                    "        <tr>" +
                    '            <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">' +
                    '                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">' +
                    "                     " +
                    "                    <tr>" +
                    '                        <td align="center" style="padding: 35px 35px 20px 35px; background-color: #ffffff;" bgcolor="#ffffff">' +
                    '                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">' +
                    "                                <tr>" +
                    '                                    <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;"> <img src="https://tastes2plate.com/img/site-logo.png" width="125" height="120" style="display: block; border: 0px;" alt="tastes2plate" /><br>' +
                    '                                       <h1>Invoice</h1> <br /> <h2 style="font-size: 30px; font-weight: 800; line-height: 36px; color: #333333; margin: 0;"> Thanks For Your Order! </h2>' +
                    "                                    </td>" +
                    "                                </tr>" +
                    "                                <tr>" +
                    '                                    <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">' +
                    '                                        <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;"> Hi ' +
                    response?.user?.full_name +
                    ", <br/><br/> we are pleased to inform you that your order <br/> #" +
                    response?.orderid +
                    " is " + response?.status + " <br/> </p>" +
                    "                                    </td>" +
                    "                                </tr>" +
                    "" +
                    "                                <tr>"
                    +
                    '                                    <td align="left" style="  font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">' +
                    '                                        <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;"> Payment Method: ' +
                    response?.gateway +
                    " </p>" +
                    "                                    </td>" +
                    // +
                    // '                                    <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">' +
                    // '                                        <p style="font-size: 16px; font-weight: 800; line-height: 24px; color: #777777;"> ORDER STATUS# <b>' +
                    // response.status +
                    // "</b> </p>" +
                    // "                                    </td>" +
                    "                                </tr>" +
                    "" +
                    "                                <tr>" +
                    '                                    <td align="left" style="padding-top: 20px;">' +
                    '                                        <table cellspacing="0" cellpadding="0" border="0" width="100%">' +
                    "                                            <tr>" +
                    '                                                <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Items </td>' +
                    '                                                <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Price </td>' +
                    '                                                <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> QTY </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Price </td>' +
                    "                                            </tr>";

                let i;
                for (i = 0; i < (response?.products?.length || 0); i++) {
                    html_template = html_template + "                         <tr>" + '                                                <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;"> ' + response.products[i].productname + " </td>" + '                                                <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;"> ' + response.products[i].price / +response.products[i].quantity + " </td>" + '                                                <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;"> ' + response.products[i].quantity + " </td>" + '                                                <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;"> ' + response.products[i].price + " </td>" + "                                           </tr>";
                }

                html_template =
                    html_template +
                    " <tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Total </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response?.price +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Shipping Price </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response?.totalShippingPrice +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Packaging Price </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response?.totalPackingPrice +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Total CGST </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response?.totalCGST +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Total SGST </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response?.totalSGST +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Total IGST </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response?.totalIGST +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> Total IGST </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> ₹' +
                    response?.totalIGST +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> Hot Food Delivery Charge </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> ₹' +
                    response?.hot_food_total_cost +
                    " </td>" +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> Tip Price </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> ₹' +
                    response?.tip_price +
                    " </td>" +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> Last Mile Long Distance Extra Delivery Charge </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 800; line-height: 24px; padding: 5px;"> ₹' +
                    response?.last_mile_long_distance_extra_charge +
                    " </td>" +
                    " </td>" +
                    "                                            	</tr>" +
                    "												<tr>" +
                    '                                                <td colspan="3"width="75%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Discount </td>' +
                    '                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ₹' +
                    response?.couponamount +
                    " </td>" +
                    "                                            	</tr>" +
                    "										</table>" +
                    "                                    </td>" +
                    "                                </tr>" +
                    "                                <tr>" +
                    '                                    <td align="left" style="padding-top: 20px;">' +
                    '                                        <table cellspacing="0" cellpadding="0" border="0" width="100%">' +
                    "                                            <tr>" +
                    '                                                <td width="75%" align="right" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;"> TOTAL </td>' +
                    '                                                <td width="25%" align="right" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;"> ₹' +
                    response?.finalprice +
                    " </td>" +
                    "                                            </tr>" +
                    "                                        </table>" +
                    "                                    </td>" +
                    "                                </tr>" +
                    "                            </table>" +
                    "                        </td>" +
                    "                    </tr>" +
                    "                    <tr>" +
                    '                        <td align="center" height="100%" valign="top" width="100%" style="padding: 0 35px 0px 35px; background-color: #ffffff;" bgcolor="#ffffff">' +
                    '                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px;">' +
                    "                                <tr>" +
                    '                                    <td align="center" valign="top" style="font-size:0;">' +
                    '                                        <div style="display:inline-block; max-width:50%; min-width:240px; vertical-align:top; width:100%;">' +
                    '                                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">' +
                    "                                                <tr>" +
                    '                                                    <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">' +
                    '                                                        <p style="font-weight: 800;">Delivery Address</p>' +
                    "                                                        <p> <strong>" +
                    response?.address?.title +
                    "</strong> <br/> " +
                    response?.address?.address +
                    " <br> " +
                    response?.address?.address2 +
                    "<br/>" +
                    response?.address?.city?.name +
                    ", " +
                    response?.address?.pincode +
                    " <br/> Contact name: " +
                    response?.address?.contact_name +
                    " <br/>  Contact number: " +
                    response?.address?.contact_mobile +
                    " </p>" +
                    "                                                    </td>" +
                    "                                                </tr>" +
                    "                                            </table>" +
                    "                                        </div>" +
                    '                                        <div style="display:inline-block; max-width:50%; min-width:240px; vertical-align:top; width:100%;">' +
                    '                                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">' +
                    "                                                <tr>" +
                    '                                                    <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">' +
                    '                                                        <p style="font-weight: 800;">Delivery Date</p>' +
                    "                                                        <p>" +
                    moment(moment(response?.delivery_date, "YYYY-MM-DD")).format("YYYY-MM-DD") +
                    " - " +
                    response?.timeslot +
                    " </p>" +
                    "                                                    </td>" +
                    "                                                </tr>" +
                    "                                            </table>" +
                    "                                        </div>" +
                    "                                    </td>" +
                    "                                </tr>" +
                    "                            </table>" +
                    "                        </td>" +
                    "                    </tr>" +
                    '                   <tr><td style="padding: 35px; background-color: #ffffff; font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px;" bgcolor="#ffffff;">Thanks for using tastes2plate.com! <br/><br/>   </td></tr>  ' +
                    "                    <tr>" +
                    '                        <td align="center" style="padding: 35px; background-color: #ffffff;" bgcolor="#ffffff">' +
                    '                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">' +
                    "                                 " +
                    "                                <tr>"
                "                                " +
                    "                            </table>" +
                    "                        </td>" +
                    "                    </tr>" +
                    "                </table>" +
                    "            </td>" +
                    "        </tr>" +
                    "    </table>" +
                    "</body>" +
                    "</html>";

                // res.status(200).send({
                //     result: html_template,
                // });
                axios
                    .post("https://pdf.tastes2plate.com/app/gen_pdf", { html: html_template })
                    .then(function (response) {
                        // res.status(200).send({
                        // 	status: "error",
                        // 	message: "Something went wrong"
                        // });
                        // let parameters = [
                        //     { "name": "name", "value": "Invoice Details" },
                        //     { "name": "pdfLink", "value": "https://www.clickdimensions.com/links/TestPDFfile.pdf" }
                        // ];


                        // SendWATI("customer_invoice", parameters, "9142429858");

                        let buffer = Buffer.from(response.data.buffer.data);
                        res.contentType("application/pdf");
                        res.send(buffer);
                        // let parameters = [
                        //     "CUSTOMER",
                        //     buffer




                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            });
    },

    // Razorpay Middleware

    razorpay_middleware: async function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
            });
        } else {
            const YOUR_KEY_ID = 'rzp_live_ZLgzjgdHBJDlP8';
            const YOUR_KEY_SECRET = 'SGAmDJNT1a6UcNyuEQIFS1ag';

            const data = {
                amount: req.body.amount,
                currency: 'INR',
                receipt: req.body.receipt,
                partial_payment: req.body.partial_payment,
                first_payment_min_amount: req.body.first_payment_min_amount,
                id: req.body.id
            };

            const config = {
                headers: {
                    'Content-Type': 'application/json'
                },
                auth: {
                    username: YOUR_KEY_ID,
                    password: YOUR_KEY_SECRET
                }
            };

            axios.post('https://api.razorpay.com/v1/orders', data, config)
                .then(response => {
                    res.json(response.data);
                })
                .catch(error => {
                    console.error('Error creating order:', error.response.data);
                });
        }
    },

    // logout user
    is_deactive_user: function (req, res) {
        let where = {};
        where["_id"] = req.body.id;

        Users.findOne(where)
            .then((response) => {
                if (!response) {
                    res.status(200).send({
                        status: "error",
                        message: "Invalid user id",
                        result: [],
                    });
                }
                if (response.active == 0) {
                    res.status(200).send({
                        status: "success",
                        message: "User is deactivated",
                        status: 0,
                    });
                } else {
                    res.status(200).send({
                        status: "success",
                        message: "User is active",
                        status: 1,
                    });
                }
            })
            .catch(() => {
                res.status(200).send({
                    status: "error",
                    message: "Invalid user id",
                    result: [],
                });
            });
    },
    second_header_list: function (req, res) {
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
            where['active'] = 0;

            SecondHeader.find(where)
                .sort("heading")
                .then((response) => {

                    SecondHeader.find(where).countDocuments(function (err, count) {
                        res.status(200).send({
                            status: "success",
                            token: req.token,
                            result: response,
                            totalCount: count,
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },

     filter_product_header: async function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let where = {};

            where["_id"] = req.query.id;

            await SecondHeader.findOne(where)
                .populate("cuisine")
                .then(async (response) => {

                    let where = {};
                    if (response?.cuisine) {
                        where["cuisine"] = response?.cuisine?._id
                    } else {
                        where['name'] = { $regex: response.heading, $options: 'i' };
                    }

                    if (req.query.city) {
                        where["city"] = req.query.city
                    }
                    if (req.query.brand) {
                        where['brand'] = req.query.brand
                    }
                    if (req.query.vendor) {
                        where['vendor'] = req.query.vendor
                    }

                    where["active"] = 1;
                    where["deleted"] = 0;
                    let skip = Number(req.query.skip) > -1 ? (Number(req.query.skip)) * Number(req.query.per_page) : 0;


                    await Products.find(where, null, {
                        limit: Number(req.query.per_page),
                        skip: skip,
                    })
                        .populate("category", "name")
                        .populate("sub_category", "name")
                        .populate("cuisine", "name")
                        .populate("brand", "name")
                        .populate("vendor", "full_name")
                        .populate("city", "name")
                        .then(async response => {
                            await Products.find(where).countDocuments(function (err, count) {
                                res.status(200).send({
                                    status: "success",
                                    token: req.token,
                                    result: response,
                                    count: count,
                                });
                            });
                        })

                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },

maakakhana_get_banners: async function (req, res) {
  try {
    const filter = {
      deleted: 0,
      active: 1,
    };

    // Optional: override active filter via query
    if (req.query.active !== undefined) {
      filter.active = Number(req.query.active);
    }

    let banners = await MaaKaKhanaBanner.find(filter).sort({ createdAt: -1 });

    // Filter images to include only active ones
    banners = banners.map(banner => {
      const filteredImages = banner.images?.filter(img => img.active === 1) || [];
      return {
        ...banner.toObject(),
        images: filteredImages,
      };
    });

    return res.status(200).send({
      status: "success",
      message: "Banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    return res.status(200).send({
      status: "error",
      message: "Failed to fetch banners",
      error: error.message,
    });
  }
}


};







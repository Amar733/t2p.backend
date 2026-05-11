const { validationResult } = require("express-validator");
let firebase = require("firebase");

const { v4: uuid } = require("uuid");

let moment = require("moment");
moment().format();

// Set S3 endpoint to DigitalOcean Spaces

// Change bucket property to your Space name

let Category = require("../models/CategoryModel");
let Brand = require("../models/BrandModel");
let Cuisine = require("../models/CuisineModel");
let Products = require("../models/ProductModel");
let Users = require("../models/UsersModel");
let City = require("../models/CityModel");
let Address = require("../models/AddressModel");
let Slider = require("../models/SliderModel");
let Settings = require("../models/SettingsModel");
let Review = require("../models/ReviewModel");
const ZipModel = require("../models/ZipModel");
const Office = require("../models/OfficeModel");

const BulkOrder = require("../models/BulkOrderModel");
let Contacts = require("../models/ContactsModel");
const ShopBySlider = require("../models/ShopBySlider");
let GharkaKhanaSliders=  require("../models/gharkaKhanaSliders");

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
    all_city: function (req, res) {
        let where = {};
        where["deleted"] = 0;
        where["active"] = 1;
        City.find(where, null, {})
            .sort({ name: 1 })
            .then((city_response) => {
                res.status(200).send({
                    city: city_response,
                });
            });
    },
    all_brands: function (req, res) {
        let where = {};
        where["deleted"] = 0;
        where["active"] = 1;
        Brand.find(where, null, {})
            .sort({ name: 1 })
            .then((city_response) => {
                res.status(200).send({
                    city: city_response,
                });
            });
    },
    all_cuisine: function (req, res) {
        let where = {};
        where["deleted"] = 0;
        where["active"] = 1;
        Cuisine.find(where, null, {})
            .sort({ name: 1 })
            .then((city_response) => {
                res.status(200).send({
                    city: city_response,
                });
            });
    },
    website_home: function (req, res) {
        let where = {};
        where["deleted"] = 0;
        Slider.find(where).then((slider_response) => {
            let where = {};
            where["deal"] = 1;
            where["deleted"] = 0;
            where["active"] = 1;
            //where['city'] = req.query.city;
            where["end_date"] = { $gt: moment().toISOString() };
            if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != null) {
                if (req.query.taste == 0 || req.query.taste == 1) {
                    where["taste"] = Number(req?.query?.taste);
                }
            };
            //where['combo_products'] = null;
            Products.find(where)
                .populate("combo_products")
                .limit(10)
                .sort({ _id: -1 })
                .then((deal_response) => {
                    let where = {};
                    where["deleted"] = 0;
                    //where['city'] = req.query.city;
                    //where["combo_products"] = null;
                    where["active"] = 1;
                    if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined && req.query.taste != null) {
                        if (req.query.taste == 0 || req.query.taste == 1) {
                            where["taste"] = Number(req?.query?.taste);
                        }
                    };
                    where["best_seller"] = 1;

                    Products.find(where)
                        .populate("combo_products")
                        .populate("city")
                        .limit(10)
                        .sort({ _id: -1 })
                        .then((best_seller_response) => {
                            let where = {};
                            where["deleted"] = 0;
                            where["featured"] = 1;
                            //where["combo_products"] = null;
                            where["active"] = 1;
                            if (req.query.taste) {
                                if (req.query.taste == 0 || req.query.taste == 1) {
                                    where["taste"] = Number(req?.query?.taste);
                                }
                            };

                            Products.find(where)
                                .populate("combo_products")
                                .populate("city")
                                .limit(10)
                                .sort({ _id: -1 })
                                .then((featured_response) => {
                                    let where = {};
                                    where["deleted"] = 0;
                                    where["active"] = 1;
                                    City.find(where, null, {})
                                        .sort({ name: 1 })
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
                                                                ShopBySlider.find({ deleted: 0 })
                                                                    .populate("products")
                                                                    .then((shopby) => {
                                                                        let where = {};

                                                                        where["deleted"] = 0;
                                                                        where["active"] = 1;
                                                            
                                                                        GharkaKhanaSliders.find(where)
                                                                            // .populate("city", "name")
                                                                            .sort("name")
                                                                            .then((ghar_ka_khana_slider) => {
                                                                                res.status(200).send({
                                                                                    status: "success",
                                                                                    slider: slider_response,
                                                                                    product_deal: deal_response,
                                                                                    best_seller: best_seller_response,

                                                                                    featured: featured_response,
                                                                                    city: city_response,
                                                                                    service_city: service_city,
                                                                                    brand: brand,
                                                                                    cuisine: cuisine,
                                                                                    top_most_ordered_products: shopby,
                                                                                    ghar_ka_khana_slider: ghar_ka_khana_slider,
                                                                                    message: "",
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
    },
    product_detail: function (req, res) {
        let where = {};
        // console.log(req.query);
        where["slug"] = req.query.slug;
        where["active"] = 1;
        where["deleted"] = 0;
        Products.findOne(where)
            .populate("category", "name slug")
            .populate("sub_category", "name slug")
            .populate("cuisine", "name slug")
            .populate("brand", "name slug")
            .populate("vendor", "full_name slug")
            .populate("city", "name slug")
            .sort({ created_date: -1 })
            .then((response) => {
                let where = {};
                where["product"] = response._id;
                where["active"] = 1;
                Review.find(where)
                    .sort({ created_date: -1 })
                    .then((review_response) => {
                        let where = {};
                        where["active"] = 1;
                        where["deleted"] = 0;
                        where["category"] = response.category;
                        Products.find(where)
                            .limit(50)
                            .populate("category", "name slug")
                            .populate("sub_category", "name slug")
                            .populate("cuisine", "name slug")
                            .populate("brand", "name slug")
                            .populate("vendor", "full_name")
                            .populate("city", "name slug")
                            .sort({ created_date: -1 })
                            .then((related_response) => {
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
                                                    related: related_response,
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
                                                // console.log(lat1, lat2, lon1, lon2, city, office_response?.position)
                                                let distance = latLonDistanceCalculate(lat1, lon1, lat2, lon2);
                                                res.status(200).send({
                                                    status: "success",
                                                    message: "",
                                                    result: response,
                                                    review: review_response,
                                                    related: related_response,
                                                    distance: distance ? Number(distance?.toFixed(2)) : 0
                                                });
                                            })
                                    } else {
                                        res.status(200).send({
                                            status: "success",
                                            message: "",
                                            result: response,
                                            review: review_response,
                                            related: related_response,
                                            distance: 0
                                        });
                                    }
                                }
                                // res.status(200).send({
                                //     status: "success",
                                //     message: "",
                                //     result: response,
                                //     review: review_response,
                                //     related: related_response,
                                // });
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
    check_zipcode: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            if (!req.query.zipcode && req.query.zipcode == "") {
                res.status(200).send({
                    status: "error",
                    message: "Enter zipcode",
                });
            } else {
                let where = {};
                where["_id"] = req.query.vendor;
                where["user_type"] = "vendor";
                Users.findOne(where, null, {})
                    .then((response) => {
                        let delivery_city = response.delivery_city;
                        let where = {};
                        where["name"] = req.query.zipcode;
                        ZipModel.findOne(where, null, {})
                            .sort({ created_date: -1 })
                            .then((response) => {
                                let city = response.city;
                                if (delivery_city.includes(city)) {
                                    res.status(200).send({
                                        status: "success",
                                        message: "available",
                                        additional_cost: response.additional_cost,
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
        }
    },
    get_master_data: function (req, res) {
        let where = {};
        where["parent"] = null;
        where["deleted"] = 0;
        where["active"] = 1;
        Category.find(where, null, {})
            .sort({ created_date: -1 })
            .then((category_response) => {
                let where = {};
                where["deleted"] = 0;
                where["active"] = 1;
                Brand.find(where, null, {})
                    .sort({ name: 1 })
                    .then((brand_response) => {
                        let where = {};
                        where["deleted"] = 0;
                        where["active"] = 1;
                        Cuisine.find(where, null, {})
                            .sort({ created_date: -1 })
                            .then((cuisine_response) => {
                                let where = {};
                                where["deleted"] = 0;
                                where["active"] = 1;
                                City.find(where, null, {})
                                    .sort({ name: 1 })
                                    .then((city_response) => {
                                        res.status(200).send({
                                            category: category_response,
                                            city: city_response,
                                            cuisine: cuisine_response,
                                            brand: brand_response,
                                        });
                                    });
                            });
                    });
            });
    },

    get_sub_category: function (req, res) {
        let where = {};
        where["parent"] = req.query.id;
        where["deleted"] = 0;
        where["active"] = 1;
        Category.find(where, null, {})
            .sort({ created_date: -1 })
            .then((category_response) => {
                res.status(200).send({
                    category: category_response,
                });
            })
            .catch(() => {
                res.status(200).send({
                    category: [],
                });
            });
    },
    search_products: function (req, res) {
        let where = {};

        where["deleted"] = 0;
        where["active"] = 1;

        if (req.query.q && req.query.q != "") {
            where["name"] = {
                $regex: ".*" + req.query.q.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "*.",
                $options: "i",
            };
        }

        if (req.query.category && req.query.category != "") {
            where["category"] = req.query.category;
        }
        if (req.query.deal && req.query.deal == "yes") {
            where["deal"] = 1;
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

        if (req.query.deal && req.query.deal != "") {
            where["selling_price"] = { $ne: "" };
        }
        if (req.query.taste && req.query.taste != "undefined" && req.query.taste != undefined) {
            if (req.query.taste == 0 || req.query.taste == 1) {
                where["taste"] = Number(req?.query?.taste);
            }
        };
        // if (
        //   req.query.price_start &&
        //   req.query.price_start != "" &&
        //   req.query.price_end &&
        //   req.query.price_end != ""
        // ) {
        //   where["price"] = { $gt: req.query.price_start, $lt: req.query.price_end };
        // }

        let sort = { created_date: -1 };
        if (req.query.sort && req.query.sort == "date_added") {
            let sort = { created_date: -1 };
        }
        if (req.query.sort && req.query.sort == "price") {
            let sort = { price: +1 };
        }
        if (req.query.sort && req.query.sort == "price-desc") {
            let sort = { price: -1 };
        }
        // console.log(where)

        Products.find(where, null, {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.page),
        })
            .populate("category", "name")
            .populate("sub_category", "name")
            .populate("cuisine", "name")
            .populate("brand", "name")
            .populate("vendor", "full_name")
            .populate("city", "name")
            .sort(sort)
            .then((response) => {
                let where2 = {};
                Settings.find(where2)
                    .sort({
                        order: +1,
                    })
                    .then((settings_response) => {
                        Products.find(where).countDocuments(function (err, count) {
                            res.status(200).send({
                                status: "success",
                                message: "",
                                result: response,
                                count: count,
                                product_not_available_message: settings_response[50].value,
                            });
                        });
                    });
            })
            .catch((error) => {
                let where = {};
                Settings.find(where)
                    .sort({
                        order: +1,
                    })
                    .then((settings_response) => {
                        res.status(200).send({
                            status: "error",
                            message: error,
                            result: [],
                            product_not_available_message: settings_response[50].value,
                        });
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
                    res.status(200).send({
                        status: "success",
                        message: "data saved.",
                        data: response,
                    });
                }
            });
        }
    },

    get_map_data: function (req, res) {
        // Set the configuration for your app
        // TODO: Replace with your project's config object
        let config = {
            apiKey: "AIzaSyCO5CDU2-xVi6VRy14HhptZ3A8Bztx5Ps4",
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
                let order_id = req.query.order_id;
                if (result["userlocation" + order_id]) {
                    res.status(200).send({
                        status: "success",
                        position: result["userlocation" + order_id] ? result["userlocation" + order_id] : {},
                        name: "",
                        delivery_boy: "",
                    });
                } else {
                    res.status(200).send({
                        status: "error",
                        position: {},
                        name: "",
                        delivery_boy: "",
                    });
                }
            });
    },

    city_detail: function (req, res) {
        let where = {};
        where["slug"] = req.query.slug;
        City.findOne(where)

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

    city_cuisine: function (req, res) {
        let where = {};
        where["slug"] = req.query.slug;
        Cuisine.findOne(where)

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

    single_brand: function (req, res) {
        let where = {};
        where["slug"] = req.query.slug;
        Brand.findOne(where)

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

    single_category: function (req, res) {
        let where = {};
        where["slug"] = req.query.slug;
        Category.findOne(where)

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

    create_contact: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            let ContactsData = new Contacts({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                message: req.body.message,
            });
            ContactsData.save(function (err) {
                if (err) {
                    res.status(200).send({
                        status: "error",
                        message: err,
                        token: req.token,
                    });
                } else {
                    res.status(200).send({
                        status: "success",
                        message: "Contact has been created successfully.",
                    });
                }
            });
        }
    },
};

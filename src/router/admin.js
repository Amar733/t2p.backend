const OrderLog = require("../models/OrderLog");
const rateLimit = require('express-rate-limit');
const fs = require("fs");
const moment = require("moment");
const multer = require("multer");
const path = require("path");
const DailyActivity = require("../models/DailyActivity");
const geoip = require('geoip-lite'); // Optional: to determine the location based on IP address
const url = require('url'); // Built-in Node.js module to parse URLs
const axios = require("axios");

const cors = require('cors');

const allowedOrigins = ['https://admin.tastes2plate.com'];
const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200, // some legacy browsers require this
};



// Define a rate limiter with options
const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});


module.exports = function (app) {
    const AdminController = require("../controllers/AdminController");

    const { check } = require("express-validator");
    const jwt = require("jsonwebtoken");
    const JWT_SECRET = "krishna";

    function generateAccessToken(key) {
        // expires after half and hour (1800 seconds = 30 minutes)
        const accessToken = jwt.sign({ mobile: key }, JWT_SECRET, { expiresIn: "180000s" });
        return accessToken;
    }

    function authenticateToken(req, res, next) {
        //const JWT_SECRET = process.env.JWT_SECRET;
        // Gather the jwt access token from the request header
        app.use(cors(corsOptions));

        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[0];
        //console.log(authHeader.split(' '));
        if (token == null) return res.sendStatus(200); // if there isn't any token

        jwt.verify(token, JWT_SECRET, (err, mobile) => {
            if (err) return res.status(200).send({
                status: "error",
                message: "Please try to relogin.. Token didn't match ..!!",
            });;
            req.token = generateAccessToken(mobile);
            next(); // pass the execution off to whatever request the client intended
        });
    }



    const logUserActivity = (actionType) => {
        return async (req, res, next) => {
            try {
                // Extract data from req.query
                res.setHeader('Access-Control-Allow-Origin', 'https://admin.tastes2plate.com');


                const userId = req.query.user_id || null;

                if (userId) {
                    // Handle IPv6 loopback address (::1) by converting it to IPv4 loopback (127.0.0.1)
                    let ipAddress = req.query.ip || req.ip || req.connection.remoteAddress;
                    if (ipAddress === '::1') {
                        ipAddress = '127.0.0.1';
                    }

                    // Extract only the base path from the URL
                    const parsedUrl = url.parse(req.originalUrl);
                    const page = parsedUrl.pathname;

                    // Use axios to get IP details
                    let ip_details = {};
                    // try {
                    //     const response = await axios.get(`https://ipapi.co/${ipAddress}/json`);
                    //     ip_details = response.data || {};
                    // } catch (axiosError) {
                    //     console.error('Error fetching IP details:', axiosError);
                    // }
                    // Use geoip to get location info based on IP address as a fallback
                    const geo = geoip.lookup(ipAddress);
                    const country = ip_details?.country || geo?.country || '';
                    const state = ip_details?.region || geo?.region || '';
                    const city = ip_details?.city || geo?.city || '';

                    const userAgent = req.headers['user-agent'];

                    let platform;

                    if (req.query.device < 800 || req.query.type == "Logistic App") {
                        if (/Android/i.test(userAgent)) {
                            platform = 'Android';
                        } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
                            platform = 'iOS';
                        } else {
                            platform = 'Android';
                        }
                    } else {
                        if (/Windows|Macintosh|Linux/i.test(userAgent)) {
                            platform = 'Desktop';
                        } else {
                            platform = 'Desktop';
                        }
                    }

                    // Create a new analytics log entry
                    await DailyActivity.create({
                        user_id: userId,
                        page: page,
                        action: actionType, // Use the actionType passed to the middleware
                        ip_address: ipAddress,
                        country: country,
                        state: state,
                        city: city,
                        device: platform,
                        type: req.query.type
                    });
                }

                next(); // Continue to the next middleware or route handler
            } catch (error) {
                console.error('Error logging user activity:', error);
                next(error); // Forward the error to the error-handling middleware
            }
        };
    };



    app

        /// User Start ////

        .post("/admin/login", logUserActivity("Login"), [check("email").trim().isLength({ min: 1 }).withMessage("Enter email address"), check("password").trim().isLength({ min: 1 }).withMessage("Enter password")], AdminController.login)

        .post("/admin/create-user", logUserActivity("Create"), [check("full_name").trim().isLength({ min: 1 }).withMessage("Enter name"), check("email").trim().isLength({ min: 1 }).withMessage("Enter email address"), check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile number"), check("password").trim().isLength({ min: 1 }).withMessage("Enter password"), check("user_type").trim().isLength({ min: 1 }).withMessage("Enter user type")], AdminController.create_user)

        .post("/admin/user-list", logUserActivity("View"), AdminController.user_list)

        .post("/admin/update-user-status", logUserActivity("Update"), AdminController.update_user_status)

        .post("/admin/send-email-otp", logUserActivity("OTP Send"), apiLimiter, [check("email").trim().isLength({ min: 1 }).withMessage("Enter email address")], AdminController.send_email_otp)

        .post("/admin/login-with-otp", logUserActivity("Login"), apiLimiter, [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile number"), check("otp").trim().isLength({ min: 1 }).withMessage("Enter OTP")], AdminController.otp_login)

        .post("/admin/reset-password", logUserActivity("Password Reset"), [check("email").trim().isLength({ min: 1 }).withMessage("Enter email address")], AdminController.reset_password)

        .post("/admin/chnage-password", logUserActivity("Update"), apiLimiter, [check("email").trim().isLength({ min: 1 }).withMessage("Enter email address"), check("otp").trim().isLength({ min: 1 }).withMessage("Enter OTP"), check("password").trim().isLength({ min: 1 }).withMessage("Enter password")], AdminController.chnage_password)

        .post("/admin/get-profile", logUserActivity("View"), [], AdminController.get_profile)

        .post(
            "/admin/update-profile",
            [
                // check('id').trim().isLength({ min: 1 }).withMessage('Enter id'),
                // check('full_name').trim().isLength({ min: 1 }).withMessage('Enter name'),
            ],
            logUserActivity("Update"),

            AdminController.update_profile
        )

        .post("/admin/delete-user", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter user id")], AdminController.delete_user)

        .post("/admin/update-profile-image", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter id")], AdminController.update_profile_image)
        ///// Users End ///////

        /// City Start ///

        .post(
            "/admin/create-city",
            [
                //check('name').trim().isLength({ min: 1 }).withMessage('Enter city name')
            ],
            logUserActivity("Create"),
            AdminController.create_city
        )

        .post("/admin/city-list", logUserActivity("View"), [], AdminController.city_list)
        .post("/admin/update-city-status", logUserActivity("Update"), [], AdminController.update_city_status)
        .post("/admin/update-city-cod-status", logUserActivity("Update"), [], AdminController.update_city_cod_availability)
        .post("/admin/update-city-hot-food-available", logUserActivity("Update"), [], AdminController.update_city_hot_food_available)
        .post("/admin/update-city-footer-status", logUserActivity("Update"), [], AdminController.update_city_footer_status)
        .post("/admin/get-single-city", logUserActivity("View"), [], AdminController.get_city)
        .post(
            "/admin/update-city",
            [
                // check('id').trim().isLength({ min: 1 }).withMessage('Enter city id'),
                //check('name').trim().isLength({ min: 1 }).withMessage('Enter city name'),
            ],
            logUserActivity("Update"),
            AdminController.update_city
        )

        .post("/admin/delete-city", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter city id")], AdminController.delete_city)

        /// City End ///

        /// Zip code Start ///

        .post("/admin/all-city-list", logUserActivity("View"), [], AdminController.all_city_list)

        .post("/admin/create-zipcode", logUserActivity("Create"), [check("name").trim().isLength({ min: 1 }).withMessage("Enter city name"), check("city").trim().isLength({ min: 1 }).withMessage("Select city")], AdminController.create_zipcode)

        .post("/admin/zipcode-list", [], logUserActivity("View"), AdminController.zipcode_list)

        .post("/admin/update-zipcode-status", [], logUserActivity("Update"), AdminController.update_zipcode_status)

        .post("/admin/update-zipcode-cod-status", [], logUserActivity("Update"), AdminController.update_zipcode_cod_status)

        .post("/admin/get-single-zipcode", [], logUserActivity("View"), AdminController.get_zipcode)

        .post("/admin/update-zipcode", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter zipcode id"), check("name").trim().isLength({ min: 1 }).withMessage("Enter zipcode name"), check("city").trim().isLength({ min: 1 }).withMessage("Select city")], AdminController.update_zipcode)

        .post("/admin/delete-zipcode", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter zipcode id")], AdminController.delete_zipcode)

        /// Zip code End ///

        /// Cusine Start ///

        .post("/admin/create-cuisine", logUserActivity("Create"), [check("name").trim().isLength({ min: 1 }).withMessage("Enter cuisine name")], AdminController.create_cuisine)

        .post("/admin/cuisine-list", [], logUserActivity("View"), AdminController.cuisine_list)

        .post("/admin/update-cuisine-status", [], logUserActivity("Update"), AdminController.update_cuisine_status)

        .post("/admin/get-single-cuisine", [], logUserActivity("View"), AdminController.get_cuisine)

        .post("/admin/update-cuisine", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter cuisine id"), check("name").trim().isLength({ min: 1 }).withMessage("Enter cuisine name")], AdminController.update_cuisine)

        .post("/admin/delete-cuisine", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter cuisine id")], AdminController.delete_cuisine)

        /// Cusine End ///

        /// Category Start ////

        .post("/admin/parent-category-list", logUserActivity("View"), [], AdminController.parent_category_list)

        .post(
            "/admin/add-category",
            [
                //check('name').trim().isLength({ min: 1 }).withMessage('Enter category name id'),
            ],
            logUserActivity("Create"),
            AdminController.add_category
        )

        .post("/admin/category-list", logUserActivity("View"), [], AdminController.category_list)

        .post("/admin/update-category-status", logUserActivity("Update"), [], AdminController.update_category_status)

        .post("/admin/get-single-category", logUserActivity("View"), [], AdminController.get_category)

        .post("/admin/delete-category", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter category id")], AdminController.delete_category)

        .post("/admin/update-category", logUserActivity("Update"), [], AdminController.update_category)

        /// Category End ////

        /// Brand Start ////

        .post(
            "/admin/add-brand",
            [
                //check('name').trim().isLength({ min: 1 }).withMessage('Enter category name id'),
            ],
            logUserActivity("Create"),
            AdminController.add_brand
        )

        .post("/admin/brand-list", logUserActivity("View"), [], AdminController.brand_list)

        .post("/admin/update-brand-status", logUserActivity("Update"), [], AdminController.update_brand_status)

        .post("/admin/update-brand-gem-status", [], logUserActivity("Update"), AdminController.update_brand_gem_status)

        .post("/admin/update-brand-top-status", [], logUserActivity("Update"), AdminController.update_brand_top_status)

        .post("/admin/update-product-top-status", [], logUserActivity("Update"), AdminController.update_product_top_status)

        .post("/admin/update-brand", [], logUserActivity("Update"), AdminController.update_brand)

        .post("/admin/get-single-brand", [], logUserActivity("View"), AdminController.get_brand)

        .post("/admin/delete-brand", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter brand id")], AdminController.delete_brand)

        /// Brand End ////

        /// Vendor Start ////

        .post(
            "/admin/add-vendor",
            [
                //check('name').trim().isLength({ min: 1 }).withMessage('Enter category name id'),
            ],
            logUserActivity("Create"),
            AdminController.add_vendor
        )

        .post("/admin/vendor-list", logUserActivity("View"), [], AdminController.vendor_list)

        .post("/admin/update-vendor-status", logUserActivity("Update"), [], AdminController.update_vendor_status)

        .post("/admin/update-vendor", logUserActivity("Update"), [], AdminController.update_vendor)

        .post("/admin/get-single-vendor", logUserActivity("View"), [], AdminController.get_vendor)

        .post("/admin/delete-vendor", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter vendor id")], AdminController.delete_vendor)

        /// Vendor End ////

        ///// Settings Start ////////
        .post("/admin/add-settings", logUserActivity("Create"), [], AdminController.add_settings)

        .post("/admin/settings-list", [], logUserActivity("View"), AdminController.settings_list)

        .post("/admin/app-settings-list", [], logUserActivity("List"), AdminController.app_settings_list)

        .post("/admin/get-settings", [], logUserActivity("View"), AdminController.get_settings)

        .post("/admin/update-settings", [], logUserActivity("Update"), AdminController.update_settings)

        .post("/admin/update-app-settings", [], logUserActivity("Update"), AdminController.update_app_settings)

        /////// Settings End /////////

        /// Product Start ////

        .post("/admin/parent-category-list", logUserActivity("View"), [], AdminController.parent_category_list)

        .post("/admin/sub-category-list", logUserActivity("View"), [check("category_id").trim().isLength({ min: 1 }).withMessage("Enter parent category id")], AdminController.sub_category_list)

        .post(
            "/admin/add-product",
            [
                //check('name').trim().isLength({ min: 1 }).withMessage('Enter category name id'),
            ],
            logUserActivity("Create"),
            AdminController.add_product
        )
        .post("/admin/update-alternate-product", logUserActivity("Update"), [], AdminController.update_alternative_products)

        .post("/admin/delete-alternate-product", logUserActivity("Delete"), [], AdminController.delete_alternative_products)

        .post("/admin/product-list", [], logUserActivity("View"), AdminController.product_list)

        .post("/admin/update-product-status", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter product id")], AdminController.update_product_status)
        .post("/admin/update-product-hot-food-available", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter product id")], AdminController.update_product_hot_food_available)

        .post("/admin/get-single-product", [], logUserActivity("View"), AdminController.get_product)

        .post("/admin/delete-product", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter product id")], AdminController.delete_product)

        .post("/admin/update-product", [], logUserActivity("Update"), AdminController.update_product)

        .post("/admin/all-product-list", [], logUserActivity("View"), AdminController.all_product_list)

        .post("/admin/all-cuisine-list", [], logUserActivity("View"), AdminController.all_cuisine_list)

        .post("/admin/all-brand-list", [], logUserActivity("View"), AdminController.all_brand_list)

        .post("/admin/all-vendor-list", [], logUserActivity("View"), AdminController.all_vendor_list)
        .post("/admin/all-vendor-list2", [], logUserActivity("View"), AdminController.all_vendor_list2)

        .post("/admin/delete-product-image", logUserActivity("Delete"), [], AdminController.delete_product_image)

        /// Product End ////

        /// Pickup Partner Start ////

        .post("/admin/add-pickup-partner", logUserActivity("Create"), [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile")], AdminController.add_pickup_partner)

        .post("/admin/pickup-partner-list", [], logUserActivity("View"), AdminController.pickup_partner_list)

        .post("/admin/update-pickup-partner-status", [], logUserActivity("Update"), AdminController.update_pickup_partner_status)

        .post(
            "/admin/update-pickup-partner",
            [
                // check('first_name').trim().isLength({ min: 1 }).withMessage('Enter first_name'),
                // check('last_name').trim().isLength({ min: 1 }).withMessage('Enter last_name'),
                check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile"),
                check("id").trim().isLength({ min: 1 }).withMessage("Enter pickup partner id"),
            ],
            logUserActivity("Update"),
            AdminController.update_pickup_partner
        )

        .post("/admin/get-single-pickup-partner", logUserActivity("View"), [], AdminController.get_pickup_partner)

        .post("/admin/delete-pickup-partner", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter pickup partner id")], AdminController.delete_pickup_partner)

        /// Pickup Partner End ////

        /// Cargo Partner Start ////

        .post("/admin/add-cargo-partner", logUserActivity("Create"), [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile")], AdminController.add_cargo_partner)

        .post("/admin/cargo-partner-list", logUserActivity("View"), [], AdminController.cargo_partner_list)

        .post("/admin/update-cargo-partner-status", logUserActivity("Update"), [], AdminController.update_cargo_partner_status)

        .post("/admin/update-cargo-partner", logUserActivity("Update"), [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile"), check("id").trim().isLength({ min: 1 }).withMessage("Enter cargo partner id")], AdminController.update_cargo_partner)

        .post("/admin/get-single-cargo-partner", logUserActivity("View"), [], AdminController.get_cargo_partner)

        .post("/admin/delete-cargo-partner", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter cargo partner id")], AdminController.delete_cargo_partner)

        /// Cargo Partner End ////

        /// Cargo Partner Start ////

        .post("/admin/add-delivery-partner", logUserActivity("Create"), [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile")], AdminController.add_delivery_partner)

        .post("/admin/delivery-partner-list", logUserActivity("View"), [], AdminController.delivery_partner_list)

        .post("/admin/update-delivery-partner-status", logUserActivity("Update"), [], AdminController.update_delivery_partner_status)

        .post("/admin/update-delivery-partner", logUserActivity("Update"), [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile"), check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery partner id")], AdminController.update_delivery_partner)

        .post("/admin/get-single-delivery-partner", logUserActivity("View"), [], AdminController.get_delivery_partner)

        .post("/admin/delete-delivery-partner", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery partner id")], AdminController.delete_delivery_partner)

        /// Cargo Partner End ////

        /// Cut off time Start ////

        .post("/admin/add-cutoff-time", logUserActivity("Create"), [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile")], AdminController.add_cutoff_time)

        .post("/admin/cutoff-time-list", [], logUserActivity("View"), AdminController.cutoff_time_list)

        .post("/admin/update-cutoff-time-status", logUserActivity("Update"), [], AdminController.update_cutoff_time_status)

        .post("/admin/update-cutoff-time", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery partner id")], AdminController.update_cutoff_time)

        .post("/admin/get-single-cutoff-time", logUserActivity("View"), [], AdminController.get_cutoff_time)

        .post("/admin/delete-cutoff-time", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery partner id")], AdminController.delete_cutoff_time)

        /// Cut off time End ////

        /// Slider Start ////

        .post(
            "/admin/add-slider",
            [
                //check('name').trim().isLength({ min: 1 }).withMessage('Enter category name id'),
            ],
            logUserActivity("Create"),
            AdminController.add_slider
        )

        .post("/admin/slider-list", logUserActivity("View"), [], AdminController.slider_list)

        .post("/admin/update-slider-status", logUserActivity("Update"), [], AdminController.update_slider_status)

        .post("/admin/update-slider", [], logUserActivity("Update"), AdminController.update_slider)

        .post("/admin/get-single-slider", [], logUserActivity("View"), AdminController.get_slider)

        .post("/admin/delete-slider", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter slider id")], AdminController.delete_slider)

        /// Slider End ////

        /// Coupon Start ////

        .post("/admin/add-coupon", [], logUserActivity("Create"), AdminController.add_coupon)

        .post("/admin/coupon-list", [], logUserActivity("View"), AdminController.coupon_list)

        .post("/admin/get-coupon-data", [], logUserActivity("View"), AdminController.get_coupon_data)

        .post("/admin/update-coupon-status", [], logUserActivity("Update"), AdminController.update_coupon_status)

        .post("/admin/update-coupon", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery partner id")], AdminController.update_coupon)

        .post("/admin/get-single-coupon", logUserActivity("View"), [], AdminController.get_coupon)

        .post("/admin/delete-coupon", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery partner id")], AdminController.delete_coupon)

        .post("/admin/add-coupon-popup", [], logUserActivity("Create"), AdminController.add_coupon_popup)

        .post("/admin/coupon-popup-list", logUserActivity("View"), [], AdminController.coupon_popup_list)

        .post("/admin/update-coupon-popup-status", logUserActivity("Update"), [], AdminController.update_coupon_popup_status)

        .post("/admin/update-coupon-popup", logUserActivity("Update"), [], AdminController.update_coupon_popup)

        .post("/admin/get-single-coupon-popup", logUserActivity("View"), [], AdminController.get_coupon_popup)

        .post("/admin/delete-coupon-popup", logUserActivity("Delete"), [], AdminController.delete_coupon_popup)

        /// Coupon End ////

        /// LP Head Start ///

        .post("/admin/add-lp-head", [], logUserActivity("Create"), AdminController.add_lp_head)

        .post("/admin/lp-head-list", [], logUserActivity("View"), AdminController.lp_head_list)

        .post("/admin/update-lp-head-status", [], logUserActivity("Update"), AdminController.update_lp_head_status)

        .post("/admin/update-lp-head", [], logUserActivity("Update"), AdminController.update_lp_head)

        .post("/admin/get-single-lp-head", [], logUserActivity("View"), AdminController.get_lp_head)

        .post("/admin/delete-lp-head", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter vendor id")], AdminController.delete_lp_head)

        /// LP Head End ///

        /// LP Head Start ///

        .post("/admin/add-lp-manager", logUserActivity("Create"), [], AdminController.add_lp_manager)

        .post("/admin/lp-manager-list", logUserActivity("View"), [], AdminController.lp_manager_list)

        .post("/admin/update-lp-manager-status", logUserActivity("Update"), [], AdminController.update_lp_manager_status)

        .post("/admin/update-lp-manager", logUserActivity("Update"), [], AdminController.update_lp_manager)

        .post("/admin/get-single-lp-manager", logUserActivity("View"), [], AdminController.get_lp_manager)

        .post("/admin/delete-lp-manager", logUserActivity("Delete"), [], AdminController.delete_lp_manager)

        /// LP Head End ///

        /// Pickup Boy Start ////

        .post("/admin/all-delivery-partner-list", logUserActivity("View"), [], AdminController.all_delivery_partner_list)

        .post("/admin/all-pickup-partner-list", [], logUserActivity("View"), AdminController.all_pickup_partner_list)

        .post("/admin/add-pickup-boy", logUserActivity("Create"), [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile")], AdminController.add_pickup_boy)

        .post("/admin/pickup-boy-list", [], logUserActivity("View"), AdminController.pickup_boy_list)

        .post("/admin/update-pickup-boy-status", [], logUserActivity("Update"), AdminController.update_pickup_boy_status)

        .post("/admin/update-pickup-boy", logUserActivity("Update"), [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile"), check("id").trim().isLength({ min: 1 }).withMessage("Enter pickup boy id")], AdminController.update_pickup_boy)

        .post("/admin/get-single-pickup-boy", logUserActivity("View"), [], AdminController.get_pickup_boy)

        .post("/admin/delete-pickup-boy", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter pickup boy id")], AdminController.delete_pickup_boy)

        /// Pickup Boy End ////

        /// Pickup Boy Start ////

        .post("/admin/add-delivery-boy", logUserActivity("Update"), [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile")], AdminController.add_delivery_boy)

        .post("/admin/delivery-boy-list", [], logUserActivity("View"), AdminController.delivery_boy_list)

        .post("/admin/update-delivery-boy-status", [], logUserActivity("Update"), AdminController.update_delivery_boy_status)

        .post("/admin/update-delivery-boy", logUserActivity("Update"), [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile"), check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery boy id")], AdminController.update_delivery_boy)

        .post("/admin/get-single-delivery-boy", [], logUserActivity("View"), AdminController.get_delivery_boy)

        .post("/admin/delete-delivery-boy", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery boy id")], AdminController.delete_delivery_boy)

        /// Pickup Boy End ////

        /// Review Start ////
        .post("/admin/review-list", logUserActivity("View"), [], AdminController.review_list)

        .post("/admin/update-review-status", logUserActivity("Update"), [], AdminController.update_review_status)

        .post("/admin/delete-review", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter review id")], AdminController.delete_review)
        /// Review End ////

        .post("/admin/lp-list", [], logUserActivity("View"), AdminController.lp_list)

        .post("/admin/delivery-list", logUserActivity("View"), [], AdminController.delivery_list)

        /// Admin User Start ////

        .post(
            "/admin/add-user",
            [
                //check('name').trim().isLength({ min: 1 }).withMessage('Enter category name id'),
            ],
            logUserActivity("Create"),
            AdminController.add_user
        )

        .post("/admin/vendor-list", logUserActivity("View"), [], AdminController.vendor_list)

        .post("/admin/update-vendor-status", logUserActivity("Update"), [], AdminController.update_vendor_status)

        .post("/admin/update-vendor", logUserActivity("Update"), [], AdminController.update_vendor)

        .post("/admin/get-single-vendor", logUserActivity("View"), [], AdminController.get_vendor)

        .post("/admin/delete-vendor", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter vendor id")], AdminController.delete_vendor)

        /// Admin User End ////

        .post("/admin/get-user-data", logUserActivity("View"), [], AdminController.get_user_data)

        .post("/admin/all-brand-list", logUserActivity("View"), [], AdminController.all_brand_list)

        .post("/admin/all-category-list", logUserActivity("View"), [], AdminController.all_category_list)

        .post("/admin/all-product-list", logUserActivity("View"), [], AdminController.all_product_list)

        .post("/admin/all-customer-list", logUserActivity("View"), [], AdminController.all_customer_list)

        /// Shipping Start ///

        .post("/admin/create-shipping", logUserActivity("Create"), [check("name").trim().isLength({ min: 1 }).withMessage("Enter shipping name")], AdminController.create_shipping)

        .post("/admin/shipping-list", logUserActivity("View"), [], AdminController.shipping_list)

        .post("/admin/update-shipping-status", logUserActivity("Update"), [], AdminController.update_shipping_status)

        .post("/admin/get-single-shipping", logUserActivity("View"), [], AdminController.get_shipping)

        .post("/admin/update-shipping", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter shipping id"), check("name").trim().isLength({ min: 1 }).withMessage("Enter shipping name")], AdminController.update_shipping)

        .post("/admin/delete-shipping", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter shipping id")], AdminController.delete_shipping)

        .post("/admin/all-shipping-class", logUserActivity("View"), [], AdminController.all_shipping_class)

        /// Shipping End ///

        .get("/admin/state-list", logUserActivity("View"), logUserActivity("View"), AdminController.state_list)

        .post("/admin/update-customer-status", logUserActivity("Update"), [], AdminController.update_customer_status)

        .post("/admin/customer-list", logUserActivity("View"), [], AdminController.customer_list)

        .post("/admin/order-list", [], logUserActivity("View"), AdminController.order_list)

        .post("/admin/update-gateway-status", logUserActivity("Update"), [], AdminController.update_gateway)

        .post("/admin/update-partial-transaction", logUserActivity("Update"), [], AdminController.update_partial_transaction)

        .post("/admin/update-complementary", logUserActivity("Update"), AdminController.update_complementary)

        .post("/admin/update-order-status", logUserActivity("Update"), [], AdminController.update_order_status)

        .post("/admin/order-delete", logUserActivity("Delete"), [], AdminController.order_delete)

        .post("/admin/update-order-date", logUserActivity("Update"), AdminController.update_order_date)
        .post("/admin/update-pickup-date", logUserActivity("Update"), AdminController.update_pickup_date)

        .post("/admin/update-order-slot", logUserActivity("Update"), AdminController.update_order_slot)

        .post("/admin/customer-address-list", logUserActivity("View"), [], AdminController.customer_address_list)

        .post("/admin/update-customer", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter id"), check("full_name").trim().isLength({ min: 1 }).withMessage("Enter name")], AdminController.update_customer)

        .post("/admin/update-customer-cod", logUserActivity("Update"), [], AdminController.update_customer_cod_status)

        .post("/admin/update-customer-order-status", logUserActivity("Update"), [], AdminController.update_customer_order_status)

        .post("/admin/add_order_note", logUserActivity("Create"), AdminController.add_order_note)

        .post("/admin/order_note_list", [], logUserActivity("View"), AdminController.order_note_list)

        .get("/admin/approve_order_vendor", logUserActivity("Update"), [], AdminController.approve_order_vendor)

        .get("/admin/send_order_invoice", logUserActivity("View"), [], AdminController.send_order_invoice)

        .post("/admin/bulk-order-list", logUserActivity("View"), [], AdminController.bulk_order_list)

        .post("/admin/update-bulk-order-status", logUserActivity("Update"), [], AdminController.update_bulk_order_status)

        .post("/admin/delete-bulk-order", logUserActivity("Delete"), [], AdminController.delete_bulk_order)

        .post("/admin/send-otp", logUserActivity("OTP SEND"), apiLimiter, AdminController.send_otp)
        .get("/admin/send_email_template", logUserActivity("View"), AdminController.send_email_template)
        .post("/admin/get_map_data", logUserActivity("View"), AdminController.get_map_data)

        .post("/admin/update-pickup-boy-status-login", logUserActivity("Update"), [], AdminController.update_pickup_boy_status_login)

        .post("/admin/update-delivery-boy-status-login", logUserActivity("Update"), [], AdminController.update_delivery_boy_status_login)

        .get("/admin/get_order_invoice", logUserActivity("View"), [], AdminController.get_order_invoice)

        .get("/admin/partner_today_order_invoice", logUserActivity("View"), [], AdminController.partner_today_order_invoice)

        .get("/admin/partner_tomorrow_order_invoice", logUserActivity("View"), [], AdminController.partner_tomorrow_order_invoice)

        .get("/admin/partner_today_order_by_product_invoice", logUserActivity("View"), [], AdminController.partner_today_order_by_product_invoice)

        .get("/admin/partner_tomorrow_order_by_product_invoice", logUserActivity("View"), [], AdminController.partner_tomorrow_order_by_product_invoice)

        /// State Start ///

        .post("/admin/state-list-all", [], logUserActivity("View"), AdminController.state_list_all)

        .post("/admin/update-state-status", [], logUserActivity("Update"), AdminController.update_state_status)

        /// State End ///

        .post("/admin/upload_doc1", logUserActivity("Update"), AdminController.upload_doc1)
        .post("/admin/upload_doc2", logUserActivity("Update"), AdminController.upload_doc2)
        .post("/admin/upload_doc3", logUserActivity("Update"), AdminController.upload_doc3)
        .post("/admin/update-profile-image-2", logUserActivity("Update"), AdminController.update_profile_image2)

        .post("/admin/schedule-order-status", [], logUserActivity("Update"), AdminController.schedule_order_status)

        .get("/admin/schedule-order-status-cron", [], logUserActivity("Update"), AdminController.schedule_order_status_cron)

        .post("/admin/create-holiday", [], logUserActivity("Create"), AdminController.create_holiday)

        .post("/admin/brand-holiday", [], logUserActivity("View"), AdminController.brand_holiday)

        .post("/admin/delete-holiday", [], logUserActivity("Delete"), AdminController.delete_holiday)

        .post("/admin/get_schedule", [], logUserActivity("View"), AdminController.get_schedule)

        .post("/admin/order-pdelete", [], logUserActivity("Delete"), AdminController.order_pdelete)

        .post("/admin/create-note", [], logUserActivity("Create"), AdminController.create_note)

        .post("/admin/order-note", [], logUserActivity("View"), AdminController.order_note)

        .post("/admin/delete-order-note", [], logUserActivity("Delete"), AdminController.delete_order_note)

        .post("/admin/financial-log", [], logUserActivity("View"), AdminController.financial_log)

        .post("/admin/update-log-status", [], logUserActivity("Update"), AdminController.update_log_status)

        /// Manage Office Start //////

        .post("/admin/create-office", logUserActivity("Create"), [check("name").trim().isLength({ min: 1 }).withMessage("Enter office name"), check("city").trim().isLength({ min: 1 }).withMessage("Select city name"), check("address").trim().isLength({ min: 1 }).withMessage("Enter address"), check("contact_person").trim().isLength({ min: 1 }).withMessage("Enter contact person"), check("contact_person_email").trim().isLength({ min: 1 }).withMessage("Enter contact person email"), check("contact_person_mobile").trim().isLength({ min: 1 }).withMessage("Enter contact person mobile")], AdminController.create_office)

        .post("/admin/office-list", [], logUserActivity("View"), AdminController.office_list)

        .post("/admin/update-office-status", logUserActivity("Update"), [], AdminController.update_office_status)

        .post("/admin/get-single-office", logUserActivity("View"), [], AdminController.get_office)

        .post("/admin/update-office", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter zipcode id"), check("name").trim().isLength({ min: 1 }).withMessage("Enter office name"), check("city").trim().isLength({ min: 1 }).withMessage("Select city name"), check("address").trim().isLength({ min: 1 }).withMessage("Enter address"), check("contact_person").trim().isLength({ min: 1 }).withMessage("Enter contact person"), check("contact_person_email").trim().isLength({ min: 1 }).withMessage("Enter contact person email"), check("contact_person_mobile").trim().isLength({ min: 1 }).withMessage("Enter contact person mobile")], AdminController.update_office)

        .post("/admin/delete-office", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter zipcode id")], AdminController.delete_office)

        /// Magage Office Stop  //////

        /// Unit Start //////

        .post("/admin/create-unit", logUserActivity("Create"), [check("name").trim().isLength({ min: 1 }).withMessage("Enter office name")], AdminController.create_unit)

        .post("/admin/unit-list", logUserActivity("View"), [], AdminController.unit_list)

        .post("/admin/get-single-unit", logUserActivity("View"), [], AdminController.get_unit)

        .post("/admin/update-unit", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter unit id"), check("name").trim().isLength({ min: 1 }).withMessage("Enter unit")], AdminController.update_unit)

        .post("/admin/delete-unit", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter unit id")], AdminController.delete_unit)

        /// Unit Stop  //////

        /// Manage Product Rate Start //////

        .post("/admin/create-product-rate", logUserActivity("Create"), [check("product").trim().isLength({ min: 1 }).withMessage("Enter product name"), check("vendor").trim().isLength({ min: 1 }).withMessage("Select vendor name"), check("unit").trim().isLength({ min: 1 }).withMessage("Enter unit"), check("price").trim().isLength({ min: 1 }).withMessage("Enter price name")], AdminController.create_product_rate)

        .post("/admin/product-rate-list", [], logUserActivity("View"), AdminController.product_rate_list)

        .post("/admin/get-single-product-rate", [], logUserActivity("View"), AdminController.get_product_rate)

        .post("/admin/update-product-rate", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter zipcode id"), check("product").trim().isLength({ min: 1 }).withMessage("Enter product name"), check("vendor").trim().isLength({ min: 1 }).withMessage("Select vendor name"), check("unit").trim().isLength({ min: 1 }).withMessage("Enter unit"), check("price").trim().isLength({ min: 1 }).withMessage("Enter price name")], AdminController.update_product_rate)

        .post("/admin/delete-product-rate", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter rate id")], AdminController.delete_product_rate)

        .post("/admin/product-unit-list", [], logUserActivity("View"), AdminController.product_unit_list)

        .post("/admin/product-by-vendor", [], logUserActivity("View"), AdminController.product_by_vendor)

        .post("/admin/product-by-vendor2", [], logUserActivity("View"), AdminController.product_by_vendor2)

        .post("/admin/product-by-office", [], logUserActivity("View"), AdminController.product_by_office)

        /// Manage Product Rate Stop  //////

        /// Plan Start //////

        .post("/admin/create-plan", logUserActivity("Create"), [check("name").trim().isLength({ min: 1 }).withMessage("Enter office name"), check("price").trim().isLength({ min: 1 }).withMessage("Enter price"), check("day").trim().isLength({ min: 1 }).withMessage("Enter day")], AdminController.create_plan)

        .post("/admin/plan-list", [], logUserActivity("View"), AdminController.plan_list)

        .post("/admin/update-plan-status", [], logUserActivity("Update"), AdminController.update_plan_status)

        .post("/admin/get-single-plan", logUserActivity("View"), [], AdminController.get_plan)

        .post("/admin/update-plan", logUserActivity("Update"), [check("name").trim().isLength({ min: 1 }).withMessage("Enter office name"), check("price").trim().isLength({ min: 1 }).withMessage("Enter price"), check("day").trim().isLength({ min: 1 }).withMessage("Enter day")], AdminController.update_plan)

        .post("/admin/delete-plan", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter zipcode id")], AdminController.delete_plan)

        /// Plan Stop  //////

        .post("/admin/check-stock", logUserActivity("View"), [], AdminController.check_stock)

        .post("/admin/check-stock2", logUserActivity("View"), [], AdminController.check_stock2)

        .post("/admin/check-office-stock", logUserActivity("View"), [], AdminController.check_office_stock)

        .post("/admin/stock-list", logUserActivity("View"), AdminController.fetch_stock_data)

        .post("/admin/scrap-list", logUserActivity("View"), AdminController.fetch_scrap_stock)

        .post("/admin/destroy-stock", logUserActivity("Update"), AdminController.destroy_stock)


        /// Wallet Start ////

        .post("/admin/add-wallet", logUserActivity("Create"), [], AdminController.add_wallet)

        .post("/admin/wallet-list", logUserActivity("View"), [], AdminController.wallet_list)

        .post("/admin/delete-wallet", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter wallet id")], AdminController.delete_wallet)

        /// Wallet End ////

        /// Stock Vendor Start ////

        .post(
            "/admin/add-vendor2",
            [
                //check('name').trim().isLength({ min: 1 }).withMessage('Enter category name id'),
            ],
            logUserActivity("Create"),
            AdminController.add_vendor2
        )

        .post("/admin/vendor2-list", logUserActivity("View"), [], AdminController.vendor2_list)

        .post("/admin/update-vendor2-status", logUserActivity("Update"), [], AdminController.update_vendor2_status)

        .post("/admin/update-vendor2", logUserActivity("Update"), [], AdminController.update_vendor2)

        .post("/admin/get-single-vendor2", logUserActivity("View"), [], AdminController.get_vendor2)

        .post("/admin/delete-vendor2", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter vendor2 id")], AdminController.delete_vendor2)

        /// Stock Vendor End ////

        /// Stock Category Start ////

        .post("/admin/parent-stock-category-list", logUserActivity("View"), [], AdminController.parent_stock_category_list)

        .post(
            "/admin/add-stock-category",
            [
                //check('name').trim().isLength({ min: 1 }).withMessage('Enter category name id'),
            ],
            logUserActivity("Create"),
            AdminController.add_stock_category
        )

        .post("/admin/stock-category-list", logUserActivity("View"), [], AdminController.stock_category_list)

        .post("/admin/update-stock-category-status", logUserActivity("Update"), [], AdminController.update_stock_category_status)

        .post("/admin/get-single-stock-category", logUserActivity("View"), [], AdminController.get_stock_category)

        .post("/admin/delete-stock-category", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter category id")], AdminController.delete_stock_category)

        .post("/admin/update-stock-category", [], logUserActivity("Update"), AdminController.update_stock_category)

        /// Stock Category End ////

        /// Stock Product Start ////

        .post("/admin/sub-stock-category-list", logUserActivity("View"), [check("category_id").trim().isLength({ min: 1 }).withMessage("Enter parent category id")], AdminController.sub_stock_category_list)

        .post("/admin/add-stock-product", [], logUserActivity("Create"), AdminController.add_stock_product)

        .post("/admin/stock-product-list", [], logUserActivity("View"), AdminController.stock_product_list)

        .post("/admin/update-stock-product-status", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter product id")], AdminController.update_stock_product_status)

        .post("/admin/get-single-stock-product", logUserActivity("View"), [], AdminController.get_stock_product)

        .post("/admin/delete-stock-product", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter product id")], AdminController.delete_stock_product)

        .post("/admin/update-stock-product", logUserActivity("Update"), [], AdminController.update_stock_product)

        .post("/admin/all-stock-product-list", logUserActivity("View"), [], AdminController.all_stock_product_list)

        /// Stock Product End ////

        .post("/admin/all-stock-vendor-list", logUserActivity("View"), [], AdminController.all_stock_vendor_list)

        .post("/admin/all-stock-vendor-list2", [], logUserActivity("View"), AdminController.all_stock_vendor_list2)

        .post("/admin/add-inward", [], logUserActivity("Create"), AdminController.add_inward)

        .post("/admin/add-inward2", [], logUserActivity("Create"), AdminController.add_inward2)

        .post("/admin/add-outward2", [], logUserActivity("Create"), AdminController.add_outward2)

        .post("/admin/inward-list", [], logUserActivity("View"), AdminController.inward_list)

        .post("/admin/inward-list2", [], logUserActivity("View"), AdminController.inward_list2)
        .post("/admin/singel-inward-list", [], logUserActivity("View"), AdminController.singel_inward_list)
        .post("/admin/update-inward-product-purchase-price", logUserActivity("Update"), [], AdminController.update_purchase_inward_product_purchase_price)

        .post("/admin/approve-inward-list2", [], logUserActivity("View"), AdminController.approve_inward_list)

        .post("/admin/outward_list2", [], logUserActivity("View"), AdminController.outward_list2)

        .post("/admin/all-stock-office-list", [], logUserActivity("View"), AdminController.all_stock_office_list)

        .post("/admin/all-stock-office-list2", [], AdminController.all_stock_office_list2)

        .post("/admin/delete-inward", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter id")], AdminController.delete_inward)

        .post("/admin/delete-inward2", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter id")], AdminController.delete_inward2)

        .post("/admin/delete-outward2", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter id")], AdminController.delete_outward2)

        .post("/admin/get-inward-data", logUserActivity("View"), [], AdminController.get_inward_data)

        .post("/admin/get-inward-data2", logUserActivity("View"), [], AdminController.get_inward_data2)

        .post("/admin/update-inward", [], logUserActivity("Update"), AdminController.update_inward)

        .post("/admin/update-inward2", [], logUserActivity("Update"), AdminController.update_inward2)

        .post("/admin/add-outward", [], logUserActivity("Create"), AdminController.add_outward)

        .post("/admin/outward-list", [], logUserActivity("View"), AdminController.outward_list)

        .post("/admin/get-outward-data", [], logUserActivity("View"), AdminController.get_outward_data)

        .post("/admin/update-outward", [], logUserActivity("Update"), AdminController.update_outward)

        .post("/admin/delete-outward", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter id")], AdminController.delete_outward)

        .post("/admin/stock-report", [], logUserActivity("View"), AdminController.stock_report)

        // .post("/admin/sales_report_chart", [], logUserActivity("View"), AdminController.sales_report_chart)

        /// Expense Start ////

        .post("/admin/parent-expense-category-category-list", logUserActivity("View"), [], AdminController.parent_expense_category_list)

        .post("/admin/add-expense-category", [], logUserActivity("Create"), AdminController.add_expense_category)

        .post("/admin/expense-category-list", [], logUserActivity("View"), AdminController.expense_list)

        .post("/admin/update-expense-category-status", logUserActivity("Update"), [], AdminController.update_expense_category_status)

        .post("/admin/get-single-expense-category", logUserActivity("View"), [], AdminController.get_expense_category)

        .post("/admin/delete-expense-category", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter expense id")], AdminController.delete_expense_category)

        .post("/admin/update-expense-category", logUserActivity("Update"), [], AdminController.update_expense_category)

        /// Expense End ////

        /// Cargo Expense Start ////

        .post("/admin/add-cargo-expense", logUserActivity("Create"), [], AdminController.add_cargo_expense)

        .post("/admin/cargo-expense-list", [], logUserActivity("View"), AdminController.cargo_expense_list)

        .post("/admin/update-cargo-expense-status", [], logUserActivity("Update"), AdminController.update_cargo_expense_status)

        .post("/admin/get-single-cargo-expense", [], logUserActivity("View"), AdminController.get_cargo_expense)

        .post("/admin/delete-cargo-expense", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter expense id")], AdminController.delete_cargo_expense)

        .post("/admin/update-cargo-expense", [], logUserActivity("Update"), AdminController.update_cargo_expense)

        .post("/admin/delete-cargo-expense-file", logUserActivity("Delete"), [], AdminController.delete_cargo_expense_file)

        /// Expense Cargo End ////

        /// Pickup Expense Start ////

        .post("/admin/add-pickup-expense", logUserActivity("Create"), [], AdminController.add_pickup_expense)

        .post("/admin/pickup-expense-list", logUserActivity("View"), [], AdminController.pickup_expense_list)

        .post("/admin/update-pickup-expense-status", logUserActivity("Update"), [], AdminController.update_pickup_expense_status)

        .post("/admin/get-single-pickup-expense", logUserActivity("View"), [], AdminController.get_pickup_expense)

        .post("/admin/delete-pickup-expense", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter expense id")], AdminController.delete_pickup_expense)

        .post("/admin/update-pickup-expense", logUserActivity("Update"), [], AdminController.update_pickup_expense)

        .post("/admin/delete-pickup-expense-file", logUserActivity("Delete"), [], AdminController.delete_pickup_expense_file)

        /// Expense End ////

        /// Other Expense Start ////

        .post("/admin/add-other-expense", logUserActivity("Create"), [], AdminController.add_other_expense)

        .post("/admin/other-expense-list", [], logUserActivity("View"), AdminController.other_expense_list)

        .post("/admin/update-other-expense-status", [], logUserActivity("Update"), AdminController.update_other_expense_status)

        .post("/admin/get-single-other-expense", [], logUserActivity("View"), AdminController.get_other_expense)

        .post("/admin/delete-other-expense", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter expense id")], AdminController.delete_other_expense)

        .post("/admin/update-other-expense", logUserActivity("Update"), [], AdminController.update_other_expense)

        .post("/admin/delete-other-expense-file", logUserActivity("Delete"), [], AdminController.delete_other_expense_file)

        /// Expense Other End ////

        .post("/admin/all-expense-category", logUserActivity("View"), [], AdminController.all_expense_category)

        .post("/admin/all-expense-sub-category", logUserActivity("View"), [], AdminController.all_expense_sub_category)

        /// Marketing Expense Start ////

        .post("/admin/add-marketing-expense", logUserActivity("Create"), [], AdminController.add_marketing_expense)

        .post("/admin/marketing-expense-list", [], logUserActivity("View"), AdminController.marketing_expense_list)

        .post("/admin/update-marketing-expense-status", logUserActivity("Update"), [], AdminController.update_marketing_expense_status)

        .post("/admin/get-single-marketing-expense", logUserActivity("View"), [], AdminController.get_marketing_expense)

        .post("/admin/delete-marketing-expense", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter expense id")], AdminController.delete_marketing_expense)

        .post("/admin/update-marketing-expense", logUserActivity("Update"), [], AdminController.update_marketing_expense)

        .post("/admin/delete-marketing-expense-file", logUserActivity("Delete"), [], AdminController.delete_marketing_expense_file)

        /// Expense Marketing End ////

        /// Travel Expense Start ////

        .post("/admin/add-travel-expense", logUserActivity("Create"), [], AdminController.add_travel_expense)

        .post("/admin/travel-expense-list", [], logUserActivity("View"), AdminController.travel_expense_list)

        .post("/admin/update-travel-expense-status", [], logUserActivity("Update"), AdminController.update_travel_expense_status)

        .post("/admin/get-single-travel-expense", [], logUserActivity("View"), AdminController.get_travel_expense)

        .post("/admin/delete-travel-expense", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter expense id")], AdminController.delete_travel_expense)

        .post("/admin/update-travel-expense", [], logUserActivity("Update"), AdminController.update_travel_expense)

        .post("/admin/delete-travel-expense-file", [], logUserActivity("Delete"), AdminController.delete_travel_expense_file)

        /// Travel Marketing End ////

        /// Requisition Expense Start ////

        .post("/admin/add-requisition-expense", [], logUserActivity("Create"), AdminController.add_requisition_expense)

        .post("/admin/requisition-expense-list", [], logUserActivity("View"), AdminController.requisition_expense_list)

        .post("/admin/update-requisition-expense-status", [], logUserActivity("Update"), AdminController.update_requisition_expense_status)

        .post("/admin/get-single-requisition-expense", [], logUserActivity("View"), AdminController.get_requisition_expense)

        .post("/admin/delete-requisition-expense", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter expense id")], AdminController.delete_requisition_expense)

        .post("/admin/update-requisition-expense", [], logUserActivity("Update"), AdminController.update_requisition_expense)

        .post("/admin/delete-requisition-expense-file", [], logUserActivity("Delete"), AdminController.delete_requisition_expense_file)

        /// Expense Requisition End ////

        /// COD Expense Start ////

        .post("/admin/add-cod-expense", [], logUserActivity("Create"), AdminController.add_cod_expense)

        .post("/admin/cod-expense-list", [], logUserActivity("View"), AdminController.cod_expense_list)

        .post("/admin/update-cod-expense-status", [], logUserActivity("Update"), AdminController.update_cod_expense_status)

        .post("/admin/get-single-cod-expense", [], logUserActivity("View"), AdminController.get_cod_expense)

        .post("/admin/delete-cod-expense", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter expense id")], AdminController.delete_cod_expense)

        .post("/admin/update-cod-expense", [], logUserActivity("Update"), AdminController.update_cod_expense)

        .post("/admin/delete-cod-expense-file", [], logUserActivity("Delete"), AdminController.delete_cod_expense_file)

        .post("/admin/all-delivery-boy-list", [], logUserActivity("View"), AdminController.all_delivery_boy_list)

        /// COD Requisition End ////

        .post("/admin/fetch-order-amount", [], logUserActivity("View"), AdminController.fetch_order_amount)

        .post("/admin/expense-report", [], logUserActivity("View"), AdminController.expense_report)

        .post("/admin/delete-user-file", [], logUserActivity("Delete"), AdminController.delete_user_file)

        .post("/admin/cod_recocilition", [], logUserActivity("View"), AdminController.cod_recocilition)

        .get("/admin/cod_recocilition_report", [], logUserActivity("View"), AdminController.cod_recocilition_report)

        /// Bank diposit Start ////

        .post("/admin/add-bank-diposit", [], logUserActivity("Create"), AdminController.add_bank_diposit)

        .post("/admin/bank-diposit-list", [], logUserActivity("View"), AdminController.bank_diposit_list)

        .post("/admin/get-single-bank-diposit", [], logUserActivity("View"), AdminController.get_bank_diposit)

        .post("/admin/delete-bank-diposit", logUserActivity("Delete"), AdminController.delete_bank_diposit)

        .post("/admin/update-bank-diposit", [], logUserActivity("Update"), AdminController.update_bank_diposit)
        .post("/admin/delete-bank-diposit-file", [], logUserActivity("Delete"), AdminController.delete_bank_diposit_file)

        /// Bank diposit End ////

        .get("/admin/all-pickup-partner-list", logUserActivity("View"), AdminController.all_pickup_partner_list)

        .post("/admin/update-bank-status", [], logUserActivity("Update"), AdminController.update_bank_status)

        .post("/admin/update-info-image", logUserActivity("Update"), AdminController.update_info_image)

        .post("/admin/send-push", [], logUserActivity("Update"), AdminController.send_push)

        .post("/admin/get-office-product", logUserActivity("View"), [], AdminController.get_office_product)

        //.get("/admin/export_product", [],  AdminController.export_product)

        .post("/admin/all-financial-log", [], logUserActivity("View"), AdminController.all_financial_log)
        .post("/admin/add-financial-log", [], logUserActivity("Create"), AdminController.add_financial_log)
        .get("/admin/partnar-log", [], logUserActivity("View"), AdminController.partnar_log)

        .post("/admin/delete-order-product", logUserActivity("Delete"), AdminController.delete_order_product)
        .post("/admin/add-order-product", logUserActivity("Create"), AdminController.add_order_product)
        .get("/admin/get-order-product", logUserActivity("View"), AdminController.fetch_product_per_city)

        .post("/admin/update-order-partner", logUserActivity("Update"), AdminController.update_order_partner)
        // .get("/admin/init_map_data", logUserActivity("View"), AdminController.init_map_data)

        .get("/admin/product-summery-print", [], logUserActivity("View"), AdminController.product_summery_print)

        .post("/admin/all-travel-log", [], logUserActivity("View"), AdminController.all_travel_log)
        .post("/admin/update-travel-log-status", logUserActivity("Update"), [], AdminController.update_travel_log_status)
        .post("/admin/contact-list", [], logUserActivity("View"), AdminController.contact_list)
        .get("/admin/partnar-log2", [], logUserActivity("View"), AdminController.partnar_log2)
        .get("/admin/partnar-log3", [], logUserActivity("View"), AdminController.partnar_log3)
        .post("/admin/add-log", [], logUserActivity("Create"), AdminController.add_log)
        .post("/admin/activity-log", [], logUserActivity("View"), AdminController.activity_log)

        .post("/admin/all-product-list-by-filter", logUserActivity("View"), [], AdminController.all_product_list_by_filter)
        .post("/admin/create-order-log-product", logUserActivity("Create"), authenticateToken, AdminController.create_order_log_product)
        .post("/admin/create-order-log-zipcode", logUserActivity("Create"), authenticateToken, AdminController.create_order_log_zipcode)

        ///Campaign
        .post("/admin/create-campaign", logUserActivity("Create"), authenticateToken, AdminController.add_campaign)
        .post("/admin/campaign-list", logUserActivity("View"), authenticateToken, AdminController.campaigns_list)
        .post("/admin/campaign-single", logUserActivity("View"), authenticateToken, AdminController.campaigns_single)
        .post("/admin/campaign-update", logUserActivity("Update"), authenticateToken, AdminController.update_campaign)
        .post("/admin/delete-campaign-image", logUserActivity("Delete"), authenticateToken, AdminController.delete_campaign_image)
        .post("/admin/campaign-delete", logUserActivity("Delete"), authenticateToken, AdminController.delete_campaign)
        .post("/admin/campaign-status-update", logUserActivity("Update"), authenticateToken, AdminController.update_campaign_status)

        .post("/admin/send-campaign-mail", logUserActivity("View"), authenticateToken, AdminController.send_campaign_email)
        .post("/admin/send-campaign-push", logUserActivity("View"), authenticateToken, AdminController.send_campaign_push)
        .post("/admin/send-campaign-whatsapp", logUserActivity("View"), authenticateToken, AdminController.send_campaign_whatsapp)

        .post("/admin/send-campaign-mail-all", logUserActivity("View"), authenticateToken, AdminController.send_campaign_email_all)
        .post("/admin/send-campaign-push-all", logUserActivity("View"), authenticateToken, AdminController.send_campaign_push_all)
        .post("/admin/send-campaign-whatsapp-all", authenticateToken, AdminController.send_campaign_whatsapp_all)
        .post("/admin/create-survey", logUserActivity("Create"), authenticateToken, AdminController.create_survey)
        .post("/admin/survey-list", logUserActivity("View"), authenticateToken, AdminController.survey_list)
        .post("/admin/update-survey-status", logUserActivity("Update"), authenticateToken, AdminController.update_survey_status)
        .post("/admin/delete-survey", logUserActivity("Delete"), authenticateToken, AdminController.delete_survey)
        .post("/admin/delete-survey-survey", logUserActivity("Delete"), authenticateToken, AdminController.delete_survey_survey)
        .post("/admin/update-survey", logUserActivity("Update"), authenticateToken, AdminController.update_survey)
        .post("/admin/fetch-single-survey", logUserActivity("View"), authenticateToken, AdminController.fetch_single_survey)

        .post("/admin/assign-survey-to", logUserActivity("Update"), authenticateToken, AdminController.create_survey_form)
        .post("/admin/survey-form-list", logUserActivity("View"), authenticateToken, AdminController.survey_form_list)
        .post("/admin/single-survey-form-list", logUserActivity("View"), authenticateToken, AdminController.single_survey_form_list)
        .post("/admin/update-survey-answer", logUserActivity("Update"), authenticateToken, AdminController.update_survey_anwer)
        .post("/admin/update-survey-answer-call", logUserActivity("Update"), authenticateToken, AdminController.update_answer_call_update)

        .post("/admin/view-survey-answers", logUserActivity("View"), authenticateToken, AdminController.survey_answer_list)

        .post("/admin/view-singel-automation-schedule", logUserActivity("View"), authenticateToken, AdminController.view_singel_automation_schedule)
        .post("/admin/view-automation-schedule", logUserActivity("View"), authenticateToken, AdminController.view_automation_schedule)
        .post("/admin/create-automation-schedule", logUserActivity("Create"), authenticateToken, AdminController.automation_schedule_create)
        .post("/admin/update-automation-schedule", logUserActivity("Update"), authenticateToken, AdminController.automation_schedule_update)
        .post("/admin/delete-automation-schedule", logUserActivity("Delete"), authenticateToken, AdminController.automation_schedule_delete)

        .post("/admin/order-list-cod-collection", logUserActivity("View"), AdminController.order_list_cod_collection)
        .post("/admin/order-list-cod-collection-orderid", logUserActivity("View"), AdminController.order_list_cod_collection_order_id)

        .post("/admin/verify-checkout", logUserActivity("View"), AdminController.verify_checkout)

        .post("/admin/delete-survey-answer", logUserActivity("Delete"), AdminController.delete_survey_anwer)

        ////Ghar ka Khana
        .post("/admin/create-ghar-ka-khana-category", logUserActivity("Create"), AdminController.ghar_ka_khana_add_category)
        .post("/admin/update-ghar-ka-khana-category", logUserActivity("Update"), AdminController.ghar_ka_khana_update_category)
        .post("/admin/fetch-ghar-ka-khana-category", logUserActivity("View"), AdminController.ghar_ka_khana_category_list)
        .post("/admin/update-ghar-ka-khana-category-status", logUserActivity("Update"), AdminController.ghar_ka_khana_update_category_status)
        .post("/admin/delete-ghar-ka-khana-category", logUserActivity("Delete"), AdminController.ghar_ka_khana_delete_category)
        .post("/admin/get-singel-ghar-ka-khana-category", logUserActivity("View"), AdminController.ghar_ka_khana_get_category)
        .post("/admin/get-ghar-ka-khana-parent-category", logUserActivity("View"), AdminController.ghar_ka_khana_parent_category_list)

        .post("/admin/create-ghar-ka-khana-slider", logUserActivity("Create"), AdminController.ghar_ka_kahana_add_slider)
        .post("/admin/update-ghar-ka-khana-slider", logUserActivity("Update"), AdminController.ghar_ka_kahana_update_slider)
        .post("/admin/fetch-ghar-ka-khana-slider", logUserActivity("View"), AdminController.ghar_ka_kahana_slider_list)
        .post("/admin/update-ghar-ka-khana-slider-status", logUserActivity("Update"), AdminController.ghar_ka_kahana_update_slider_status)
        .post("/admin/delete-ghar-ka-khana-slider", logUserActivity("Delete"), AdminController.ghar_ka_kahana_delete_slider)
        .post("/admin/get-singel-ghar-ka-khana-slider", logUserActivity("View"), AdminController.ghar_ka_kahana_get_slider)
        .post("/admin/ghar-ka-khana-fetch-orders", logUserActivity("View"), AdminController.ghar_ka_khana_fetch_orders)
        .post("/admin/ghar-ka-khana-delete-order", logUserActivity("Delete"), AdminController.ghar_ka_kahana_order_delete)
        .post("/admin/ghar-ka-khana-pdelete-order", logUserActivity("Delete"), AdminController.ghar_ka_kahana_order_pdelete)
        .get("/admin/ghar-ka-khana-get-order-invoice", logUserActivity("View"), AdminController.ghar_ka_khana_get_order_invoice)
        .get("/admin/ghar-ka-khana-product-summery-print", logUserActivity("View"), AdminController.ghar_ka_khana_product_summery_print)

        .post("/admin/ghar-ka-khana-update-order-basic", logUserActivity("Update"), AdminController.ghar_ka_kahana_order_update_basics)
        .post("/admin/order-fetch-boys", logUserActivity("View"), AdminController.orders_fetch_boys)
        .post("/admin/gharkakhana_update-order-status", logUserActivity("Update"), [], AdminController.update_gharkakhana_order_status)


        // Gifts Section

        .post("/admin/create-gift", logUserActivity("Create"), AdminController.create_gift)
        .post("/admin/all-gift-list", [], logUserActivity("View"), AdminController.gift_list)
        .post("/admin/update-gift-status", logUserActivity("Update"), AdminController.update_gift_status)
        .post("/admin/get-single-gift", [], logUserActivity("View"), AdminController.get_gift)
        .post("/admin/delete-gift-image", [], logUserActivity("Delete"), AdminController.delete_gift_image)
        .post("/admin/update-gift", [], logUserActivity("Update"), AdminController.update_gift)
        .post("/admin/delete-gift", [], logUserActivity("Delete"), AdminController.delete_gift)

        .post("/admin/all-gift-type-list", [], logUserActivity("View"), AdminController.all_gift_type_list)

        ///APIS for P & L
        // .post("/admin/pickup-delivery-expense", [], AdminController.pickup_delivery_expense_p_l)
        // .post("/admin/other-expense", [], AdminController.other_expense_p_l)
        // .post("/admin/marketing-expense", [], AdminController.marketing_expense_p_l)
        // .post("/admin/requisition-expense", [], AdminController.requisition_expense_p_l)
        .post("/admin/other-expense2", logUserActivity("View"), [], AdminController.other_expense2_p_l)
        .post("/admin/profit-loss", [], logUserActivity("View"), AdminController.purchase_expense)
        // .post("/admin/total-sale", [], AdminController.total_sale_p_l)
        .post("/admin/create-po-order", logUserActivity("Create"), [], AdminController.create_po_order)

        /////SHOP APIS
        .post("/admin/add-shop", logUserActivity("Create"), [], AdminController.add_shop)
        .post("/admin/shop-list", logUserActivity("View"), [], AdminController.shop_list)
        .post("/admin/get-single-shop", logUserActivity("View"), [], AdminController.get_singel_shop)
        .post("/admin/update-shop", [], logUserActivity("Update"), AdminController.update_shop)
        .post("/admin/update-shop-status", logUserActivity("Update"), [], AdminController.update_shop_status)
        .post("/admin/delete-shop", logUserActivity("Delete"), [], AdminController.delete_Shop)
        .post("/admin/update-shop-fssi-image", logUserActivity("Update"), [], AdminController.update_fssi_image)
        .post("/admin/update-banner-image", [], logUserActivity("Update"), AdminController.update_banner_image)
        .post("/admin/update-qr-image", [], logUserActivity("Update"), AdminController.update_qr_image)

        .post("/app/shop-verify-otp", logUserActivity("Update"), apiLimiter, AdminController.shop_verify_otp)
        .post("/app/shop-login", logUserActivity("Login"), AdminController.shop_login)
        .post("/app/shop-send-otp", logUserActivity("OTP Send"), apiLimiter, AdminController.shop_send_otp)

        .get("/app/shop-get-profile", logUserActivity("View"), AdminController.shop_get_profile)
        .post("/app/shop-get-orders", logUserActivity("View"), AdminController.shop_get_order)
        .get("/app/shop-get-list", logUserActivity("View"), AdminController.shop_list_search)

        ///SHOP PRODUCT
        .post("/admin/add-shop-product", [], logUserActivity("Create"), AdminController.add_shop_product)
        .post("/admin/shop-product-list", [], logUserActivity("View"), AdminController.shop_product_list)
        .post("/admin/get-single-shop-product", logUserActivity("View"), [], AdminController.get_singel_shop_product)
        .post("/admin/update-shop-product", [], logUserActivity("Update"), AdminController.update_shop_product)
        .post("/admin/update-shop-product-status", [], logUserActivity("Update"), AdminController.update_shop_product_status)
        .post("/admin/delete-shop-product", [], logUserActivity("Delete"), AdminController.delete_shop_product)

        .post("/app/shop-proudct-list-customer", logUserActivity("View"), [], AdminController.shop_product_list_customer)

        // TimeSlot Apis
        .post("/admin/add-timeslot", logUserActivity("Create"), AdminController.add_TimeSlot)
        .post("/admin/delete-timeslot", logUserActivity("Delete"), AdminController.delete_TimeSlot)

        .get("/admin/get-timeslot", logUserActivity("View"), AdminController.get_TimeSlot)


        /////Shop Slider

        .post("/admin/create-shop-slider", logUserActivity("Create"), AdminController.shop_add_slider)
        .post("/admin/update-shop-slider", logUserActivity("Update"), AdminController.shop_update_slider)
        .post("/admin/fetch-shop-slider", logUserActivity("View"), AdminController.shop_slider_list)
        .post("/admin/update-shop-slider-status", logUserActivity("Update"), AdminController.Shop_update_slider_status)
        .post("/admin/delete-shop-slider", logUserActivity("Delete"), AdminController.shop_delete_slider)
        .post("/admin/get-singel-shop-slider", logUserActivity("View"), AdminController.shop_get_singel_slider)

        // TOP HEADER

        .post("/admin/create-top-header", logUserActivity("Create"), AdminController.top_header_add)
        .post("/admin/update-top-header", logUserActivity("Update"), AdminController.top_header_update)
        .post("/admin/update-top-header-image", logUserActivity("Update"), AdminController.top_header_image_update)
        .post("/admin/get-singel-top-header", logUserActivity("View"), AdminController.top_header_get)
        .post("/admin/get-all-top-header", logUserActivity("View"), AdminController.top_header_get_all)
        .post("/admin/update-top-header-status", logUserActivity("Update"), AdminController.top_heading_update_status)
        .post("/admin/delete-top-header", logUserActivity("Delete"), AdminController.top_header_delete)


        ////Video
        .post("/admin/create-video", logUserActivity("Create"), AdminController.video_model_add)
        .post("/admin/update-video", logUserActivity("Update"), AdminController.video_update)
        .post("/admin/update-video-status", logUserActivity("Update"), AdminController.video_update_status)
        .post("/admin/get-singel-video", logUserActivity("View"), AdminController.video_get_single)
        .post("/admin/get-video", logUserActivity("View"), AdminController.video_get_all)
        .post("/admin/delete-video", logUserActivity("Delete"), AdminController.video_delete)
        .post("/app/get-video", logUserActivity("View"), AdminController.video_get_all_front)
        ///BEst Seller
        .post("/admin/add-to-best-seller", logUserActivity("Create"), authenticateToken, AdminController.add_best_seller_product)


        /////Second Header

        .post("/admin/create-Second-header", logUserActivity("Create"), AdminController.add_second_header)
        .post("/admin/update-second-header", logUserActivity("Update"), AdminController.second_header_update)
        .post("/admin/fetch-second-header", logUserActivity("View"), AdminController.second_header_list)
        .post("/admin/update-second-header-status", logUserActivity("Update"), AdminController.second_heading_update_status)
        .post("/admin/delete-second-header", logUserActivity("Delete"), AdminController.second_header_delete)
        .post("/admin/get-singel-second-header", logUserActivity("View"), AdminController.second_header_get_singel)


        .post("/admin/product-vendor-based", logUserActivity("View"), AdminController.product_list_vendor_based)
        .get("/admin/fetch-daily-activity", logUserActivity("View"), AdminController.fetch_daily_activity)
        .get("/admin/fetch-daily-ip-otp-log", logUserActivity("View"), AdminController.fetch_all_ip_otp)
        .post("/admin/unblock-mobile", logUserActivity("Update"), AdminController.unblock_otp)
        .get("/admin/fetch-daily-activity-logistic", logUserActivity("View"), AdminController.fetch_daily_activity_logistic)
        .get("/admin/product-price", logUserActivity("Update"), AdminController.product_data_price)
        .get("/admin/survey-analytics", AdminController.getSurveyAnalytics)
        .post("/admin/user-survey-analytics",authenticateToken, AdminController.getuserSurveyAnalytics)
        .post("/admin/alloted-surveyors",authenticateToken, AdminController.getSurveyAssignedUsers)
        .post("/admin/survey-analytics-by-id", authenticateToken,AdminController.getSurveyAnalyticsBySurveyId)
        // .get("/admin/download-user-list", AdminController.downloadUserListCSV);

        .post("/admin/maakakhana-add-banner",authenticateToken,AdminController.maakakhana_add_banner)
        .post("/admin/maakakhana-update-banner",authenticateToken, AdminController.maakakhana_update_banner)
        .post("/admin/maakakhana-toggle-image-status",authenticateToken, AdminController.maakakhana_toggle_image_status)
        .post("/admin/maakakhana-delete-banner",authenticateToken,AdminController.maakakhana_delete_banner)
        .post("/admin/maakakhana_delete_image",authenticateToken,AdminController.maakakhana_delete_image)
        .get("/admin/maakakhana-get-banners",authenticateToken,AdminController.maakakhana_get_banners)
        .get("/admin/maakakhana-get-banner-by-id",authenticateToken,AdminController.maakakhana_get_banner_by_id)
        .post("/admin/maakakhana-reorder-images-by-url",authenticateToken,AdminController.maakakhana_reorder_images_by_url)
         .post("/admin/update_bulk_product_price",authenticateToken,AdminController.update_bulk_order_price)



    //get
    // .get("/url_change", AdminController.url_change)

    // .get("/admin/checkout-mobile", AdminController.get_checkout_user_details)

};

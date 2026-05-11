
const path = require("path");
const DailyActivity = require("../models/DailyActivity");
const geoip = require('geoip-lite'); // Optional: to determine the location based on IP address
const url = require('url'); // Built-in Node.js module to parse URLs

module.exports = function (app) {
    const { check } = require("express-validator");
    const WebController = require("../controllers/WebController");


    const logUserActivity = (actionType) => {
        return async (req, res, next) => {
            try {
                // Extract data from req.query


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

    app.get("/web/all-city", logUserActivity("View"), WebController.all_city)
        .get("/web/website-home", logUserActivity("View"), WebController.website_home)
        .get("/web/product-detail", logUserActivity("View"), WebController.product_detail)
        .get("/web/check-zipcode", logUserActivity("View"), WebController.check_zipcode)
        .get("/web/get-master-data", logUserActivity("View"), WebController.get_master_data)
        .get("/web/get-sub-category", logUserActivity("View"), WebController.get_sub_category)
        .get("/web/search-product", logUserActivity("View"), WebController.search_products)
        .post("/web/bulk-order", logUserActivity("View"), [check("name").trim().isLength({ min: 1 }).withMessage("Enter name"), check("city").trim().isLength({ min: 1 }).withMessage("Enter city"), check("address").trim().isLength({ min: 1 }).withMessage("Enter address"), check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile"), check("email").trim().isLength({ min: 1 }).withMessage("Enter email"), check("msg").trim().isLength({ min: 1 }).withMessage("Enter message")], WebController.bulk_order)
        .post("/web/get_map_data", logUserActivity("View"), WebController.get_map_data)
        .get("/web/city-detail", logUserActivity("View"), WebController.city_detail)
        .get("/web/all-brands", logUserActivity("View"), WebController.all_brands)
        .get("/web/all-cuisine", logUserActivity("View"), WebController.all_cuisine)
        .get("/web/city-cuisine", logUserActivity("View"), WebController.city_cuisine)
        .get("/web/single-brand", logUserActivity("View"), WebController.single_brand)
        .get("/web/single-category", logUserActivity("View"), WebController.single_category)
        .post("/web/create-contact", logUserActivity("Create"), [check("name").trim().isLength({ min: 1 }).withMessage("Enter name"), check("email").trim().isLength({ min: 1 }).withMessage("Enter email address"), check("phone").trim().isLength({ min: 1 }).withMessage("Enter mobile number"), check("message").trim().isLength({ min: 1 }).withMessage("Enter message")], WebController.create_contact);
};

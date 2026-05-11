const AdminController = require("../controllers/AdminController");
const { fetchShopBySlider } = require("../controllers/RoleAndPermission");
const rateLimit = require('express-rate-limit');


const DailyActivity = require("../models/DailyActivity");
const Cart = require("../models/CartModel");
const geoip = require('geoip-lite'); // Optional: to determine the location based on IP address
const url = require('url'); // Built-in Node.js module to parse URLs

// Define a rate limiter with options
const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

const cors = require('cors');

const allowedOrigins = ['https://admin.tastes2plate.com','http://localhost:8002'];
const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200, // some legacy browsers require this
};

module.exports = function (app) {
    const { check } = require("express-validator");
    const AppController = require("../controllers/AppController");

    // Apply CORS middleware for all /app routes
    app.use('/app', cors(corsOptions));

    const logUserActivity = (actionType) => {
        return async (req, res, next) => {
            try {
                // Extract data from req.query
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE');
                res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');


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

    app.get("/app/all-parent-categories", logUserActivity("View"), AppController.parent_category_list)
        // .get("/app/all-sub-categories", AppController.sub_category_list)
        .get("/app/all-brands", logUserActivity("View"), AppController.brand_list)
        .get("/app/all-products", logUserActivity("View"), AppController.product_list)
        .get("/app/all-cuisine", logUserActivity("View"), AppController.product_list)
        .get("/app/product-details", logUserActivity("View"), AppController.product_details)
        .post("/app/registration", logUserActivity("Registration"), AppController.registration)
        .post("/app/verify-otp", logUserActivity("Verify OTP"), AppController.verify_otp)
        .post("/app/login", logUserActivity("Login"), AppController.login)
        .post("/app/send-otp", logUserActivity("Send OTP"), apiLimiter, AppController.send_otp)
        .get("/app/get-profile", logUserActivity("View"), AppController.get_profile)
        .post("/app/edit-profile", logUserActivity("Update"), AppController.edit_profile)
        .get("/app/all-cities", logUserActivity("View"), AppController.all_city_list)
        .post("/app/update-profile-image", logUserActivity("Update"), AppController.update_profile_image)
        .get("/app/all-address", logUserActivity("View"), AppController.address_list)
        .post("/app/add-address", logUserActivity("Create"), AppController.add_address)
        .get("/app/get-address", logUserActivity("View"), AppController.get_address)
        .post("/app/edit-address", logUserActivity("Update"), AppController.edit_address)
        .get("/app/delete-address", logUserActivity("Delete"), AppController.delete_address)
        .get("/app/contact-us", logUserActivity("View"), AppController.get_contact_us)
        .post("/app/edit-contact-us", logUserActivity("Update"), AppController.edit_contact_us)
        .get("/app/home", logUserActivity("View"), AppController.home)
        .get("/app/offer-deal", logUserActivity("View"), AppController.offer_deal)
        .post("/app/add-to-cart", logUserActivity("Create"), AppController.add_to_cart)
        .post("/app/add-to-wish", logUserActivity("Create"), AppController.add_to_wish)
        .get("/app/get-cart", logUserActivity("View"), AppController.cart_list)
        .get("/app/get-wish", logUserActivity("View"), AppController.wish_list)
        .get("/app/delete-cart", logUserActivity("Delete"), AppController.delete_cart)
        .get("/app/delete-wish", logUserActivity("Delete"), AppController.delete_wish)
        .post("/app/update-cart", logUserActivity("Update"), AppController.update_cart)
        .get("/app/get-coupon-popup", logUserActivity("View"), AppController.coupon_popup_list)
        .post("/app/apply-coupon", logUserActivity("Update"), AppController.apply_coupon)
        .post("/app/checkout", logUserActivity("Create"), AppController.checkout)
        .post("/app/checkout-confirm", logUserActivity("Update"), AppController.checkout_confirm)
        .post("/app/logistic-login", logUserActivity("Login"), AppController.logistic_login)
        .post("/app/verify-logistic", logUserActivity("View"), apiLimiter, [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile"), check("otp").trim().isLength({ min: 1 }).withMessage("Enter otp")], AppController.verify_logistic_otp)
        .post("/app/add-logistics-boy", logUserActivity("Create"), [check("full_name").trim().isLength({ min: 1 }).withMessage("Enter full name"), check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile number"), check("master").trim().isLength({ min: 1 }).withMessage("Enter master"), check("user_type").trim().isLength({ min: 1 }).withMessage("Enter account type")], AppController.add_logistics_boy)
        .post(
            "/app/list-logistic-boy",
            [
                check("user_type").trim().isLength({ min: 1 }).withMessage("Enter user type"),
                //check("master").trim().isLength({ min: 1 }).withMessage("Enter user master account ID"),
            ],
            logUserActivity("View"),
            AppController.list_logistics_boy
        )
        .post("/app/delete-logistic-boy", logUserActivity("Delete"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter user id")], AppController.delete_logistic_boy)
        .post("/app/settings", logUserActivity("View"), AppController.settings)
        .get("/app/vendor-pending-order", logUserActivity("View"), AppController.vendor_pending_order)
        .post("/app/approve-order", logUserActivity("Update"), AppController.approve_order)
        .post("/app/ready-pickup-order", logUserActivity("Update"), AppController.ready_pickup_order)
        .get("/app/vendor-active-order", logUserActivity("Update"), AppController.vendor_active_order)

        .post("/app/pickup-partner-order", logUserActivity("View"), AppController.pickup_order)

        .post("/app/pickup-past-order", logUserActivity("View"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery/pickup partner id")], AppController.pickup_past_order)

        .post("/app/cargo-partner-order", logUserActivity("View"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery/pickup partner id")], AppController.cargo_order)

        .post("/app/cargo-past-order", logUserActivity("View"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery/pickup partner id")], AppController.cargo_past_order)

        .post(
            "/app/delivery-partner-order",
            logUserActivity("View"),
            //[check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery/pickup partner id")],
            AppController.delivery_order
        )

        .post("/app/delivery-past-order", logUserActivity("View"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery/pickup partner id")], AppController.delivery_past_order)

        .post("/app/pickup-partner-order-assign-pickup-boy", logUserActivity("Update"), AppController.pickup_partner_order_assign_pickup_boy)

        .post("/app/pickup-boy-order-start", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.pickup_boy_order_start)

        .post("/app/send-otp-to-cargo", logUserActivity("OTP SEND"), apiLimiter, [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.send_otp_to_cargo)

        .post("/app/delivered-to-cargo", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.delivered_to_cargo)

        .post("/app/pickup-boy-order-list", logUserActivity("View"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.pickup_boy_order_list)

        .post("/app/pickup-boy-past-order-list", logUserActivity("View"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.pickup_boy_past_order_list)

        .post("/app/cargo-start-order", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.cargo_start_order)

        .post("/app/send-otp-to-delivery-partner", logUserActivity("OTP SEND"), apiLimiter, [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.send_otp_to_delivery_partner)

        .post("/app/delivered-to-delivery-partner", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.delivered_to_delivery_partner)

        .post("/app/delivery-partner-order-assign-delivery-boy", logUserActivity("Update"), AppController.delivery_partner_order_assign_delivery_boy)

        .post("/app/delivery-partner-order-assign-delivery-boy-notification", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id"), check("delivery_boy").trim().isLength({ min: 1 }).withMessage("Enter delivery boy id")], AppController.delivery_partner_order_assign_delivery_boy_notification)

        .post("/app/delivery-boy-order-start", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.delivery_boy_order_start)

        .post("/app/send-otp-to-customer", logUserActivity("OTP SEND"), apiLimiter, [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.send_otp_to_customer)

        .post("/app/delivered-to-customer", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id"), check("otp").trim().isLength({ min: 1 }).withMessage("Enter OTP")], AppController.delivered_to_customer)

        .post("/app/delivery-boy-order-list", logUserActivity("View"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.delivery_boy_order_list)

        .post("/app/delivery-boy-past-order-list", logUserActivity("View"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.delivery_boy_past_order_list)

        .post("/app/update-profile", logUserActivity("Update"), AppController.update_profile)
        .post("/app/update-order-position", logUserActivity("Update"), AppController.update_order_position)
        .post("/app/add-review", logUserActivity("Create"), AppController.add_review)
        .get("/app/my-orders", logUserActivity("View"), AppController.my_orders)
        .post("/app/cancel-order", logUserActivity("Update"), AppController.cancel_order)
        .get("/app/get-city-zip", logUserActivity("View"), AppController.get_city_zip)
        .get("/app/cutofftime-check", logUserActivity("View"), AppController.cutofftime_check)
        .get("/app/check-zipcode", logUserActivity("View"), AppController.check_zipcode)
        .post("/app/clear-cart", logUserActivity("Delete"), AppController.clear_cart)
        .post("/app/employee-status-chnage", logUserActivity("Update"), AppController.employee_status_chnage)
        .get("/app/website-home", logUserActivity("View"), AppController.website_home)
        .post("/app/update-vendor-position", logUserActivity("Update"), AppController.update_vendor_position)
        .post("/app/update-cargo-position", logUserActivity("Update"), AppController.update_cargo_position)
        .post("/app/update-delivery-partner-position", logUserActivity("Update"), AppController.update_delivery_parner_position)
        .post("/app/update-token", logUserActivity("Update"), AppController.update_token)

        .get("/app/state-list", logUserActivity("View"), AppController.state_list)
        .get("/app/city-list-by-state", logUserActivity("View"), AppController.city_list)
        .get("/app/zipcode-by-city", logUserActivity("View"), AppController.zipcode_list)
        .post("/app/payment-update-delivery", logUserActivity("Update"), AppController.payment_update_delivery)
        .post("/app/razorpay-create-order", logUserActivity("Create"), AppController.razorpay_create_order)

        .get("/app/get_order_invoice", [], logUserActivity("View"), AppController.get_order_invoice)

        .get("/app/pickup-earnings", logUserActivity("View"), AppController.pickup_earnings)
        .get("/app/cargo-earnings", logUserActivity("View"), AppController.cargo_earnings)
        .get("/app/delivery-earnings", logUserActivity("View"), AppController.delivery_earnings)

        .get("/app/delivery-boy-earning", logUserActivity("View"), AppController.delivery_boy_earning)

        .get("/app/order-updates", logUserActivity("Update"), AppController.order_updates)
        .post("/app/bulk-order", logUserActivity("Create"), [check("name").trim().isLength({ min: 1 }).withMessage("Enter name"), check("city").trim().isLength({ min: 1 }).withMessage("Enter city"), check("address").trim().isLength({ min: 1 }).withMessage("Enter address"), check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile"), check("email").trim().isLength({ min: 1 }).withMessage("Enter email"), check("msg").trim().isLength({ min: 1 }).withMessage("Enter message")], AppController.bulk_order)

        .post("/app/upload_doc1", logUserActivity("Update"), AppController.upload_doc1)
        .post("/app/upload_doc2", logUserActivity("Update"), AppController.upload_doc2)
        .post("/app/upload_doc3", logUserActivity("Update"), AppController.upload_doc3)
        .post("/app/update-profile-image-2", logUserActivity("Update"), AppController.update_profile_image2)
        .get("/app/lp-manager-list", logUserActivity("View"), AppController.lp_manager_list)
        .get("/app/lp-manager-delivery-partner", logUserActivity("View"), AppController.lp_manager_delivery_partner)
        // .get("/app/lp-manager-delivery-partner", AppController.lp_manager_delivery_boy)
        .get("/app/lp-head-order-list", logUserActivity("View"), AppController.lp_head_order_list)
        .get("/app/lp-manager-order-list", logUserActivity("View"), AppController.lp_manager_order_list)
        .get("/app/lp-manager-delivery-partner-order-list", logUserActivity("View"), AppController.lp_manager_delivery_partner_order_list)
        .get("/app/lp-manager-pickup-partner-order-list", logUserActivity("View"), AppController.lp_manager_pickup_partner_order_list)
        .get("/app/lp-head-delivery-partner-order-list", logUserActivity("View"), AppController.lp_head_delivery_partner_order_list)
        .get("/app/lp-head-pickup-partner-order-list", logUserActivity("View"), AppController.lp_head_pickup_partner_order_list)
        .get("/app/ghar-ka-khana-lp-manager-delivery-partner-order-list", logUserActivity("View"), AppController.ghar_ka_khana_lp_manager_delivery_partner_order_list)
        .get("/app/ghar-ka-khana-lp-manager-pickup-partner-order-list", logUserActivity("View"), AppController.ghar_ka_khana_lp_manager_pickup_partner_order_list)
        .get("/app/ghar-ka-khana-lp-head-delivery-partner-order-list", logUserActivity("View"), AppController.ghar_ka_khana_lp_head_delivery_partner_order_list)
        .get("/app/ghar-ka-khana-lp-head-pickup-partner-order-list", logUserActivity("View"), AppController.ghar_ka_khana_lp_head_pickup_partner_order_list)
        .get("/app/ghar-ka-khana-lp-manager-order-list", logUserActivity("View"), AppController.ghar_ka_khana_lp_manager_order_list)
        .get("/app/ghar-ka-khana-lp-head-order-list", logUserActivity("View"), AppController.ghar_ka_khana_lp_head_order_list)

        .post("/app/update-logistic", logUserActivity("Update"), AppController.update_logistic)

        .post("/app/update-qr-select", logUserActivity("Update"), AppController.update_qr_select)

        .get("/app/financial-log", logUserActivity("View"), AppController.financial_log)

        .get("/app/send-payment-link", logUserActivity("View"), AppController.send_payment_link)

        .get("/app/send-map-link", logUserActivity("View"), AppController.send_map_link)

        .get("/app/vendor-order-list", logUserActivity("View"), AppController.vendor_order_list)

        .post("/app/vendor-login", logUserActivity("Login"), AppController.vendor_login)

        .post("/app/verify-vendor", logUserActivity("View"), [check("mobile").trim().isLength({ min: 1 }).withMessage("Enter mobile"), check("otp").trim().isLength({ min: 1 }).withMessage("Enter otp")], AppController.verify_vendor_otp)

        .get("/app/partner_today_order_by_product_invoice", logUserActivity("View"), logUserActivity("View"), [], AppController.partner_today_order_by_product_invoice)

        .get("/app/partner_tomorrow_order_by_product_invoice", logUserActivity("View"), [], AppController.partner_tomorrow_order_by_product_invoice)

        .get("/app/all-plan-list", logUserActivity("View"), [], AppController.all_plan_list)

        .post("/app/assign-plan", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter user id"), check("plan").trim().isLength({ min: 1 }).withMessage("Enter plan")], AppController.assign_plan)

        .get("/app/get-wallet-data", logUserActivity("View"), AppController.get_wallet_data)

        .post("/app/razorpay-create-order2", logUserActivity("Create"), AppController.razorpay_create_order2)

        .post("/app/wallet-transactions", [], logUserActivity("View"), AppController.wallet_list)

        .post("/app/my-wallet-transactions", logUserActivity("View"), [], AppController.my_wallet_transaction)

        .post("/app/update-pickup-order-weight", logUserActivity("Update"), [], AppController.update_pickup_order_weight)

        .post("/app/update-delivery-order-weight", logUserActivity("Update"), [], AppController.update_delivery_order_weight)

        .post("/app/create-bundle", logUserActivity("Create"), AppController.create_bundle)

        .post(
            "/app/pickup-partner-bundle-order",
            //[check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery/pickup partner id")],
            logUserActivity("View"),
            AppController.pickup_bundle_order
        )

        .post(
            "/app/delivery-partner-bundle-order",
            logUserActivity("View"),
            //[check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery/pickup partner id")],
            AppController.delivery_bundle_order
        )

        .post("/app/get-office-box", logUserActivity("View"), AppController.get_office_box)

        .post("/app/create-box", logUserActivity("Create"), AppController.create_box)

        .post(
            "/app/pickup-partner-box-order",
            logUserActivity("View"),
            //[check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery/pickup partner id")],
            AppController.pickup_box_order
        )

        .post(
            "/app/delivery-partner-box-order",
            logUserActivity("View"),
            //[check("id").trim().isLength({ min: 1 }).withMessage("Enter delivery/pickup partner id")],
            AppController.delivery_box_order
        )

        .post("/app/delete-bundle", logUserActivity("Delete"), AppController.delete_bundle)
        .get("/app/suggestion", logUserActivity("View"), AppController.suggestion)
        .post("/app/delete-box", logUserActivity("Delete"), AppController.delete_box)

        .get("/app/all-sub-categories", logUserActivity("View"), AppController.sub_category_list)
        .get("/app/all-delivery-status", logUserActivity("View"), AppController.all_delivery_status)

        .post("/app/update-pickup-distance", logUserActivity("Update"), AppController.update_pickup_distance)
        .post("/app/update-delivery-distance", logUserActivity("Update"), AppController.update_delivery_distance)
        .post("/app/all-financial-log", logUserActivity("View"), AppController.all_financial_log)

        .post("/app/add-travel-log", logUserActivity("Create"), AppController.add_tarvel_log)
        .post("/app/end-travel-log", logUserActivity("Update"), AppController.end_tarvel_log)

        .get("/app/open-order", logUserActivity("View"), AppController.customer_open_order)
        .post("/app/partner-status-change", logUserActivity("Update"), AppController.partner_status_change)
        .post("/app/account-delete-request", logUserActivity("Delete"), AppController.account_delete_request)
        .post("/app/change-order-status", logUserActivity("Update"), AppController.change_order_status_new)

        .post("/app/fetch-shop-by-slider", logUserActivity("View"), fetchShopBySlider)
        .post("/app/new-login", logUserActivity("Login"), AppController.new_login)
        .post("/app/my-app-login", logUserActivity("Login"), AppController.new_login)
        .post("/app/calculate-checkout-distance", logUserActivity("View"), AppController.calculate_checkout_distance)
        .post("/app/fetch-city-using-zip", logUserActivity("View"), AppController.fetch_city_using_zip)
        .post("/app/calculate-checkout-distance-desktop", logUserActivity("View"), AppController.fetchCheckoutDistanceForDesktop)

        .post("/app/delete-user", logUserActivity("Delete"), AppController.delete_user_data)

        ///////GHAR KA KHANA
        .post("/app/gharkakhana-add-to-cart", logUserActivity("Create"), AppController.GharKakhanaCartCreate)
        .post("/app/gharkakhana-fetch-cart", logUserActivity("View"), AppController.gharKakhanaFetchCart)
        .post("/app/gharkakhana-delete-cart", logUserActivity("Delete"), AppController.gharKakhanaDeleteCart)
        .post("/app/fetch-ghar-ka-khana-slider", logUserActivity("View"), AppController.ghar_ka_kahana_slider_list)
        .post("/app/gharkakhana-checkout", logUserActivity("Create"), AppController.gharKaKhanaOrdersCreate)
        .post("/app/gharkakhana-preview-checkout", logUserActivity("Update"), AppController.gharKakhanaPreviewCheckout)
        // .post("/app/gharkakhana-confirm-checkout", AppController.ghar_ka_khana_confirm_checkout)

        .post("/app/gharkakhana-category", logUserActivity("View"), AdminController.ghar_ka_khana_parent_category_list)
        .post("/app/gharkakhana-subcategory", logUserActivity("View"), AppController.ghar_ka_khana_category_list)

        .post("/app/gharkakhana-pickup-patner-list", logUserActivity("View"), AppController.ghar_ka_khana_fetch_orders_pickup_partner)
        .post("/app/gharkakhana-delivery-partner-list", logUserActivity("View"), AppController.ghar_ka_khana_fetch_orders_delivery_partner)
        .post("/app/gharkakhana-pickup-partner-update", logUserActivity("Update"), AppController.ghar_ka_khana_update_pickup_partner)
        .post("/app/gharkakhana-delivery-partner-update", logUserActivity("Update"), AppController.ghar_ka_khana_update_delivery_partner)

        .post("/app/gharkakhana-pickup-boy-list", logUserActivity("View"), AppController.ghar_ka_khana_fetch_orders_pickup_boy)
        .post("/app/gharkakhana-delivery-boy-list", logUserActivity("View"), AppController.ghar_ka_khana_fetch_orders_delivery_boy)
        .post("/app/gharkakhana-check-express-delivery", logUserActivity("View"), AppController.ghar_ka_khana_checking_express_delivery)

        .post("/app/gharkakhana-user-order-list", logUserActivity("Update"), AppController.ghar_ka_khana_customer_order_list)
        .post("/app/gharkakhana-pickup-order", logUserActivity("Update"), AppController.ghar_ka_khana_order_updated_by_weight)
        .post("/app/gharkakhana-delivered-order", logUserActivity("Update"), AppController.ghar_ka_khana_order_delivered)
        .post("/app/gharkakhana-pickup-boy-picked-order", logUserActivity("Update"), AppController.ghar_ka_khana_pickup_boy_picked_order)
        .post("/app/gharkakhana-pickup-boy-order-start", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.ghar_ka_khana_pickup_boy_order_start)
        .post("/app/gharkakhana-delivery-boy-order-start", logUserActivity("Update"), [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.ghar_ka_khana_delivery_boy_order_start)
        .post("/app/gharkakhana-send-otp-to-customer", logUserActivity("OTP SEND"), apiLimiter, [check("id").trim().isLength({ min: 1 }).withMessage("Enter order id")], AppController.ghar_ka_khana_send_otp_to_customer)
        .post("/app/gharkakhana-final_payment_confirm", logUserActivity("Update"), AppController.ghar_ka_khana_final_payment_confirm)




        // google-map-suggestion
        .get("/app/google-map-auto-suggestion", logUserActivity("View"), AppController.google_map_auto_suggestion)
        .get("/app/google-map-place-deatials", logUserActivity("View"), AppController.google_map_place_deatials)

        // lp head
        .post("/app/lp-head-order-assign-delivery-partner", logUserActivity("Update"), AppController.lp_head_order_assign_delivery_partner)
        .post("/app/lp-head-order-assign-delivery-boy", logUserActivity("Update"), AppController.lp_head_order_assign_delivery_boy)
        .get("/app/lp-head-inside-delivery-agent-list", logUserActivity("Update"), AppController.lp_head_inside_delivery_agent_list)
        .get("/app/lp-head-inside-delivery-boy-list", logUserActivity("Update"), AppController.lp_head_inside_delivery_boy_list)
        .post("/app/lp-head-add-lp-manager", logUserActivity("Update"), AppController.lp_head_add_lp_manager)
        // .post("/app/lp-head-update-lp-manager", AppController.lp_head_update_lp_manager)
        // .post("/app/lp-head-delete-lp-manager", AppController.lp-head-delete-lp-manager)

        // lp manager
        .post("/app/lp-manager-order-assign-delivery-partner", logUserActivity("Update"), AppController.lp_manager_order_assign_delivery_partner)
        .post("/app/lp-manager-order-assign-delivery-boy", logUserActivity("Update"), AppController.lp_manager_order_assign_delivery_boy)

        // RE ORDER
        .post("/app/re-order", logUserActivity("Create"), AppController.reorder_product_from_checkout)

        .get("/app/new_get_order_invoice", logUserActivity("View"), [], AppController.new_get_order_invoice)
        .post("/app//razorpay-create-order", logUserActivity("View"), [], AppController.razorpay_middleware)

        /////Testing
        // .post("/app/test", AppController.testing_api)\

        .post("/app/is-deactive-user", logUserActivity("View"), AppController.is_deactive_user)
        .get("/app/get-top-header", logUserActivity("View"), AdminController.top_header_get_all)


        .post("/app/second-header", logUserActivity("View"), AppController.second_header_list)
        .get("/app/filter-product", logUserActivity("View"), AppController.filter_product_header)

        .post("/app/all-vendor-list", logUserActivity("View"), [], AdminController.all_vendor_list2)

         .get("/app/maakakhana-get-banners",AppController.maakakhana_get_banners)

        .get('/health-check', (req, res) => {
            res.status(200).send('Health is good');
        })
        
        .get("/app/debug-cart", (req, res) => {
            Cart.find({ user: req.query.id }).then((carts) => {
                res.status(200).send({
                    status: "success",
                    result: carts
                });
            }).catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error.message
                });
            });
        });


};

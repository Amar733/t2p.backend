const { viewActivityLogs, AnalyticLogsCreate, ViewAnalyticData, AnalyticLogsCreateUser, AnalyticLogsCreateProduct, AnalyticNewUserCount } = require("../controllers/Logs");

const path = require("path");
const DailyActivity = require("../models/DailyActivity");
const geoip = require('geoip-lite'); // Optional: to determine the location based on IP address
const url = require('url'); // Built-in Node.js module to parse URLs


module.exports = function (app) {
    const { check } = require("express-validator");
    const jwt = require("jsonwebtoken");
    const JWT_SECRET = "krishna";

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

    function generateAccessToken(key) {
        // expires after half and hour (1800 seconds = 30 minutes)
        const accessToken = jwt.sign({ mobile: key }, JWT_SECRET, { expiresIn: "180000s" });
        return accessToken;
    }

    function authenticateToken(req, res, next) {
        //const JWT_SECRET = process.env.JWT_SECRET;
        // Gather the jwt access token from the request header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[0];
        //console.log(authHeader.split(' '));
        if (token == null) return res.sendStatus(200); // if there isn't any token

        jwt.verify(token, JWT_SECRET, (err, mobile) => {
            if (err) return res.sendStatus(200);
            req.token = generateAccessToken(mobile);
            next(); // pass the execution off to whatever request the client intended
        });
    }

    app.post("/admin/order-activity-log", logUserActivity("View"), [], viewActivityLogs)
    app.post("/admin/analytics-log-user",logUserActivity("Create"),  [], AnalyticLogsCreateUser)
    app.post("/admin/analytics-log-product",logUserActivity("Create"),  [], AnalyticLogsCreateProduct)
    
    app.post("/admin/view-analytics-log",logUserActivity("View"),  [], ViewAnalyticData)

    app.post("/admin/view-new-user-count", logUserActivity("View"), [], AnalyticNewUserCount)

};


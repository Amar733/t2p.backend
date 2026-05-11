API Documentation by Categories
Base URL Structure
App APIs: /app/*

Web APIs: /web/*

Admin APIs: /admin/*

1. AUTHENTICATION & USER MANAGEMENT
Customer Authentication
POST /app/registration - User registration

POST /app/verify-otp - Verify OTP

POST /app/login - User login

POST /app/send-otp - Send OTP

POST /app/new-login - New login method

POST /app/my-app-login - App login

Profile Management
GET /app/get-profile - Get user profile

POST /app/edit-profile - Edit profile

POST /app/update-profile-image - Update profile image

POST /app/update-profile - Update profile details

POST /app/account-delete-request - Request account deletion

POST /app/delete-user - Delete user account

Vendor/Shop Authentication
POST /app/vendor-login - Vendor login

POST /app/verify-vendor - Verify vendor OTP

POST /app/shop-login - Shop login

POST /app/shop-send-otp - Send OTP to shop

POST /app/shop-verify-otp - Verify shop OTP

GET /app/shop-get-profile - Get shop profile

Logistics Authentication
POST /app/logistic-login - Logistics login

POST /app/verify-logistic - Verify logistics OTP

2. PRODUCT & CATALOG
Categories
GET /app/all-parent-categories - Get all parent categories

GET /app/all-sub-categories - Get all sub-categories

GET /app/all-cuisine - Get all cuisines

Brands
GET /app/all-brands - Get all brands

GET /web/all-brands - Get brands (web)

GET /web/single-brand - Get single brand details

Products
GET /app/all-products - Get all products

GET /app/product-details - Get product details

GET /web/product-detail - Get product detail (web)

GET /web/search-product - Search products

GET /app/filter-product - Filter products

GET /app/suggestion - Get product suggestions

Shop Products
POST /app/shop-proudct-list-customer - Get shop products for customers

3. HOME & CONTENT
Home Pages
GET /app/home - App home page

GET /app/website-home - Website home page

GET /web/website-home - Web home page

Sliders & Banners
POST /app/fetch-shop-by-slider - Fetch shop by slider

POST /app/fetch-ghar-ka-khana-slider - Fetch Ghar Ka Khana slider

GET /app/maakakhana-get-banners - Get Maa Ka Khana banners

Headers
GET /app/get-top-header - Get top header

POST /app/second-header - Get second header

Videos
POST /app/get-video - Get videos

4. CART & WISHLIST
Cart Management
POST /app/add-to-cart - Add to cart

GET /app/get-cart - Get cart items

POST /app/update-cart - Update cart

GET /app/delete-cart - Delete cart item

POST /app/clear-cart - Clear entire cart

Wishlist
POST /app/add-to-wish - Add to wishlist

GET /app/get-wish - Get wishlist

GET /app/delete-wish - Delete wishlist item

Ghar Ka Khana Cart
POST /app/gharkakhana-add-to-cart - Add to Ghar Ka Khana cart

POST /app/gharkakhana-fetch-cart - Fetch Ghar Ka Khana cart

POST /app/gharkakhana-delete-cart - Delete Ghar Ka Khana cart item

5. CHECKOUT & ORDERS
Checkout
POST /app/checkout - Checkout

POST /app/checkout-confirm - Confirm checkout

POST /app/calculate-checkout-distance - Calculate checkout distance

POST /app/calculate-checkout-distance-desktop - Calculate distance (desktop)

POST /admin/verify-checkout - Verify checkout

Ghar Ka Khana Checkout
POST /app/gharkakhana-checkout - Ghar Ka Khana checkout

POST /app/gharkakhana-preview-checkout - Preview checkout

POST /app/gharkakhana-final_payment_confirm - Final payment confirmation

Orders
GET /app/my-orders - Get my orders

POST /app/cancel-order - Cancel order

GET /app/order-updates - Get order updates

GET /app/open-order - Get open orders

POST /app/re-order - Re-order from previous order

Ghar Ka Khana Orders
POST /app/gharkakhana-user-order-list - Get user orders

Invoices
GET /app/get_order_invoice - Get order invoice

GET /app/new_get_order_invoice - Get new order invoice

6. PAYMENT
Payment Processing
POST /app/razorpay-create-order - Create Razorpay order

POST /app/razorpay-create-order2 - Create Razorpay order (wallet)

POST /app/payment-update-delivery - Update payment for delivery

Coupons
GET /app/get-coupon-popup - Get coupon popup

POST /app/apply-coupon - Apply coupon

7. ADDRESS MANAGEMENT
Addresses
GET /app/all-address - Get all addresses

POST /app/add-address - Add address

GET /app/get-address - Get single address

POST /app/edit-address - Edit address

GET /app/delete-address - Delete address

8. LOCATION & DELIVERY
Cities & Locations
GET /app/all-cities - Get all cities

GET /web/all-city - Get all cities (web)

GET /web/city-detail - Get city details

GET /app/state-list - Get state list

GET /app/city-list-by-state - Get cities by state

GET /app/zipcode-by-city - Get zipcodes by city

Zipcode & Delivery Check
GET /app/check-zipcode - Check zipcode availability

GET /web/check-zipcode - Check zipcode (web)

GET /app/cutofftime-check - Check cutoff time

POST /app/fetch-city-using-zip - Fetch city using zipcode

Google Maps
GET /app/google-map-auto-suggestion - Google map autocomplete

GET /app/google-map-place-deatials - Google map place details

9. VENDOR MANAGEMENT
Vendor Orders
GET /app/vendor-pending-order - Get pending orders

POST /app/approve-order - Approve order

POST /app/ready-pickup-order - Mark ready for pickup

GET /app/vendor-active-order - Get active orders

GET /app/vendor-order-list - Get vendor order list

Vendor Reports
GET /app/partner_today_order_by_product_invoice - Today's order by product

GET /app/partner_tomorrow_order_by_product_invoice - Tomorrow's order by product

10. LOGISTICS & DELIVERY
Pickup Partner
POST /app/pickup-partner-order - Get pickup partner orders

POST /app/pickup-past-order - Get past pickup orders

POST /app/pickup-partner-order-assign-pickup-boy - Assign pickup boy

POST /app/pickup-boy-order-start - Start pickup

POST /app/send-otp-to-cargo - Send OTP to cargo

POST /app/delivered-to-cargo - Mark delivered to cargo

POST /app/pickup-boy-order-list - Get pickup boy orders

POST /app/pickup-boy-past-order-list - Get past orders

GET /app/pickup-earnings - Get pickup earnings

Cargo Partner
POST /app/cargo-partner-order - Get cargo orders

POST /app/cargo-past-order - Get past cargo orders

POST /app/cargo-start-order - Start cargo order

POST /app/send-otp-to-delivery-partner - Send OTP to delivery partner

POST /app/delivered-to-delivery-partner - Mark delivered to delivery partner

GET /app/cargo-earnings - Get cargo earnings

Delivery Partner
POST /app/delivery-partner-order - Get delivery orders

POST /app/delivery-past-order - Get past delivery orders

POST /app/delivery-partner-order-assign-delivery-boy - Assign delivery boy

POST /app/delivery-boy-order-start - Start delivery

POST /app/send-otp-to-customer - Send OTP to customer

POST /app/delivered-to-customer - Mark delivered to customer

POST /app/delivery-boy-order-list - Get delivery boy orders

POST /app/delivery-boy-past-order-list - Get past orders

GET /app/delivery-earnings - Get delivery earnings

GET /app/delivery-boy-earning - Get delivery boy earnings

Logistics Management
POST /app/add-logistics-boy - Add logistics boy

POST /app/list-logistic-boy - List logistics boys

POST /app/delete-logistic-boy - Delete logistics boy

POST /app/update-logistic - Update logistics info

POST /app/update-order-position - Update order position

POST /app/update-vendor-position - Update vendor position

POST /app/update-cargo-position - Update cargo position

POST /app/update-delivery-partner-position - Update delivery partner position

Bundles & Boxes
POST /app/create-bundle - Create bundle

POST /app/pickup-partner-bundle-order - Get pickup bundle orders

POST /app/delivery-partner-bundle-order - Get delivery bundle orders

POST /app/delete-bundle - Delete bundle

POST /app/create-box - Create box

POST /app/get-office-box - Get office boxes

POST /app/pickup-partner-box-order - Get pickup box orders

POST /app/delivery-partner-box-order - Get delivery box orders

POST /app/delete-box - Delete box

Distance & Weight
POST /app/update-pickup-distance - Update pickup distance

POST /app/update-delivery-distance - Update delivery distance

POST /app/update-pickup-order-weight - Update pickup order weight

POST /app/update-delivery-order-weight - Update delivery order weight

11. LP (LOGISTICS PARTNER) HEAD & MANAGER
LP Head
GET /app/lp-head-order-list - Get LP head orders

GET /app/lp-head-delivery-partner-order-list - Get delivery partner orders

GET /app/lp-head-pickup-partner-order-list - Get pickup partner orders

POST /app/lp-head-order-assign-delivery-partner - Assign delivery partner

POST /app/lp-head-order-assign-delivery-boy - Assign delivery boy

GET /app/lp-head-inside-delivery-agent-list - Get delivery agents

GET /app/lp-head-inside-delivery-boy-list - Get delivery boys

POST /app/lp-head-add-lp-manager - Add LP manager

LP Manager
GET /app/lp-manager-list - Get LP managers

GET /app/lp-manager-delivery-partner - Get delivery partners

GET /app/lp-manager-order-list - Get manager orders

GET /app/lp-manager-delivery-partner-order-list - Get delivery partner orders

GET /app/lp-manager-pickup-partner-order-list - Get pickup partner orders

POST /app/lp-manager-order-assign-delivery-partner - Assign delivery partner

POST /app/lp-manager-order-assign-delivery-boy - Assign delivery boy

Ghar Ka Khana LP
GET /app/ghar-ka-khana-lp-manager-delivery-partner-order-list - Manager delivery orders

GET /app/ghar-ka-khana-lp-manager-pickup-partner-order-list - Manager pickup orders

GET /app/ghar-ka-khana-lp-head-delivery-partner-order-list - Head delivery orders

GET /app/ghar-ka-khana-lp-head-pickup-partner-order-list - Head pickup orders

GET /app/ghar-ka-khana-lp-manager-order-list - Manager orders

GET /app/ghar-ka-khana-lp-head-order-list - Head orders

12. GHAR KA KHANA (HOME FOOD)
Categories
POST /app/gharkakhana-category - Get categories

POST /app/gharkakhana-subcategory - Get subcategories

Orders & Delivery
POST /app/gharkakhana-pickup-patner-list - Get pickup partner list

POST /app/gharkakhana-delivery-partner-list - Get delivery partner list

POST /app/gharkakhana-pickup-partner-update - Update pickup partner

POST /app/gharkakhana-delivery-partner-update - Update delivery partner

POST /app/gharkakhana-pickup-boy-list - Get pickup boy list

POST /app/gharkakhana-delivery-boy-list - Get delivery boy list

POST /app/gharkakhana-check-express-delivery - Check express delivery

POST /app/gharkakhana-pickup-order - Pickup order

POST /app/gharkakhana-delivered-order - Delivered order

POST /app/gharkakhana-pickup-boy-picked-order - Pickup boy picked order

POST /app/gharkakhana-pickup-boy-order-start - Start pickup

POST /app/gharkakhana-delivery-boy-order-start - Start delivery

POST /app/gharkakhana-send-otp-to-customer - Send OTP to customer

13. REVIEWS & RATINGS
POST /app/add-review - Add product review

14. WALLET & PLANS
Wallet
GET /app/get-wallet-data - Get wallet data

POST /app/wallet-transactions - Get wallet transactions

POST /app/my-wallet-transactions - Get my wallet transactions

Plans
GET /app/all-plan-list - Get all plans

POST /app/assign-plan - Assign plan to user

15. SETTINGS & CONFIGURATION
POST /app/settings - Get app settings

GET /app/contact-us - Get contact us info

POST /app/edit-contact-us - Edit contact us

POST /app/update-token - Update FCM token

POST /app/partner-status-change - Change partner status

POST /app/employee-status-chnage - Change employee status

POST /app/update-qr-select - Update QR selection

16. BULK ORDERS & INQUIRIES
POST /app/bulk-order - Submit bulk order inquiry

POST /web/bulk-order - Submit bulk order (web)

POST /web/create-contact - Create contact inquiry

17. FINANCIAL & LOGS
GET /app/financial-log - Get financial logs

POST /app/all-financial-log - Get all financial logs

GET /app/send-payment-link - Send payment link

POST /app/add-travel-log - Add travel log

POST /app/end-travel-log - End travel log

18. DOCUMENTS & UPLOADS
POST /app/upload_doc1 - Upload document 1

POST /app/upload_doc2 - Upload document 2

POST /app/upload_doc3 - Upload document 3

POST /app/update-profile-image-2 - Update profile image 2

19. SHOP MANAGEMENT
GET /app/shop-get-list - Get shop list

POST /app/shop-get-orders - Get shop orders

GET /app/all-delivery-status - Get all delivery statuses

20. MISCELLANEOUS
Offers & Deals
GET /app/offer-deal - Get offers and deals

Map & Location
POST /web/get_map_data - Get map data

GET /app/send-map-link - Send map link

User Status
POST /app/is-deactive-user - Check if user is deactivated

Vendor List
POST /app/all-vendor-list - Get all vendors

Health Check
GET /app/health-check - Health check endpoint

Change Order Status
POST /app/change-order-status - Change order status

21. WEB-SPECIFIC APIS
GET /web/get-master-data - Get master data

GET /web/get-sub-category - Get sub-categories

GET /web/all-cuisine - Get all cuisines

GET /web/city-cuisine - Get city cuisines

GET /web/single-category - Get single category

22. ADMIN APIS (Extensive - Key ones listed)
Authentication
POST /admin/login - Admin login

POST /admin/send-email-otp - Send email OTP

POST /admin/login-with-otp - Login with OTP

POST /admin/reset-password - Reset password

POST /admin/chnage-password - Change password

User Management
POST /admin/create-user - Create user

POST /admin/user-list - Get user list

POST /admin/update-user-status - Update user status

POST /admin/delete-user - Delete user

Product Management
POST /admin/add-product - Add product

POST /admin/product-list - Get product list

POST /admin/update-product - Update product

POST /admin/delete-product - Delete product

Order Management
POST /admin/order-list - Get order list

POST /admin/update-order-status - Update order status

POST /admin/order-delete - Delete order

Reports
POST /orderreport - Order report

POST /ordercount - Order count

POST /maxordervalue - Max order value

POST /minordervalue - Min order value


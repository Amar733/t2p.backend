const mongoose = require("mongoose");

const RoleAndPermissionSchema = new mongoose.Schema(
    {
        rolename: {
            type: String,
            required: true,
        },
        deleted: {
            type: Number,
            default: 0,
        },
        dashboard: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        wallet: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        plans: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        customers: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        orders: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        orders_order_status: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        orders_payment_method: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        orders_partial_refund_transaction: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        orders_complimentary: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        orders_delivery_date: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        orders_time_slot: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        orders_add_delete_product: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        cod_recocilition: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        bulk_orders: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        users: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        locations: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        locations_state: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        locations_city: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        locations_zipcode: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        cut_off_time: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        sliders: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        cuisines: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        brands: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        categories: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        vendors: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        products: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        stocks: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        stocks_office: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        stocks_vendor: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        stocks_category: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        stocks_product: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        stocks_unit: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        stocks_rate: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        stocks_inward: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        stocks_outward: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        stocks_report: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        expense: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        expense_category: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        expense_cargo: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        expense_pickup_delivery_cost: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        expense_other: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        expense_marketing: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        expense_travel: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        expense_requistion: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        expense_cod_payments: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        expense_bank_deposit: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        expense_report: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        partners: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        partners_pickup: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        partners_cargo: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        partners_delivery: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        partners_lp_head: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        partners_lp_manager: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        partners_pickup_boy: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        partners_delivery_boy: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        reviews: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        coupon: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        reports: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },

        pickup: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },

        cargo: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },

        delivery: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },

        bundles: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },

        box: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        notification: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },

        purchase_inward: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        purchase_outward: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        blogs: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        testimonial: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        financial_log: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },

        travel_log: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        faq: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        analytics: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        campaign: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        gift: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },

        aftoap: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        aftoap_category: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        aftoap_slider: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        aftoap_order: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        survey: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        daily_activity: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        otp_mobile_log: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        logistic_app_log: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        product_regular_price: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        product_selling_price: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        product_purchase_price: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        product_is_featured: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        product_in_deal: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        product_weight: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        product_cuisine: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        product_brand: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        product_vendor: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        product_city: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
        product_packaging_charge: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },
order_vendor: {
        view: {
            type: Boolean,
            default: false,
        },
        add_edit: {
            type: Boolean,
            default: false,
        },
        delete: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },
    },
    order_pickup_partner: {
        view: {
            type: Boolean,
            default: false,
        },
        add_edit: {
            type: Boolean,
            default: false,
        },
        delete: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },
    },
    order_pickup_boy: {
        view: {
            type: Boolean,
            default: false,
        },
        add_edit: {
            type: Boolean,
            default: false,
        },
        delete: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },
    },
    order_cargo_partner: {
        view: {
            type: Boolean,
            default: false,
        },
        add_edit: {
            type: Boolean,
            default: false,
        },
        delete: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },
    },
    order_delivery_partner: {
        view: {
            type: Boolean,
            default: false,
        },
        add_edit: {
            type: Boolean,
            default: false,
        },
        delete: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },
    },
    order_delivery_boy: {
        view: {
            type: Boolean,
            default: false,
        },
        add_edit: {
            type: Boolean,
            default: false,
        },
        delete: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },
    },
    activity_log: {
        view: {
            type: Boolean,
            default: false,
        },
        add_edit: {
            type: Boolean,
            default: false,
        },
        delete: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },
    },
     survey_anylatics: {
            view: {
                type: Boolean,
                default: false,
            },
            add_edit: {
                type: Boolean,
                default: false,
            },
            delete: {
                type: Boolean,
                default: false,
            },
            block: {
                type: Boolean,
                default: false,
            },
        },

    },
    { timestamps: true }
);
module.exports = mongoose.model("RoleAndPermission", RoleAndPermissionSchema);

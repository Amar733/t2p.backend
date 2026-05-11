# Cart City/Zipcode Association Fix

## Problem
The backend had a bug where:
- `add-to-cart` accepted city/zipcode parameters but didn't save them
- `get-cart` couldn't filter by city/zipcode, returning all cart items regardless of location
- Cart items weren't associated with the customer's delivery location

## Root Cause
The `CartModel` schema only stored the vendor's city (as ObjectId reference) but didn't store the customer's city/zipcode where they want delivery.

## Solution

### 1. Updated CartModel Schema
**File:** `src/models/CartModel.js`

Added two new fields:
```javascript
customer_city: {
    type: String,
    default: ""
},
customer_zipcode: {
    type: String,
    default: ""
}
```

### 2. Updated add_to_cart Function
**File:** `src/controllers/AppController.js`

Modified to save customer location:
```javascript
let cartData = new Cart({
    // ... existing fields
    customer_city: req.body.customer_city || "",
    customer_zipcode: req.body.customer_zipcode || "",
    // ... rest of fields
});
```

### 3. Updated cart_list Function
**File:** `src/controllers/AppController.js`

Added filtering by customer location:
```javascript
var where = {};
where["user"] = req.query.id;

// Filter by customer_city and customer_zipcode if provided
if (req.query.customer_city) {
    where["customer_city"] = req.query.customer_city;
}
if (req.query.customer_zipcode) {
    where["customer_zipcode"] = req.query.customer_zipcode;
}

Cart.find(where)...
```

## API Usage

### POST /app/add-to-cart
**Request Body:**
```json
{
    "id": "user_id",
    "productid": "product_id",
    "quantity": 1,
    "customer_city": "Mumbai",
    "customer_zipcode": "400001"
}
```

### GET /app/get-cart
**Query Parameters:**
```
?id=user_id&customer_city=Mumbai&customer_zipcode=400001
```

## Testing
1. Clear existing cart items (they don't have customer_city/customer_zipcode)
2. Add items with city/zipcode parameters
3. Retrieve cart with same city/zipcode - should return items
4. Retrieve cart with different city/zipcode - should return empty

## Notes
- Existing cart items in database won't have customer_city/customer_zipcode (will be empty strings)
- Frontend should always send customer_city and customer_zipcode when adding to cart
- Frontend should send same parameters when retrieving cart

# User-Facing API Documentation

Base URL: `/api/v1`

---

## Authentication Routes

### POST /auth/signup
Create a new user account

**Request Body:**
```json
{
  "fullname": "string",
  "email": "string",
  "password": "string",
  "phone": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "number",
    "fullname": "string",
    "email": "string",
    "phone": "string"
  }
}
```

**Cookie Set:** `token` (HTTP-only authentication cookie)

---

### POST /auth/login
Login to user account

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User loggen-in successfully",
  "user": {
    "id": "number",
    "fullname": "string",
    "email": "string",
    "phone": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Cookie Set:** `token` (HTTP-only authentication cookie)

---

### POST /auth/logout
Logout from user account

**Authentication:** Required
**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

**Cookie Cleared:** `token`

---

## User Profile Routes

All profile routes require authentication.

### GET /users/profile
Get current user's profile information

**Authentication:** Required
**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "user": {
    "id": "number",
    "fullname": "string",
    "email": "string",
    "phone": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

---

### PUT /users/profile
Update user profile (fullname and/or phone)

**Authentication:** Required
**Request Body:**
```json
{
  "fullname": "string (optional)",
  "phone": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "number",
    "fullname": "string",
    "email": "string",
    "phone": "string"
  }
}
```

---

### PUT /users/password
Change user password

**Authentication:** Required
**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Address Management Routes

All address routes require authentication.

### GET /users/addresses
Get all addresses for the current user

**Authentication:** Required
**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Addresses fetched successfully",
  "addresses": [
    {
      "id": "number",
      "user_id": "number",
      "address_line1": "string",
      "address_line2": "string (nullable)",
      "city": "string",
      "state": "string",
      "postal_code": "string",
      "country": "string",
      "is_default": "boolean",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

---

### POST /users/addresses
Create a new address

**Authentication:** Required
**Request Body:**
```json
{
  "address_line1": "string",
  "address_line2": "string (optional)",
  "city": "string",
  "state": "string",
  "postal_code": "string",
  "country": "string",
  "is_default": "boolean (optional, default: false)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address created successfully",
  "address": {
    "id": "number",
    "user_id": "number",
    "address_line1": "string",
    "address_line2": "string",
    "city": "string",
    "state": "string",
    "postal_code": "string",
    "country": "string",
    "is_default": "boolean"
  }
}
```

---

### PUT /users/addresses/:id
Update an existing address

**Authentication:** Required
**URL Parameters:**
- `id` (number) - Address ID

**Request Body:**
```json
{
  "address_line1": "string (optional)",
  "address_line2": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)",
  "postal_code": "string (optional)",
  "country": "string (optional)",
  "is_default": "boolean (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "address": { /* updated address object */ }
}
```

---

### DELETE /users/addresses/:id
Delete an address

**Authentication:** Required
**URL Parameters:**
- `id` (number) - Address ID

**Response:**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

### PUT /users/addresses/:id/default
Set an address as default

**Authentication:** Required
**URL Parameters:**
- `id` (number) - Address ID

**Response:**
```json
{
  "success": true,
  "message": "Default address updated successfully",
  "address": { /* address object */ }
}
```

---

## Product Routes

### GET /products
Get all products with optional filters

**Authentication:** Not required
**Query Parameters:**
- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 10) - Items per page
- `sort` (string, optional) - Sort order: "asc" or "desc"
- `category_id` (number, optional) - Filter by category
- `min_price` (number, optional) - Minimum price filter
- `max_price` (number, optional) - Maximum price filter

**Response:**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "products": [
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "slug": "string",
      "category_id": "number",
      "category_name": "string",
      "price": "number",
      "compare_at_price": "number (nullable)",
      "discount": "number (nullable)",
      "status": "string",
      "sku": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

---

### GET /products/search
Search products by name or description

**Authentication:** Not required
**Query Parameters:**
- `q` (string, required) - Search query
- `category_id` (number, optional) - Filter by category
- `min_price` (number, optional) - Minimum price filter
- `max_price` (number, optional) - Maximum price filter
- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 10) - Items per page

**Response:**
```json
{
  "success": true,
  "message": "Products search completed successfully",
  "products": [ /* array of product objects */ ],
  "pagination": { /* pagination object */ }
}
```

---

### GET /products/category/:id
Get products by category

**Authentication:** Not required
**URL Parameters:**
- `id` (number) - Category ID

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)
- `sort` (string, optional) - "asc" or "desc"

**Response:**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "products": [ /* array of product objects */ ],
  "pagination": { /* pagination object */ }
}
```

---

### GET /products/one/:id
Get single product details

**Authentication:** Not required
**URL Parameters:**
- `id` (number) - Product ID

**Response:**
```json
{
  "success": true,
  "message": "Product fetched successfully",
  "product": {
    "id": "number",
    "name": "string",
    "description": "string",
    "slug": "string",
    "category_id": "number",
    "category_name": "string",
    "price": "number",
    "compare_at_price": "number",
    "discount": "number",
    "status": "string",
    "sku": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

---

### GET /products/:id/variants
Get all variants for a product

**Authentication:** Not required
**URL Parameters:**
- `id` (number) - Product ID

**Response:**
```json
{
  "success": true,
  "message": "Product variants fetched successfully",
  "variants": [
    {
      "id": "number",
      "product_id": "number",
      "size": "string (nullable)",
      "color": "string (nullable)",
      "stock": "number",
      "additional_price": "number (nullable)"
    }
  ]
}
```

---

## Category Routes

### GET /categories
Get all categories in hierarchical structure

**Authentication:** Not required
**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "categories": [
    {
      "id": "number",
      "name": "string",
      "slug": "string",
      "description": "string (nullable)",
      "parent_id": "number (nullable)",
      "image_url": "string (nullable)",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "subcategories": [ /* array of category objects */ ]
    }
  ]
}
```

---

### GET /categories/:id
Get single category with subcategories

**Authentication:** Not required
**URL Parameters:**
- `id` (number) - Category ID

**Response:**
```json
{
  "success": true,
  "message": "Category fetched successfully",
  "category": {
    "id": "number",
    "name": "string",
    "slug": "string",
    "description": "string",
    "parent_id": "number (nullable)",
    "image_url": "string (nullable)",
    "subcategories": [ /* array of subcategory objects */ ],
    "parent": { /* parent category object if exists */ },
    "product_count": "number"
  }
}
```

---

### GET /categories/:id/products
Get all products in a category (paginated)

**Authentication:** Not required
**URL Parameters:**
- `id` (number) - Category ID

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)
- `sort` (string, optional) - "asc" or "desc"

**Response:**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "category": { /* category object */ },
  "products": [ /* array of product objects */ ],
  "pagination": { /* pagination object */ }
}
```

---

## Wishlist Routes

All wishlist routes require authentication.

### GET /users/wishlist
Get user's wishlist items

**Authentication:** Required
**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Wishlist fetched successfully",
  "wishlist": [
    {
      "id": "number",
      "user_id": "number",
      "product_id": "number",
      "created_at": "timestamp",
      "product": { /* full product object */ }
    }
  ]
}
```

---

### POST /users/wishlist
Add item to wishlist

**Authentication:** Required
**Request Body:**
```json
{
  "product_id": "number"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to wishlist successfully",
  "wishlist_item": {
    "id": "number",
    "user_id": "number",
    "product_id": "number",
    "created_at": "timestamp"
  }
}
```

---

### DELETE /users/wishlist/:id
Remove item from wishlist

**Authentication:** Required
**URL Parameters:**
- `id` (number) - Wishlist item ID

**Response:**
```json
{
  "success": true,
  "message": "Item removed from wishlist successfully"
}
```

---

### DELETE /users/wishlist/clear
Clear entire wishlist

**Authentication:** Required
**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Wishlist cleared successfully"
}
```

---

## Cart Routes

All cart routes require authentication.

### GET /cart
Get user's shopping cart

**Authentication:** Required
**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Cart fetched successfully",
  "cart": [
    {
      "id": "number",
      "user_id": "number",
      "product_id": "number",
      "variant_id": "number (nullable)",
      "quantity": "number",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "product": { /* product object */ },
      "variant": { /* variant object if applicable */ }
    }
  ],
  "total": "number"
}
```

---

### POST /cart
Add item to cart

**Authentication:** Required
**Request Body:**
```json
{
  "product_id": "number",
  "variant_id": "number (optional)",
  "quantity": "number"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart_item": {
    "id": "number",
    "user_id": "number",
    "product_id": "number",
    "variant_id": "number",
    "quantity": "number"
  }
}
```

---

### PUT /cart/:id
Update cart item quantity

**Authentication:** Required
**URL Parameters:**
- `id` (number) - Cart item ID

**Request Body:**
```json
{
  "quantity": "number"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "cart_item": { /* updated cart item */ }
}
```

---

### DELETE /cart/:id
Remove item from cart

**Authentication:** Required
**URL Parameters:**
- `id` (number) - Cart item ID

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

---

### DELETE /cart/clear
Clear entire cart

**Authentication:** Required
**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## Order Routes

All order routes require authentication.

### GET /orders
Get user's order history

**Authentication:** Required
**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "orders": [
    {
      "id": "number",
      "user_id": "number",
      "total_amount": "number",
      "status": "string",
      "payment_status": "string",
      "shipping_address_id": "number",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "items_count": "number"
    }
  ]
}
```

---

### GET /orders/:id
Get specific order details

**Authentication:** Required
**URL Parameters:**
- `id` (number) - Order ID

**Response:**
```json
{
  "success": true,
  "message": "Order details fetched successfully",
  "order": {
    "id": "number",
    "user_id": "number",
    "total_amount": "number",
    "status": "string",
    "payment_status": "string",
    "shipping_address_id": "number",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "items": [ /* array of order items */ ],
    "shipping_address": { /* address object */ }
  }
}
```

---

### POST /orders
Create a new order

**Authentication:** Required
**Request Body:**
```json
{
  "shipping_address_id": "number",
  "coupon_code": "string (optional)",
  "payment_method": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "number",
    "user_id": "number",
    "total_amount": "number",
    "status": "pending",
    "payment_status": "pending",
    "shipping_address_id": "number"
  }
}
```

---

### PUT /orders/:id/cancel
Cancel an order

**Authentication:** Required
**URL Parameters:**
- `id` (number) - Order ID

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": { /* updated order object */ }
}
```

---

## Payment Routes

All payment routes require authentication.

### POST /payments/initiate
Initiate a payment for an order

**Authentication:** Required
**Request Body:**
```json
{
  "order_id": "number",
  "payment_method": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "payment": {
    "id": "number",
    "order_id": "number",
    "amount": "number",
    "payment_method": "string",
    "status": "pending",
    "payment_gateway_response": { /* gateway-specific data */ }
  }
}
```

---

### POST /payments/verify
Verify a payment transaction

**Authentication:** Required
**Request Body:**
```json
{
  "payment_id": "number",
  "transaction_id": "string",
  "payment_gateway_data": { /* gateway-specific verification data */ }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment": {
    "id": "number",
    "order_id": "number",
    "status": "completed",
    "verified_at": "timestamp"
  }
}
```

---

### GET /payments/:order_id
Get payment status for an order

**Authentication:** Required
**URL Parameters:**
- `order_id` (number) - Order ID

**Response:**
```json
{
  "success": true,
  "message": "Payment status fetched successfully",
  "payment": {
    "id": "number",
    "order_id": "number",
    "amount": "number",
    "payment_method": "string",
    "status": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

---

## Coupon Routes

### GET /coupons/active
Get all active coupons (Public route)

**Authentication:** Not required
**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Active coupons fetched successfully",
  "coupons": [
    {
      "id": "number",
      "code": "string",
      "description": "string",
      "discount_type": "string",
      "discount_value": "number",
      "min_purchase_amount": "number (nullable)",
      "max_discount_amount": "number (nullable)",
      "valid_from": "timestamp",
      "valid_until": "timestamp",
      "usage_limit": "number (nullable)",
      "usage_count": "number"
    }
  ]
}
```

---

### POST /coupons/validate
Validate a coupon code

**Authentication:** Required
**Request Body:**
```json
{
  "code": "string",
  "cart_total": "number"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon is valid",
  "coupon": {
    "id": "number",
    "code": "string",
    "discount_type": "string",
    "discount_value": "number",
    "discount_amount": "number",
    "final_amount": "number"
  }
}
```

---

## Error Response Format

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* optional array of validation errors */ ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

Most user routes require authentication via HTTP-only cookies:

1. Login via `/auth/login` or signup via `/auth/signup`
2. Server sets `token` cookie automatically
3. Include cookie in subsequent requests (automatic in browsers)
4. Logout via `/auth/logout` clears the cookie

**Cookie Name:** `token`
**Cookie Type:** HTTP-only (not accessible via JavaScript)
**Cookie Duration:** Set by server configuration

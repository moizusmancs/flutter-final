# Admin API Documentation

Base URL: `http://localhost:4000/api/v1/admin`

All admin routes (except login) require authentication via `admin_token` cookie.

---

## Authentication Routes

### 1. Login
**Endpoint**: `POST /auth/login`

**Description**: Authenticate admin user and receive auth token

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Validation Rules**:
- `email`: Valid email format, required
- `password`: Minimum 6 characters, required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "admin": {
    "id": 1,
    "email": "admin@example.com",
    "fullname": "Admin User"
  }
}
```

**Error Responses**:
- 400: Invalid credentials
- 400: Validation errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Cookies Set**:
- `admin_token`: HTTP-only cookie with JWT token

---

### 2. Logout
**Endpoint**: `POST /auth/logout`

**Description**: Logout admin user and clear auth token

**Authentication**: Required (admin_token cookie)

**Request Body**: None

**Success Response** (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Cookies Cleared**:
- `admin_token`: Removed

---

### 3. Check Authentication
**Endpoint**: `GET /auth/check`

**Description**: Verify if admin is authenticated

**Authentication**: Required (admin_token cookie)

**Request Body**: None

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin is authenticated",
  "admin": {
    "id": 1,
    "email": "admin@example.com",
    "fullname": "Admin User"
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Product Routes

### 4. Get All Products
**Endpoint**: `GET /products`

**Description**: Retrieve paginated list of all products with filters

**Authentication**: Required

**Query Parameters**:
```
page (optional): Page number (default: 1)
limit (optional): Items per page (default: 10)
search (optional): Search in product name
category_id (optional): Filter by category ID
status (optional): Filter by status (active, inactive, out_of_stock)
```

**Example Request**:
```
GET /admin/products?page=1&limit=20&search=shirt&category_id=5&status=active
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "products": [
    {
      "id": 1,
      "name": "Blue Cotton Shirt",
      "description": "Comfortable cotton shirt",
      "slug": "blue-cotton-shirt",
      "category_id": 5,
      "category_name": "Shirts",
      "price": 29.99,
      "compare_at_price": 39.99,
      "status": "active",
      "sku": "SHIRT-001",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 5. Get Single Product
**Endpoint**: `GET /products/:id`

**Description**: Get detailed information about a specific product

**Authentication**: Required

**Path Parameters**:
- `id`: Product ID (number)

**Example Request**:
```
GET /admin/products/1
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Product fetched successfully",
  "product": {
    "id": 1,
    "name": "Blue Cotton Shirt",
    "description": "Comfortable cotton shirt",
    "slug": "blue-cotton-shirt",
    "category_id": 5,
    "category_name": "Shirts",
    "price": 29.99,
    "compare_at_price": 39.99,
    "status": "active",
    "sku": "SHIRT-001",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:20:00Z"
  },
  "variants": [
    {
      "id": 1,
      "product_id": 1,
      "size": "M",
      "color": "Blue",
      "material": "Cotton",
      "stock_quantity": 50
    }
  ],
  "media": [
    {
      "id": 1,
      "product_id": 1,
      "url": "https://s3.amazonaws.com/bucket/image1.jpg",
      "is_primary": true
    }
  ]
}
```

**Error Response** (404):
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

### 6. Create Product
**Endpoint**: `POST /products`

**Description**: Create a new product

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Blue Cotton Shirt",
  "description": "Comfortable cotton shirt for everyday wear",
  "slug": "blue-cotton-shirt",
  "category_id": 5,
  "price": 29.99,
  "compare_at_price": 39.99,
  "status": "active",
  "sku": "SHIRT-001"
}
```

**Validation Rules**:
- `name`: String, min 3 chars, max 255 chars, required
- `description`: String, optional
- `slug`: String, unique, required
- `category_id`: Number, must exist in categories table, required
- `price`: Number, min 0, required
- `compare_at_price`: Number, min 0, optional
- `status`: Enum (active, inactive), required
- `sku`: String, unique, required

**Success Response** (201):
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": 1,
    "name": "Blue Cotton Shirt",
    "description": "Comfortable cotton shirt for everyday wear",
    "slug": "blue-cotton-shirt",
    "category_id": 5,
    "price": 29.99,
    "compare_at_price": 39.99,
    "status": "active",
    "sku": "SHIRT-001",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- 400: Validation errors or duplicate slug/SKU
- 404: Category not found

---

### 7. Update Product
**Endpoint**: `PUT /products/:id`

**Description**: Update an existing product

**Authentication**: Required

**Path Parameters**:
- `id`: Product ID (number)

**Request Body** (all fields optional):
```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "slug": "updated-slug",
  "category_id": 5,
  "price": 34.99,
  "compare_at_price": 44.99,
  "status": "active",
  "sku": "SHIRT-001-NEW"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "id": 1,
    "name": "Updated Product Name",
    "description": "Updated description",
    "slug": "updated-slug",
    "category_id": 5,
    "price": 34.99,
    "compare_at_price": 44.99,
    "status": "active",
    "sku": "SHIRT-001-NEW",
    "updated_at": "2024-01-20T14:20:00Z"
  }
}
```

**Error Responses**:
- 400: Validation errors or duplicate slug/SKU
- 404: Product or category not found

---

### 8. Delete Product
**Endpoint**: `DELETE /products/:id`

**Description**: Delete a product (only if it has no variants)

**Authentication**: Required

**Path Parameters**:
- `id`: Product ID (number)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Error Responses**:
- 400: Product has variants (cannot delete)
- 404: Product not found

---

### 9. Update Product Status
**Endpoint**: `PUT /products/:id/status`

**Description**: Update product status with validation

**Authentication**: Required

**Path Parameters**:
- `id`: Product ID (number)

**Request Body**:
```json
{
  "status": "active"
}
```

**Validation**:
- Cannot set to "active" without category_id
- Status must be: active, inactive, or out_of_stock

**Success Response** (200):
```json
{
  "success": true,
  "message": "Product status updated successfully",
  "product": {
    "id": 1,
    "status": "active"
  }
}
```

---

## Product Variant Routes

### 10. Get Product Variants
**Endpoint**: `GET /products/:id/variants`

**Description**: Get all variants for a specific product

**Authentication**: Required

**Path Parameters**:
- `id`: Product ID (number)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Variants fetched successfully",
  "variants": [
    {
      "id": 1,
      "product_id": 1,
      "size": "M",
      "color": "Blue",
      "material": "Cotton",
      "stock_quantity": 50
    },
    {
      "id": 2,
      "product_id": 1,
      "size": "L",
      "color": "Blue",
      "material": "Cotton",
      "stock_quantity": 30
    }
  ],
  "count": 2
}
```

---

### 11. Add Product Variant
**Endpoint**: `POST /products/:id/variants`

**Description**: Add a new variant to a product

**Authentication**: Required

**Path Parameters**:
- `id`: Product ID (number)

**Request Body**:
```json
{
  "size": "M",
  "color": "Blue",
  "material": "Cotton",
  "stock_quantity": 50
}
```

**Validation Rules**:
- `size`: String, optional
- `color`: String, optional
- `material`: String, optional
- `stock_quantity`: Number, min 0, required

**Success Response** (201):
```json
{
  "success": true,
  "message": "Variant added successfully",
  "variant": {
    "id": 1,
    "product_id": 1,
    "size": "M",
    "color": "Blue",
    "material": "Cotton",
    "stock_quantity": 50
  }
}
```

**Error Response**:
- 404: Product not found

---

### 12. Update Product Variant
**Endpoint**: `PUT /products/variants/:id`

**Description**: Update an existing variant

**Authentication**: Required

**Path Parameters**:
- `id`: Variant ID (number)

**Request Body** (all fields optional):
```json
{
  "size": "L",
  "color": "Red",
  "material": "Polyester",
  "stock_quantity": 75
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Variant updated successfully",
  "variant": {
    "id": 1,
    "size": "L",
    "color": "Red",
    "material": "Polyester",
    "stock_quantity": 75
  }
}
```

**Error Response**:
- 404: Variant not found

---

### 13. Delete Product Variant
**Endpoint**: `DELETE /products/variants/:id`

**Description**: Delete a variant (checks for cart/wishlist dependencies)

**Authentication**: Required

**Path Parameters**:
- `id`: Variant ID (number)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Variant deleted successfully"
}
```

**Error Responses**:
- 400: Variant is in user carts or wishlists
- 404: Variant not found

---

### 14. Update Variant Stock
**Endpoint**: `PUT /products/variants/:id/stock`

**Description**: Update only the stock quantity of a variant

**Authentication**: Required

**Path Parameters**:
- `id`: Variant ID (number)

**Request Body**:
```json
{
  "stock_quantity": 100
}
```

**Validation**:
- `stock_quantity`: Number, min 0, required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "variant": {
    "id": 1,
    "stock_quantity": 100
  }
}
```

---

## Media Routes

### 15. Generate Presigned URL
**Endpoint**: `POST /media/presigned-url`

**Description**: Generate S3 presigned URL for image upload

**Authentication**: Required

**Request Body**:
```json
{
  "fileName": "product-image.jpg",
  "fileType": "image/jpeg"
}
```

**Validation**:
- `fileName`: String, required
- `fileType`: String, must be image MIME type, required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Presigned URL generated",
  "url": "https://bucket.s3.amazonaws.com/uploads/abc123.jpg?AWSAccessKeyId=...",
  "key": "uploads/abc123.jpg"
}
```

**Upload Process**:
1. Get presigned URL from this endpoint
2. Upload file to S3 using PUT request to the presigned URL
3. Use the S3 URL to add media to product

---

### 16. Add Product Media
**Endpoint**: `POST /products/:id/media`

**Description**: Add media (image) to a product

**Authentication**: Required

**Path Parameters**:
- `id`: Product ID (number)

**Request Body**:
```json
{
  "url": "https://bucket.s3.amazonaws.com/uploads/abc123.jpg",
  "is_primary": false
}
```

**Validation**:
- `url`: Valid URL, required
- `is_primary`: Boolean, default false

**Note**: If `is_primary` is true, all other media for this product will be set to non-primary automatically.

**Success Response** (201):
```json
{
  "success": true,
  "message": "Media added successfully",
  "media": {
    "id": 1,
    "product_id": 1,
    "url": "https://bucket.s3.amazonaws.com/uploads/abc123.jpg",
    "is_primary": false
  }
}
```

---

### 17. Delete Product Media
**Endpoint**: `DELETE /media/:id`

**Description**: Delete a media item

**Authentication**: Required

**Path Parameters**:
- `id`: Media ID (number)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Media deleted successfully"
}
```

**Error Response**:
- 404: Media not found

---

### 18. Set Primary Media
**Endpoint**: `PUT /media/:id/primary`

**Description**: Set a media item as primary for a product

**Authentication**: Required

**Path Parameters**:
- `id`: Media ID (number)

**Request Body**:
```json
{
  "product_id": 1
}
```

**Note**: Automatically unsets other primary media for the product.

**Success Response** (200):
```json
{
  "success": true,
  "message": "Primary media updated successfully",
  "media": {
    "id": 1,
    "product_id": 1,
    "is_primary": true
  }
}
```

---

## Category Routes

### 19. Get All Categories
**Endpoint**: `GET /categories`

**Description**: Get all categories with product count

**Authentication**: Required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "categories": [
    {
      "id": 1,
      "name": "Shirts",
      "slug": "shirts",
      "product_count": 25
    },
    {
      "id": 2,
      "name": "Pants",
      "slug": "pants",
      "product_count": 18
    }
  ]
}
```

---

### 20. Create Category
**Endpoint**: `POST /categories`

**Description**: Create a new category

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Shirts",
  "slug": "shirts"
}
```

**Validation**:
- `name`: String, min 2 chars, max 100 chars, required
- `slug`: String, unique, required

**Success Response** (201):
```json
{
  "success": true,
  "message": "Category created successfully",
  "category": {
    "id": 1,
    "name": "Shirts",
    "slug": "shirts"
  }
}
```

**Error Response**:
- 400: Duplicate slug

---

### 21. Update Category
**Endpoint**: `PUT /categories/:id`

**Description**: Update an existing category

**Authentication**: Required

**Path Parameters**:
- `id`: Category ID (number)

**Request Body** (all fields optional):
```json
{
  "name": "Updated Shirts",
  "slug": "updated-shirts"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Category updated successfully",
  "category": {
    "id": 1,
    "name": "Updated Shirts",
    "slug": "updated-shirts"
  }
}
```

**Error Responses**:
- 400: Duplicate slug
- 404: Category not found

---

### 22. Delete Category
**Endpoint**: `DELETE /categories/:id`

**Description**: Delete a category (only if it has no products)

**Authentication**: Required

**Path Parameters**:
- `id`: Category ID (number)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Responses**:
- 400: Category has products (cannot delete)
- 404: Category not found

---

## Order Routes

### 23. Get All Orders
**Endpoint**: `GET /orders`

**Description**: Get paginated list of all orders with filters

**Authentication**: Required

**Query Parameters**:
```
page (optional): Page number (default: 1)
limit (optional): Items per page (default: 10)
status (optional): Filter by status (pending, paid, shipped, delivered, cancelled)
search (optional): Search by order ID or user email
start_date (optional): Filter orders from this date
end_date (optional): Filter orders until this date
```

**Example Request**:
```
GET /admin/orders?page=1&limit=20&status=pending&start_date=2024-01-01
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "orders": [
    {
      "id": 1,
      "user_id": 5,
      "total_amount": 149.99,
      "status": "pending",
      "payment_method": "card",
      "created_at": "2024-01-15T10:30:00Z",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "items_count": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 24. Get Order Details
**Endpoint**: `GET /orders/:id`

**Description**: Get detailed information about a specific order

**Authentication**: Required

**Path Parameters**:
- `id`: Order ID (number)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Order details fetched successfully",
  "order": {
    "id": 1,
    "user_id": 5,
    "total_amount": 149.99,
    "status": "pending",
    "payment_method": "card",
    "created_at": "2024-01-15T10:30:00Z",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "user_phone": "+1234567890"
  },
  "items": [
    {
      "id": 1,
      "order_id": 1,
      "variant_id": 1,
      "quantity": 2,
      "price_at_purchase": 29.99,
      "product_name": "Blue Cotton Shirt",
      "size": "M",
      "color": "Blue",
      "product_image": "https://s3.amazonaws.com/bucket/image1.jpg"
    }
  ],
  "shipping_address": {
    "id": 1,
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "USA"
  },
  "coupon": {
    "code": "SAVE20",
    "discount_applied": 20.00
  }
}
```

**Error Response**:
- 404: Order not found

---

### 25. Update Order Status
**Endpoint**: `PUT /orders/:id/status`

**Description**: Update the status of an order

**Authentication**: Required

**Path Parameters**:
- `id`: Order ID (number)

**Request Body**:
```json
{
  "status": "shipped"
}
```

**Validation**:
- `status`: Enum (pending, paid, shipped, delivered, cancelled), required
- Cannot update cancelled orders
- Cannot change delivered orders (except to cancelled)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "id": 1,
    "status": "shipped"
  }
}
```

**Error Responses**:
- 400: Invalid status transition
- 404: Order not found

---

### 26. Get Order Statistics
**Endpoint**: `GET /orders/stats`

**Description**: Get comprehensive order statistics

**Authentication**: Required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Order statistics fetched successfully",
  "status_breakdown": [
    {
      "status": "pending",
      "count": 25,
      "total_revenue": 2500.00
    },
    {
      "status": "delivered",
      "count": 150,
      "total_revenue": 15000.00
    }
  ],
  "overall_stats": {
    "total_orders": 200,
    "total_revenue": 20000.00,
    "average_order_value": 100.00
  },
  "recent_stats": {
    "orders_last_30_days": 50,
    "revenue_last_30_days": 5000.00
  },
  "top_products": [
    {
      "id": 1,
      "name": "Blue Cotton Shirt",
      "order_count": 45,
      "total_quantity_sold": 90,
      "total_revenue": 2699.10
    }
  ]
}
```

---

## User Management Routes

### 27. Get All Users
**Endpoint**: `GET /users`

**Description**: Get paginated list of all users

**Authentication**: Required

**Query Parameters**:
```
page (optional): Page number (default: 1)
limit (optional): Items per page (default: 10)
search (optional): Search by name, email, or phone
is_blocked (optional): Filter by blocked status (true/false)
```

**Example Request**:
```
GET /admin/users?page=1&limit=20&search=john&is_blocked=false
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "users": [
    {
      "id": 1,
      "fullname": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "is_blocked": false,
      "created_at": "2024-01-10T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

---

### 28. Get User Details
**Endpoint**: `GET /users/:id`

**Description**: Get detailed information about a user

**Authentication**: Required

**Path Parameters**:
- `id`: User ID (number)

**Success Response** (200):
```json
{
  "success": true,
  "message": "User details fetched successfully",
  "user": {
    "id": 1,
    "fullname": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "is_blocked": false,
    "created_at": "2024-01-10T08:00:00Z",
    "addresses_count": 2,
    "orders_count": 15,
    "total_spent": 1499.85,
    "completed_orders": 12
  }
}
```

**Error Response**:
- 404: User not found

---

### 29. Get User Orders
**Endpoint**: `GET /users/:id/orders`

**Description**: Get all orders for a specific user

**Authentication**: Required

**Path Parameters**:
- `id`: User ID (number)

**Query Parameters**:
```
page (optional): Page number (default: 1)
limit (optional): Items per page (default: 10)
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User orders fetched successfully",
  "orders": [
    {
      "id": 1,
      "total_amount": 149.99,
      "status": "delivered",
      "payment_method": "card",
      "created_at": "2024-01-15T10:30:00Z",
      "items_count": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

---

### 30. Block/Unblock User
**Endpoint**: `PUT /users/:id/block`

**Description**: Block or unblock a user

**Authentication**: Required

**Path Parameters**:
- `id`: User ID (number)

**Request Body**:
```json
{
  "is_blocked": true
}
```

**Validation**:
- `is_blocked`: Boolean, required

**Note**: Automatically creates `is_blocked` column if it doesn't exist in database.

**Success Response** (200):
```json
{
  "success": true,
  "message": "User blocked successfully",
  "user": {
    "id": 1,
    "is_blocked": true
  }
}
```

**Error Response**:
- 404: User not found

---

## Coupon Routes

### 31. Get All Coupons
**Endpoint**: `GET /coupons`

**Description**: Get all coupons with active/expired status

**Authentication**: Required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Coupons fetched successfully",
  "coupons": [
    {
      "id": 1,
      "code": "SAVE20",
      "discount_percent": 20,
      "min_order_amount": 100.00,
      "expires_at": "2024-12-31T23:59:59Z",
      "is_active": true,
      "is_expired": false
    },
    {
      "id": 2,
      "code": "WELCOME10",
      "discount_percent": 10,
      "min_order_amount": null,
      "expires_at": "2024-01-01T00:00:00Z",
      "is_active": false,
      "is_expired": true
    }
  ],
  "count": 2
}
```

---

### 32. Create Coupon
**Endpoint**: `POST /coupons`

**Description**: Create a new discount coupon

**Authentication**: Required

**Request Body**:
```json
{
  "code": "SAVE20",
  "discount_percent": 20,
  "min_order_amount": 100.00,
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Validation**:
- `code`: String, min 3 chars, max 50 chars, auto-uppercase, unique, required
- `discount_percent`: Integer, 1-100, required
- `min_order_amount`: Number, min 0, optional, nullable
- `expires_at`: DateTime ISO format, optional, nullable

**Success Response** (201):
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "coupon": {
    "id": 1,
    "code": "SAVE20",
    "discount_percent": 20,
    "min_order_amount": 100.00,
    "expires_at": "2024-12-31T23:59:59Z"
  }
}
```

**Error Response**:
- 400: Duplicate coupon code

---

### 33. Update Coupon
**Endpoint**: `PUT /coupons/:id`

**Description**: Update an existing coupon

**Authentication**: Required

**Path Parameters**:
- `id`: Coupon ID (number)

**Request Body** (all fields optional, at least one required):
```json
{
  "code": "SAVE25",
  "discount_percent": 25,
  "min_order_amount": 150.00,
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "coupon": {
    "id": 1,
    "code": "SAVE25",
    "discount_percent": 25,
    "min_order_amount": 150.00,
    "expires_at": "2024-12-31T23:59:59Z"
  }
}
```

**Error Responses**:
- 400: Duplicate code or validation error
- 404: Coupon not found

---

### 34. Delete Coupon
**Endpoint**: `DELETE /coupons/:id`

**Description**: Delete a coupon (only if not used in any orders)

**Authentication**: Required

**Path Parameters**:
- `id`: Coupon ID (number)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

**Error Responses**:
- 400: Coupon has been used in orders (cannot delete)
- 404: Coupon not found

---

### 35. Get Coupon Usage Statistics
**Endpoint**: `GET /coupons/:id/usage`

**Description**: Get detailed usage statistics for a coupon

**Authentication**: Required

**Path Parameters**:
- `id`: Coupon ID (number)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Coupon usage stats fetched successfully",
  "coupon": {
    "id": 1,
    "code": "SAVE20",
    "discount_percent": 20,
    "min_order_amount": 100.00,
    "expires_at": "2024-12-31T23:59:59Z"
  },
  "stats": {
    "total_uses": 45,
    "total_discount_given": 900.00,
    "average_discount": 20.00,
    "first_used_at": "2024-01-15T10:30:00Z",
    "last_used_at": "2024-02-10T14:20:00Z"
  },
  "recent_orders": [
    {
      "id": 100,
      "user_id": 5,
      "total_amount": 120.00,
      "status": "delivered",
      "created_at": "2024-02-10T14:20:00Z",
      "discount_applied": 24.00,
      "user_email": "john@example.com"
    }
  ]
}
```

**Error Response**:
- 404: Coupon not found

---

## Analytics Routes

### 36. Get Overall Statistics
**Endpoint**: `GET /analytics/stats`

**Description**: Get comprehensive dashboard statistics

**Authentication**: Required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Overall statistics fetched successfully",
  "stats": {
    "orders": {
      "total": 500,
      "pending": 25,
      "paid": 50,
      "shipped": 75,
      "delivered": 300,
      "cancelled": 50
    },
    "revenue": {
      "total": 50000.00,
      "average_order_value": 100.00,
      "last_30_days": 10000.00,
      "previous_30_days": 8000.00,
      "growth_percentage": 25.00
    },
    "orders_trend": {
      "last_30_days": 100,
      "previous_30_days": 80,
      "growth_percentage": 25.00
    },
    "users": {
      "total": 1000,
      "new_last_30_days": 150
    },
    "products": {
      "total": 200,
      "active": 180,
      "categories": 15,
      "variants": 600
    }
  }
}
```

---

### 37. Get Revenue Over Time
**Endpoint**: `GET /analytics/revenue`

**Description**: Get revenue data grouped by time period

**Authentication**: Required

**Query Parameters**:
```
period (optional): Time grouping (day, week, month, year) - default: month
start_date (optional): Start date in ISO format
end_date (optional): End date in ISO format
```

**Example Request**:
```
GET /admin/analytics/revenue?period=month&start_date=2024-01-01&end_date=2024-12-31
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Revenue data fetched successfully",
  "period": "month",
  "data": [
    {
      "period": "2024-01",
      "total_orders": 50,
      "revenue": 5000.00,
      "average_order_value": 100.00,
      "completed_orders": 45,
      "cancelled_orders": 5
    },
    {
      "period": "2024-02",
      "total_orders": 60,
      "revenue": 6500.00,
      "average_order_value": 108.33,
      "completed_orders": 55,
      "cancelled_orders": 5
    }
  ]
}
```

**Default Behavior** (no date range specified):
- Returns data for last 12 periods based on selected period type

---

### 38. Get Top Products
**Endpoint**: `GET /analytics/top-products`

**Description**: Get best-selling products ranked by sales

**Authentication**: Required

**Query Parameters**:
```
limit (optional): Number of products to return (1-100) - default: 10
period (optional): Time period (7days, 30days, 90days, all) - default: 30days
```

**Example Request**:
```
GET /admin/analytics/top-products?limit=20&period=30days
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Top products fetched successfully",
  "period": "30days",
  "limit": 20,
  "products": [
    {
      "id": 1,
      "name": "Blue Cotton Shirt",
      "slug": "blue-cotton-shirt",
      "order_count": 45,
      "total_quantity_sold": 90,
      "total_revenue": 2699.10,
      "average_price": 29.99,
      "image_url": "https://s3.amazonaws.com/bucket/image1.jpg"
    },
    {
      "id": 2,
      "name": "Black Jeans",
      "slug": "black-jeans",
      "order_count": 38,
      "total_quantity_sold": 76,
      "total_revenue": 3799.24,
      "average_price": 49.99,
      "image_url": "https://s3.amazonaws.com/bucket/image2.jpg"
    }
  ]
}
```

---

### 39. Get Recent Orders
**Endpoint**: `GET /analytics/recent-orders`

**Description**: Get recent orders with details

**Authentication**: Required

**Query Parameters**:
```
limit (optional): Number of orders to return (1-100) - default: 20
status (optional): Filter by status (pending, paid, shipped, delivered, cancelled)
```

**Example Request**:
```
GET /admin/analytics/recent-orders?limit=10&status=pending
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Recent orders fetched successfully",
  "status": "pending",
  "limit": 10,
  "orders": [
    {
      "id": 100,
      "user_id": 5,
      "total_amount": 149.99,
      "status": "pending",
      "payment_method": "card",
      "created_at": "2024-02-15T10:30:00Z",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "item_count": 3,
      "first_product_image": "https://s3.amazonaws.com/bucket/image1.jpg"
    }
  ]
}
```

---

## Common Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
**Description**: Authentication required or invalid token

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden
**Description**: Valid token but insufficient permissions

```json
{
  "success": false,
  "message": "Forbidden"
}
```

### 400 Bad Request
**Description**: Validation errors or business logic violations

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "price",
      "message": "Price must be greater than 0"
    }
  ]
}
```

### 404 Not Found
**Description**: Resource not found

```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 Internal Server Error
**Description**: Unexpected server error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Authentication Flow

1. **Login**: `POST /admin/auth/login` with credentials
2. **Receive Token**: Server sets `admin_token` HTTP-only cookie
3. **Make Requests**: Include cookie in all subsequent requests (automatic with `credentials: true`)
4. **Check Auth**: Use `GET /admin/auth/check` to verify token validity
5. **Logout**: `POST /admin/auth/logout` to clear token

---

## Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting in production:
- Login: 5 attempts per 15 minutes
- API endpoints: 100 requests per minute per IP

---

## Best Practices

1. **Always use HTTPS in production**
2. **Set secure cookie flags**: `httpOnly: true, secure: true, sameSite: 'strict'`
3. **Validate all inputs** on both client and server
4. **Handle errors gracefully** with user-friendly messages
5. **Use pagination** for list endpoints to improve performance
6. **Cache responses** where appropriate (React Query handles this)
7. **Log important actions** (create, update, delete operations)

---

## Complete Route Summary

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | POST | `/auth/login` | Admin login |
| 2 | POST | `/auth/logout` | Admin logout |
| 3 | GET | `/auth/check` | Check authentication |
| 4 | GET | `/products` | Get all products |
| 5 | GET | `/products/:id` | Get single product |
| 6 | POST | `/products` | Create product |
| 7 | PUT | `/products/:id` | Update product |
| 8 | DELETE | `/products/:id` | Delete product |
| 9 | PUT | `/products/:id/status` | Update product status |
| 10 | GET | `/products/:id/variants` | Get product variants |
| 11 | POST | `/products/:id/variants` | Add variant |
| 12 | PUT | `/products/variants/:id` | Update variant |
| 13 | DELETE | `/products/variants/:id` | Delete variant |
| 14 | PUT | `/products/variants/:id/stock` | Update variant stock |
| 15 | POST | `/media/presigned-url` | Generate S3 presigned URL |
| 16 | POST | `/products/:id/media` | Add product media |
| 17 | DELETE | `/media/:id` | Delete media |
| 18 | PUT | `/media/:id/primary` | Set primary media |
| 19 | GET | `/categories` | Get all categories |
| 20 | POST | `/categories` | Create category |
| 21 | PUT | `/categories/:id` | Update category |
| 22 | DELETE | `/categories/:id` | Delete category |
| 23 | GET | `/orders` | Get all orders |
| 24 | GET | `/orders/:id` | Get order details |
| 25 | PUT | `/orders/:id/status` | Update order status |
| 26 | GET | `/orders/stats` | Get order statistics |
| 27 | GET | `/users` | Get all users |
| 28 | GET | `/users/:id` | Get user details |
| 29 | GET | `/users/:id/orders` | Get user orders |
| 30 | PUT | `/users/:id/block` | Block/unblock user |
| 31 | GET | `/coupons` | Get all coupons |
| 32 | POST | `/coupons` | Create coupon |
| 33 | PUT | `/coupons/:id` | Update coupon |
| 34 | DELETE | `/coupons/:id` | Delete coupon |
| 35 | GET | `/coupons/:id/usage` | Get coupon usage stats |
| 36 | GET | `/analytics/stats` | Get overall statistics |
| 37 | GET | `/analytics/revenue` | Get revenue over time |
| 38 | GET | `/analytics/top-products` | Get top products |
| 39 | GET | `/analytics/recent-orders` | Get recent orders |

**Total: 39 Admin API Endpoints**

# E-Commerce Backend Implementation Plan

Complete implementation guide for building a Flutter-based e-commerce application backend.

**Project:** University-level e-commerce app
**Frontend:** Flutter (User) + Web (Admin)
**Backend:** Node.js + Express.js + MySQL
**Storage:** AWS S3 for images
**Validation:** Zod schemas

---

## Table of Contents

1. [Current Status](#current-status)
2. [Architecture Pattern](#architecture-pattern)
3. [File Structure Requirements](#file-structure-requirements)
4. [Complete Route Plan](#complete-route-plan)
5. [Implementation Priority](#implementation-priority)
6. [Detailed Implementation Guide](#detailed-implementation-guide)

---

## Current Status

### ✅ Already Implemented (8 routes)

**Authentication:**
- `POST /api/v1/users/auth/signup` - User registration
- `POST /api/v1/users/auth/login` - User login

**Products (Public):**
- `GET /api/v1/products/` - Get all products
- `GET /api/v1/products/one/:id` - Get single product

**Admin - Categories:**
- `POST /api/v1/admin/categories/new` - Create category

**Admin - Products:**
- `POST /api/v1/admin/products/new` - Create product draft
- `PUT /api/v1/admin/products/update` - Update product

**Admin - Media:**
- `POST /api/v1/admin/media/presigned` - Get S3 presigned URL

### 🆕 To Be Implemented (60+ routes)

See detailed breakdown below.

---

## Architecture Pattern

Every feature follows this layered structure:

```
Request → Route → Zod Validation → AsyncCall Wrapper → Controller → Response
                                                      ↓
                                            Global Error Handler
```

### File Structure Per Feature

For each feature, you need **4 files**:

```
1. Type Definition:     src/types/{feature}.ts
2. Zod Schema:          src/zod/{module}/{feature}.zod.ts
3. Controller:          src/controller/{module}/{feature}.controller.ts
4. Route:               src/routes/{module}/{feature}.routes.ts
```

### Example: User Address Feature

```typescript
// 1. src/types/address.ts
export interface UserAddress {
    id?: number;
    user_id: number;
    line1: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
    is_default: boolean;
}

// 2. src/zod/users/address.zod.ts
import { z } from 'zod';

export const createAddressSchema = z.object({
    line1: z.string().min(5, "Address line must be at least 5 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().min(2, "Country is required"),
    zip_code: z.string().regex(/^\d{5,6}$/, "Invalid ZIP code"),
    is_default: z.boolean().optional().default(false)
});

export const updateAddressSchema = createAddressSchema.partial();

export const addressIdSchema = z.object({
    id: z.string().regex(/^\d+$/).transform(Number)
});

// 3. src/controller/users/address.controller.ts
import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import { UserAddress } from "../../types/address.js";
import CustomError from "../../utils/customError.js";
import { ResultSetHeader } from "mysql2";

export const handleGetUserAddresses = AsyncCall(async (req, res, next) => {
    const userId = req.user.id; // From auth middleware

    const addresses = await queryDb<UserAddress[]>(
        "SELECT * FROM user_address WHERE user_id = ?",
        [userId]
    );

    res.status(200).json({
        success: true,
        message: "Addresses fetched successfully",
        addresses
    });
});

export const handleCreateAddress = AsyncCall(async (req, res, next) => {
    const userId = req.user.id;
    const { line1, city, state, country, zip_code, is_default } = req.body;

    // If this is default, unset other defaults
    if (is_default) {
        await queryDb(
            "UPDATE user_address SET is_default = 0 WHERE user_id = ?",
            [userId]
        );
    }

    const result = await queryDb<ResultSetHeader>(
        `INSERT INTO user_address (user_id, line1, city, state, country, zip_code, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, line1, city, state, country, zip_code, is_default]
    );

    res.status(201).json({
        success: true,
        message: "Address created successfully",
        address: {
            id: result.insertId,
            user_id: userId,
            line1,
            city,
            state,
            country,
            zip_code,
            is_default
        }
    });
});

export const handleUpdateAddress = AsyncCall(async (req, res, next) => {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Check ownership
    const address = await queryDb<UserAddress[]>(
        "SELECT * FROM user_address WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (address.length === 0) {
        return next(new CustomError("Address not found", 404));
    }

    // Build dynamic update query
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(field => `${field} = ?`).join(", ");

    await queryDb(
        `UPDATE user_address SET ${setClause} WHERE id = ? AND user_id = ?`,
        [...values, id, userId]
    );

    res.status(200).json({
        success: true,
        message: "Address updated successfully"
    });
});

export const handleDeleteAddress = AsyncCall(async (req, res, next) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await queryDb<ResultSetHeader>(
        "DELETE FROM user_address WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Address not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Address deleted successfully"
    });
});

export const handleSetDefaultAddress = AsyncCall(async (req, res, next) => {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership
    const address = await queryDb<UserAddress[]>(
        "SELECT * FROM user_address WHERE id = ? AND user_id = ?",
        [id, userId]
    );

    if (address.length === 0) {
        return next(new CustomError("Address not found", 404));
    }

    // Unset all defaults
    await queryDb(
        "UPDATE user_address SET is_default = 0 WHERE user_id = ?",
        [userId]
    );

    // Set new default
    await queryDb(
        "UPDATE user_address SET is_default = 1 WHERE id = ?",
        [id]
    );

    res.status(200).json({
        success: true,
        message: "Default address updated"
    });
});

// 4. src/routes/users/address.routes.ts
import express from "express";
import {
    handleGetUserAddresses,
    handleCreateAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    handleSetDefaultAddress
} from "../../controller/users/address.controller.js";
import { zodValidate } from "../../middlewares/zodValidate.middleware.js";
import { createAddressSchema, updateAddressSchema, addressIdSchema } from "../../zod/users/address.zod.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", handleGetUserAddresses);
router.post("/", zodValidate(createAddressSchema, "body"), handleCreateAddress);
router.put("/:id", zodValidate(addressIdSchema, "params"), zodValidate(updateAddressSchema, "body"), handleUpdateAddress);
router.delete("/:id", zodValidate(addressIdSchema, "params"), handleDeleteAddress);
router.put("/:id/default", zodValidate(addressIdSchema, "params"), handleSetDefaultAddress);

export default router;
```

---

## Complete Route Plan

### Legend
- ✅ = Already implemented
- 🆕 = Needs implementation
- 🔒 = Requires authentication
- 👑 = Requires admin authentication

---

## 1. USER AUTHENTICATION & PROFILE

**Base URL:** `/api/v1/users`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| POST | `/auth/signup` | ✅ | None | Register new user |
| POST | `/auth/login` | ✅ | None | Login user |
| POST | `/auth/logout` | 🆕 | 🔒 | Logout (clear cookie) |
| GET | `/profile` | 🆕 | 🔒 | Get user profile |
| PUT | `/profile` | 🆕 | 🔒 | Update profile |
| PUT | `/password` | 🆕 | 🔒 | Change password |

**Files to create:**
```
src/types/user.ts (✅ exists - may need extension)
src/zod/users/profile.zod.ts (🆕)
src/controller/users/profile.controller.ts (🆕)
src/routes/users/profile.routes.ts (🆕)
```

---

## 2. USER ADDRESSES

**Base URL:** `/api/v1/users/addresses`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/` | 🆕 | 🔒 | Get all user addresses |
| POST | `/` | 🆕 | 🔒 | Add new address |
| PUT | `/:id` | 🆕 | 🔒 | Update address |
| DELETE | `/:id` | 🆕 | 🔒 | Delete address |
| PUT | `/:id/default` | 🆕 | 🔒 | Set as default |

**Files to create:**
```
src/types/address.ts (🆕)
src/zod/users/address.zod.ts (🆕)
src/controller/users/address.controller.ts (🆕)
src/routes/users/address.routes.ts (🆕)
```

---

## 3. PRODUCTS (Public - Flutter)

**Base URL:** `/api/v1/products`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/` | ✅ | None | Get all products (with filters) |
| GET | `/one/:id` | ✅ | None | Get single product |
| GET | `/:id/variants` | 🆕 | None | Get product variants |
| GET | `/search` | 🆕 | None | Search products |
| GET | `/category/:id` | 🆕 | None | Get products by category |

**Files to update/create:**
```
src/types/product.ts (✅ exists - may need extension)
src/zod/products/search.zod.ts (🆕)
src/controller/products/product.controller.ts (✅ update)
src/routes/products/product.routes.ts (✅ update)
```

---

## 4. CATEGORIES (Public)

**Base URL:** `/api/v1/categories`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/` | 🆕 | None | Get all categories |
| GET | `/:id` | 🆕 | None | Get category with subcategories |
| GET | `/:id/products` | 🆕 | None | Get products in category |

**Files to create:**
```
src/types/category.ts (✅ exists - may need extension)
src/zod/categories/category.zod.ts (🆕)
src/controller/categories/category.controller.ts (🆕)
src/routes/categories/category.routes.ts (🆕)
```

---

## 5. WISHLIST

**Base URL:** `/api/v1/users/wishlist`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/` | 🆕 | 🔒 | Get user wishlist |
| POST | `/` | 🆕 | 🔒 | Add variant to wishlist |
| DELETE | `/:id` | 🆕 | 🔒 | Remove from wishlist |
| DELETE | `/clear` | 🆕 | 🔒 | Clear entire wishlist |

**Files to create:**
```
src/types/wishlist.ts (🆕)
src/zod/users/wishlist.zod.ts (🆕)
src/controller/users/wishlist.controller.ts (🆕)
src/routes/users/wishlist.routes.ts (🆕)
```

---

## 6. CART

**Base URL:** `/api/v1/users/cart`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/` | 🆕 | 🔒 | Get user cart |
| POST | `/` | 🆕 | 🔒 | Add item to cart |
| PUT | `/:id` | 🆕 | 🔒 | Update cart item quantity |
| DELETE | `/:id` | 🆕 | 🔒 | Remove item from cart |
| DELETE | `/clear` | 🆕 | 🔒 | Clear entire cart |

**Files to create:**
```
src/types/cart.ts (🆕)
src/zod/users/cart.zod.ts (🆕)
src/controller/users/cart.controller.ts (🆕)
src/routes/users/cart.routes.ts (🆕)
```

---

## 7. ORDERS (User)

**Base URL:** `/api/v1/users/orders`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/` | 🆕 | 🔒 | Get user order history |
| GET | `/:id` | 🆕 | 🔒 | Get order details |
| POST | `/` | 🆕 | 🔒 | Create new order |
| PUT | `/:id/cancel` | 🆕 | 🔒 | Cancel order |

**Files to create:**
```
src/types/order.ts (🆕)
src/zod/users/order.zod.ts (🆕)
src/controller/users/order.controller.ts (🆕)
src/routes/users/order.routes.ts (🆕)
```

---

## 8. PAYMENTS

**Base URL:** `/api/v1/payments`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| POST | `/initiate` | 🆕 | 🔒 | Initiate payment |
| POST | `/verify` | 🆕 | 🔒 | Verify payment |
| GET | `/:order_id` | 🆕 | 🔒 | Get payment status |

**Files to create:**
```
src/types/payment.ts (🆕)
src/zod/payments/payment.zod.ts (🆕)
src/controller/payments/payment.controller.ts (🆕)
src/routes/payments/payment.routes.ts (🆕)
```

---

## 9. COUPONS (User)

**Base URL:** `/api/v1/coupons`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| POST | `/validate` | 🆕 | 🔒 | Validate coupon code |
| GET | `/active` | 🆕 | None | Get active coupons |

**Files to create:**
```
src/types/coupon.ts (🆕)
src/zod/coupons/coupon.zod.ts (🆕)
src/controller/coupons/coupon.controller.ts (🆕)
src/routes/coupons/coupon.routes.ts (🆕)
```

---

## 10. ADMIN - AUTHENTICATION

**Base URL:** `/api/v1/admin/auth`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| POST | `/login` | 🆕 | None | Admin login |
| POST | `/logout` | 🆕 | 👑 | Admin logout |

**Files to create:**
```
src/types/admin.ts (🆕)
src/zod/admin/auth.zod.ts (🆕)
src/controller/admin/auth.controller.ts (🆕)
src/routes/admin/auth.routes.ts (🆕)
```

---

## 11. ADMIN - CATEGORIES

**Base URL:** `/api/v1/admin/categories`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/` | 🆕 | 👑 | Get all categories |
| POST | `/new` | ✅ | 👑 | Create category |
| PUT | `/:id` | 🆕 | 👑 | Update category |
| DELETE | `/:id` | 🆕 | 👑 | Delete category |

**Files to update:**
```
src/controller/products/admin/category.admin.controller.ts (✅ update)
src/routes/admin/category/category.admin.routes.ts (✅ update)
```

---

## 12. ADMIN - PRODUCTS

**Base URL:** `/api/v1/admin/products`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/` | 🆕 | 👑 | Get all products |
| GET | `/:id` | 🆕 | 👑 | Get product details |
| POST | `/new` | ✅ | 👑 | Create product |
| PUT | `/update` | ✅ | 👑 | Update product |
| DELETE | `/:id` | 🆕 | 👑 | Delete product |
| PUT | `/:id/status` | 🆕 | 👑 | Change status |

**Files to update:**
```
src/controller/products/admin/product.admin.controller.ts (✅ update)
src/routes/admin/products/product.admin.routes.ts (✅ update)
```

---

## 13. ADMIN - PRODUCT VARIANTS

**Base URL:** `/api/v1/admin/products`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/:id/variants` | 🆕 | 👑 | Get all variants |
| POST | `/:id/variants` | 🆕 | 👑 | Add variant |
| PUT | `/variants/:id` | 🆕 | 👑 | Update variant |
| DELETE | `/variants/:id` | 🆕 | 👑 | Delete variant |
| PUT | `/variants/:id/stock` | 🆕 | 👑 | Update stock |

**Files to create:**
```
src/types/variant.ts (🆕)
src/zod/admin/variant/variant.zod.ts (🆕)
src/controller/admin/variant.controller.ts (🆕)
src/routes/admin/variant/variant.routes.ts (🆕)
```

---

## 14. ADMIN - PRODUCT MEDIA

**Base URL:** `/api/v1/admin`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| POST | `/media/presigned` | ✅ | 👑 | Get presigned URL |
| POST | `/products/:id/media` | 🆕 | 👑 | Add media to product |
| DELETE | `/products/media/:id` | 🆕 | 👑 | Delete product media |
| PUT | `/products/media/:id/primary` | 🆕 | 👑 | Set as primary |

**Files to update/create:**
```
src/types/media.ts (🆕)
src/zod/admin/media/media.zod.ts (🆕)
src/controller/products/admin/media/media.admin.controller.ts (✅ update)
src/routes/admin/media/media.routes.ts (✅ update)
```

---

## 15. ADMIN - ORDERS

**Base URL:** `/api/v1/admin/orders`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/` | 🆕 | 👑 | Get all orders |
| GET | `/:id` | 🆕 | 👑 | Get order details |
| PUT | `/:id/status` | 🆕 | 👑 | Update order status |
| GET | `/stats` | 🆕 | 👑 | Get order statistics |

**Files to create:**
```
src/types/order.ts (🆕 - shared with user)
src/zod/admin/order/order.zod.ts (🆕)
src/controller/admin/order.controller.ts (🆕)
src/routes/admin/order/order.routes.ts (🆕)
```

---

## 16. ADMIN - USERS

**Base URL:** `/api/v1/admin/users`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/` | 🆕 | 👑 | Get all users |
| GET | `/:id` | 🆕 | 👑 | Get user details |
| GET | `/:id/orders` | 🆕 | 👑 | Get user orders |
| PUT | `/:id/block` | 🆕 | 👑 | Block/unblock user |

**Files to create:**
```
src/zod/admin/users/users.zod.ts (🆕)
src/controller/admin/users.controller.ts (🆕)
src/routes/admin/users/users.routes.ts (🆕)
```

---

## 17. ADMIN - COUPONS

**Base URL:** `/api/v1/admin/coupons`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/` | 🆕 | 👑 | Get all coupons |
| POST | `/` | 🆕 | 👑 | Create coupon |
| PUT | `/:id` | 🆕 | 👑 | Update coupon |
| DELETE | `/:id` | 🆕 | 👑 | Delete coupon |
| GET | `/:id/usage` | 🆕 | 👑 | Get usage stats |

**Files to create:**
```
src/types/coupon.ts (🆕 - shared)
src/zod/admin/coupon/coupon.zod.ts (🆕)
src/controller/admin/coupon.controller.ts (🆕)
src/routes/admin/coupon/coupon.routes.ts (🆕)
```

---

## 18. ADMIN - ANALYTICS

**Base URL:** `/api/v1/admin/dashboard`

| Method | Endpoint | Status | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/stats` | 🆕 | 👑 | Overall statistics |
| GET | `/revenue` | 🆕 | 👑 | Revenue over time |
| GET | `/top-products` | 🆕 | 👑 | Best selling products |
| GET | `/recent-orders` | 🆕 | 👑 | Recent orders |

**Files to create:**
```
src/controller/admin/dashboard.controller.ts (🆕)
src/routes/admin/dashboard/dashboard.routes.ts (🆕)
```

---

## Implementation Priority

### PRIORITY 1 - Critical for MVP (Week 1-2)

**Must have for basic functionality:**

1. **Authentication Middleware** (🚨 HIGHEST PRIORITY)
   - `src/middlewares/auth.middleware.ts`
   - `src/middlewares/adminAuth.middleware.ts`

2. **User Addresses**
   - All CRUD operations
   - Required for checkout

3. **Cart Management**
   - Add/update/remove items
   - Required for orders

4. **Product Variants**
   - Display variants (sizes, colors)
   - Required for cart/orders

5. **Categories (Public)**
   - Browse categories
   - Filter products

### PRIORITY 2 - Important Features (Week 3)

**Essential for complete user experience:**

1. **Wishlist**
   - Save favorite items

2. **Order Creation**
   - Place orders from cart
   - Order history

3. **Product Media (Admin)**
   - Upload multiple images
   - Set primary image

4. **Admin Order Management**
   - View orders
   - Update status

5. **Product Search**
   - Search by name/description

### PRIORITY 3 - Nice to Have (Week 4-5)

**Enhanced features:**

1. **Payments**
   - Payment gateway integration
   - COD option

2. **Coupons**
   - Discount codes
   - Validation

3. **Admin Analytics**
   - Sales reports
   - Dashboard stats

4. **Admin User Management**
   - View users
   - Block users

5. **Profile Management**
   - Update user info
   - Change password

---

## Middleware Requirements

### 1. Authentication Middleware

**File:** `src/middlewares/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import CustomError from "../utils/customError.js";
import { queryDb } from "../utils/queryDb.js";
import { User } from "../types/user.js";

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                fullname: string;
            };
        }
    }
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;

        if (!token) {
            return next(new CustomError("Authentication required", 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

        // Get user from database
        const users = await queryDb<User[]>(
            "SELECT id, email, fullname FROM users WHERE id = ?",
            [decoded.userId]
        );

        if (users.length === 0) {
            return next(new CustomError("User not found", 404));
        }

        // Attach user to request
        req.user = {
            id: users[0].id!,
            email: users[0].email,
            fullname: users[0].fullname
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new CustomError("Invalid token", 401));
        }
        next(error);
    }
};
```

### 2. Admin Authentication Middleware

**File:** `src/middlewares/adminAuth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import CustomError from "../utils/customError.js";

declare global {
    namespace Express {
        interface Request {
            admin?: {
                id: number;
                email: string;
            };
        }
    }
}

export const adminAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.admin_token; // Different cookie for admin

        if (!token) {
            return next(new CustomError("Admin authentication required", 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            adminId: number;
            email: string;
            role: string;
        };

        if (decoded.role !== "admin") {
            return next(new CustomError("Admin access required", 403));
        }

        req.admin = {
            id: decoded.adminId,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new CustomError("Invalid admin token", 401));
        }
        next(error);
    }
};
```

---

## Zod Schema Patterns

### Basic Schemas

```typescript
// ID parameter validation
export const idParamSchema = z.object({
    id: z.string().regex(/^\d+$/).transform(Number)
});

// Pagination query validation
export const paginationSchema = z.object({
    page: z.string().optional().default("1").transform(Number),
    limit: z.string().optional().default("10").transform(Number),
    sort: z.enum(["asc", "desc"]).optional().default("desc")
});

// Search query validation
export const searchSchema = z.object({
    q: z.string().min(1, "Search query is required"),
    category_id: z.string().optional().transform(Number),
    min_price: z.string().optional().transform(Number),
    max_price: z.string().optional().transform(Number)
});
```

### Complex Schemas

```typescript
// Cart item schema
export const addToCartSchema = z.object({
    variant_id: z.number().int().positive(),
    quantity: z.number().int().min(1).max(10)
});

// Order creation schema
export const createOrderSchema = z.object({
    shipping_address_id: z.number().int().positive(),
    payment_method: z.enum(["card", "cod", "upi", "net_banking"]),
    coupon_code: z.string().optional()
});

// Product variant schema
export const createVariantSchema = z.object({
    size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
    color: z.string().min(2).max(50),
    stock: z.number().int().min(0),
    additional_price: z.number().min(0).default(0)
});
```

---

## Database Query Patterns

### 1. Ownership Verification

```typescript
// Always verify user owns the resource before update/delete
const [resource] = await queryDb<Resource[]>(
    "SELECT * FROM table WHERE id = ? AND user_id = ?",
    [resourceId, userId]
);

if (!resource) {
    return next(new CustomError("Resource not found", 404));
}
```

### 2. Joined Queries for Related Data

```typescript
// Get cart with product details
const cartItems = await queryDb<CartItem[]>(`
    SELECT
        c.id, c.quantity,
        pv.size, pv.color, pv.additional_price, pv.stock,
        p.name, p.price, p.discount,
        pm.url as image_url
    FROM cart c
    JOIN product_variants pv ON c.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.is_primary = 1
    WHERE c.user_id = ?
`, [userId]);
```

### 3. Transactions for Multi-Table Operations

```typescript
import { db } from "../config/mysql2.js";

// Order creation with transaction
export const handleCreateOrder = AsyncCall(async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Insert order
        const [orderResult] = await connection.query<ResultSetHeader>(
            "INSERT INTO orders (user_id, total_amount, status, shipping_address_id) VALUES (?, ?, ?, ?)",
            [userId, totalAmount, "pending", addressId]
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of cartItems) {
            await connection.query(
                "INSERT INTO order_items (order_id, variant_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)",
                [orderId, item.variant_id, item.quantity, item.price]
            );
        }

        // Clear cart
        await connection.query("DELETE FROM cart WHERE user_id = ?", [userId]);

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order_id: orderId
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});
```

---

## Response Format Standards

### Success Response

```typescript
res.status(200).json({
    success: true,
    message: "Operation successful",
    data: {...}
});
```

### Error Response (handled by global error handler)

```typescript
{
    success: false,
    message: "Error description",
    errors: null | [...validation errors]
}
```

### Paginated Response

```typescript
res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: products,
    pagination: {
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10
    }
});
```

---

## Route Registration in index.ts

**File:** `src/index.ts`

```typescript
import express from "express";
import cookieParser from "cookie-parser";

// User routes
import authRoutes from "./routes/user/auth.routes.js";
import profileRoutes from "./routes/users/profile.routes.js";
import addressRoutes from "./routes/users/address.routes.js";
import cartRoutes from "./routes/users/cart.routes.js";
import wishlistRoutes from "./routes/users/wishlist.routes.js";
import orderRoutes from "./routes/users/order.routes.js";

// Public routes
import productRoutes from "./routes/products/product.routes.js";
import categoryRoutes from "./routes/categories/category.routes.js";

// Payment routes
import paymentRoutes from "./routes/payments/payment.routes.js";

// Coupon routes
import couponRoutes from "./routes/coupons/coupon.routes.js";

// Admin routes
import adminAuthRoutes from "./routes/admin/auth.routes.js";
import adminCategoryRoutes from "./routes/admin/category/category.admin.routes.js";
import adminProductRoutes from "./routes/admin/products/product.admin.routes.js";
import adminVariantRoutes from "./routes/admin/variant/variant.routes.js";
import adminMediaRoutes from "./routes/admin/media/media.routes.js";
import adminOrderRoutes from "./routes/admin/order/order.routes.js";
import adminUserRoutes from "./routes/admin/users/users.routes.js";
import adminCouponRoutes from "./routes/admin/coupon/coupon.routes.js";
import adminDashboardRoutes from "./routes/admin/dashboard/dashboard.routes.js";

import { globalErrorHandler } from "./middlewares/globalErrorHandler.middleware.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// User routes
app.use("/api/v1/users/auth", authRoutes);
app.use("/api/v1/users/profile", profileRoutes);
app.use("/api/v1/users/addresses", addressRoutes);
app.use("/api/v1/users/cart", cartRoutes);
app.use("/api/v1/users/wishlist", wishlistRoutes);
app.use("/api/v1/users/orders", orderRoutes);

// Public routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);

// Payment routes
app.use("/api/v1/payments", paymentRoutes);

// Coupon routes
app.use("/api/v1/coupons", couponRoutes);

// Admin routes
app.use("/api/v1/admin/auth", adminAuthRoutes);
app.use("/api/v1/admin/categories", adminCategoryRoutes);
app.use("/api/v1/admin/products", adminProductRoutes);
app.use("/api/v1/admin/variants", adminVariantRoutes);
app.use("/api/v1/admin/media", adminMediaRoutes);
app.use("/api/v1/admin/orders", adminOrderRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/admin/coupons", adminCouponRoutes);
app.use("/api/v1/admin/dashboard", adminDashboardRoutes);

// Global error handler (must be last)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

---

## Testing Checklist

For each feature, test:

1. ✅ **Happy path** - Normal operation works
2. ✅ **Validation errors** - Invalid input rejected
3. ✅ **Authentication** - Unauthorized access blocked
4. ✅ **Authorization** - Users can't access others' data
5. ✅ **Edge cases** - Empty cart, duplicate items, etc.
6. ✅ **Error handling** - Database errors handled gracefully

---

## Common Pitfalls to Avoid

1. ❌ **Don't skip authentication** - All protected routes must use `authMiddleware`
2. ❌ **Don't trust client data** - Always validate with Zod
3. ❌ **Don't expose sensitive data** - Remove passwords before sending response
4. ❌ **Don't forget ownership checks** - User A shouldn't access User B's cart
5. ❌ **Don't use plain SQL with user input** - Always use parameterized queries
6. ❌ **Don't forget to handle edge cases** - Empty cart, out of stock, expired coupons
7. ❌ **Don't skip error handling** - Wrap async functions with AsyncCall
8. ❌ **Don't hardcode values** - Use environment variables for secrets

---

## Quick Reference

### TypeScript Interface Location
```
src/types/{feature}.ts
```

### Zod Schema Location
```
User features:  src/zod/users/{feature}.zod.ts
Admin features: src/zod/admin/{module}/{feature}.zod.ts
Public:         src/zod/{module}/{feature}.zod.ts
```

### Controller Location
```
User features:  src/controller/users/{feature}.controller.ts
Admin features: src/controller/admin/{feature}.controller.ts
Public:         src/controller/{module}/{feature}.controller.ts
```

### Route Location
```
User features:  src/routes/users/{feature}.routes.ts
Admin features: src/routes/admin/{module}/{feature}.routes.ts
Public:         src/routes/{module}/{feature}.routes.ts
```

---

## Summary

**Total Routes to Implement:** 60+

**Total New Files:** ~80 files
- 15 Types
- 20 Zod schemas
- 25 Controllers
- 20 Routes
- 2 Middlewares (auth)

**Estimated Timeline:** 4-5 weeks for complete implementation

**Next Steps:**
1. Implement authentication middleware (CRITICAL)
2. Start with Priority 1 features (addresses, cart, variants)
3. Move to Priority 2 (wishlist, orders, media)
4. Finish with Priority 3 (payments, analytics)

---

Good luck with your university project! 🚀



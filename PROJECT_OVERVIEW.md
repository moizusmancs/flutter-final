# E-Commerce Platform - Complete Project Overview

> **Last Updated:** December 11, 2025
> **Purpose:** Reference document for AI assistants and developers

---

## 📋 Table of Contents

1. [Project Architecture](#project-architecture)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Authentication Flow](#authentication-flow)
7. [Current Implementation Status](#current-implementation-status)
8. [Recent Fixes & Changes](#recent-fixes--changes)
9. [Next Steps](#next-steps)

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐         ┌─────────────────────┐   │
│  │  FLUTTER MOBILE APP │         │  REACT ADMIN PANEL  │   │
│  │  (Customer Facing)  │         │  (Store Management) │   │
│  ├─────────────────────┤         ├─────────────────────┤   │
│  │ • Product Browsing  │         │ • Dashboard/Analytics│   │
│  │ • Shopping Cart     │         │ • Product Management │   │
│  │ • Orders & Wishlist │         │ • Order Management  │   │
│  │ • User Auth (JWT)   │         │ • User Management   │   │
│  │ • Payment Gateway   │         │ • Coupon Management │   │
│  │                     │         │ • Admin Auth (Cookie)│   │
│  │ Port: Mobile Device │         │ Port: 5173 (Vite)   │   │
│  └──────────┬──────────┘         └──────────┬──────────┘   │
│             │                               │                │
│             └───────────┬───────────────────┘                │
│                         ↓                                     │
│              ┌──────────────────────┐                        │
│              │  NODE.JS BACKEND API │                        │
│              ├──────────────────────┤                        │
│              │ • Express.js Server  │                        │
│              │ • MySQL Database     │                        │
│              │ • JWT Authentication │                        │
│              │ • AWS S3 Storage     │                        │
│              │ • Stripe Payments    │                        │
│              │ • Zod Validation     │                        │
│              │                      │                        │
│              │ Port: 4000           │                        │
│              └──────────────────────┘                        │
│                         ↓                                     │
│              ┌──────────────────────┐                        │
│              │   MySQL Database     │                        │
│              │   Database: vouge    │                        │
│              │   14 Tables          │                        │
│              └──────────────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend (Flutter Mobile App)
- **Framework:** Flutter 3.9.0+
- **Language:** Dart
- **UI:** Material Design 3
- **HTTP Client:** http package (^0.13.6)
- **Image Carousel:** carousel_slider 4.2.0
- **Base URL:** `http://localhost:4000/api/v1`

### Web (React Admin Panel)
- **Framework:** React 19.2.0
- **Language:** TypeScript 5.7+
- **Build Tool:** Vite 7.2.4
- **UI Library:** Material UI (@mui/material 7.3.6)
- **State Management:**
  - TanStack React Query 5.90.12 (server state)
  - Context API (authentication)
- **HTTP Client:** Axios 1.13.2
- **Forms:** React Hook Form 7.68.0 + Zod 4.1.13
- **Charts:** Recharts 3.5.1
- **Tables:** MUI Data Grid 8.21.0
- **Routing:** React Router DOM 7.10.1
- **Base URL:** `http://localhost:4000/api/v1`

### Backend (Node.js API)
- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.1.0
- **Language:** TypeScript 5.9.3 (compiled to ES modules)
- **Database:** MySQL 2 (mysql2 package)
- **Authentication:** JWT (jsonwebtoken 9.0.2) + bcrypt 6.0.0
- **Validation:** Zod 4.1.12
- **File Storage:** AWS S3 (@aws-sdk/client-s3)
- **Payments:** Stripe 20.0.0
- **Dev Tools:** Nodemon + Concurrently (hot reload)
- **Port:** 4000

---

## 📂 Directory Structure

### Backend (`/backend`)
```
backend/
├── src/
│   ├── index.ts                    # Express app entry point
│   ├── config/
│   │   ├── mysql2.ts               # MySQL connection
│   │   └── aws.ts                  # AWS S3 client
│   ├── controller/
│   │   ├── admin/                  # Admin-only controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── analytics.admin.controller.ts
│   │   │   ├── product.admin.controller.ts
│   │   │   ├── order.admin.controller.ts
│   │   │   ├── user.admin.controller.ts
│   │   │   └── coupon.admin.controller.ts
│   │   ├── users/                  # User controllers
│   │   ├── products/               # Product controllers
│   │   └── categories/             # Category controllers
│   ├── routes/
│   │   ├── admin/                  # Admin routes
│   │   ├── user/                   # User auth routes
│   │   ├── users/                  # User feature routes
│   │   ├── products/               # Product routes
│   │   └── categories/             # Category routes
│   ├── middlewares/
│   │   ├── asyncCall.middleware.ts # Async error wrapper
│   │   ├── zodValidate.middleware.ts
│   │   ├── adminAuth.middleware.ts # Admin JWT verification
│   │   ├── userAuth.middleware.ts  # User JWT verification
│   │   └── globalErrorHandler.middleware.ts
│   ├── types/                      # TypeScript interfaces
│   ├── utils/                      # Helper functions
│   └── zod/                        # Validation schemas
├── dist/                           # Compiled JavaScript
├── schema.sql                      # Database schema
├── seed-fake-data.sql              # Sample data
└── package.json
```

### Web Admin Panel (`/web`)
```
web/
├── src/
│   ├── api/
│   │   ├── client.ts               # Axios instance
│   ��   ├── auth.api.ts             # Auth endpoints
│   │   └── analytics.api.ts        # Analytics endpoints
│   ├── components/
│   │   ├── common/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── Layout/
│   │   │       ├── AdminLayout.tsx
│   │   │       ├── Header.tsx
│   │   │       └── Sidebar.tsx
│   │   └── dashboard/              # Dashboard components
│   ├── contexts/
│   │   └── AuthContext.tsx         # Global auth state
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   └── dashboard/
│   │       └── DashboardPage.tsx
│   ├── types/                      # TypeScript types
│   ├── App.tsx                     # Route configuration
│   └── main.tsx                    # React entry point
└── package.json
```

### Flutter Mobile App (`/frontend`)
```
frontend/
├── lib/
│   ├── main.dart                   # App entry point
│   ├── core/
│   │   └── validators.dart
│   ├── models/
│   │   └── product_model.dart
│   ├── screens/
│   │   ├── auth/
│   │   ├── home/
│   │   └── cart/
│   ├── services/
│   │   └── api_service.dart        # HTTP client
│   └── widgets/
├── android/                        # Android native
├── ios/                            # iOS native
└── pubspec.yaml
```

---

## 🗄️ Database Schema

**Database Name:** `vouge`
**Database Host:** localhost
**Database User:** root
**Database Password:** macbookmoiz2002

### Tables (14)

1. **users** - Customer accounts
   - Fields: id, fullname, email, password_hash, created_at

2. **user_address** - Shipping/billing addresses
   - Fields: id, user_id, address_line1, address_line2, city, state, postal_code, country, is_default

3. **categories** - Product categories (hierarchical)
   - Fields: id, name, slug, parent_id

4. **products** - Product listings
   - Fields: id, name, description, category_id, price, discount, created_at

5. **product_variants** - Size/color variants with stock
   - Fields: id, product_id, size, color, stock, additional_price

6. **product_media** - Product images (S3 URLs)
   - Fields: id, product_id, url, is_primary

7. **wishlist** - User wishlists
   - Fields: id, user_id, variant_id, created_at

8. **cart** - Shopping cart items
   - Fields: id, user_id, variant_id, quantity

9. **orders** - Customer orders
   - Fields: id, user_id, total_amount, status, payment_id, shipping_address_id, created_at
   - Status: pending, paid, shipped, delivered, cancelled

10. **order_items** - Items in orders
    - Fields: id, order_id, variant_id, quantity, price_at_purchase

11. **payments** - Payment transactions
    - Fields: id, order_id, method, status, transaction_reference, paid_at
    - Method: card, cod, upi, net_banking
    - Status: pending, completed, failed

12. **coupons** - Discount codes
    - Fields: id, code, discount_percent, min_order_amount, expires_at

13. **order_coupons** - Applied coupons per order
    - Fields: id, order_id, coupon_id, discount_applied

14. **admins** - Admin accounts
    - Fields: id, username, email, password_hash, role
    - Roles: super_admin, admin, moderator

### Current Data
- **Orders:** 23 (from Jan-Apr 2024)
- **Users:** 20
- **Products:** 20
- **Admins:** 1 (admin@example.com)

---

## 🔌 API Endpoints

**Base URL:** `http://localhost:4000/api/v1`

### User Authentication
```
POST   /users/auth/signup              Register new user
POST   /users/auth/login               User login (returns JWT)
```

### User Features (Protected)
```
GET    /users/profile                  Get user profile
PUT    /users/profile                  Update profile
GET    /users/addresses                List addresses
POST   /users/addresses                Create address
PUT    /users/addresses/:id            Update address
DELETE /users/addresses/:id            Delete address
GET    /users/wishlist                 Get wishlist
POST   /users/wishlist                 Add to wishlist
DELETE /users/wishlist/:variantId      Remove from wishlist
GET    /users/cart                     Get cart
POST   /users/cart                     Add to cart
DELETE /users/cart/:cartId             Remove from cart
GET    /users/orders                   Get user orders
POST   /users/orders                   Create order
GET    /users/payments/checkout        Payment checkout
POST   /users/coupons/validate         Validate coupon
```

### Public Routes
```
GET    /products                       List all products (with filters)
GET    /products/one/:id               Get single product
GET    /categories                     List categories
```

### Admin Authentication
```
POST   /admin/auth/login               Admin login (sets HTTP-only cookie)
GET    /admin/auth/check               Verify authentication
POST   /admin/auth/logout              Admin logout
```

### Admin - Analytics
```
GET    /admin/analytics/stats          Overall statistics
GET    /admin/analytics/revenue        Revenue over time
GET    /admin/analytics/top-products   Top selling products
GET    /admin/analytics/recent-orders  Recent orders
```

### Admin - Products
```
GET    /admin/products                 List products (paginated)
POST   /admin/products/new             Create product
PUT    /admin/products/update/:id      Update product
DELETE /admin/products/:id             Delete product
GET    /admin/products/:id/variants    Get variants
POST   /admin/products/:id/variants    Add variant
PUT    /admin/products/variants/:id    Update variant
DELETE /admin/products/variants/:id    Delete variant
```

### Admin - Orders
```
GET    /admin/orders                   List orders (with filters)
GET    /admin/orders/:id               Order details
PUT    /admin/orders/:id/status        Update order status
```

### Admin - Users
```
GET    /admin/users                    List users
GET    /admin/users/:id                User details
PUT    /admin/users/:id/block          Block/unblock user
```

### Admin - Coupons
```
GET    /admin/coupons                  List coupons
POST   /admin/coupons/new              Create coupon
PUT    /admin/coupons/:id              Update coupon
DELETE /admin/coupons/:id              Delete coupon
```

### Admin - Categories
```
GET    /admin/categories               List categories
POST   /admin/categories/new           Create category
PUT    /admin/categories/update/:id    Update category
DELETE /admin/categories/:id           Delete category
```

### Admin - Media
```
POST   /admin/media/presigned          Get S3 presigned URL
GET    /admin/media                    List media
DELETE /admin/media/:id                Delete media
```

---

## 🔐 Authentication Flow

### User Authentication (Flutter App)
1. User submits email/password via login form
2. POST to `/users/auth/login`
3. Backend validates credentials
4. Returns JWT token in response body
5. Flutter app stores token (SharedPreferences/Secure Storage)
6. Token sent in `Authorization: Bearer {token}` header for protected routes

### Admin Authentication (React Web)
1. Admin submits email/password via login form
2. POST to `/admin/auth/login`
3. Backend validates credentials
4. Backend sets `admin_token` HTTP-only cookie
   - `httpOnly: true` (prevents JavaScript access)
   - `secure: true` (HTTPS only in production)
   - `sameSite: "lax"` (allows cookie on navigation)
   - `maxAge: 7 days`
5. React AuthContext stores admin info
6. Cookie automatically sent with all requests
7. Backend `adminAuthMiddleware` verifies JWT from cookie
8. On 401 response, Axios interceptor redirects to `/login`

### Middleware Flow
```
Request
  ↓
adminAuthMiddleware / userAuthMiddleware
  ↓
Extract JWT from cookie / header
  ↓
Verify JWT signature
  ↓
Decode payload (userId / adminId)
  ↓
Attach to req.userId / req.adminId
  ↓
Continue to controller
```

---

## ✅ Current Implementation Status

### Backend
- ✅ **Database Schema** - All 14 tables created
- ✅ **User Auth** - Signup, login with JWT
- ✅ **Admin Auth** - Login, logout, session check
- ✅ **Product CRUD** - Create, read, update, delete
- ✅ **Category CRUD** - Full implementation
- ✅ **Order Management** - Basic structure
- ✅ **Analytics** - Dashboard stats, revenue, top products
- ✅ **AWS S3 Integration** - Presigned URLs for media upload
- ✅ **Validation** - Zod schemas for all inputs
- ✅ **Error Handling** - Global error handler
- ⏳ **Payment Integration** - Stripe structure ready
- ⏳ **Full User Features** - Cart, wishlist, orders (partial)

### Web Admin Panel
- ✅ **Authentication** - Login page with JWT cookies
- ✅ **Protected Routes** - Auto-redirect to login
- ✅ **Dashboard** - Analytics with charts and tables
- ✅ **Layout** - Header, sidebar, main content area
- ✅ **Session Persistence** - Stays logged in on refresh
- ⏳ **Products Management** - CRUD UI (planned)
- ⏳ **Orders Management** - List, update status (planned)
- ⏳ **Users Management** - List, block/unblock (planned)
- ⏳ **Coupons Management** - CRUD UI (planned)
- ⏳ **Categories Management** - CRUD UI (planned)
- ⏳ **Media Management** - Upload interface (planned)

### Flutter Mobile App
- ✅ **Screen Structure** - Login, signup, home, product detail, cart
- ✅ **UI Components** - Custom widgets for forms, buttons, cards
- ✅ **Product Display** - Grid layout with images
- ⏳ **API Integration** - Basic service, needs full implementation
- ⏳ **Cart Functionality** - UI ready, API integration needed
- ⏳ **Order Flow** - Not implemented
- ⏳ **Payment Gateway** - Not implemented

---

## 🔧 Recent Fixes & Changes

### December 11, 2025

#### 1. Fixed Session Persistence Issue
**Problem:** Admin logged out on page refresh
**Cause:** Cookie `sameSite: "strict"` prevented cookie from being sent on navigation
**Fix:** Changed to `sameSite: "lax"` + added `path: "/"` in auth.controller.ts
**Files Modified:**
- `/backend/src/controller/admin/auth.controller.ts` (lines 43-44, 62-67)

#### 2. Fixed SQL Query Errors (500 errors on analytics)
**Problem:** Backend queries failing with SQL errors
**Fixes Applied:**
- Removed non-existent `status` column from products query
- Fixed JOIN condition: `LEFT JOIN payments p ON o.payment_id = p.id` (was `o.id = p.order_id`)
- Fixed products active count query

**Files Modified:**
- `/backend/src/controller/admin/analytics.admin.controller.ts` (lines 34, 284)

#### 3. Fixed Zod Validation Schemas
**Problem:** TypeScript compilation errors with default values on transformed fields
**Fix:** Used `z.preprocess()` for default values before transformation
**Files Modified:**
- `/backend/src/zod/admin/analytics/analyticsSchema.zod.ts` (lines 16-35)

#### 4. Fixed TypeScript Type Errors
**Problem:** Import error - `Variant` type didn't exist
**Fix:** Changed to `ProductVariant` type
**Files Modified:**
- `/backend/src/controller/products/admin/variant.admin.controller.ts` (line 6, multiple uses)

---

## 🎯 Next Steps

### Immediate Priorities (Web Admin Panel)

1. **Products Management Page**
   - List products (table with pagination, search)
   - Create product form (name, description, category, price, discount)
   - Edit product modal
   - Delete confirmation
   - Manage variants (size, color, stock)
   - Upload product images (S3 integration)

2. **Orders Management Page**
   - List orders (filterable by status, date)
   - View order details (items, customer, shipping)
   - Update order status (pending → paid → shipped → delivered)
   - Print invoice

3. **Users Management Page**
   - List users (with search)
   - View user details (orders, addresses)
   - Block/unblock user

4. **Coupons Management Page**
   - List coupons
   - Create coupon (code, discount %, min order amount, expiry)
   - Edit/delete coupons
   - View coupon usage stats

5. **Categories Management Page**
   - Tree view of categories (hierarchical)
   - Create category (name, slug, parent)
   - Edit/delete categories
   - Reorder categories

### Flutter App Priorities

1. Complete API integration (cart, wishlist, orders)
2. Payment gateway integration (Stripe/Razorpay)
3. User profile management
4. Order tracking
5. Push notifications

---

## 📝 Important Notes

### Environment Setup
```bash
# Backend
cd backend
npm install
npm run dev      # Starts TypeScript watch + nodemon

# Web Admin
cd web
npm install
npm run dev      # Starts Vite dev server on port 5173

# Flutter App
cd frontend
flutter pub get
flutter run      # Runs on connected device/emulator
```

### Test Credentials
**Admin Login:**
- Email: `admin@example.com`
- Password: (Set via bcrypt hash in database)

**Database Access:**
```bash
mysql -u root -pmacbookmoiz2002 vouge
```

### CORS Configuration
Backend allows requests from:
- `http://localhost:5173` (React admin panel)
- Credentials enabled for cookie-based auth

### File Upload Flow (S3)
1. Admin requests presigned URL: `POST /admin/media/presigned`
2. Backend generates S3 presigned URL (5-minute expiry)
3. Frontend uploads file directly to S3 using presigned URL
4. Frontend sends S3 URL to backend to save in database

---

## 🚀 Production Deployment Notes

### Backend
- Set `NODE_ENV=production`
- Use environment variables for all secrets
- Enable `secure: true` for cookies (HTTPS)
- Set up database backups
- Configure rate limiting
- Enable logging (Winston/Morgan)

### Web Admin
- Build with `npm run build`
- Deploy to Vercel/Netlify
- Update `VITE_API_BASE_URL` to production API

### Flutter App
- Build APK/IPA for production
- Configure API base URL for production
- Set up Firebase/AWS for notifications
- Submit to App Store/Play Store

---

## 📞 Support & Resources

- **Backend Documentation:** `/backend/ADMIN_API_DOCUMENTATION.md`
- **Auth Flow:** `/backend/AUTH_ENDPOINTS.md`
- **Admin Panel Plan:** `/web/ADMIN_PANEL_PLAN.md`
- **Implementation Plan:** `/backend/IMPLEMENTATION_PLAN.md`

---

**Document maintained for AI assistant context and developer onboarding**

# VougeAR - Comprehensive Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Key Features](#key-features)
7. [Database Schema](#database-schema)
8. [API Documentation](#api-documentation)
9. [Authentication & Authorization](#authentication--authorization)
10. [Payment Integration](#payment-integration)
11. [Virtual Try-On (VTON) System](#virtual-try-on-vton-system)
12. [Deployment Guide](#deployment-guide)
13. [Testing Guide](#testing-guide)

---

## Project Overview

**VougeAR** is a full-stack e-commerce mobile application with advanced AR-powered Virtual Try-On (VTON) capabilities. The application allows users to browse fashion products, try them on virtually using AI, add items to cart, manage wishlists, and complete secure checkout with integrated payment processing.

### Key Highlights
- **Mobile Platform**: iOS & Android (Flutter)
- **Backend**: Node.js + Express + TypeScript
- **Database**: MySQL
- **Cloud Storage**: AWS S3
- **Payment Processing**: Stripe
- **AI Integration**: Virtual Try-On API
- **Architecture**: RESTful API with Repository Pattern

---

## Technology Stack

### Frontend (Mobile App)
```yaml
Framework: Flutter 3.9.0
Language: Dart
State Management: Provider
HTTP Client: Dio 5.4.0
Secure Storage: flutter_secure_storage 9.0.0
Payment SDK: flutter_stripe 11.2.0
Image Handling: image_picker 1.0.7
UI Components: Material Design 3
```

### Backend (API Server)
```json
Runtime: Node.js
Framework: Express 5.1.0
Language: TypeScript 5.9.3
Database Driver: mysql2 3.15.2
Authentication: JWT (jsonwebtoken 9.0.2)
Password Hashing: bcrypt 6.0.0
Payment Processing: Stripe 20.0.0
Cloud Storage: AWS SDK S3 3.913.0
Validation: Zod 4.1.12
HTTP Client: Axios 1.13.2
```

### Database & Storage
```
Primary Database: MySQL 8.0+
Cloud Storage: AWS S3
Session Management: JWT Tokens
Local Storage: SharedPreferences + SecureStorage
```

### Development Tools
```
Version Control: Git
API Testing: Postman/cURL
Mobile Development: VS Code + Flutter DevTools
Backend Development: VS Code + TypeScript
Process Manager: Nodemon + Concurrently
Build System: TypeScript Compiler + Flutter Build
```

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Application                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Presentation Layer                       │  │
│  │  - Screens (Home, Product, Cart, Checkout, VTON)    │  │
│  │  - Widgets (Custom Buttons, Cards, Forms)            │  │
│  │  - Theme & Styling                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                     │  │
│  │  - Providers (Auth, State Management)                │  │
│  │  - Repositories (API Communication)                  │  │
│  │  - Models (Data Structures)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Data Layer                              │  │
│  │  - DioClient (HTTP Client)                           │  │
│  │  - Secure Storage (Tokens, Credentials)              │  │
│  │  - Local Cache                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS/REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Server                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Layer                               │  │
│  │  - Routes (Endpoint Definitions)                     │  │
│  │  - Middleware (Auth, Validation, Error Handling)     │  │
│  │  - Controllers (Request Processing)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                     │  │
│  │  - Service Functions                                 │  │
│  │  - Validation Schemas (Zod)                          │  │
│  │  - Utilities (S3, Stripe, JWT)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Data Access Layer                        │  │
│  │  - Database Queries                                  │  │
│  │  - Connection Pool                                   │  │
│  │  - Transaction Management                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
    ┌──────────┐    ┌──────────┐   ┌──────────┐
    │  MySQL   │    │  AWS S3  │   │  Stripe  │
    │ Database │    │  Storage │   │   API    │
    └──────────┘    └─────��────┘   └──────────┘
```

### Design Patterns Used

1. **Repository Pattern**: Separates data access logic from business logic
2. **Provider Pattern**: State management in Flutter
3. **MVC Pattern**: Controllers handle requests, Models define data
4. **Singleton Pattern**: DioClient, Database Connection
5. **Factory Pattern**: Model constructors (fromJson/toJson)
6. **Middleware Pattern**: Request processing pipeline
7. **Interceptor Pattern**: HTTP request/response interception

---

## Backend Architecture

### Project Structure

```
backend/
├── src/
│   ├── controller/
│   │   ├── admin/              # Admin-only endpoints
│   │   │   ├── auth.controller.ts
│   │   │   ├── analytics.admin.controller.ts
│   │   │   ├── coupon.admin.controller.ts
│   │   │   ├── order.admin.controller.ts
│   │   │   └── user.admin.controller.ts
│   │   ├── products/
│   │   │   ├── product.controller.ts
│   │   │   └── admin/
│   │   │       ├── product.admin.controller.ts
│   │   │       ├── category.admin.controller.ts
│   │   │       ├── variant.admin.controller.ts
│   │   │       └── media/
│   │   │           └── media.admin.controller.ts
│   │   ├── users/              # User endpoints
│   │   │   ├── auth.controller.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── wishlist.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── payment.controller.ts
│   │   │   ├── address.controller.ts
│   │   │   ├── coupon.controller.ts
│   │   │   └── vton.controller.ts
│   │   └── categories/
│   │       └── category.controller.ts
│   ├── routes/
│   │   ├── admin/              # Admin routes
│   │   ├── users/              # User routes
│   │   ├── products/           # Product routes
│   │   └── categories/         # Category routes
│   ├── middleware/
│   │   ├── authenticate.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   └── validator.middleware.ts
│   ├── utils/
│   │   ├── db.utils.ts         # Database utilities
│   │   ├── s3.utils.ts         # AWS S3 utilities
│   │   └── vton.utils.ts       # VTON API utilities
│   ├── types/
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── vton.ts
│   │   └── checkout.ts
│   └── index.ts                # Entry point
├── .env                        # Environment variables
├── package.json
└── tsconfig.json
```

### Core Backend Components

#### 1. Database Connection (`db.utils.ts`)
```typescript
// Connection pool management
- createPool(): Manages MySQL connection pool
- queryDb<T>(): Generic query execution with type safety
- Automatic connection recycling
- Error handling and logging
```

#### 2. Authentication System
```typescript
// JWT-based authentication
- Token generation: JWT with 7-day expiry
- Password hashing: bcrypt with salt rounds
- Middleware: authenticateUser, authenticateAdmin
- Role-based access control (RBAC)
```

#### 3. Error Handling
```typescript
// Custom error classes
- CustomError: Base error with status code
- Global error handler middleware
- Zod validation errors
- Database error mapping
```

#### 4. S3 Integration
```typescript
// AWS S3 utilities
- generatePresignedUrl(): Upload URLs
- generateDownloadUrl(): Signed download URLs
- deleteFromS3(): File deletion
- Bucket: vougear-products, vougear-vton-images
```

---

## Frontend Architecture

### Project Structure

```
frontend/
├── lib/
│   ├── main.dart                    # App entry point
│   ├── core/
│   │   ├── constants/
│   │   │   └── api_constants.dart   # API endpoints
│   │   ├── network/
│   │   │   ├── dio_client.dart      # HTTP client
│   │   │   └── api_result.dart      # Response wrapper
│   │   ├── storage/
│   │   │   └── local_storage_service.dart
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   └── app_colors.dart
│   │   └── validators.dart
│   ├── data/
│   │   ├── models/
│   │   │   ├── user_model.dart
│   │   │   ├── product_model.dart
│   │   │   ├── cart_item_model.dart
│   │   │   ├── order_model.dart
│   │   │   ├── address_model.dart
│   │   │   ├── vton_model.dart
│   │   │   └── category_model.dart
│   │   └── repositories/
│   │       ├── auth_repository.dart
│   │       ├── products_repository.dart
│   │       ├── cart_repository.dart
│   │       ├── wishlist_repository.dart
│   │       ├── checkout_repository.dart
│   │       ├── orders_repository.dart
│   │       └── vton_repository.dart
│   ├── providers/
│   │   └── auth_provider.dart       # State management
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── welcome_screen.dart
│   │   │   ├── login_screen.dart
│   │   │   └── signup_email_screen.dart
│   │   ├── home/
│   │   │   ├── home_screen.dart
│   │   │   ├── product_detail_screen.dart
│   │   │   ├── category_screen.dart
│   │   │   └── categories_list_screen.dart
│   │   ├── cart/
│   │   │   └── cart_screen.dart
│   │   ├── wishlist/
│   │   │   └── wishlist_screen.dart
│   │   ├── checkout/
│   │   │   ├── checkout_screen.dart
│   │   │   ├── add_address_screen.dart
│   │   │   ├── card_payment_screen.dart
│   │   │   └── order_confirmation_screen.dart
│   │   ├── vton/
│   │   │   ├── vton_onboarding_screen.dart
│   │   │   ├── vton_upload_screen.dart
│   │   │   └── vton_result_screen.dart
│   │   └── profile/
│   │       └── profile_screen.dart
│   └── widgets/
│       ├── custom_button.dart
│       ├── custom_textfield.dart
│       ├── product_card.dart
│       └── circular_category_item.dart
├── pubspec.yaml
└── analysis_options.yaml
```

### Core Frontend Components

#### 1. DioClient (HTTP Client)
```dart
Features:
- Base URL configuration
- Request/Response interceptors
- Automatic token injection
- Error handling
- Request logging
- Timeout configuration (10s default, 5min for VTON)
```

#### 2. ApiResult Wrapper
```dart
class ApiResult<T> {
  final bool success;
  final T? data;
  final String? error;
  final String? message;
}

Usage: Consistent error handling across all API calls
```

#### 3. Repository Pattern
```dart
All repositories follow this pattern:
- Accept DioClient in constructor
- Return ApiResult<T> for all operations
- Handle DioException errors
- Convert JSON to Models
```

#### 4. State Management (Provider)
```dart
AuthProvider:
- Manages authentication state
- Stores user data
- Handles login/logout
- Token management
```

---

## Key Features

### 1. User Authentication & Authorization

#### Registration Flow
```
User enters email/password → Backend validates → Hash password →
Store in DB → Generate JWT → Return token + user data →
Store in SecureStorage → Navigate to Home
```

#### Login Flow
```
User enters credentials → Backend validates → Compare hashed password →
Generate JWT → Return token + user data → Store token → Navigate to Home
```

#### JWT Token Structure
```json
{
  "id": 123,
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1235172690
}
```

### 2. Product Browsing

#### Features
- Category-based filtering
- Product variants (sizes, colors)
- Image galleries with carousel
- Price & discount display
- Stock availability
- Product details (description, brand)

#### Implementation
```
GET /api/v1/products
GET /api/v1/products/:id
GET /api/v1/categories
GET /api/v1/categories/:id/products
```

### 3. Shopping Cart

#### Features
- Add/Remove items
- Update quantity
- Real-time price calculation
- Product variant selection
- Persistent cart (DB-backed)

#### Database Schema
```sql
cart (
  id INT PRIMARY KEY,
  user_id INT,
  variant_id INT,
  quantity INT,
  created_at TIMESTAMP
)
```

### 4. Wishlist Management

#### Features
- Add/Remove products
- Heart icon toggle
- Persistent across sessions
- Quick add to cart from wishlist

#### Implementation
```
POST /api/v1/users/wishlist/add
DELETE /api/v1/users/wishlist/remove/:productId
GET /api/v1/users/wishlist
```

### 5. Checkout & Payment System

#### Checkout Flow
```
Cart → Select Address → Choose Payment Method →
  ├─ COD → Place Order → Confirmation
  └─ Card → Stripe Payment → Verify → Confirmation
```

#### Address Management
- Add new addresses
- Select default address
- Multiple saved addresses
- Validation (ZIP: 5-6 digits)

#### Payment Methods
1. **Cash on Delivery (COD)**
   - Simple order placement
   - Payment status: 'pending'

2. **Card Payment (Stripe)**
   - Create payment intent
   - Show Stripe CardField widget
   - Confirm payment with 3D Secure
   - Verify on backend
   - Update order status

#### Stripe Integration
```typescript
// Backend: Create Payment Intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(totalAmount * 100), // Cents
  currency: 'usd',
  metadata: { order_id, user_id }
});

// Frontend: Confirm Payment
await Stripe.instance.confirmPayment(
  paymentIntentClientSecret: clientSecret,
  data: PaymentMethodParams.card(...)
);
```

### 6. Order Management

#### Order Lifecycle
```
Created → Pending →
  ├─ Processing → Shipped → Delivered → Completed
  └─ Cancelled
```

#### Order Structure
```typescript
interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address_id: number;
  payment_id: number;
  items: OrderItem[];
}
```

### 7. Virtual Try-On (VTON) System

#### Complete VTON Flow

**Step 1: Upload User Image**
```
User selects photo → Upload to S3 (presigned URL) →
Save metadata to DB → Store image ID
```

**Step 2: Select Product**
```
Browse products → Click "Try On" → Navigate to VTON screen
```

**Step 3: Generate VTON**
```
Send userImageId + productId → Backend calls VTON API →
Poll for status → Display result
```

**Step 4: View & Action**
```
View result → Add to Cart / Save / Share
```

#### VTON API Integration
```typescript
// Backend: Generate VTON
const response = await axios.post('https://api.fashn.ai/v1/run', {
  model_image: userImageUrl,
  garment_image: productImageUrl,
  category: 'tops'
}, {
  headers: { 'Authorization': `Bearer ${FASHN_API_KEY}` }
});

// Store prediction_id and poll for status
```

#### Image Storage Structure
```
S3 Buckets:
├── vougear-products/          # Product images
│   └── products/{id}/...
└── vougear-vton-images/       # User uploaded images
    └── users/{userId}/...
```

---

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### products
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(5, 2) DEFAULT 0,
  brand VARCHAR(255),
  category_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### product_variants
```sql
CREATE TABLE product_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  size VARCHAR(50),
  color VARCHAR(50),
  stock INT DEFAULT 0,
  additional_price DECIMAL(10, 2) DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

#### categories
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  parent_id INT DEFAULT NULL,
  image_url VARCHAR(512),
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);
```

#### cart
```sql
CREATE TABLE cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  variant_id INT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_variant (user_id, variant_id)
);
```

#### wishlist
```sql
CREATE TABLE wishlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);
```

#### user_addresses
```sql
CREATE TABLE user_addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  line1 VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### orders
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shipping_address_id INT,
  payment_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (shipping_address_id) REFERENCES user_addresses(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);
```

#### order_items
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  variant_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);
```

#### payments
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  method ENUM('card', 'cod') NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  transaction_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

#### vton_user_images
```sql
CREATE TABLE vton_user_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  s3_key VARCHAR(512) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### vton_generations
```sql
CREATE TABLE vton_generations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  user_image_id INT NOT NULL,
  product_id INT NOT NULL,
  result_image_url VARCHAR(512),
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  prediction_id VARCHAR(255),
  segmentation_type INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (user_image_id) REFERENCES vton_user_images(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Database Relationships

```
users (1) ──────── (N) cart
users (1) ──────── (N) wishlist
users (1) ──────── (N) orders
users (1) ──────── (N) user_addresses
users (1) ──────── (N) vton_user_images
users (1) ──────── (N) vton_generations

categories (1) ──── (N) products
products (1) ────── (N) product_variants
products (1) ────── (N) product_images
products (1) ────── (N) wishlist
products (1) ────── (N) vton_generations

orders (1) ──────── (N) order_items
orders (1) ──────── (1) payments
orders (1) ──────── (1) user_addresses

product_variants (1) ── (N) cart
product_variants (1) ── (N) order_items
```

---

## API Documentation

### Base URL
```
Development: http://localhost:4000/api/v1
Production: https://api.vougear.com/api/v1
```

### Authentication Endpoints

#### 1. Register User
```http
POST /users/auth/signup
Content-Type: application/json

Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login User
```http
POST /users/auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Get Current User
```http
GET /users/profile/me
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Product Endpoints

#### 1. Get All Products
```http
GET /products
Query Parameters:
  - category_id (optional): Filter by category
  - page (optional): Page number (default: 1)
  - limit (optional): Items per page (default: 20)

Response (200):
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Classic T-Shirt",
      "description": "...",
      "price": 29.99,
      "discount": 10,
      "brand": "Nike",
      "category_id": 2,
      "images": ["url1", "url2"],
      "variants": [...]
    }
  ]
}
```

#### 2. Get Product Details
```http
GET /products/:id

Response (200):
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Classic T-Shirt",
    "description": "...",
    "price": 29.99,
    "discount": 10,
    "images": [...],
    "variants": [
      {
        "id": 1,
        "size": "M",
        "color": "Blue",
        "stock": 50,
        "additional_price": 0
      }
    ]
  }
}
```

### Cart Endpoints

#### 1. Get Cart Items
```http
GET /users/cart
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "cart": [
    {
      "id": 1,
      "variant_id": 5,
      "quantity": 2,
      "product_name": "Classic T-Shirt",
      "size": "M",
      "color": "Blue",
      "price": 29.99,
      "image_url": "...",
      "subtotal": 59.98
    }
  ],
  "total": 59.98
}
```

#### 2. Add to Cart
```http
POST /users/cart/add
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "variantId": 5,
  "quantity": 2
}

Response (200):
{
  "success": true,
  "message": "Item added to cart",
  "cartItem": { ... }
}
```

#### 3. Update Cart Item
```http
PUT /users/cart/update
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "variantId": 5,
  "quantity": 3
}

Response (200):
{
  "success": true,
  "message": "Cart updated"
}
```

#### 4. Remove from Cart
```http
DELETE /users/cart/remove/:variantId
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Item removed from cart"
}
```

### Wishlist Endpoints

#### 1. Get Wishlist
```http
GET /users/wishlist
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "wishlist": [
    {
      "id": 1,
      "product_id": 10,
      "product_name": "Summer Dress",
      "price": 59.99,
      "discount": 15,
      "image_url": "...",
      "in_stock": true
    }
  ]
}
```

#### 2. Add to Wishlist
```http
POST /users/wishlist/add
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "productId": 10
}

Response (200):
{
  "success": true,
  "message": "Added to wishlist"
}
```

#### 3. Remove from Wishlist
```http
DELETE /users/wishlist/remove/:productId
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Removed from wishlist"
}
```

### Address Endpoints

#### 1. Get All Addresses
```http
GET /users/addresses
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "addresses": [
    {
      "id": 1,
      "line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zip_code": "10001",
      "is_default": true
    }
  ]
}
```

#### 2. Add Address
```http
POST /users/addresses
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "line1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zip_code": "10001",
  "is_default": true
}

Response (200):
{
  "success": true,
  "message": "Address added successfully",
  "address": { ... }
}
```

### Order & Payment Endpoints

#### 1. Create Order
```http
POST /users/orders
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "shipping_address_id": 1,
  "payment_method": "card" // or "cod"
}

Response (200):
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": 100,
    "total_amount": 89.97,
    "status": "pending",
    "items": [...]
  }
}
```

#### 2. Initiate Payment (Card)
```http
POST /users/payments/initiate
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "order_id": 100,
  "payment_method": "card"
}

Response (200):
{
  "success": true,
  "message": "Payment intent created",
  "payment": {
    "order_id": 100,
    "method": "card",
    "status": "pending",
    "client_secret": "pi_xxx_secret_yyy",
    "payment_intent_id": "pi_xxx"
  }
}
```

#### 3. Verify Payment
```http
POST /users/payments/verify
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "order_id": 100,
  "payment_intent_id": "pi_xxx"
}

Response (200):
{
  "success": true,
  "message": "Payment verified",
  "payment": {
    "status": "completed",
    "amount": 89.97
  }
}
```

#### 4. Get Order History
```http
GET /users/orders
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "orders": [
    {
      "id": 100,
      "total_amount": 89.97,
      "status": "delivered",
      "created_at": "2025-01-15T10:30:00Z",
      "items": [...]
    }
  ]
}
```

### VTON Endpoints

#### 1. Get Upload URL
```http
GET /users/vton/upload-url?fileName=user-photo.jpg
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "imageUrl": "https://s3.amazonaws.com/...",
    "s3Key": "users/123/..."
  }
}
```

#### 2. Save User Image
```http
POST /users/vton/user-images
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "imageUrl": "https://s3.amazonaws.com/...",
  "s3Key": "users/123/..."
}

Response (200):
{
  "success": true,
  "message": "User image saved",
  "data": {
    "id": 5,
    "image_url": "..."
  }
}
```

#### 3. Generate VTON
```http
POST /users/vton/generate
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "userImageId": 5,
  "productId": 10,
  "segmentationType": 0
}

Response (200):
{
  "success": true,
  "message": "VTON generation started",
  "data": {
    "id": 25,
    "status": "processing",
    "prediction_id": "abc123"
  }
}
```

#### 4. Check VTON Status
```http
GET /users/vton/status/:id
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "id": 25,
    "status": "completed",
    "result_image_url": "https://s3.amazonaws.com/..."
  }
}
```

#### 5. Get VTON History
```http
GET /users/vton/history
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "history": [
    {
      "id": 25,
      "product_name": "Summer Dress",
      "result_image_url": "...",
      "status": "completed",
      "created_at": "2025-01-15T14:20:00Z"
    }
  ]
}
```

### Category Endpoints

#### 1. Get All Categories
```http
GET /categories

Response (200):
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Women",
      "parent_id": null,
      "image_url": "...",
      "subcategories": [
        {
          "id": 2,
          "name": "Dresses",
          "parent_id": 1
        }
      ]
    }
  ]
}
```

---

## Authentication & Authorization

### JWT Token Flow

#### Token Generation
```typescript
// Backend
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);
```

#### Token Storage (Frontend)
```dart
// Secure storage for token
await LocalStorageService.saveToken(token);

// Auto-inject in HTTP headers
dio.options.headers['Authorization'] = 'Bearer $token';
```

#### Token Verification (Backend)
```typescript
// Middleware
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Role-Based Access Control

```typescript
// User routes: Accessible to authenticated users
router.use(authenticateUser);

// Admin routes: Accessible only to admins
router.use(authenticateUser, requireAdmin);

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
```

### Password Security

```typescript
// Hashing during registration
const hashedPassword = await bcrypt.hash(password, 10);

// Verification during login
const isMatch = await bcrypt.compare(password, user.password);
```

---

## Payment Integration

### Stripe Configuration

#### Environment Variables
```env
# Backend .env
STRIPE_SECRET_KEY=sk_test_xxx

# Frontend api_constants.dart
stripePublishableKey=pk_test_xxx
```

#### Payment Flow Sequence

```
1. User clicks "Place Order" with Card Payment
   ↓
2. Frontend: Call /payments/initiate
   ↓
3. Backend: Create Stripe Payment Intent
   stripe.paymentIntents.create({
     amount: totalAmount * 100,
     currency: 'usd'
   })
   ↓
4. Backend: Return client_secret + payment_intent_id
   ↓
5. Frontend: Show Stripe CardField
   User enters card details
   ↓
6. Frontend: Confirm payment with Stripe SDK
   Stripe.instance.confirmPayment(
     paymentIntentClientSecret: clientSecret
   )
   ↓
7. Stripe: Process payment (may show 3D Secure)
   ↓
8. Frontend: Call /payments/verify
   ↓
9. Backend: Verify payment status with Stripe API
   stripe.paymentIntents.retrieve(payment_intent_id)
   ↓
10. Backend: Update order & payment status
    ↓
11. Frontend: Show success/failure message
```

#### Handling Payment States

```typescript
// Payment statuses
'pending'    // Payment initiated, awaiting confirmation
'completed'  // Payment successful
'failed'     // Payment declined or error

// Order statuses after payment
'pending'     // Order created, payment pending
'processing'  // Payment successful, preparing shipment
'shipped'     // Order dispatched
'delivered'   // Order completed
'cancelled'   // Order/payment cancelled
```

#### Test Card Numbers (Stripe)

```
Success:          4242 4242 4242 4242
Declined:         4000 0000 0000 9995
3D Secure:        4000 0025 0000 3155
Insufficient:     4000 0000 0000 9995

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5-6 digits
```

---

## Virtual Try-On (VTON) System

### VTON Architecture

```
┌────────────────────────────────────────────────┐
│           Mobile App (Flutter)                 │
│  1. User uploads photo                         │
│  2. Browses products                           │
│  3. Clicks "Try On"                            │
└────────────────┬───────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────┐
│         Backend API (Express)                  │
│  1. Generate S3 presigned URL                  │
│  2. Save image metadata                        │
│  3. Call VTON API (Fashn.ai)                  │
│  4. Poll for completion                        │
│  5. Store result                               │
└────────┬──────────────────────┬────────────────┘
         │                      │
         ▼                      ▼
┌──────────────┐      ┌──────────────────┐
│   AWS S3     │      │   VTON API       │
│  - User pics │      │  (Fashn.ai)      │
│  - Results   │      │  - AI Processing │
└──────────────┘      └──────────────────┘
```

### VTON Implementation Details

#### 1. Image Upload Process

```typescript
// Step 1: Frontend requests presigned URL
const result = await vtonRepository.getUploadUrl('photo.jpg');

// Step 2: Upload directly to S3
await vtonRepository.uploadImageToS3(
  result.data.uploadUrl,
  imageFile
);

// Step 3: Save metadata to database
await vtonRepository.saveUserImage(
  result.data.imageUrl,
  result.data.s3Key
);
```

#### 2. VTON Generation

```typescript
// Backend: vton.controller.ts
export const handleGenerateVton = async (req, res) => {
  const { userImageId, productId, segmentationType } = req.body;

  // Get user image and product image URLs
  const userImage = await queryDb(...);
  const productImage = await queryDb(...);

  // Call VTON API
  const response = await axios.post(
    'https://api.fashn.ai/v1/run',
    {
      model_image: userImage.image_url,
      garment_image: productImage.image_url,
      category: 'tops',
      segmentation_type: segmentationType
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.FASHN_API_KEY}`
      }
    }
  );

  // Save generation record
  const vtonId = await queryDb(
    'INSERT INTO vton_generations ...',
    [userId, userImageId, productId, response.data.id]
  );

  return res.json({
    success: true,
    data: { id: vtonId, status: 'processing' }
  });
};
```

#### 3. Status Polling

```dart
// Frontend: Poll every 2 seconds
Timer.periodic(Duration(seconds: 2), (timer) async {
  final status = await vtonRepository.getVtonStatus(vtonId);

  if (status.data['status'] == 'completed') {
    timer.cancel();
    setState(() {
      resultUrl = status.data['result_image_url'];
    });
  }
});
```

#### 4. VTON API Response Handling

```typescript
// Backend: Check VTON status
const checkVtonStatus = async (predictionId: string) => {
  const response = await axios.get(
    `https://api.fashn.ai/v1/status/${predictionId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.FASHN_API_KEY}`
      }
    }
  );

  if (response.data.status === 'completed') {
    // Update database with result
    await queryDb(
      'UPDATE vton_generations SET status = ?, result_image_url = ? WHERE prediction_id = ?',
      ['completed', response.data.output_url, predictionId]
    );
  }

  return response.data;
};
```

### VTON Best Practices

1. **Image Quality**
   - Minimum resolution: 768x1024
   - Clear front-facing photos
   - Good lighting

2. **Performance Optimization**
   - Lazy loading for history
   - Caching result images
   - Progressive image loading

3. **Error Handling**
   - Timeout after 5 minutes
   - Retry failed generations
   - Graceful degradation

4. **User Experience**
   - Loading indicators
   - Progress updates
   - Quick preview before generation

---

## Deployment Guide

### Backend Deployment

#### 1. Environment Setup
```bash
# Install Node.js 18+
nvm install 18
nvm use 18

# Install dependencies
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with production values
```

#### 2. Database Setup
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE vougear;

# Run migrations (create all tables)
mysql -u root -p vougear < schema.sql
```

#### 3. Build & Start
```bash
# Development
npm run dev

# Production build
npm run build
node dist/index.js

# Or use PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name vougear-api
pm2 save
pm2 startup
```

#### 4. Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=vougear

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_PRODUCTS=vougear-products
S3_BUCKET_VTON=vougear-vton-images

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx

# VTON API
FASHN_API_KEY=your-fashn-api-key

# Server
PORT=4000
NODE_ENV=production
```

### Frontend Deployment

#### 1. Environment Configuration
```dart
// lib/core/constants/api_constants.dart
class ApiConstants {
  static const String baseUrl = 'https://api.vougear.com/api/v1';
  static const String stripePublishableKey = 'pk_live_xxx';
}
```

#### 2. Build iOS
```bash
cd frontend

# Install dependencies
flutter pub get

# Build iOS
flutter build ios --release

# Or create IPA
flutter build ipa

# Archive with Xcode
open ios/Runner.xcworkspace
# Product → Archive → Distribute
```

#### 3. Build Android
```bash
# Build APK
flutter build apk --release

# Build App Bundle (for Play Store)
flutter build appbundle --release
```

#### 4. App Store Deployment
```bash
# Using Fastlane (optional)
cd ios
fastlane release

# Or manual upload to App Store Connect
# 1. Archive in Xcode
# 2. Upload to App Store Connect
# 3. Submit for review
```

### Production Checklist

#### Backend
- [ ] Change JWT_SECRET to strong random key
- [ ] Use production Stripe keys
- [ ] Enable HTTPS/SSL
- [ ] Setup CORS properly
- [ ] Configure rate limiting
- [ ] Setup logging (Winston, etc.)
- [ ] Database backups configured
- [ ] Error monitoring (Sentry)
- [ ] Load balancer configured
- [ ] CDN for static assets

#### Frontend
- [ ] Change API baseUrl to production
- [ ] Use production Stripe keys
- [ ] Remove debug prints
- [ ] Enable code obfuscation
- [ ] Configure app signing
- [ ] Set proper permissions
- [ ] Optimize images
- [ ] Test on multiple devices
- [ ] App Store assets ready
- [ ] Privacy policy linked

#### Infrastructure
- [ ] Database: MySQL 8.0+ (AWS RDS recommended)
- [ ] Storage: AWS S3 with CloudFront
- [ ] Server: AWS EC2 / DigitalOcean
- [ ] Monitoring: CloudWatch / DataDog
- [ ] Backups: Automated daily backups
- [ ] SSL: Let's Encrypt / AWS Certificate Manager

---

## Testing Guide

### Backend Testing

#### Manual API Testing with cURL

```bash
# 1. Register User
curl -X POST http://localhost:4000/api/v1/users/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123"}'

# 2. Login
curl -X POST http://localhost:4000/api/v1/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# Save the token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Get Products
curl http://localhost:4000/api/v1/products

# 4. Add to Cart
curl -X POST http://localhost:4000/api/v1/users/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"variantId":1,"quantity":2}'

# 5. Get Cart
curl http://localhost:4000/api/v1/users/cart \
  -H "Authorization: Bearer $TOKEN"

# 6. Create Order
curl -X POST http://localhost:4000/api/v1/users/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shipping_address_id":1,"payment_method":"cod"}'
```

#### Database Testing
```sql
-- Check user creation
SELECT * FROM users WHERE email = 'test@example.com';

-- Check cart items
SELECT c.*, p.name, pv.size
FROM cart c
JOIN product_variants pv ON c.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
WHERE c.user_id = 1;

-- Check order creation
SELECT o.*, oi.quantity, p.name
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN product_variants pv ON oi.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
WHERE o.user_id = 1;
```

### Frontend Testing

#### Manual Testing Flow

**1. Authentication**
```
✓ Open app
✓ Click "Sign Up"
✓ Enter valid email/password
✓ Verify registration success
✓ Logout
✓ Login with same credentials
✓ Verify home screen loads
```

**2. Product Browsing**
```
✓ View all products
✓ Filter by category
✓ Click product card
✓ View product details
✓ Swipe through images
✓ Select variant (size/color)
✓ Verify price updates
```

**3. Shopping Cart**
```
✓ Add item to cart
✓ Verify cart count updates
✓ Open cart screen
✓ Update quantity
✓ Remove item
✓ Verify total calculation
```

**4. Wishlist**
```
✓ Click heart icon on product
✓ Verify wishlist count
✓ Open wishlist screen
✓ Remove from wishlist
✓ Move to cart
```

**5. Checkout**
```
✓ Proceed to checkout
✓ Add new address
✓ Select default address
✓ Choose payment method (COD)
✓ Place order
✓ Verify confirmation screen
✓ Repeat with Card payment
✓ Enter test card: 4242 4242 4242 4242
✓ Verify payment success
```

**6. VTON Feature**
```
✓ Navigate to VTON
✓ Upload photo
✓ Select product
✓ Click "Generate"
✓ Wait for processing (loading indicator)
✓ Verify result displays
✓ Add to cart from result
```

### Stripe Payment Testing

#### Test Cards
```
Success:
  Card: 4242 4242 4242 4242
  Expiry: 12/34
  CVC: 123
  ZIP: 12345

Decline:
  Card: 4000 0000 0000 9995

3D Secure:
  Card: 4000 0025 0000 3155
  (Will show auth popup)
```

#### Payment Flow Testing
```
1. Add items to cart ($50)
2. Proceed to checkout
3. Select card payment
4. Enter test card (4242...)
5. Verify Stripe CardField appears
6. Fill all card details
7. Click "Pay $50.00"
8. Verify payment processes
9. Check backend logs for:
   - Payment intent created
   - Payment confirmed
   - Order status updated
10. Verify order confirmation screen
```

### Error Handling Testing

#### Network Errors
```
✓ Turn off WiFi
✓ Try to login → Should show error
✓ Try to load products → Should show error
✓ Turn on WiFi
✓ Retry → Should work
```

#### Validation Errors
```
✓ Login with invalid email format
✓ Password less than 6 characters
✓ Empty form submission
✓ ZIP code with 4 digits (should fail)
✓ ZIP code with 5 digits (should pass)
```

#### Edge Cases
```
✓ Add item with quantity = 0
✓ Add out-of-stock variant
✓ Complete checkout with empty cart
✓ Double-click "Place Order"
✓ Expired JWT token
✓ VTON with invalid image
```

---

## Common Issues & Solutions

### Issue 1: JWT Token Expired
```
Error: "Invalid token" or "Unauthorized"

Solution:
1. Token expires after 7 days
2. User needs to login again
3. Frontend automatically redirects to login
```

### Issue 2: CORS Errors
```
Error: "Access-Control-Allow-Origin" blocked

Solution (Backend):
app.use(cors({
  origin: ['http://localhost:3000', 'https://vougear.com'],
  credentials: true
}));
```

### Issue 3: Stripe Payment Fails
```
Error: "Payment configuration error"

Solutions:
1. Check STRIPE_SECRET_KEY in backend .env
2. Check stripePublishableKey in frontend
3. Restart backend to load new env vars
4. Verify test mode keys match (both pk_test and sk_test)
```

### Issue 4: VTON Timeout
```
Error: "Request timeout"

Solutions:
1. Increased timeout to 5 minutes in repository
2. Check FASHN_API_KEY is valid
3. Verify image URLs are accessible
4. Check VTON API status
```

### Issue 5: Database Connection Failed
```
Error: "ER_ACCESS_DENIED_ERROR"

Solutions:
1. Check DB credentials in .env
2. Verify MySQL is running: mysql.server status
3. Create user: CREATE USER 'user'@'localhost' IDENTIFIED BY 'pass';
4. Grant permissions: GRANT ALL ON vougear.* TO 'user'@'localhost';
```

### Issue 6: S3 Upload Fails
```
Error: "Access Denied" or "SignatureDoesNotMatch"

Solutions:
1. Check AWS credentials in .env
2. Verify IAM permissions for S3
3. Check bucket names match
4. Ensure bucket region is correct
```

---

## Performance Optimization

### Backend Optimizations

```typescript
// 1. Database Query Optimization
// Use indexes on frequently queried columns
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_cart_user ON cart(user_id);

// 2. Connection Pooling
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  // ...
});

// 3. Response Caching (for products, categories)
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 min

// 4. Image Optimization
// Use CloudFront CDN for S3 images
// Compress images before upload
```

### Frontend Optimizations

```dart
// 1. Image Caching
CachedNetworkImage(
  imageUrl: product.imageUrl,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
)

// 2. Lazy Loading
ListView.builder(
  itemCount: products.length,
  itemBuilder: (context, index) => ProductCard(...)
)

// 3. State Management
// Use Provider for efficient rebuilds
Consumer<AuthProvider>(
  builder: (context, auth, child) => ...
)

// 4. Pagination
// Load products in batches of 20
GET /products?page=1&limit=20
```

---

## Security Considerations

### Backend Security

```typescript
// 1. SQL Injection Prevention
// Using parameterized queries
await queryDb('SELECT * FROM users WHERE id = ?', [userId]);

// 2. Password Security
// Strong hashing with bcrypt
const hashedPassword = await bcrypt.hash(password, 10);

// 3. JWT Security
// Strong secret, short expiry for sensitive operations
jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

// 4. Input Validation
// Using Zod schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// 5. Rate Limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### Frontend Security

```dart
// 1. Secure Token Storage
// Using flutter_secure_storage
await storage.write(key: 'jwt_token', value: token);

// 2. HTTPS Only
// Enforce HTTPS in production
const String baseUrl = 'https://api.vougear.com';

// 3. Certificate Pinning (Production)
// Prevent MITM attacks
dio.httpClientAdapter = IOHttpClientAdapter(
  createHttpClient: () {
    final client = HttpClient();
    client.badCertificateCallback = (cert, host, port) => false;
    return client;
  },
);

// 4. Input Sanitization
// Validate all user inputs
validator: (value) {
  if (value == null || value.isEmpty) return 'Required';
  if (!EmailValidator.validate(value)) return 'Invalid email';
  return null;
}
```

---

## Monitoring & Logging

### Backend Logging

```typescript
// Using Winston
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log important events
logger.info('User logged in', { userId: user.id });
logger.error('Payment failed', { orderId, error: err.message });
```

### Frontend Analytics

```dart
// Track user actions
void trackEvent(String eventName, Map<String, dynamic> properties) {
  print('Event: $eventName, Props: $properties');
  // Send to analytics service (Firebase, Mixpanel, etc.)
}

// Usage
trackEvent('product_viewed', {
  'product_id': product.id,
  'category': product.category,
  'price': product.price
});
```

---

## Future Enhancements

### Planned Features

1. **Social Features**
   - Share VTON results on social media
   - User reviews and ratings
   - Product recommendations

2. **Advanced VTON**
   - Multiple garments at once
   - Full outfit try-on
   - AR preview in real-time

3. **Loyalty Program**
   - Points system
   - Referral rewards
   - Exclusive discounts

4. **Push Notifications**
   - Order status updates
   - New product alerts
   - Personalized offers

5. **Admin Dashboard**
   - Web-based admin panel
   - Sales analytics
   - Inventory management
   - User management

6. **Payment Options**
   - Apple Pay
   - Google Pay
   - PayPal integration

---

## Conclusion

VougeAR is a comprehensive e-commerce platform that combines modern mobile development practices with cutting-edge AI technology. The application demonstrates:

- **Scalable Architecture**: Clean separation of concerns, modular design
- **Secure Implementation**: JWT authentication, encrypted storage, secure payments
- **Modern Tech Stack**: Flutter, Node.js, MySQL, AWS, Stripe
- **Advanced Features**: AI-powered virtual try-on, real-time payment processing
- **Production Ready**: Error handling, validation, performance optimization

### Tech Stack Summary

```
Frontend:  Flutter + Dart + Provider
Backend:   Node.js + Express + TypeScript
Database:  MySQL
Cloud:     AWS S3
Payment:   Stripe
AI:        Fashn.ai VTON API
```

### Key Metrics

- **12 Main Screens**: Auth, Home, Product, Cart, Wishlist, Checkout, VTON, Profile
- **35+ API Endpoints**: Complete REST API coverage
- **10 Database Tables**: Normalized schema design
- **3 External APIs**: Stripe, AWS S3, VTON
- **Full CRUD**: Products, Cart, Wishlist, Orders, Addresses

---

## Contact & Support

For questions or issues:

1. **Code Issues**: Check GitHub repository
2. **API Questions**: Refer to API Documentation section
3. **Database Issues**: See Database Schema section
4. **Deployment Help**: Follow Deployment Guide

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Project**: VougeAR E-Commerce Platform
**Authors**: Development Team

---

*This document serves as the complete technical reference for the VougeAR project. Keep it updated as new features are added.*

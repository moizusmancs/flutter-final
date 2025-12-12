# Flutter Frontend Summary

## Project Overview

**Project Name:** VougeAR
**Type:** Flutter E-commerce Mobile Application
**SDK Version:** ^3.9.0
**Initial Route:** LoginScreen

## Project Structure

```
frontend/
├── lib/
│   ├── core/              # Core utilities and validators
│   ├── models/            # Data models
│   ├── screens/           # App screens/pages
│   │   ├── auth/          # Authentication screens
│   │   ├── home/          # Home and product screens
│   │   └── cart/          # Shopping cart screen
│   ├── services/          # API and backend services
│   ├── widgets/           # Reusable UI components
│   └── main.dart          # App entry point
├── test/                  # Unit and widget tests
└── pubspec.yaml           # Dependencies and configuration
```

---

## Dependencies

### Production Dependencies
- **flutter**: SDK - Core Flutter framework
- **http**: ^0.13.6 - HTTP client for API calls
- **carousel_slider**: 4.2.0 - Image carousel widget
- **cupertino_icons**: ^1.0.8 - iOS-style icons

### Dev Dependencies
- **flutter_test**: SDK - Testing framework
- **flutter_lints**: ^5.0.0 - Linting rules

---

## Application Architecture

### Entry Point
**File:** `lib/main.dart`

- Initializes MaterialApp with Material 3 design
- Sets LoginScreen as home/initial route
- Disables debug banner
- Uses blue primary color theme

---

## Core Layer

### Validators (`lib/core/validators.dart`)

Provides form validation utilities:

- **validateEmail(String?)** - Email format validation with regex
- **validatePassword(String?)** - Minimum 8 characters password validation
- **validateName(String?)** - Required name field validation
- **validatePhone(String?)** - Minimum 10 digits phone validation

---

## Models Layer

### Product Model (`lib/models/product_model.dart`)

**Properties:**
```dart
int id
String name
String description
String category
double price
double discount
List<String> images
int stock
```

**Methods:**
- `fromJson(Map<String, dynamic>)` - Deserialize from API response
- `toJson()` - Serialize to JSON

**Note:** Currently uses simple fields. Does NOT match backend schema which has:
- `category_id` instead of `category` string
- `slug`, `sku`, `status` fields missing
- No support for variants or detailed media objects

---

## Services Layer

### API Service (`lib/services/api_service.dart`)

**Base URL:** `http://localhost:4000/api/v1`

**Generic Methods:**
- `get(String endpoint)` - Generic GET request
- `post(String endpoint, Map<String, dynamic> data)` - Generic POST request

**Product-Specific Methods:**
- `fetchProducts()` - Returns `List<Product>` from GET `/products`
- `fetchOneProduct(String id)` - Returns `Product` from GET `/products/one/:id`

**Status:** Basic implementation without:
- Authentication headers (no cookie handling)
- Error handling beyond status code checks
- Pagination support
- Category filtering
- Cart/Wishlist/Order APIs
- User authentication APIs

---

## Screens Layer

### Authentication Screens

#### 1. Login Screen (`lib/screens/auth/login_screen.dart`)

**Purpose:** User login interface

**Features:**
- Email input with validation
- Password input with validation
- Login button (no API integration yet)
- Google login button (placeholder)
- Navigate to signup screen

**State:**
- Form validation with GlobalKey
- TextEditingControllers for email/password

**Navigation:**
- Navigates to SignupChoiceScreen on "Create account"

**Status:** UI complete, no API integration

---

#### 2. Signup Choice Screen (`lib/screens/auth/signup_choice_screen.dart`)

**Purpose:** Choose signup method (email/phone/social)

**Status:** File exists but not analyzed (not read in this session)

---

#### 3. Signup Email Screen (`lib/screens/auth/signup_email_screen.dart`)

**Purpose:** Email-based signup form

**Status:** File exists but not analyzed (not read in this session)

---

### Home Screens

#### 1. Home Screen (`lib/screens/home/home_screen.dart`)

**Purpose:** Main product browsing interface

**Features:**
- **Drawer Navigation** with menu items (Home, Cart, Favourites, Profile)
- **App Bar** with title and cart icon
- **Search Bar** for product search (UI only, no functionality)
- **Category Chips** - horizontal scroll with selection
  - Categories: All, Jackets, T-Shirts, Polos, Hoodies, Jeans, Shoes
- **Product Grid** - 2 columns, displays fetched products
- **Bottom Navigation Bar** - Home, Cart, Favourites, Profile tabs

**State Management:**
- `List<Product> products` - Fetched from API
- `bool isLoading` - Loading state
- `String selectedCategory` - Currently selected category (not functional)
- `int _selectedIndex` - Bottom nav selected index

**API Integration:**
- Calls `ApiService.fetchProducts()` on init
- Displays products in grid using ProductCard widget

**Navigation:**
- Cart icon → CartScreen
- ProductCard tap → ProductDetailPage

**Limitations:**
- Category filtering not implemented (UI only)
- Search not implemented
- Drawer menu items not functional
- Bottom nav doesn't change content

---

#### 2. Product Detail Screen (`lib/screens/home/product_detail_screen.dart`)

**Purpose:** Display detailed product information

**Features:**
- **Image Swiper** - PageView for multiple product images
- **Image Indicators** - Dots showing current image
- **Product Info** - Name, description, price display
- **Add to Cart** button (shows snackbar, no API)
- **Favorite** button (placeholder, no functionality)
- **Buy Now** button (placeholder, no functionality)
- **Reviews Section** - Static dummy reviews

**State:**
- `Product? product` - Fetched product data
- `bool isLoading` - Loading state
- `int _currentImage` - Current image index

**API Integration:**
- Fetches single product via `ApiService.fetchOneProduct(productId)`

**Navigation:**
- Receives `int productId` as parameter
- Back button in AppBar

**Limitations:**
- No actual cart integration
- No wishlist integration
- Static reviews (not from API)
- No variant selection

---

### Cart Screen

#### Cart Screen (`lib/screens/cart/cart_screen.dart`)

**Purpose:** Display and manage shopping cart

**Features:**
- Display cart items with image, name, description, price
- Quantity controls (+/- buttons)
- Buy button for each item (placeholder)
- Back navigation

**State:**
- `List<Map<String, dynamic>> cartItems` - Dummy cart data

**Methods:**
- `increaseQuantity(int index)` - Increment item quantity
- `decreaseQuantity(int index)` - Decrement item quantity (min 1)

**Limitations:**
- Uses dummy/hardcoded data
- No API integration
- No persistent cart state
- No total price calculation
- No checkout flow

---

## Widgets Layer

### 1. Custom Button (`lib/widgets/custom_button.dart`)

**Purpose:** Reusable button component

**Props:**
- `String text` (required) - Button label
- `VoidCallback onPressed` (required) - Tap handler
- `Color color` (optional, default: blue) - Background color

**Styling:**
- Full width button
- 14px vertical padding
- 16px font size, white text

---

### 2. Custom TextField (`lib/widgets/custom_textfield.dart`)

**Purpose:** Reusable form input field

**Props:**
- `String label` (required) - Field label
- `TextEditingController controller` (required) - Text controller
- `bool obscureText` (optional, default: false) - Password masking
- `String? Function(String?)? validator` (optional) - Validation function
- `TextInputType keyboardType` (optional, default: text) - Input type

**Styling:**
- Outlined border
- 8px vertical padding

---

### 3. Product Card (`lib/widgets/product_card.dart`)

**Purpose:** Display product in grid/list

**Props:**
- `Product product` (required) - Product data

**Features:**
- Network image with error handling (placeholder on error)
- Product name (bold, 16px)
- Product description (truncated to 20 chars)
- Product price (green, bold)
- Tap to navigate to ProductDetailPage

**Styling:**
- Card with elevation 3
- Rounded corners (12px)
- 150px image height

---

### 4. Category Chip (`lib/widgets/category_chip.dart`)

**Purpose:** Category filter chip

**Status:** File exists but not analyzed (not read in this session)

---

## API Integration Status

### Implemented ✅
- Fetch all products (GET `/products`)
- Fetch single product (GET `/products/one/:id`)

### Not Implemented ❌
- User authentication (signup/login/logout)
- Category listing
- Product search
- Cart operations (add/get/update/remove)
- Wishlist operations
- Order creation and management
- Payment processing
- User profile management
- Address management
- Cookie-based authentication

---

## Missing Features & Technical Debt

### 1. State Management
- No global state management (Provider, Riverpod, Bloc, GetX)
- Cart state not persisted
- User authentication state not managed
- Each screen manages its own state

### 2. Navigation
- No named routes
- No route guards for authentication
- Manual Navigator.push calls everywhere

### 3. API Integration
- No authentication token handling
- No HTTP interceptors
- No error handling/retry logic
- No loading states UI
- No offline support
- Hardcoded localhost URL

### 4. Data Models
- Product model doesn't match backend schema
- No Category model
- No User model
- No Cart model
- No Order model
- No Address model
- No Variant model

### 5. UI/UX
- No error messages displayed to user
- No loading indicators during API calls
- Search bar not functional
- Category filtering not implemented
- Bottom navigation doesn't change content
- No empty states
- No pull-to-refresh

### 6. Features Not Implemented
- User registration
- User login/logout
- Product variants selection
- Add to cart functionality
- Wishlist functionality
- Checkout flow
- Order history
- User profile editing
- Address management
- Payment integration
- Product reviews (using static data)
- Image zoom/gallery
- Filter by price/rating
- Sort products

---

## Backend API Mismatch

The frontend Product model does NOT match the backend schema:

### Frontend Model:
```dart
{
  id, name, description, category (string),
  price, discount, images (List<String>), stock
}
```

### Backend Schema (from USER_API_DOCUMENTATION.md):
```json
{
  id, name, description, slug, category_id (number),
  category_name, price, compare_at_price, discount,
  status, sku, created_at, updated_at
}
```

### Missing in Frontend:
- `slug`
- `category_id` (uses string instead)
- `category_name`
- `compare_at_price`
- `status`
- `sku`
- `created_at`, `updated_at`
- Variants array
- Media array with is_primary flag

---

## Recommended Next Steps

### Priority 1 - Core Functionality
1. **Implement State Management** (Provider/Riverpod)
   - User authentication state
   - Cart state
   - Product state

2. **Fix Product Model** to match backend schema
   - Add missing fields
   - Create separate Variant and Media models
   - Update API service responses

3. **Implement Authentication**
   - Signup API integration
   - Login API integration
   - Cookie/token storage
   - Auth state persistence

4. **Cart Functionality**
   - Add to cart API
   - Get cart API
   - Update/remove items
   - Cart badge counter

### Priority 2 - User Experience
5. **Error Handling**
   - Display API errors to user
   - Network error handling
   - Retry mechanisms

6. **Loading States**
   - Shimmer loading for products
   - Progress indicators
   - Pull to refresh

7. **Search & Filters**
   - Product search API integration
   - Category filtering
   - Price range filtering
   - Sort options

### Priority 3 - Advanced Features
8. **Wishlist**
9. **Checkout Flow**
10. **Order History**
11. **User Profile**
12. **Product Variants Selection**
13. **Reviews & Ratings**

---

## File Summary

### Total Files: 14 Dart files

**Core:** 1 file (validators)
**Models:** 1 file (Product)
**Services:** 1 file (ApiService)
**Screens:** 6 files (3 auth, 2 home, 1 cart)
**Widgets:** 4 files (button, textfield, product card, category chip)
**Main:** 1 file (app entry)

### Lines of Code Estimate: ~1,100 lines

---

## Design Patterns Used

- **Stateful/Stateless Widgets** - Standard Flutter pattern
- **Repository Pattern** - ApiService acts as data layer (partial)
- **Model Classes** - Product model with JSON serialization

### NOT Using:
- State management pattern (Provider, Bloc, etc.)
- Dependency Injection
- Clean Architecture layers
- MVVM or MVC patterns

---

## Notes for Future Development

1. **Environment Configuration**: Hardcoded localhost URL should be moved to environment config
2. **Type Safety**: Consider using freezed/json_serializable for models
3. **API Client**: Replace basic http with Dio for better features
4. **Routing**: Implement go_router or auto_route
5. **Testing**: No tests written yet, should add unit/widget/integration tests
6. **Localization**: No i18n support, only English
7. **Theme**: Basic Material 3 theme, could be enhanced
8. **Accessibility**: No specific accessibility considerations
9. **Performance**: No image caching, lazy loading not implemented
10. **Security**: No input sanitization, API keys not secured

---

## Current Development Status

**Phase:** Early Development / Prototype
**Completion:** ~20% of full e-commerce app
**Backend Integration:** Minimal (only product fetching)
**Production Ready:** No

### Working Features:
✅ Display products list
✅ View product details
✅ UI for login/signup (no backend)
✅ UI for cart (dummy data)

### Broken/Incomplete:
❌ User authentication
❌ Real cart functionality
❌ Search and filters
❌ Wishlist
❌ Orders/Checkout
❌ Profile management
❌ Reviews system
❌ Payment integration

---

*Last Updated: Based on current codebase analysis*

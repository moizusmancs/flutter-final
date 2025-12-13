# API Endpoints Fix

## Issue
Getting 404 errors when calling signup/login endpoints from Flutter app.

## Root Cause
The API endpoint paths in `lib/core/constants/api_constants.dart` didn't match the backend route mounting.

## Backend Route Structure
From `backend/src/index.ts`:

```javascript
// User routes
app.use("/api/v1/users/auth", userAuthRoutes);
app.use("/api/v1/users/profile", userProfileRoutes);
app.use("/api/v1/users/addresses", userAddressRoutes);
app.use("/api/v1/users/wishlist", userWishlistRoutes);
app.use("/api/v1/users/cart", userCartRoutes);
app.use("/api/v1/users/orders", userOrderRoutes);
app.use("/api/v1/users/payments", userPaymentRoutes);
app.use("/api/v1/users/coupons", userCouponRoutes);

// Public routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
```

## Fixed Endpoints

### Before (WRONG):
```dart
// Auth endpoints
static const String signup = '/auth/signup';
static const String login = '/auth/login';
static const String logout = '/auth/logout';
```

This would result in: `http://localhost:4000/api/v1/auth/signup` → **404 Error**

### After (CORRECT):
```dart
// Auth endpoints
static const String signup = '/users/auth/signup';
static const String login = '/users/auth/login';
static const String logout = '/users/auth/logout';
```

This results in: `http://localhost:4000/api/v1/users/auth/signup` → **✅ Works**

## Complete Corrected Endpoints

```dart
class ApiConstants {
  static const String baseUrl = 'http://localhost:4000/api/v1';

  // Auth endpoints
  static const String signup = '/users/auth/signup';
  static const String login = '/users/auth/login';
  static const String logout = '/users/auth/logout';

  // Profile endpoints
  static const String profile = '/users/profile';
  static const String updateProfile = '/users/profile';
  static const String changePassword = '/users/profile/password';

  // Product endpoints (no /users prefix)
  static const String products = '/products';
  static const String productSearch = '/products/search';

  // Category endpoints (no /users prefix)
  static const String categories = '/categories';

  // Cart endpoints
  static const String cart = '/users/cart';
  static const String clearCart = '/users/cart/clear';

  // Wishlist endpoints
  static const String wishlist = '/users/wishlist';

  // Order endpoints
  static const String orders = '/users/orders';

  // Address endpoints
  static const String addresses = '/users/addresses';

  // Payment endpoints
  static const String createPaymentIntent = '/users/payments/create-payment-intent';
  static const String confirmPayment = '/users/payments/confirm';

  // Coupon endpoints
  static const String validateCoupon = '/users/coupons/validate';
}
```

## Additional Fixes

### Improved Error Handling in AuthRepository

Added a helper method `_extractErrorMessage()` to properly handle DioException errors:

```dart
String _extractErrorMessage(DioException e) {
  if (e.response != null) {
    final data = e.response!.data;

    // Try to extract message from response
    if (data is Map<String, dynamic>) {
      return data['message']?.toString() ??
             data['error']?.toString() ??
             'Request failed with status ${e.response!.statusCode}';
    }

    return 'Request failed with status ${e.response!.statusCode}';
  }

  // Network errors
  if (e.type == DioExceptionType.connectionTimeout) {
    return 'Connection timeout. Please check your internet connection.';
  } else if (e.type == DioExceptionType.receiveTimeout) {
    return 'Server is taking too long to respond.';
  } else if (e.type == DioExceptionType.connectionError) {
    return 'Cannot connect to server. Please check your internet connection.';
  }

  return e.message ?? 'An unexpected error occurred';
}
```

This fixes the type error: `type 'String' is not a subtype of type 'int' of 'index'`

## Testing

Now you should be able to:

1. **Signup**: Enter user details and tap "Sign Up"
   - Full API URL: `http://localhost:4000/api/v1/users/auth/signup`

2. **Login**: Enter email/password and tap "Login"
   - Full API URL: `http://localhost:4000/api/v1/users/auth/login`

3. **Logout**: Call logout method
   - Full API URL: `http://localhost:4000/api/v1/users/auth/logout`

## Files Modified

1. `lib/core/constants/api_constants.dart` - Fixed all endpoint paths
2. `lib/data/repositories/auth_repository.dart` - Improved error handling

---

*Issue resolved: API endpoints now correctly match backend routing structure.*

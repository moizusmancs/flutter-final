class ApiConstants {
  // Base URL - change to your production URL in production
  static const String baseUrl = 'http://localhost:4000/api/v1';

  // Auth endpoints
  static const String signup = '/users/auth/signup';
  static const String login = '/users/auth/login';
  static const String logout = '/users/auth/logout';

  // Profile endpoints
  static const String profile = '/users/profile';
  static const String updateProfile = '/users/profile';
  static const String changePassword = '/users/profile/password';

  // Product endpoints
  static const String products = '/products';
  static const String productSearch = '/products/search';

  // Category endpoints
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

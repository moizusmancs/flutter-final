class ApiConstants {
  // Base URL - change to your production URL in production
  static const String baseUrl = 'http://localhost:4000/api/v1';
  // static const String baseUrl = 'http://192.168.18.24:4000/api/v1';

  // Stripe Configuration
  // Get your publishable key from: https://dashboard.stripe.com/test/apikeys
  static const String stripePublishableKey = 'pk_test_51RMPIBE3ebK9kAcMikNb9KFT2hcBEQJZAXbkRM0aQ84pH79gouYwexJ1PCMbblu2AENS6QWVLJjdtMvwbykBFEyT00ETjbwAxQ';

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
  static const String createPaymentIntent = '/users/payments/initiate';
  static const String confirmPayment = '/users/payments/verify';

  // Coupon endpoints
  static const String validateCoupon = '/users/coupons/validate';

  // Virtual Try-On endpoints
  static const String vtonUploadUrl = '/users/vton/upload-url';
  static const String vtonSaveUserImage = '/users/vton/save-user-image';
  static const String vtonUserImages = '/users/vton/user-images';
  static const String vtonGenerate = '/users/vton/generate';
  static const String vtonStatus = '/users/vton/status';
  static const String vtonHistory = '/users/vton/history';
  static const String vtonDeleteUserImage = '/users/vton/user-image';
}

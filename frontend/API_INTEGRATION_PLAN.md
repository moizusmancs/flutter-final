# Flutter Backend API Integration Plan

## Overview

This document outlines the step-by-step plan to integrate the backend APIs (documented in `backend/USER_API_DOCUMENTATION.md`) with the Flutter frontend application.

---

## Phase 1: Foundation Setup (Week 1)

### 1.1 Install Required Packages

Add to `pubspec.yaml`:

```yaml
dependencies:
  # State Management
  provider: ^6.1.1  # or riverpod/bloc based on preference

  # HTTP & API
  dio: ^5.4.0  # Better than http package
  cookie_jar: ^4.0.8
  dio_cookie_manager: ^3.1.1

  # Local Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0

  # JSON Serialization
  json_annotation: ^4.8.1

  # UI Utilities
  flutter_dotenv: ^5.1.0  # Environment variables

dev_dependencies:
  build_runner: ^2.4.7
  json_serializable: ^6.7.1
```

**Why these packages:**
- **Dio**: Advanced HTTP client with interceptors, better error handling
- **Cookie Manager**: Handle HTTP-only cookies from backend
- **Provider**: State management for auth, cart, etc.
- **Secure Storage**: Store sensitive data (tokens if needed)
- **JSON Serializable**: Auto-generate fromJson/toJson

---

### 1.2 Project Structure Reorganization

Create new folder structure:

```
lib/
├── core/
│   ├── constants/
│   │   ├── api_constants.dart       # API endpoints
│   │   └── app_constants.dart       # App-wide constants
│   ├── network/
│   │   ├── dio_client.dart          # Dio configuration
│   │   ├── api_interceptor.dart     # Request/response interceptors
│   │   └── api_result.dart          # API response wrapper
│   ├── errors/
│   │   ├── exceptions.dart          # Custom exceptions
│   │   └── failures.dart            # Error handling
│   └── validators.dart              # (existing)
│
├── data/
│   ├── models/
│   │   ├── user_model.dart          # NEW
│   │   ├── product_model.dart       # UPDATE (fix schema)
│   │   ├── category_model.dart      # NEW
│   │   ├── cart_model.dart          # NEW
│   │   ├── order_model.dart         # NEW
│   │   ├── address_model.dart       # NEW
│   │   ├── variant_model.dart       # NEW
│   │   └── wishlist_model.dart      # NEW
│   │
│   ├── repositories/
│   │   ├── auth_repository.dart     # NEW
│   │   ├── product_repository.dart  # NEW
│   │   ├── cart_repository.dart     # NEW
│   │   ├── order_repository.dart    # NEW
│   │   └── user_repository.dart     # NEW
│   │
│   └── services/
│       ├── api_service.dart         # UPDATE (replace with Dio)
│       ├── auth_service.dart        # NEW
│       └── storage_service.dart     # NEW (local storage)
│
├── providers/
│   ├── auth_provider.dart           # NEW
│   ├── cart_provider.dart           # NEW
│   ├── product_provider.dart        # NEW
│   ├── wishlist_provider.dart       # NEW
│   └── user_provider.dart           # NEW
│
├── screens/                         # (existing, will update)
├── widgets/                         # (existing)
└── main.dart                        # UPDATE (add providers)
```

---

### 1.3 Setup Dio Client with Cookie Support

**File:** `lib/core/network/dio_client.dart`

```dart
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:path_provider/path_provider.dart';

class DioClient {
  late Dio _dio;
  late CookieJar _cookieJar;

  DioClient() {
    _dio = Dio(BaseOptions(
      baseUrl: 'http://localhost:4000/api/v1',  // Use env variable in production
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _initializeCookieJar();
    _setupInterceptors();
  }

  Future<void> _initializeCookieJar() async {
    final appDocDir = await getApplicationDocumentsDirectory();
    final cookiePath = '${appDocDir.path}/.cookies/';
    _cookieJar = PersistCookieJar(storage: FileStorage(cookiePath));
    _dio.interceptors.add(CookieManager(_cookieJar));
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          print('REQUEST[${options.method}] => PATH: ${options.path}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print('RESPONSE[${response.statusCode}] => DATA: ${response.data}');
          return handler.next(response);
        },
        onError: (error, handler) {
          print('ERROR[${error.response?.statusCode}] => MESSAGE: ${error.message}');
          return handler.next(error);
        },
      ),
    );
  }

  Dio get dio => _dio;

  Future<void> clearCookies() async {
    await _cookieJar.deleteAll();
  }
}
```

---

### 1.4 Create API Result Wrapper

**File:** `lib/core/network/api_result.dart`

```dart
class ApiResult<T> {
  final bool success;
  final String? message;
  final T? data;
  final String? error;

  ApiResult({
    required this.success,
    this.message,
    this.data,
    this.error,
  });

  factory ApiResult.success(T data, {String? message}) {
    return ApiResult(
      success: true,
      data: data,
      message: message,
    );
  }

  factory ApiResult.failure(String error) {
    return ApiResult(
      success: false,
      error: error,
    );
  }
}
```

---

## Phase 2: Authentication Implementation (Week 1-2)

### Priority: HIGHEST - Required for all authenticated routes

### 2.1 Create User Model

**File:** `lib/data/models/user_model.dart`

```dart
import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class User {
  final int id;
  final String fullname;
  final String email;
  final String phone;
  @JsonKey(name: 'created_at')
  final String? createdAt;
  @JsonKey(name: 'updated_at')
  final String? updatedAt;

  User({
    required this.id,
    required this.fullname,
    required this.email,
    required this.phone,
    this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}
```

Run: `flutter pub run build_runner build`

---

### 2.2 Create Auth Repository

**File:** `lib/data/repositories/auth_repository.dart`

```dart
import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/api_result.dart';
import '../models/user_model.dart';

class AuthRepository {
  final DioClient _dioClient;

  AuthRepository(this._dioClient);

  // POST /auth/signup
  Future<ApiResult<User>> signup({
    required String fullname,
    required String email,
    required String password,
    required String phone,
  }) async {
    try {
      final response = await _dioClient.dio.post('/auth/signup', data: {
        'fullname': fullname,
        'email': email,
        'password': password,
        'phone': phone,
      });

      if (response.data['success']) {
        final user = User.fromJson(response.data['user']);
        return ApiResult.success(user, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Signup failed');
    }
  }

  // POST /auth/login
  Future<ApiResult<User>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dioClient.dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.data['success']) {
        final user = User.fromJson(response.data['user']);
        return ApiResult.success(user, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Login failed');
    }
  }

  // POST /auth/logout
  Future<ApiResult<void>> logout() async {
    try {
      final response = await _dioClient.dio.post('/auth/logout');

      if (response.data['success']) {
        await _dioClient.clearCookies();
        return ApiResult.success(null, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Logout failed');
    }
  }
}
```

---

### 2.3 Create Auth Provider (State Management)

**File:** `lib/providers/auth_provider.dart`

```dart
import 'package:flutter/foundation.dart';
import '../data/models/user_model.dart';
import '../data/repositories/auth_repository.dart';
import '../core/network/api_result.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository;

  User? _user;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _errorMessage;

  AuthProvider(this._authRepository);

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<bool> signup({
    required String fullname,
    required String email,
    required String password,
    required String phone,
  }) async {
    _setLoading(true);

    final result = await _authRepository.signup(
      fullname: fullname,
      email: email,
      password: password,
      phone: phone,
    );

    if (result.success && result.data != null) {
      _user = result.data;
      _isAuthenticated = true;
      _errorMessage = null;
      _setLoading(false);
      return true;
    } else {
      _errorMessage = result.error;
      _setLoading(false);
      return false;
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _setLoading(true);

    final result = await _authRepository.login(
      email: email,
      password: password,
    );

    if (result.success && result.data != null) {
      _user = result.data;
      _isAuthenticated = true;
      _errorMessage = null;
      _setLoading(false);
      return true;
    } else {
      _errorMessage = result.error;
      _setLoading(false);
      return false;
    }
  }

  Future<void> logout() async {
    _setLoading(true);
    await _authRepository.logout();
    _user = null;
    _isAuthenticated = false;
    _setLoading(false);
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
```

---

### 2.4 Update Login Screen to Use Auth Provider

**File:** `lib/screens/auth/login_screen.dart` (UPDATE)

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/validators.dart';
import '../home/home_screen.dart';
import 'signup_choice_screen.dart';

class LoginScreen extends StatefulWidget {
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();

    final success = await authProvider.login(
      email: emailController.text,
      password: passwordController.text,
    );

    if (success && mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'Login failed'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextField(
                controller: emailController,
                decoration: InputDecoration(labelText: 'Email'),
              ),
              TextField(
                controller: passwordController,
                decoration: InputDecoration(labelText: 'Password'),
                obscureText: true,
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: authProvider.isLoading ? null : _login,
                child: authProvider.isLoading
                    ? CircularProgressIndicator()
                    : Text('Login'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => SignupChoiceScreen()),
                  );
                },
                child: Text('New user? Create an account'),
              )
            ],
          ),
        ),
      ),
    );
  }
}
```

---

### 2.5 Update main.dart with Providers

**File:** `lib/main.dart` (UPDATE)

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/network/dio_client.dart';
import 'data/repositories/auth_repository.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/login_screen.dart';

void main() {
  final dioClient = DioClient();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(AuthRepository(dioClient)),
        ),
        // Add more providers here later
      ],
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VougeAR',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primarySwatch: Colors.blue,
      ),
      home: LoginScreen(),
    );
  }
}
```

---

## Phase 3: Product & Category Integration (Week 2)

### 3.1 Update Product Model to Match Backend

**File:** `lib/data/models/product_model.dart` (REPLACE)

```dart
import 'package:json_annotation/json_annotation.dart';

part 'product_model.g.dart';

@JsonSerializable()
class Product {
  final int id;
  final String name;
  final String description;
  final String? slug;
  @JsonKey(name: 'category_id')
  final int categoryId;
  @JsonKey(name: 'category_name')
  final String? categoryName;
  final double price;
  @JsonKey(name: 'compare_at_price')
  final double? compareAtPrice;
  final double? discount;
  final String? status;
  final String? sku;
  @JsonKey(name: 'created_at')
  final String? createdAt;
  @JsonKey(name: 'updated_at')
  final String? updatedAt;

  Product({
    required this.id,
    required this.name,
    required this.description,
    this.slug,
    required this.categoryId,
    this.categoryName,
    required this.price,
    this.compareAtPrice,
    this.discount,
    this.status,
    this.sku,
    this.createdAt,
    this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
  Map<String, dynamic> toJson() => _$ProductToJson(this);

  // Helper for displaying price
  double get finalPrice => price - (price * (discount ?? 0) / 100);
}
```

---

### 3.2 Create Variant Model

**File:** `lib/data/models/variant_model.dart`

```dart
import 'package:json_annotation/json_annotation.dart';

part 'variant_model.g.dart';

@JsonSerializable()
class Variant {
  final int id;
  @JsonKey(name: 'product_id')
  final int productId;
  final String? size;
  final String? color;
  final int stock;
  @JsonKey(name: 'additional_price')
  final double? additionalPrice;

  Variant({
    required this.id,
    required this.productId,
    this.size,
    this.color,
    required this.stock,
    this.additionalPrice,
  });

  factory Variant.fromJson(Map<String, dynamic> json) => _$VariantFromJson(json);
  Map<String, dynamic> toJson() => _$VariantToJson(this);
}
```

---

### 3.3 Create Category Model

**File:** `lib/data/models/category_model.dart`

```dart
import 'package:json_annotation/json_annotation.dart';

part 'category_model.g.dart';

@JsonSerializable()
class Category {
  final int id;
  final String name;
  final String? slug;
  final String? description;
  @JsonKey(name: 'parent_id')
  final int? parentId;
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  final List<Category>? subcategories;
  @JsonKey(name: 'product_count')
  final int? productCount;

  Category({
    required this.id,
    required this.name,
    this.slug,
    this.description,
    this.parentId,
    this.imageUrl,
    this.subcategories,
    this.productCount,
  });

  factory Category.fromJson(Map<String, dynamic> json) => _$CategoryFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryToJson(this);
}
```

---

### 3.4 Create Product Repository

**File:** `lib/data/repositories/product_repository.dart`

```dart
import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/api_result.dart';
import '../models/product_model.dart';
import '../models/variant_model.dart';
import '../models/category_model.dart';

class ProductRepository {
  final DioClient _dioClient;

  ProductRepository(this._dioClient);

  // GET /products
  Future<ApiResult<List<Product>>> getProducts({
    int page = 1,
    int limit = 10,
    String? sort,
    int? categoryId,
    double? minPrice,
    double? maxPrice,
  }) async {
    try {
      final queryParams = {
        'page': page,
        'limit': limit,
        if (sort != null) 'sort': sort,
        if (categoryId != null) 'category_id': categoryId,
        if (minPrice != null) 'min_price': minPrice,
        if (maxPrice != null) 'max_price': maxPrice,
      };

      final response = await _dioClient.dio.get('/products', queryParameters: queryParams);

      if (response.data['success']) {
        final products = (response.data['products'] as List)
            .map((json) => Product.fromJson(json))
            .toList();
        return ApiResult.success(products);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Failed to fetch products');
    }
  }

  // GET /products/one/:id
  Future<ApiResult<Product>> getProductById(int id) async {
    try {
      final response = await _dioClient.dio.get('/products/one/$id');

      if (response.data['success']) {
        final product = Product.fromJson(response.data['product']);
        return ApiResult.success(product);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Product not found');
    }
  }

  // GET /products/:id/variants
  Future<ApiResult<List<Variant>>> getProductVariants(int productId) async {
    try {
      final response = await _dioClient.dio.get('/products/$productId/variants');

      if (response.data['success']) {
        final variants = (response.data['variants'] as List)
            .map((json) => Variant.fromJson(json))
            .toList();
        return ApiResult.success(variants);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Failed to fetch variants');
    }
  }

  // GET /products/search
  Future<ApiResult<List<Product>>> searchProducts({
    required String query,
    int page = 1,
    int limit = 10,
    int? categoryId,
    double? minPrice,
    double? maxPrice,
  }) async {
    try {
      final queryParams = {
        'q': query,
        'page': page,
        'limit': limit,
        if (categoryId != null) 'category_id': categoryId,
        if (minPrice != null) 'min_price': minPrice,
        if (maxPrice != null) 'max_price': maxPrice,
      };

      final response = await _dioClient.dio.get('/products/search', queryParameters: queryParams);

      if (response.data['success']) {
        final products = (response.data['products'] as List)
            .map((json) => Product.fromJson(json))
            .toList();
        return ApiResult.success(products);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Search failed');
    }
  }

  // GET /categories
  Future<ApiResult<List<Category>>> getCategories() async {
    try {
      final response = await _dioClient.dio.get('/categories');

      if (response.data['success']) {
        final categories = (response.data['categories'] as List)
            .map((json) => Category.fromJson(json))
            .toList();
        return ApiResult.success(categories);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Failed to fetch categories');
    }
  }
}
```

---

## Phase 4: Cart Implementation (Week 3)

### 4.1 Create Cart Model

**File:** `lib/data/models/cart_model.dart`

```dart
import 'package:json_annotation/json_annotation.dart';
import 'product_model.dart';
import 'variant_model.dart';

part 'cart_model.g.dart';

@JsonSerializable()
class CartItem {
  final int id;
  @JsonKey(name: 'user_id')
  final int userId;
  @JsonKey(name: 'product_id')
  final int productId;
  @JsonKey(name: 'variant_id')
  final int? variantId;
  final int quantity;
  final Product? product;
  final Variant? variant;
  @JsonKey(name: 'created_at')
  final String? createdAt;
  @JsonKey(name: 'updated_at')
  final String? updatedAt;

  CartItem({
    required this.id,
    required this.userId,
    required this.productId,
    this.variantId,
    required this.quantity,
    this.product,
    this.variant,
    this.createdAt,
    this.updatedAt,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) => _$CartItemFromJson(json);
  Map<String, dynamic> toJson() => _$CartItemToJson(this);
}

@JsonSerializable()
class Cart {
  final List<CartItem> items;
  final double total;

  Cart({required this.items, required this.total});

  factory Cart.fromJson(Map<String, dynamic> json) => Cart(
    items: (json['cart'] as List).map((item) => CartItem.fromJson(item)).toList(),
    total: (json['total'] as num).toDouble(),
  );
}
```

---

### 4.2 Create Cart Repository

**File:** `lib/data/repositories/cart_repository.dart`

```dart
import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/api_result.dart';
import '../models/cart_model.dart';

class CartRepository {
  final DioClient _dioClient;

  CartRepository(this._dioClient);

  // GET /cart
  Future<ApiResult<Cart>> getCart() async {
    try {
      final response = await _dioClient.dio.get('/cart');

      if (response.data['success']) {
        final cart = Cart.fromJson(response.data);
        return ApiResult.success(cart);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Failed to fetch cart');
    }
  }

  // POST /cart
  Future<ApiResult<CartItem>> addToCart({
    required int productId,
    int? variantId,
    required int quantity,
  }) async {
    try {
      final response = await _dioClient.dio.post('/cart', data: {
        'product_id': productId,
        if (variantId != null) 'variant_id': variantId,
        'quantity': quantity,
      });

      if (response.data['success']) {
        final cartItem = CartItem.fromJson(response.data['cart_item']);
        return ApiResult.success(cartItem, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Failed to add to cart');
    }
  }

  // PUT /cart/:id
  Future<ApiResult<CartItem>> updateCartItem(int id, int quantity) async {
    try {
      final response = await _dioClient.dio.put('/cart/$id', data: {
        'quantity': quantity,
      });

      if (response.data['success']) {
        final cartItem = CartItem.fromJson(response.data['cart_item']);
        return ApiResult.success(cartItem);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Failed to update cart');
    }
  }

  // DELETE /cart/:id
  Future<ApiResult<void>> removeFromCart(int id) async {
    try {
      final response = await _dioClient.dio.delete('/cart/$id');

      if (response.data['success']) {
        return ApiResult.success(null, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Failed to remove from cart');
    }
  }

  // DELETE /cart/clear
  Future<ApiResult<void>> clearCart() async {
    try {
      final response = await _dioClient.dio.delete('/cart/clear');

      if (response.data['success']) {
        return ApiResult.success(null, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message']);
      }
    } on DioException catch (e) {
      return ApiResult.failure(e.response?.data['message'] ?? 'Failed to clear cart');
    }
  }
}
```

---

## Phase 5: Wishlist, Orders, and Profile (Week 4)

Follow similar patterns for:

### 5.1 Wishlist
- Create `wishlist_model.dart`
- Create `wishlist_repository.dart`
- Create `wishlist_provider.dart`
- Update UI screens

### 5.2 Orders
- Create `order_model.dart`
- Create `order_repository.dart`
- Create `order_provider.dart`
- Create checkout flow screens

### 5.3 User Profile
- Create `address_model.dart`
- Create `user_repository.dart`
- Create `user_provider.dart`
- Create profile/address screens

---

## Implementation Priority & Timeline

### Week 1: Foundation
- [x] Install packages
- [x] Setup Dio client with cookies
- [x] Create folder structure
- [x] Implement authentication (signup/login/logout)

### Week 2: Products & Categories
- [ ] Update Product model
- [ ] Create Variant & Category models
- [ ] Implement product listing
- [ ] Implement product details
- [ ] Implement search & filters
- [ ] Implement category browsing

### Week 3: Shopping Features
- [ ] Implement cart functionality
- [ ] Add to cart from product details
- [ ] Cart screen with quantity controls
- [ ] Implement wishlist
- [ ] Add/remove from wishlist

### Week 4: Checkout & Profile
- [ ] Address management
- [ ] Order creation flow
- [ ] Payment integration
- [ ] Order history
- [ ] User profile editing
- [ ] Password change

---

## Screen Implementation Order

### Phase 1 (Essential)
1. ✅ **Login Screen** - Already exists, integrate API
2. ✅ **Signup Screen** - Create and integrate API
3. **Home Screen** - Update with real products
4. **Product Detail Screen** - Update with variants
5. **Cart Screen** - Connect to API

### Phase 2 (Important)
6. **Category Screen** - Browse by category
7. **Search Screen** - Product search
8. **Wishlist Screen** - Manage favorites
9. **Profile Screen** - User info

### Phase 3 (Complete Experience)
10. **Address Management Screen** - CRUD addresses
11. **Checkout Screen** - Order placement
12. **Order History Screen** - Past orders
13. **Order Details Screen** - Track order
14. **Payment Screen** - Payment processing

---

## Testing Checklist

### Authentication
- [ ] Signup with valid data
- [ ] Signup with existing email (error handling)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Logout clears cookies
- [ ] Session persists across app restarts

### Products
- [ ] Fetch products list
- [ ] Pagination works
- [ ] Product details load
- [ ] Variants display correctly
- [ ] Search returns results
- [ ] Category filtering works

### Cart
- [ ] Add to cart (requires auth)
- [ ] Update quantity
- [ ] Remove from cart
- [ ] Cart persists across sessions
- [ ] Total calculation correct

### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Validation errors display correctly
- [ ] Loading states show spinners
- [ ] Failed requests can be retried

---

## Key Considerations

### 1. Cookie Management
- Dio with CookieManager handles HTTP-only cookies automatically
- Cookies persist across app restarts via PersistCookieJar
- Clear cookies on logout

### 2. Error Handling
- Use try-catch for all API calls
- Display user-friendly error messages
- Log errors for debugging

### 3. State Management
- Provider for global state (auth, cart, wishlist)
- Local state for UI-only changes
- Notify listeners on data changes

### 4. Performance
- Implement pagination for lists
- Cache product images
- Lazy load categories
- Debounce search queries

### 5. Security
- Never log sensitive data (passwords, tokens)
- Use HTTPS in production
- Validate all user inputs
- Handle session expiry gracefully

---

## Next Steps

1. **Start with Phase 1** - Foundation setup and authentication
2. **Test authentication thoroughly** before moving to products
3. **Implement one feature at a time** - Don't try to do everything at once
4. **Test on real device** - Cookies behave differently on emulator vs device
5. **Handle edge cases** - Network errors, empty states, loading states

---

*This plan provides a structured approach to integrate all backend APIs with the Flutter app. Follow the phases sequentially for best results.*

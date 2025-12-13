import 'package:flutter/foundation.dart';
import '../data/models/user_model.dart';
import '../data/repositories/auth_repository.dart';
import '../data/repositories/profile_repository.dart';
import '../core/storage/local_storage_service.dart';
import '../core/network/dio_client.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository;
  final ProfileRepository _profileRepository;
  final DioClient _dioClient;

  // 🔧 Set to false to use real API with token-based auth
  static const bool MOCK_AUTH_MODE = false;

  User? _user;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  bool _isInitialized = false;
  String? _errorMessage;

  AuthProvider(this._authRepository, this._profileRepository, this._dioClient);

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  bool get isInitialized => _isInitialized;
  String? get errorMessage => _errorMessage;
  DioClient get dioClient => _dioClient;

  // Check if user is logged in on app startup
  Future<void> checkAuth() async {
    _isLoading = true;

    try {
      final isLoggedIn = await LocalStorageService.isLoggedIn();
      if (isLoggedIn) {
        final user = await LocalStorageService.getUser();
        final token = await LocalStorageService.getToken();

        if (user != null && token != null) {
          _user = user;
          _isAuthenticated = true;
          _dioClient.setAuthToken(token);

          // Fetch fresh profile data from server (but don't block on it)
          _fetchAndUpdateProfile().catchError((e) {
            print('Error refreshing profile on startup: $e');
            // Continue with cached user data
          });
        }
      }
    } catch (e) {
      print('Error checking auth: $e');
    }

    _isInitialized = true;
    _isLoading = false;
    notifyListeners();
  }

  // Fetch profile from server and update local state
  Future<void> _fetchAndUpdateProfile() async {
    try {
      final result = await _profileRepository.getProfile();

      if (result.success && result.data != null) {
        _user = result.data;
        // Update local storage with fresh profile data
        await LocalStorageService.saveUser(result.data!);
        notifyListeners();
      } else if (result.error?.contains('401') == true || result.error?.contains('Authentication') == true) {
        // Token is invalid or expired - logout user
        print('Token expired or invalid, logging out');
        await logout();
      }
    } catch (e) {
      print('Error fetching profile: $e');
      // Check if it's an authentication error
      if (e.toString().contains('401') || e.toString().contains('Authentication')) {
        print('Token expired or invalid, logging out');
        await logout();
      }
      // Don't throw error for other cases - we still have cached user data
    }
  }

  Future<bool> signup({
    required String fullname,
    required String email,
    required String password,
    required String phone,
  }) async {
    _setLoading(true);

    // 🔧 MOCK MODE: Simulate successful signup without API call
    if (MOCK_AUTH_MODE) {
      await Future.delayed(const Duration(seconds: 1));

      _user = User(
        id: 999,
        fullname: fullname,
        email: email,
        phone: phone,
        createdAt: DateTime.now().toIso8601String(),
        updatedAt: DateTime.now().toIso8601String(),
      );
      _isAuthenticated = true;
      _errorMessage = null;
      _setLoading(false);
      print('🔧 MOCK AUTH: Signup successful (no real API call)');
      return true;
    }

    // Real API call
    final result = await _authRepository.signup(
      fullname: fullname,
      email: email,
      password: password,
      phone: phone,
    );

    if (result.success && result.data != null) {
      final authResponse = result.data!;
      _user = authResponse.user;
      _isAuthenticated = true;
      _errorMessage = null;

      // Save to local storage
      await LocalStorageService.saveToken(authResponse.token);
      await LocalStorageService.saveUser(authResponse.user);

      // Set token in Dio headers
      _dioClient.setAuthToken(authResponse.token);

      // Fetch complete profile from server
      await _fetchAndUpdateProfile();

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

    // 🔧 MOCK MODE: Simulate successful login without API call
    if (MOCK_AUTH_MODE) {
      await Future.delayed(const Duration(seconds: 1));

      _user = User(
        id: 999,
        fullname: 'Mock User',
        email: email,
        phone: '1234567890',
        createdAt: DateTime.now().toIso8601String(),
        updatedAt: DateTime.now().toIso8601String(),
      );
      _isAuthenticated = true;
      _errorMessage = null;
      _setLoading(false);
      print('🔧 MOCK AUTH: Login successful (no real API call)');
      return true;
    }

    // Real API call
    final result = await _authRepository.login(
      email: email,
      password: password,
    );

    if (result.success && result.data != null) {
      final authResponse = result.data!;
      _user = authResponse.user;
      _isAuthenticated = true;
      _errorMessage = null;

      // Save to local storage
      await LocalStorageService.saveToken(authResponse.token);
      await LocalStorageService.saveUser(authResponse.user);

      // Set token in Dio headers
      _dioClient.setAuthToken(authResponse.token);

      // Fetch complete profile from server
      await _fetchAndUpdateProfile();

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

    // Call logout API (optional, just to log the event on server)
    if (!MOCK_AUTH_MODE) {
      await _authRepository.logout();
    }

    // Clear local storage
    await LocalStorageService.clearAuthData();

    // Remove token from Dio headers
    _dioClient.removeAuthToken();

    // Clear local state
    _user = null;
    _isAuthenticated = false;
    _errorMessage = null;

    _setLoading(false);
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  // Update user after profile changes
  Future<void> updateUser(User updatedUser) async {
    _user = updatedUser;
    await LocalStorageService.saveUser(updatedUser);
    notifyListeners();
  }
}

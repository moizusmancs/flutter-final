import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/api_result.dart';
import '../../core/constants/api_constants.dart';
import '../models/auth_response.dart';

class AuthRepository {
  final DioClient _dioClient;

  AuthRepository(this._dioClient);

  // POST /auth/signup
  Future<ApiResult<AuthResponse>> signup({
    required String fullname,
    required String email,
    required String password,
    required String phone,
  }) async {
    try {
      final response = await _dioClient.dio.post(ApiConstants.signup, data: {
        'fullname': fullname,
        'email': email,
        'password': password,
        'phone': phone,
      });

      if (response.data['success'] == true) {
        final authResponse = AuthResponse.fromJson(response.data);
        return ApiResult.success(authResponse, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Signup failed');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Signup failed: ${e.toString()}');
    }
  }

  // POST /auth/login
  Future<ApiResult<AuthResponse>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dioClient.dio.post(ApiConstants.login, data: {
        'email': email,
        'password': password,
      });

      if (response.data['success'] == true) {
        final authResponse = AuthResponse.fromJson(response.data);
        return ApiResult.success(authResponse, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Login failed');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Login failed: ${e.toString()}');
    }
  }

  // POST /auth/logout
  Future<ApiResult<void>> logout() async {
    try {
      final response = await _dioClient.dio.post(ApiConstants.logout);

      if (response.data['success'] == true) {
        return ApiResult.success(null, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Logout failed');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Logout failed: ${e.toString()}');
    }
  }

  // Helper method to extract error message from DioException
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
}

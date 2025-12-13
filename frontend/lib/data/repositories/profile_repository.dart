import 'package:frontend/core/network/dio_client.dart';
import 'package:frontend/data/models/user_model.dart';
import 'package:frontend/core/network/api_result.dart';

class ProfileRepository {
  final DioClient _dioClient;

  ProfileRepository(this._dioClient);

  /// GET /users/profile - Get user profile
  Future<ApiResult<User>> getProfile() async {
    try {
      final response = await _dioClient.dio.get('/users/profile');

      if (response.statusCode == 200 && response.data['success'] == true) {
        final user = User.fromJson(response.data['user']);
        return ApiResult.success(user);
      } else {
        return ApiResult.failure(
          response.data['message'] ?? 'Failed to fetch profile',
        );
      }
    } catch (e) {
      print('Error fetching profile: $e');
      return ApiResult.failure('Error fetching profile: ${e.toString()}');
    }
  }

  /// PUT /users/profile - Update user profile (fullname and/or phone)
  Future<ApiResult<User>> updateProfile({
    String? fullname,
    String? phone,
  }) async {
    try {
      final Map<String, dynamic> data = {};
      if (fullname != null) data['fullname'] = fullname;
      if (phone != null) data['phone'] = phone;

      if (data.isEmpty) {
        return ApiResult.failure('No fields to update');
      }

      final response = await _dioClient.dio.put(
        '/users/profile',
        data: data,
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final user = User.fromJson(response.data['user']);
        return ApiResult.success(user);
      } else {
        return ApiResult.failure(
          response.data['message'] ?? 'Failed to update profile',
        );
      }
    } catch (e) {
      print('Error updating profile: $e');
      return ApiResult.failure('Error updating profile: ${e.toString()}');
    }
  }

  /// PUT /users/password - Change user password
  Future<ApiResult<void>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _dioClient.dio.put(
        '/users/password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return ApiResult.success(null);
      } else {
        return ApiResult.failure(
          response.data['message'] ?? 'Failed to change password',
        );
      }
    } catch (e) {
      print('Error changing password: $e');
      return ApiResult.failure('Error changing password: ${e.toString()}');
    }
  }
}

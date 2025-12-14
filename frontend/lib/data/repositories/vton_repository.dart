import 'dart:io';
import 'package:dio/dio.dart';
import 'package:http/http.dart' as http;
import '../../core/network/dio_client.dart';
import '../../core/network/api_result.dart';
import '../../core/constants/api_constants.dart';
import '../models/vton_model.dart';

class VtonRepository {
  final DioClient _dioClient;

  VtonRepository(this._dioClient);

  // Get upload URL for user image
  Future<ApiResult<VtonUploadUrls>> getUploadUrl(String fileName) async {
    try {
      final response = await _dioClient.dio.get(
        ApiConstants.vtonUploadUrl,
        queryParameters: {'fileName': fileName},
      );

      if (response.data['success'] == true) {
        final urls = VtonUploadUrls.fromJson(response.data['data']);
        return ApiResult.success(urls, message: response.data['message']);
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to get upload URL');
      }
    } on DioException catch (e) {
      return ApiResult.failure(
        e.response?.data['message'] ?? 'Failed to get upload URL',
      );
    } catch (e) {
      return ApiResult.failure('An error occurred: ${e.toString()}');
    }
  }

  // Upload image to S3 using presigned URL
  Future<ApiResult<void>> uploadImageToS3(
      String uploadUrl, File imageFile) async {
    try {
      final bytes = await imageFile.readAsBytes();
      print('Uploading ${bytes.length} bytes to S3...');

      final response = await http.put(
        Uri.parse(uploadUrl),
        headers: {'Content-Type': 'image/jpeg'},
        body: bytes,
      );

      print('S3 upload response: ${response.statusCode}');
      print('S3 response body: ${response.body}');

      if (response.statusCode == 200) {
        return ApiResult.success(null, message: 'Image uploaded successfully');
      } else {
        return ApiResult.failure(
            'Failed to upload image to S3 (Status: ${response.statusCode})');
      }
    } catch (e) {
      print('S3 upload error: $e');
      return ApiResult.failure('An error occurred: ${e.toString()}');
    }
  }

  // Save user image metadata after upload
  Future<ApiResult<Map<String, dynamic>>> saveUserImage(
      String imageUrl, String s3Key) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.vtonSaveUserImage,
        data: {
          'imageUrl': imageUrl,
          's3Key': s3Key,
        },
      );

      if (response.data['success'] == true) {
        return ApiResult.success(
          response.data['data'],
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to save user image');
      }
    } on DioException catch (e) {
      return ApiResult.failure(
        e.response?.data['message'] ?? 'Failed to save user image',
      );
    } catch (e) {
      return ApiResult.failure('An error occurred: ${e.toString()}');
    }
  }

  // Get all user uploaded images
  Future<ApiResult<List<UserImage>>> getUserImages() async {
    try {
      final response = await _dioClient.dio.get(
        ApiConstants.vtonUserImages,
      );

      if (response.data['success'] == true) {
        final List<dynamic> imagesJson = response.data['images'];
        final images =
            imagesJson.map((json) => UserImage.fromJson(json)).toList();

        return ApiResult.success(images, message: response.data['message']);
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to fetch user images');
      }
    } on DioException catch (e) {
      return ApiResult.failure(
        e.response?.data['message'] ?? 'Failed to fetch user images',
      );
    } catch (e) {
      return ApiResult.failure('An error occurred: ${e.toString()}');
    }
  }

  // Generate virtual try-on
  Future<ApiResult<VtonGenerationResponse>> generateVton({
    required int userImageId,
    required int productId,
    int segmentationType = 0,
  }) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.vtonGenerate,
        data: {
          'userImageId': userImageId,
          'productId': productId,
          'segmentationType': segmentationType,
        },
        options: Options(
          receiveTimeout: const Duration(minutes: 5), // VTON generation can take time
        ),
      );

      if (response.data['success'] == true) {
        final vtonResponse =
            VtonGenerationResponse.fromJson(response.data['data']);
        return ApiResult.success(vtonResponse,
            message: response.data['message']);
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to generate VTON');
      }
    } on DioException catch (e) {
      return ApiResult.failure(
        e.response?.data['message'] ?? 'Failed to generate VTON',
      );
    } catch (e) {
      return ApiResult.failure('An error occurred: ${e.toString()}');
    }
  }

  // Check VTON generation status
  Future<ApiResult<Map<String, dynamic>>> getVtonStatus(int vtonId) async {
    try {
      final response = await _dioClient.dio.get(
        '${ApiConstants.vtonStatus}/$vtonId',
      );

      if (response.data['success'] == true) {
        return ApiResult.success(
          response.data['data'],
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to fetch VTON status');
      }
    } on DioException catch (e) {
      return ApiResult.failure(
        e.response?.data['message'] ?? 'Failed to fetch VTON status',
      );
    } catch (e) {
      return ApiResult.failure('An error occurred: ${e.toString()}');
    }
  }

  // Get VTON history
  Future<ApiResult<List<VtonGeneration>>> getVtonHistory() async {
    try {
      final response = await _dioClient.dio.get(
        ApiConstants.vtonHistory,
      );

      if (response.data['success'] == true) {
        final List<dynamic> historyJson = response.data['history'];
        final history =
            historyJson.map((json) => VtonGeneration.fromJson(json)).toList();

        return ApiResult.success(history, message: response.data['message']);
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to fetch VTON history');
      }
    } on DioException catch (e) {
      return ApiResult.failure(
        e.response?.data['message'] ?? 'Failed to fetch VTON history',
      );
    } catch (e) {
      return ApiResult.failure('An error occurred: ${e.toString()}');
    }
  }

  // Delete user image
  Future<ApiResult<void>> deleteUserImage(int imageId) async {
    try {
      final response = await _dioClient.dio.delete(
        '${ApiConstants.vtonDeleteUserImage}/$imageId',
      );

      if (response.data['success'] == true) {
        return ApiResult.success(null, message: response.data['message']);
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to delete user image');
      }
    } on DioException catch (e) {
      return ApiResult.failure(
        e.response?.data['message'] ?? 'Failed to delete user image',
      );
    } catch (e) {
      return ApiResult.failure('An error occurred: ${e.toString()}');
    }
  }
}

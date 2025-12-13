import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/api_result.dart';
import '../../core/constants/api_constants.dart';
import '../models/category_model.dart';

class CategoriesRepository {
  final DioClient _dioClient;

  CategoriesRepository(this._dioClient);

  // GET /categories - Get all categories with hierarchical structure
  Future<ApiResult<List<Category>>> getAllCategories() async {
    try {
      final response = await _dioClient.dio.get(ApiConstants.categories);

      if (response.data['success'] == true) {
        final List<dynamic> categoriesJson = response.data['categories'];
        final categories = categoriesJson
            .map((json) => Category.fromJson(json))
            .toList();
        return ApiResult.success(categories, message: response.data['message']);
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to fetch categories');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Failed to fetch categories: ${e.toString()}');
    }
  }

  // GET /categories/:id - Get single category with subcategories and product count
  Future<ApiResult<Category>> getCategory(int id) async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.categories}/$id');

      if (response.data['success'] == true) {
        final category = Category.fromJson(response.data['category']);
        return ApiResult.success(category, message: response.data['message']);
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to fetch category');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Failed to fetch category: ${e.toString()}');
    }
  }

  // Helper method to extract error message from DioException
  String _extractErrorMessage(DioException e) {
    if (e.response != null) {
      final data = e.response!.data;

      if (data is Map<String, dynamic>) {
        return data['message']?.toString() ??
            data['error']?.toString() ??
            'Request failed with status ${e.response!.statusCode}';
      }

      return 'Request failed with status ${e.response!.statusCode}';
    }

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

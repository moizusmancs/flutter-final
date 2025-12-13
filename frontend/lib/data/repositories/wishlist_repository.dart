import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/api_result.dart';
import '../../core/constants/api_constants.dart';
import '../models/wishlist_item_model.dart';

class WishlistRepository {
  final DioClient _dioClient;

  WishlistRepository(this._dioClient);

  // POST /users/wishlist - Add item to wishlist
  Future<ApiResult<Map<String, dynamic>>> addToWishlist({
    required int variantId,
  }) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.wishlist,
        data: {
          'variant_id': variantId,
        },
      );

      if (response.data['success'] == true) {
        return ApiResult.success(
          response.data['wishlist_item'],
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to add to wishlist');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Failed to add to wishlist: ${e.toString()}');
    }
  }

  // GET /users/wishlist - Get wishlist items
  Future<ApiResult<Map<String, dynamic>>> getWishlist() async {
    try {
      final response = await _dioClient.dio.get(ApiConstants.wishlist);

      if (response.data['success'] == true) {
        final List<dynamic> wishlistJson = response.data['wishlist'];
        final wishlistItems = wishlistJson
            .map((json) => WishlistItem.fromJson(json))
            .toList();

        return ApiResult.success(
          {
            'wishlist': wishlistItems,
            'count': response.data['count'],
          },
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to fetch wishlist');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Failed to fetch wishlist: ${e.toString()}');
    }
  }

  // DELETE /users/wishlist/:id - Remove item from wishlist
  Future<ApiResult<void>> removeFromWishlist(int wishlistItemId) async {
    try {
      final response = await _dioClient.dio
          .delete('${ApiConstants.wishlist}/$wishlistItemId');

      if (response.data['success'] == true) {
        return ApiResult.success(null, message: response.data['message']);
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to remove from wishlist');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure(
          'Failed to remove from wishlist: ${e.toString()}');
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

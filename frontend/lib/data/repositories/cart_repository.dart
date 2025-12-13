import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/api_result.dart';
import '../../core/constants/api_constants.dart';
import '../models/cart_item_model.dart';

class CartRepository {
  final DioClient _dioClient;

  CartRepository(this._dioClient);

  // POST /users/cart - Add item to cart
  Future<ApiResult<Map<String, dynamic>>> addToCart({
    required int variantId,
    int quantity = 1,
  }) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.cart,
        data: {
          'variant_id': variantId,
          'quantity': quantity,
        },
      );

      if (response.data['success'] == true) {
        return ApiResult.success(
          response.data['cart_item'],
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to add to cart');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Failed to add to cart: ${e.toString()}');
    }
  }

  // GET /users/cart - Get cart items
  Future<ApiResult<Map<String, dynamic>>> getCart() async {
    try {
      final response = await _dioClient.dio.get(ApiConstants.cart);

      if (response.data['success'] == true) {
        final List<dynamic> cartJson = response.data['cart'];
        final cartItems = cartJson.map((json) => CartItem.fromJson(json)).toList();

        return ApiResult.success(
          {
            'cart': cartItems,
            'count': response.data['count'],
            'total': response.data['total'],
          },
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to fetch cart');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Failed to fetch cart: ${e.toString()}');
    }
  }

  // DELETE /users/cart/:id - Remove item from cart
  Future<ApiResult<void>> removeFromCart(int cartItemId) async {
    try {
      final response =
          await _dioClient.dio.delete('${ApiConstants.cart}/$cartItemId');

      if (response.data['success'] == true) {
        return ApiResult.success(null, message: response.data['message']);
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to remove from cart');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Failed to remove from cart: ${e.toString()}');
    }
  }

  // PUT /users/cart/:id - Update cart item quantity
  Future<ApiResult<void>> updateCartItem(int cartItemId, int quantity) async {
    try {
      final response = await _dioClient.dio.put(
        '${ApiConstants.cart}/$cartItemId',
        data: {'quantity': quantity},
      );

      if (response.data['success'] == true) {
        return ApiResult.success(null, message: response.data['message']);
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to update cart');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Failed to update cart: ${e.toString()}');
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

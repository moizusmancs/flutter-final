import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/api_result.dart';
import '../../core/constants/api_constants.dart';
import '../models/order_model.dart';

class OrdersRepository {
  final DioClient _dioClient;

  OrdersRepository(this._dioClient);

  // GET /users/orders - Get all user orders
  Future<ApiResult<List<Order>>> getOrders() async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/users/orders');

      if (response.data['success'] == true) {
        final List<dynamic> ordersJson = response.data['orders'];
        final orders = ordersJson.map((json) => Order.fromJson(json)).toList();

        return ApiResult.success(
          orders,
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to fetch orders');
      }
    } on DioException catch (e) {
      return ApiResult.failure(
        e.response?.data['message'] ?? 'Failed to fetch orders',
      );
    } catch (e) {
      return ApiResult.failure('An error occurred: ${e.toString()}');
    }
  }

  // GET /users/orders/:id - Get specific order details
  Future<ApiResult<Order>> getOrderDetails(int orderId) async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/users/orders/$orderId');

      if (response.data['success'] == true) {
        final order = Order.fromJson(response.data['order']);

        return ApiResult.success(
          order,
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to fetch order details');
      }
    } on DioException catch (e) {
      return ApiResult.failure(
        e.response?.data['message'] ?? 'Failed to fetch order details',
      );
    } catch (e) {
      return ApiResult.failure('An error occurred: ${e.toString()}');
    }
  }

  // PUT /users/orders/:id/cancel - Cancel order
  Future<ApiResult<Map<String, dynamic>>> cancelOrder(int orderId) async {
    try {
      final response = await _dioClient.dio.put('${ApiConstants.baseUrl}/users/orders/$orderId/cancel');

      if (response.data['success'] == true) {
        return ApiResult.success(
          response.data['order'],
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to cancel order');
      }
    } on DioException catch (e) {
      return ApiResult.failure(
        e.response?.data['message'] ?? 'Failed to cancel order',
      );
    } catch (e) {
      return ApiResult.failure('An error occurred: ${e.toString()}');
    }
  }

  // POST /users/orders - Create new order
  Future<ApiResult<Map<String, dynamic>>> createOrder({
    required int shippingAddressId,
    required String paymentMethod,
  }) async {
    try {
      final response = await _dioClient.dio.post(
        '${ApiConstants.baseUrl}/users/orders',
        data: {
          'shipping_address_id': shippingAddressId,
          'payment_method': paymentMethod,
        },
      );

      if (response.data['success'] == true) {
        return ApiResult.success(
          response.data['order'],
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to create order');
      }
    } on DioException catch (e) {
      return ApiResult.failure(
        e.response?.data['message'] ?? 'Failed to create order',
      );
    } catch (e) {
      return ApiResult.failure('An error occurred: ${e.toString()}');
    }
  }
}

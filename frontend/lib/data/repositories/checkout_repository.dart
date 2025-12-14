import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/api_result.dart';
import '../../core/constants/api_constants.dart';
import '../models/address_model.dart';
import '../models/order_model.dart';

class CheckoutRepository {
  final DioClient _dioClient;

  CheckoutRepository(this._dioClient);

  // Get all addresses
  Future<ApiResult<List<Address>>> getAddresses() async {
    try {
      final response = await _dioClient.dio.get(ApiConstants.addresses);

      if (response.data['success'] == true) {
        final List<dynamic> addressesJson = response.data['addresses'];
        final addresses = addressesJson.map((json) => Address.fromJson(json)).toList();

        return ApiResult.success(
          addresses,
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Failed to fetch addresses');
      }
    } on DioException catch (e) {
      return ApiResult.failure(_extractErrorMessage(e));
    } catch (e) {
      return ApiResult.failure('Failed to fetch addresses: ${e.toString()}');
    }
  }

  // Add new address
  Future<ApiResult<Address>> addAddress({
    required String line1,
    required String city,
    required String state,
    required String country,
    required String zipCode,
    bool isDefault = false,
  }) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.addresses,
        data: {
          'line1': line1,
          'city': city,
          'state': state,
          'country': country,
          'zip_code': zipCode,
          'is_default': isDefault,
        },
      );

      if (response.data['success'] == true) {
        final address = Address.fromJson(response.data['address']);
        return ApiResult.success(address, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Failed to add address');
      }
    } on DioException catch (e) {
      return ApiResult.failure(_extractErrorMessage(e));
    } catch (e) {
      return ApiResult.failure('Failed to add address: ${e.toString()}');
    }
  }

  // Set default address
  Future<ApiResult<void>> setDefaultAddress(int addressId) async {
    try {
      final response = await _dioClient.dio.put('${ApiConstants.addresses}/$addressId/default');

      if (response.data['success'] == true) {
        return ApiResult.success(null, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Failed to set default address');
      }
    } on DioException catch (e) {
      return ApiResult.failure(_extractErrorMessage(e));
    } catch (e) {
      return ApiResult.failure('Failed to set default address: ${e.toString()}');
    }
  }

  // Create order
  Future<ApiResult<Order>> createOrder({
    required int addressId,
    required String paymentMethod,
    String? couponCode,
  }) async {
    try {
      final Map<String, dynamic> data = {
        'shipping_address_id': addressId,
        'payment_method': paymentMethod,
      };

      if (couponCode != null && couponCode.isNotEmpty) {
        data['coupon_code'] = couponCode;
      }

      final response = await _dioClient.dio.post(
        ApiConstants.orders,
        data: data,
      );

      if (response.data['success'] == true) {
        final order = Order.fromJson(response.data['order']);
        return ApiResult.success(order, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Failed to create order');
      }
    } on DioException catch (e) {
      return ApiResult.failure(_extractErrorMessage(e));
    } catch (e) {
      return ApiResult.failure('Failed to create order: ${e.toString()}');
    }
  }

  // Get order by ID
  Future<ApiResult<Order>> getOrder(int orderId) async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.orders}/$orderId');

      if (response.data['success'] == true) {
        final order = Order.fromJson(response.data['order']);
        return ApiResult.success(order, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Failed to fetch order');
      }
    } on DioException catch (e) {
      return ApiResult.failure(_extractErrorMessage(e));
    } catch (e) {
      return ApiResult.failure('Failed to fetch order: ${e.toString()}');
    }
  }

  // Initiate payment
  Future<ApiResult<Map<String, dynamic>>> initiatePayment({
    required int orderId,
    required String paymentMethod, // 'card' or 'cod'
  }) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.createPaymentIntent,
        data: {
          'order_id': orderId,
          'payment_method': paymentMethod,
        },
      );

      if (response.data['success'] == true) {
        return ApiResult.success(
          response.data,
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Failed to initiate payment');
      }
    } on DioException catch (e) {
      return ApiResult.failure(_extractErrorMessage(e));
    } catch (e) {
      return ApiResult.failure('Failed to initiate payment: ${e.toString()}');
    }
  }

  // Confirm payment
  Future<ApiResult<Map<String, dynamic>>> confirmPayment({
    required int orderId,
    required String paymentIntentId,
  }) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.confirmPayment,
        data: {
          'order_id': orderId,
          'payment_intent_id': paymentIntentId,
        },
      );

      if (response.data['success'] == true) {
        return ApiResult.success(
          response.data,
          message: response.data['message'],
        );
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Payment confirmation failed');
      }
    } on DioException catch (e) {
      return ApiResult.failure(_extractErrorMessage(e));
    } catch (e) {
      return ApiResult.failure('Payment confirmation failed: ${e.toString()}');
    }
  }

  String _extractErrorMessage(DioException e) {
    if (e.response?.data != null && e.response!.data is Map) {
      return e.response!.data['message'] ?? 'An error occurred';
    }
    return e.message ?? 'Network error';
  }
}

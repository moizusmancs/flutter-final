import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/api_result.dart';
import '../../core/constants/api_constants.dart';
import '../models/product_model.dart';
import '../models/product_variant_model.dart';

class ProductsRepository {
  final DioClient _dioClient;

  ProductsRepository(this._dioClient);

  // GET /products - Get all products with pagination and filters
  Future<ApiResult<List<Product>>> getProducts({
    int page = 1,
    int limit = 10,
    String? sort,
    int? categoryId,
    double? minPrice,
    double? maxPrice,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (sort != null) queryParams['sort'] = sort;
      if (categoryId != null) queryParams['category_id'] = categoryId;
      if (minPrice != null) queryParams['min_price'] = minPrice;
      if (maxPrice != null) queryParams['max_price'] = maxPrice;

      final response = await _dioClient.dio.get(
        ApiConstants.products,
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final List<dynamic> productsJson = response.data['products'];
        try {
          final products = productsJson.map((json) => Product.fromJson(json)).toList();
          print('Successfully parsed ${products.length} products');
          return ApiResult.success(products, message: response.data['message']);
        } catch (e) {
          print('Error parsing products: $e');
          print('First product JSON: ${productsJson.isNotEmpty ? productsJson[0] : "empty"}');
          return ApiResult.failure('Failed to parse products: ${e.toString()}');
        }
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Failed to fetch products');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      print('Error in getProducts: $e');
      return ApiResult.failure('Failed to fetch products: ${e.toString()}');
    }
  }

  // GET /products/one/:id - Get single product
  Future<ApiResult<Product>> getProduct(int id) async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.products}/one/$id');

      if (response.data['success'] == true) {
        final product = Product.fromJson(response.data['product']);
        return ApiResult.success(product, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Failed to fetch product');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Failed to fetch product: ${e.toString()}');
    }
  }

  // GET /products/category/:id - Get products by category
  Future<ApiResult<List<Product>>> getProductsByCategory(
    int categoryId, {
    int page = 1,
    int limit = 20,
    String? sort,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (sort != null) queryParams['sort'] = sort;

      final response = await _dioClient.dio.get(
        '${ApiConstants.products}/category/$categoryId',
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final List<dynamic> productsJson = response.data['products'];
        final products = productsJson.map((json) => Product.fromJson(json)).toList();
        return ApiResult.success(products, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Failed to fetch products');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Failed to fetch products: ${e.toString()}');
    }
  }

  // GET /products/search - Search products
  Future<ApiResult<List<Product>>> searchProducts(
    String query, {
    int page = 1,
    int limit = 10,
    int? categoryId,
    double? minPrice,
    double? maxPrice,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'q': query,
        'page': page,
        'limit': limit,
      };

      if (categoryId != null) queryParams['category_id'] = categoryId;
      if (minPrice != null) queryParams['min_price'] = minPrice;
      if (maxPrice != null) queryParams['max_price'] = maxPrice;

      final response = await _dioClient.dio.get(
        '${ApiConstants.products}/search',
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final List<dynamic> productsJson = response.data['products'];
        final products = productsJson.map((json) => Product.fromJson(json)).toList();
        return ApiResult.success(products, message: response.data['message']);
      } else {
        return ApiResult.failure(response.data['message'] ?? 'Search failed');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Search failed: ${e.toString()}');
    }
  }

  // GET /products/:id/variants - Get product variants
  Future<ApiResult<List<ProductVariant>>> getProductVariants(int productId) async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.products}/$productId/variants');

      if (response.data['success'] == true) {
        final List<dynamic> variantsJson = response.data['variants'];
        final variants = variantsJson
            .map((json) => ProductVariant.fromJson(json))
            .toList();
        return ApiResult.success(variants, message: response.data['message']);
      } else {
        return ApiResult.failure(
            response.data['message'] ?? 'Failed to fetch variants');
      }
    } on DioException catch (e) {
      final errorMessage = _extractErrorMessage(e);
      return ApiResult.failure(errorMessage);
    } catch (e) {
      return ApiResult.failure('Failed to fetch variants: ${e.toString()}');
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

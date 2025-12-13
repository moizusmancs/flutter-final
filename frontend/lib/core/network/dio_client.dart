import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../storage/local_storage_service.dart';

class DioClient {
  late Dio _dio;

  DioClient() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _setupInterceptors();
  }

  Future<void> initialize() async {
    // Load token and add to headers if exists
    await _loadTokenToHeaders();
  }

  Future<void> _loadTokenToHeaders() async {
    final token = await LocalStorageService.getToken();
    if (token != null && token.isNotEmpty) {
      setAuthToken(token);
    }
  }

  // Set Authorization header with token
  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  // Remove Authorization header
  void removeAuthToken() {
    _dio.options.headers.remove('Authorization');
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          print('┌─────────────────────────────────────────────────────');
          print('│ REQUEST[${options.method}]');
          print('│ URL: ${options.baseUrl}${options.path}');
          print('│ Headers: ${options.headers}');
          print('│ Data: ${options.data}');
          print('└─────────────────────────────────────────────────────');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print('┌─────────────────────────────────────────────────────');
          print('│ RESPONSE[${response.statusCode}]');
          print('│ URL: ${response.requestOptions.baseUrl}${response.requestOptions.path}');
          print('│ Data: ${response.data}');
          print('└─────────────────────────────────────────────────────');
          return handler.next(response);
        },
        onError: (error, handler) {
          print('┌─────────────────────────────────────────────────────');
          print('│ ERROR[${error.response?.statusCode}]');
          print('│ URL: ${error.requestOptions.baseUrl}${error.requestOptions.path}');
          print('│ Message: ${error.message}');
          print('│ Response Data: ${error.response?.data}');
          print('└─────────────────────────────────────────────────────');
          return handler.next(error);
        },
      ),
    );
  }

  Dio get dio => _dio;
}

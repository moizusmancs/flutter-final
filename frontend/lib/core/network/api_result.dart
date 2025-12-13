class ApiResult<T> {
  final bool success;
  final String? message;
  final T? data;
  final String? error;

  ApiResult({
    required this.success,
    this.message,
    this.data,
    this.error,
  });

  factory ApiResult.success(T data, {String? message}) {
    return ApiResult(
      success: true,
      data: data,
      message: message,
    );
  }

  factory ApiResult.failure(String error) {
    return ApiResult(
      success: false,
      error: error,
    );
  }
}

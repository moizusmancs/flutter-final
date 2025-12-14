class UserImage {
  final int id;
  final int userId;
  final String imageUrl;
  final String s3Key;
  final String createdAt;

  UserImage({
    required this.id,
    required this.userId,
    required this.imageUrl,
    required this.s3Key,
    required this.createdAt,
  });

  factory UserImage.fromJson(Map<String, dynamic> json) {
    return UserImage(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      imageUrl: json['image_url'] as String,
      s3Key: json['s3_key'] as String,
      createdAt: json['created_at'] as String,
    );
  }
}

class VtonGeneration {
  final int id;
  final int productId;
  final String? generatedImageUrl;
  final String status;
  final String createdAt;
  final String? productName;
  final String? productImageUrl;
  final String? userImageUrl;

  VtonGeneration({
    required this.id,
    required this.productId,
    this.generatedImageUrl,
    required this.status,
    required this.createdAt,
    this.productName,
    this.productImageUrl,
    this.userImageUrl,
  });

  factory VtonGeneration.fromJson(Map<String, dynamic> json) {
    return VtonGeneration(
      id: json['id'] as int,
      productId: json['product_id'] as int,
      generatedImageUrl: json['generated_image_url'] as String?,
      status: json['status'] as String,
      createdAt: json['created_at'] as String,
      productName: json['product_name'] as String?,
      productImageUrl: json['product_image_url'] as String?,
      userImageUrl: json['user_image_url'] as String?,
    );
  }

  bool get isProcessing => status == 'processing';
  bool get isCompleted => status == 'completed';
  bool get isFailed => status == 'failed';
}

class VtonUploadUrls {
  final String uploadUrl;
  final String fileUrl;
  final String s3Key;

  VtonUploadUrls({
    required this.uploadUrl,
    required this.fileUrl,
    required this.s3Key,
  });

  factory VtonUploadUrls.fromJson(Map<String, dynamic> json) {
    return VtonUploadUrls(
      uploadUrl: json['uploadUrl'] as String,
      fileUrl: json['fileUrl'] as String,
      s3Key: json['s3Key'] as String,
    );
  }
}

class VtonGenerationResponse {
  final int vtonId;
  final String orderId;
  final String status;
  final int maxRetries;
  final int avgResponseTime;

  VtonGenerationResponse({
    required this.vtonId,
    required this.orderId,
    required this.status,
    required this.maxRetries,
    required this.avgResponseTime,
  });

  factory VtonGenerationResponse.fromJson(Map<String, dynamic> json) {
    return VtonGenerationResponse(
      vtonId: json['vtonId'] as int,
      orderId: json['orderId'] as String,
      status: json['status'] as String,
      maxRetries: json['maxRetries'] as int,
      avgResponseTime: json['avgResponseTime'] as int,
    );
  }
}

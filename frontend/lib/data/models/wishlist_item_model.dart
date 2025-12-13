class WishlistItem {
  final int id;
  final int userId;
  final int variantId;
  final String createdAt;
  final String size;
  final String color;
  final int stock;
  final double additionalPrice;
  final int productId;
  final String productName;
  final double productPrice;
  final double productDiscount;
  final String productDescription;
  final String? categoryName;
  final String? imageUrl;

  WishlistItem({
    required this.id,
    required this.userId,
    required this.variantId,
    required this.createdAt,
    required this.size,
    required this.color,
    required this.stock,
    required this.additionalPrice,
    required this.productId,
    required this.productName,
    required this.productPrice,
    required this.productDiscount,
    required this.productDescription,
    this.categoryName,
    this.imageUrl,
  });

  factory WishlistItem.fromJson(Map<String, dynamic> json) {
    return WishlistItem(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      variantId: json['variant_id'] as int,
      createdAt: json['created_at'] as String,
      size: json['size'] as String,
      color: json['color'] as String,
      stock: json['stock'] as int,
      additionalPrice: _parseDouble(json['additional_price']),
      productId: json['product_id'] as int,
      productName: json['product_name'] as String,
      productPrice: _parseDouble(json['product_price']),
      productDiscount: _parseDouble(json['product_discount']),
      productDescription: json['product_description'] as String,
      categoryName: json['category_name'] as String?,
      imageUrl: json['image_url'] as String?,
    );
  }

  static double _parseDouble(dynamic value) {
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.parse(value);
    return 0.0;
  }

  double get finalPrice =>
      (productPrice + additionalPrice) * (1 - productDiscount / 100);

  bool get hasDiscount => productDiscount > 0;

  bool get isInStock => stock > 0;
}

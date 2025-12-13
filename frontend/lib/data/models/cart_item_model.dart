class CartItem {
  final int id;
  final int userId;
  final int variantId;
  final int quantity;
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
  final double itemTotal;

  CartItem({
    required this.id,
    required this.userId,
    required this.variantId,
    required this.quantity,
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
    required this.itemTotal,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      variantId: json['variant_id'] as int,
      quantity: json['quantity'] as int,
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
      itemTotal: _parseDouble(json['item_total']),
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
}

class ProductVariant {
  final int id;
  final int productId;
  final String size;
  final String color;
  final int stock;
  final double additionalPrice;

  ProductVariant({
    required this.id,
    required this.productId,
    required this.size,
    required this.color,
    required this.stock,
    required this.additionalPrice,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['id'] as int,
      productId: json['product_id'] as int,
      size: json['size'] as String,
      color: json['color'] as String,
      stock: json['stock'] as int,
      additionalPrice: _parseDouble(json['additional_price']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_id': productId,
      'size': size,
      'color': color,
      'stock': stock,
      'additional_price': additionalPrice,
    };
  }

  // Helper method to parse additional_price that might be String or num
  static double _parseDouble(dynamic value) {
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.parse(value);
    return 0.0;
  }

  bool get isInStock => stock > 0;
}

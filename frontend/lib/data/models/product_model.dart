import 'package:json_annotation/json_annotation.dart';

part 'product_model.g.dart';

@JsonSerializable()
class Product {
  final int id;
  final String name;
  final String description;
  @JsonKey(name: 'category_id')
  final int? categoryId;
  @JsonKey(name: 'category_name')
  final String? categoryName;
  final double price;
  final double discount;
  final List<String> images;
  @JsonKey(name: 'created_at')
  final String? createdAt;

  Product({
    required this.id,
    required this.name,
    required this.description,
    this.categoryId,
    this.categoryName,
    required this.price,
    required this.discount,
    required this.images,
    this.createdAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // Convert price and discount from String to double if needed
    return Product(
      id: json['id'] as int,
      name: json['name'] as String,
      description: json['description'] as String,
      categoryId: json['category_id'] as int?,
      categoryName: json['category_name'] as String?,
      price: _parseDouble(json['price']),
      discount: _parseDouble(json['discount']),
      images: (json['images'] as List<dynamic>).map((e) => e as String).toList(),
      createdAt: json['created_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() => _$ProductToJson(this);

  // Helper method to parse price/discount that might be String or num
  static double _parseDouble(dynamic value) {
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.parse(value);
    return 0.0;
  }

  // Helper getters
  double get finalPrice => price * (1 - discount / 100);
  bool get hasDiscount => discount > 0;
}

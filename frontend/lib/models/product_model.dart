class Product {
  
  final int id;
  final String name;
  final String description;
  final String category;
  final double price;
  final double discount;
  final List<String> images;
  final int stock;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.price,
    required this.discount,
    required this.images,
    required this.stock,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      images: json['images'] != null
          ? List<String>.from(json['images'])
          : <String>[],
      stock: json['stock'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'price': price,
      'discount': discount,
      'images': images,
      'stock': stock,
    };
  }
}

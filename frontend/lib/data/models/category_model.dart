class Category {
  final int id;
  final String name;
  final String? description;
  final int? parentId;
  final String? createdAt;
  final String? updatedAt;
  final List<Category>? subcategories;
  final int? productCount;

  Category({
    required this.id,
    required this.name,
    this.description,
    this.parentId,
    this.createdAt,
    this.updatedAt,
    this.subcategories,
    this.productCount,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as int,
      name: json['name'] as String,
      description: json['description'] as String?,
      parentId: json['parent_id'] as int?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
      subcategories: json['subcategories'] != null
          ? (json['subcategories'] as List<dynamic>)
              .map((e) => Category.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      productCount: json['product_count'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'parent_id': parentId,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'subcategories': subcategories?.map((e) => e.toJson()).toList(),
      'product_count': productCount,
    };
  }
}

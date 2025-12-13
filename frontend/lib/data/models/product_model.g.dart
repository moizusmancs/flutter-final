// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Product _$ProductFromJson(Map<String, dynamic> json) => Product(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  description: json['description'] as String,
  categoryId: (json['category_id'] as num?)?.toInt(),
  categoryName: json['category_name'] as String?,
  price: (json['price'] as num).toDouble(),
  discount: (json['discount'] as num).toDouble(),
  images: (json['images'] as List<dynamic>).map((e) => e as String).toList(),
  createdAt: json['created_at'] as String?,
);

Map<String, dynamic> _$ProductToJson(Product instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'description': instance.description,
  'category_id': instance.categoryId,
  'category_name': instance.categoryName,
  'price': instance.price,
  'discount': instance.discount,
  'images': instance.images,
  'created_at': instance.createdAt,
};

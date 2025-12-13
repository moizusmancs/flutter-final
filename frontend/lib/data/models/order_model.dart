class Order {
  final int id;
  final int userId;
  final double totalAmount;
  final String status;
  final String createdAt;
  final String? line1;
  final String? city;
  final String? state;
  final String? country;
  final String? zipCode;
  final String? paymentMethod;
  final String? paymentStatus;
  final String? transactionReference;
  final List<OrderItem>? items;

  Order({
    required this.id,
    required this.userId,
    required this.totalAmount,
    required this.status,
    required this.createdAt,
    this.line1,
    this.city,
    this.state,
    this.country,
    this.zipCode,
    this.paymentMethod,
    this.paymentStatus,
    this.transactionReference,
    this.items,
  });

  static double _parseDouble(dynamic value) {
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.parse(value);
    return 0.0;
  }

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      totalAmount: _parseDouble(json['total_amount']),
      status: json['status'] as String,
      createdAt: json['created_at'] as String,
      line1: json['line1'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      country: json['country'] as String?,
      zipCode: json['zip_code'] as String?,
      paymentMethod: json['payment_method'] as String?,
      paymentStatus: json['payment_status'] as String?,
      transactionReference: json['transaction_reference'] as String?,
      items: json['items'] != null
          ? (json['items'] as List)
              .map((item) => OrderItem.fromJson(item))
              .toList()
          : null,
    );
  }

  String get formattedAddress {
    final parts = <String>[];
    if (line1 != null) parts.add(line1!);
    if (city != null) parts.add(city!);
    if (state != null) parts.add(state!);
    if (zipCode != null) parts.add(zipCode!);
    if (country != null) parts.add(country!);
    return parts.join(', ');
  }

  bool get canBeCancelled {
    return status != 'cancelled' && status != 'shipped' && status != 'delivered';
  }

  String get statusDisplay {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'paid':
        return 'Paid';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }
}

class OrderItem {
  final int id;
  final int orderId;
  final int variantId;
  final int quantity;
  final double priceAtPurchase;
  final String size;
  final String color;
  final int productId;
  final String productName;
  final String productDescription;
  final String? imageUrl;

  OrderItem({
    required this.id,
    required this.orderId,
    required this.variantId,
    required this.quantity,
    required this.priceAtPurchase,
    required this.size,
    required this.color,
    required this.productId,
    required this.productName,
    required this.productDescription,
    this.imageUrl,
  });

  static double _parseDouble(dynamic value) {
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.parse(value);
    return 0.0;
  }

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] as int,
      orderId: json['order_id'] as int,
      variantId: json['variant_id'] as int,
      quantity: json['quantity'] as int,
      priceAtPurchase: _parseDouble(json['price_at_purchase']),
      size: json['size'] as String,
      color: json['color'] as String,
      productId: json['product_id'] as int,
      productName: json['product_name'] as String,
      productDescription: json['product_description'] as String,
      imageUrl: json['image_url'] as String?,
    );
  }

  double get itemTotal => priceAtPurchase * quantity;
}

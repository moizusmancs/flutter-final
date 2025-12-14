class Address {
  final int id;
  final int userId;
  final String line1;
  final String city;
  final String state;
  final String country;
  final String zipCode;
  final bool isDefault;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Address({
    required this.id,
    required this.userId,
    required this.line1,
    required this.city,
    required this.state,
    required this.country,
    required this.zipCode,
    required this.isDefault,
    this.createdAt,
    this.updatedAt,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'],
      userId: json['user_id'],
      line1: json['line1'],
      city: json['city'],
      state: json['state'],
      country: json['country'],
      zipCode: json['zip_code'],
      isDefault: json['is_default'] == 1 || json['is_default'] == true,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : null,
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'line1': line1,
      'city': city,
      'state': state,
      'country': country,
      'zip_code': zipCode,
      'is_default': isDefault,
    };
  }

  String get formattedAddress {
    return '$line1, $city, $state $zipCode, $country';
  }
}

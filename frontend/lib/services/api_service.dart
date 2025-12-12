import 'package:frontend/models/product_model.dart';
import 'package:http/http.dart' as http; 
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://localhost:4000/api/v1';

  static Future<dynamic> get(String endpoint) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to fetch data: ${response.statusCode}');
    }
  }

  static Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to post data: ${response.statusCode}');
    }
  }

  static Future<List<Product>> fetchProducts() async {
    final data = await get('/products');
    final List<dynamic> productsData = data['products'];
    return productsData.map((json) => Product.fromJson(json)).toList();
  }

  static Future<Product> fetchOneProduct(String id) async {
    final data = await get('/products/one/'+id);
    return Product.fromJson(data['product']);
    // final dynamic productsData = data['products'];
    // return productsData.map((json) => Product.fromJson(json)).toList();
  }


}
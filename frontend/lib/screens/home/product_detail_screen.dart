import 'package:flutter/material.dart';
import 'package:frontend/models/product_model.dart';
import 'package:frontend/services/api_service.dart';

class ProductDetailPage extends StatefulWidget {
  final int productId;

  const ProductDetailPage({Key? key, required this.productId})
    : super(key: key);

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  Product? product;
  bool isLoading = true;
  int _currentImage = 0;

  @override
  void initState() {
    super.initState();
    _fetchProduct();
  }

  Future<void> _fetchProduct() async {
    try {
      final data = await ApiService.fetchOneProduct(
        widget.productId.toString(),
      );
      setState(() {
        product = data;
        isLoading = false;
      });
    } catch (e) {
      print('Error fetching product: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (product == null) {
      return const Scaffold(body: Center(child: Text('Product not found')));
    }

    return Scaffold(
      appBar: AppBar(title: Text(product!.name), centerTitle: true),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🖼️ Image Swiper
            SizedBox(
              height: 300,
              width: double.infinity,
              child: PageView.builder(
                itemCount: product!.images.length,
                onPageChanged: (index) {
                  setState(() => _currentImage = index);
                },
                itemBuilder: (context, index) {
                  return Image.network(
                    product!.images[index],
                    fit: BoxFit.cover,
                    width: double.infinity,
                    errorBuilder: (context, error, stackTrace) =>
                        const Icon(Icons.broken_image, size: 100),
                  );
                },
              ),
            ),

            // 🔵 Image Indicators
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: product!.images.asMap().entries.map((entry) {
                return Container(
                  width: 8.0,
                  height: 8.0,
                  margin: const EdgeInsets.symmetric(
                    vertical: 10.0,
                    horizontal: 4.0,
                  ),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _currentImage == entry.key
                        ? Colors.black
                        : Colors.grey[400],
                  ),
                );
              }).toList(),
            ),

            // 📦 Product Info
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product!.name,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),

                  Text(
                    product!.description,
                    style: const TextStyle(color: Colors.grey, fontSize: 16),
                  ),
                  const SizedBox(height: 12),

                  Text(
                    '\$${product!.price.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: Colors.green,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // 🛒 Add to Cart and ❤️ Icon Row
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            // TODO: add to cart logic
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Added to cart!')),
                            );
                          },
                          icon: const Icon(Icons.add_shopping_cart),
                          label: const Text('Add to Cart'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      IconButton(
                        onPressed: () {
                          // TODO: add favorite logic
                        },
                        icon: const Icon(Icons.favorite_border, size: 28),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // 🟢 Buy Now button
                  ElevatedButton(
                    onPressed: () {
                      // TODO: implement buy now
                    },
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(50),
                      backgroundColor: Colors.black,
                    ),
                    child: const Text(
                      'Buy Now',
                      style: TextStyle(fontSize: 18),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // 💬 Reviews Section
                  const Text(
                    'Reviews',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),

                  const ListTile(
                    leading: CircleAvatar(child: Icon(Icons.person)),
                    title: Text('John Doe'),
                    subtitle: Text('Great product! Really liked the fabric.'),
                    trailing: Icon(Icons.star, color: Colors.amber),
                  ),
                  const ListTile(
                    leading: CircleAvatar(child: Icon(Icons.person)),
                    title: Text('Jane Smith'),
                    subtitle: Text('Nice fit, will buy again!'),
                    trailing: Icon(Icons.star, color: Colors.amber),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

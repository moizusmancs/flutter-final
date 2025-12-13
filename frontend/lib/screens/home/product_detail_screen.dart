import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:frontend/data/models/product_model.dart';
import 'package:frontend/data/models/product_variant_model.dart';
import 'package:frontend/data/repositories/products_repository.dart';
import 'package:frontend/data/repositories/cart_repository.dart';
import 'package:frontend/data/repositories/wishlist_repository.dart';
import 'package:frontend/core/theme/app_colors.dart';
import 'package:frontend/providers/auth_provider.dart';

class ProductDetailPage extends StatefulWidget {
  final int productId;

  const ProductDetailPage({super.key, required this.productId});

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  Product? product;
  List<ProductVariant> variants = [];
  ProductVariant? selectedVariant;
  bool isLoading = true;
  bool isAddingToCart = false;
  bool isAddingToWishlist = false;
  bool isInWishlist = false;
  int _currentImage = 0;
  bool _isInitialized = false;
  int quantity = 1;

  late ProductsRepository _productsRepository;
  late CartRepository _cartRepository;
  late WishlistRepository _wishlistRepository;

  @override
  void initState() {
    super.initState();
    // Will initialize in didChangeDependencies
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    // Only initialize once
    if (!_isInitialized) {
      _isInitialized = true;

      // Get the authenticated DioClient from AuthProvider
      final authProvider = context.read<AuthProvider>();
      final dioClient = authProvider.dioClient;

      _productsRepository = ProductsRepository(dioClient);
      _cartRepository = CartRepository(dioClient);
      _wishlistRepository = WishlistRepository(dioClient);

      _fetchProductAndVariants();
    }
  }

  Future<void> _fetchProductAndVariants() async {
    if (!mounted) return;

    setState(() {
      isLoading = true;
    });

    try {
      // Fetch product details
      final productResult =
          await _productsRepository.getProduct(widget.productId);

      if (productResult.success && productResult.data != null) {
        // Fetch product variants
        final variantsResult =
            await _productsRepository.getProductVariants(widget.productId);

        if (variantsResult.success && variantsResult.data != null) {
          if (mounted) {
            setState(() {
              product = productResult.data;
              variants = variantsResult.data!;
              // Select first variant by default
              if (variants.isNotEmpty) {
                selectedVariant = variants.first;
              }
              isLoading = false;
            });
          }
        } else {
          if (mounted) {
            setState(() {
              product = productResult.data;
              isLoading = false;
            });
          }
        }
      } else {
        if (mounted) {
          setState(() {
            isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  Future<void> _addToCart() async {
    if (selectedVariant == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please select size'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() {
      isAddingToCart = true;
    });

    try {
      final result = await _cartRepository.addToCart(
        variantId: selectedVariant!.id,
        quantity: quantity,
      );

      if (mounted) {
        setState(() {
          isAddingToCart = false;
        });

        if (result.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result.message ?? 'Added to cart!'),
              backgroundColor: AppColors.success,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result.error ?? 'Failed to add to cart'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isAddingToCart = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _toggleWishlist() async {
    if (selectedVariant == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please select size'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() {
      isAddingToWishlist = true;
    });

    try {
      final result = await _wishlistRepository.addToWishlist(
        variantId: selectedVariant!.id,
      );

      if (mounted) {
        setState(() {
          isAddingToWishlist = false;
        });

        if (result.success) {
          setState(() {
            isInWishlist = true;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result.message ?? 'Added to wishlist!'),
              backgroundColor: AppColors.success,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result.error ?? 'Failed to add to wishlist'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isAddingToWishlist = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _buyNow() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Buy now functionality coming soon!'),
        backgroundColor: AppColors.info,
      ),
    );
  }

  void _incrementQuantity() {
    if (selectedVariant != null && quantity < selectedVariant!.stock) {
      setState(() {
        quantity++;
      });
    }
  }

  void _decrementQuantity() {
    if (quantity > 1) {
      setState(() {
        quantity--;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        backgroundColor: AppColors.backgroundWhite,
        body: Center(
          child: CircularProgressIndicator(
            color: AppColors.buttonPrimary,
          ),
        ),
      );
    }

    if (product == null) {
      return Scaffold(
        backgroundColor: AppColors.backgroundWhite,
        body: const Center(child: Text('Product not found')),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.backgroundWhite,
      appBar: AppBar(
        title: Text(product!.name),
        centerTitle: true,
        backgroundColor: AppColors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: isAddingToWishlist ? null : _toggleWishlist,
            icon: isAddingToWishlist
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: AppColors.buttonPrimary,
                      strokeWidth: 2,
                    ),
                  )
                : Icon(
                    isInWishlist ? Icons.favorite : Icons.favorite_border,
                    color: AppColors.buttonPrimary,
                  ),
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 90),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image Carousel
                SizedBox(
                  height: 350,
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
                        errorBuilder: (context, error, stackTrace) => Icon(
                          Icons.broken_image,
                          size: 100,
                          color: AppColors.textLight,
                        ),
                      );
                    },
                  ),
                ),

                // Image Indicators
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: product!.images.asMap().entries.map((entry) {
                      return Container(
                        width: 8.0,
                        height: 8.0,
                        margin: const EdgeInsets.symmetric(horizontal: 4.0),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _currentImage == entry.key
                              ? AppColors.buttonPrimary
                              : AppColors.border,
                        ),
                      );
                    }).toList(),
                  ),
                ),

                // Product Info
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Name and Price Row
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  product!.name,
                                  style: TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                if (product!.categoryName != null)
                                  Text(
                                    product!.categoryName!,
                                    style: TextStyle(
                                      color: AppColors.textLight,
                                      fontSize: 14,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Price
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              if (product!.hasDiscount)
                                Text(
                                  '\$${product!.price.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    color: AppColors.textLight,
                                    fontSize: 14,
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                              Text(
                                '\$${product!.finalPrice.toStringAsFixed(2)}',
                                style: TextStyle(
                                  color: AppColors.buttonPrimary,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),

                      // Select Size and Quantity Row
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Size Selection
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Select Size',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                if (variants.isNotEmpty)
                                  Wrap(
                                    spacing: 10,
                                    runSpacing: 10,
                                    children: variants.map((variant) {
                                      final isSelected =
                                          selectedVariant?.id == variant.id;
                                      return GestureDetector(
                                        onTap: () {
                                          setState(() {
                                            selectedVariant = variant;
                                            // Reset quantity if it exceeds new variant's stock
                                            if (quantity > variant.stock) {
                                              quantity = variant.stock > 0 ? 1 : 0;
                                            }
                                          });
                                        },
                                        child: Container(
                                          width: 50,
                                          height: 50,
                                          decoration: BoxDecoration(
                                            color: isSelected
                                                ? AppColors.buttonPrimary
                                                : AppColors.white,
                                            border: Border.all(
                                              color: isSelected
                                                  ? AppColors.buttonPrimary
                                                  : AppColors.border,
                                              width: isSelected ? 2 : 1,
                                            ),
                                            shape: BoxShape.circle,
                                          ),
                                          child: Center(
                                            child: Text(
                                              variant.size.toUpperCase(),
                                              style: TextStyle(
                                                color: isSelected
                                                    ? AppColors.white
                                                    : AppColors.textPrimary,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 14,
                                              ),
                                            ),
                                          ),
                                        ),
                                      );
                                    }).toList(),
                                  ),
                              ],
                            ),
                          ),

                          const SizedBox(width: 20),

                          // Quantity Selector
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                'Quantity',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: AppColors.border,
                                    width: 1,
                                  ),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(
                                      onPressed: _decrementQuantity,
                                      icon: const Icon(Icons.remove, size: 18),
                                      color: AppColors.textPrimary,
                                      constraints: const BoxConstraints(
                                        minWidth: 36,
                                        minHeight: 36,
                                      ),
                                      padding: EdgeInsets.zero,
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 12),
                                      child: Text(
                                        '$quantity',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                    ),
                                    IconButton(
                                      onPressed: _incrementQuantity,
                                      icon: const Icon(Icons.add, size: 18),
                                      color: AppColors.textPrimary,
                                      constraints: const BoxConstraints(
                                        minWidth: 36,
                                        minHeight: 36,
                                      ),
                                      padding: EdgeInsets.zero,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Virtual Try-On Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content:
                                    const Text('Virtual Try-On coming soon!'),
                                backgroundColor: AppColors.info,
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            backgroundColor: AppColors.white,
                            foregroundColor: AppColors.buttonPrimary,
                            side: BorderSide(
                              color: AppColors.buttonPrimary,
                              width: 2,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                            elevation: 0,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.view_in_ar,
                                  color: AppColors.buttonPrimary),
                              const SizedBox(width: 8),
                              const Text(
                                'Virtually Try-On',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Description
                      Text(
                        'Description',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        product!.description,
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 15,
                          height: 1.6,
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Divider
                      Divider(color: AppColors.divider, thickness: 1),

                      const SizedBox(height: 16),

                      // Reviews Section
                      Text(
                        'Reviews',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 12),

                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor:
                              AppColors.buttonPrimary.withValues(alpha: 0.2),
                          child:
                              Icon(Icons.person, color: AppColors.buttonPrimary),
                        ),
                        title: Text(
                          'John Doe',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        subtitle: Text(
                          'Great product! Really liked the fabric.',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                        trailing: const Icon(Icons.star, color: Colors.amber),
                      ),

                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor:
                              AppColors.buttonPrimary.withValues(alpha: 0.2),
                          child:
                              Icon(Icons.person, color: AppColors.buttonPrimary),
                        ),
                        title: Text(
                          'Jane Smith',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        subtitle: Text(
                          'Nice fit, will buy again!',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                        trailing: const Icon(Icons.star, color: Colors.amber),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Floating Bottom Buttons
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: AppColors.white,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadow,
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: SafeArea(
                top: false,
                child: Row(
                  children: [
                    // Add to Cart Button (Secondary)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: isAddingToCart ? null : _addToCart,
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: BorderSide(
                            color: AppColors.buttonPrimary,
                            width: 2,
                          ),
                          foregroundColor: AppColors.buttonPrimary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        child: isAddingToCart
                            ? SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  color: AppColors.buttonPrimary,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text(
                                'Add to Cart',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),

                    const SizedBox(width: 12),

                    // Buy Now Button (Primary)
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _buyNow,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          backgroundColor: AppColors.buttonPrimary,
                          foregroundColor: AppColors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        child: const Text(
                          'Buy Now',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

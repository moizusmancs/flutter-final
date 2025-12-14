import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:frontend/data/models/product_model.dart';
import 'package:frontend/data/repositories/products_repository.dart';
import 'package:frontend/data/repositories/cart_repository.dart';
import 'package:frontend/data/repositories/wishlist_repository.dart';
import 'package:frontend/core/network/dio_client.dart';
import 'package:frontend/widgets/circular_category_item.dart';
import 'package:frontend/widgets/custom_search_bar.dart';
import 'package:frontend/widgets/custom_app_bar.dart';
import 'package:frontend/widgets/product_card.dart';
import 'package:frontend/core/theme/app_colors.dart';
import 'package:frontend/providers/auth_provider.dart';
import 'package:frontend/screens/home/category_screen.dart';
import 'package:frontend/screens/home/categories_list_screen.dart';
import 'package:frontend/screens/home/product_detail_screen.dart';
import 'package:frontend/screens/cart/cart_screen.dart';
import 'package:frontend/screens/wishlist/wishlist_screen.dart';
import 'package:frontend/screens/profile/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Product> products = [];
  bool isLoading = true;
  int cartCount = 0;
  int wishlistCount = 0;
  late ProductsRepository _productsRepository;
  late CartRepository _cartRepository;
  late WishlistRepository _wishlistRepository;

  @override
  void initState() {
    super.initState();
    // Get DioClient from context to create repositories
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      final dioClient = authProvider.dioClient;

      _productsRepository = ProductsRepository(dioClient);
      _cartRepository = CartRepository(dioClient);
      _wishlistRepository = WishlistRepository(dioClient);

      _loadProducts();
      _loadCartCount();
      _loadWishlistCount();
    });
  }

  Future<void> _loadProducts() async {
    setState(() {
      isLoading = true;
    });

    try {
      final result = await _productsRepository.getProducts(
        page: 1,
        limit: 10,
        sort: 'desc', // Latest products first
      );

      if (result.success && result.data != null) {
        if (mounted) {
          setState(() {
            products = result.data!;
            isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            isLoading = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result.error ?? 'Failed to load products'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
      print('Error fetching products: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading products: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _loadCartCount() async {
    try {
      final result = await _cartRepository.getCart();
      if (result.success && result.data != null && mounted) {
        setState(() {
          cartCount = result.data!['count'] as int;
        });
      }
    } catch (e) {
      // Silently fail - count will remain 0
      print('Error fetching cart count: $e');
    }
  }

  Future<void> _loadWishlistCount() async {
    try {
      final result = await _wishlistRepository.getWishlist();
      if (result.success && result.data != null && mounted) {
        setState(() {
          wishlistCount = result.data!['count'] as int;
        });
      }
    } catch (e) {
      // Silently fail - count will remain 0
      print('Error fetching wishlist count: $e');
    }
  }

  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> categories = [
    {'label': 'Sale', 'icon': Icons.local_offer, 'categoryId': null}, // null means latest products
    {'label': 'Men', 'icon': Icons.man, 'categoryId': 1},
    {'label': 'Women', 'icon': Icons.woman, 'categoryId': 2},
    {'label': 'Kids', 'icon': Icons.child_care, 'categoryId': 3},
  ];


  int _selectedIndex = 0;

  void _onBottomNavTap(int index) {
    if (index == 1) {
      // Navigate to Categories screen
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const CategoriesListScreen(),
        ),
      );
    } else if (index == 2) {
      // Navigate to Cart screen
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const CartScreen(),
        ),
      ).then((_) => _loadCartCount()); // Reload count when returning
    } else if (index == 3) {
      // Navigate to Profile screen
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const ProfileScreen(),
        ),
      );
    } else {
      setState(() {
        _selectedIndex = index;
      });
    }
  }

  void _onCategoryTap(String label, int? categoryId) {
    if (categoryId == null) {
      // "Sale" button - just reload latest products
      _loadProducts();
    } else {
      // Navigate to category screen
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => CategoryScreen(
            categoryName: label,
            categoryId: categoryId,
          ),
        ),
      );
    }
  }

  void _onProductTap(Product product) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProductDetailPage(productId: product.id),
      ),
    );
  }

  Widget _buildCartIconWithBadge(bool isActive) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Icon(isActive ? Icons.shopping_cart : Icons.shopping_cart_outlined),
        if (cartCount > 0)
          Positioned(
            right: -6,
            top: -6,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.error,
                shape: BoxShape.circle,
              ),
              constraints: const BoxConstraints(
                minWidth: 16,
                minHeight: 16,
              ),
              child: Text(
                cartCount > 99 ? '99+' : cartCount.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(color: AppColors.buttonPrimary),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'VougeAR',
                    style: TextStyle(
                      color: AppColors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    authProvider.user?.fullname ?? 'Guest',
                    style: TextStyle(
                      color: AppColors.white.withValues(alpha: 0.9),
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            ListTile(
              leading: Icon(Icons.home, color: AppColors.textPrimary),
              title: const Text('Home'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: Icon(Icons.shopping_cart, color: AppColors.textPrimary),
              title: const Text('Cart'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Icon(Icons.favorite, color: AppColors.textPrimary),
              title: const Text('Favourites'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const WishlistScreen(),
                  ),
                ).then((_) => _loadWishlistCount());
              },
            ),
            ListTile(
              leading: Icon(Icons.person, color: AppColors.textPrimary),
              title: const Text('Profile'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const ProfileScreen(),
                  ),
                );
              },
            ),
            const Divider(),
            ListTile(
              leading: Icon(Icons.logout, color: AppColors.error),
              title: const Text('Logout'),
              onTap: () async {
                await authProvider.logout();
                if (mounted) {
                  Navigator.of(context).pushReplacementNamed('/');
                }
              },
            ),
          ],
        ),
      ),

      appBar: CustomAppBar(
        wishlistCount: wishlistCount,
        onFavouriteTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const WishlistScreen(),
            ),
          ).then((_) => _loadWishlistCount()); // Reload count when returning
        },
      ),

      body: isLoading
          ? Center(
              child: CircularProgressIndicator(
                color: AppColors.buttonPrimary,
              ),
            )
          : CustomScrollView(
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.all(16.0),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      // Combined Container: Search Bar + Categories
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppColors.buttonPrimary,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Search Bar
                            CustomSearchBar(
                              controller: _searchController,
                              hintText: 'Search for products',
                              onChanged: (value) {
                                // Handle search
                              },
                            ),

                            const SizedBox(height: 16),

                            // Divider
                            Divider(
                              color: AppColors.white.withValues(alpha: 0.3),
                              thickness: 1,
                            ),

                            const SizedBox(height: 16),

                            // Popular Categories Text
                            Text(
                              'Popular Categories',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: AppColors.white,
                              ),
                            ),

                            const SizedBox(height: 16),

                            // Category Section
                            SizedBox(
                              height: 105,
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                itemCount: categories.length,
                                itemBuilder: (context, index) {
                                  final category = categories[index];
                                  return Padding(
                                    padding: EdgeInsets.only(
                                      left: index == 0 ? 0 : 8,
                                      right: index == categories.length - 1 ? 0 : 8,
                                    ),
                                    child: CircularCategoryItem(
                                      label: category['label'],
                                      icon: category['icon'],
                                      isSelected: false,
                                      onTap: () {
                                        _onCategoryTap(category['label'], category['categoryId']);
                                      },
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Recommended Section Header
                      Text(
                        'Recommended',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),

                      const SizedBox(height: 16),
                    ]),
                  ),
                ),

                // Product Grid as Sliver
                products.isEmpty
                    ? SliverFillRemaining(
                        child: Center(
                          child: Text(
                            'No products available',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        sliver: SliverGrid(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            mainAxisSpacing: 12,
                            crossAxisSpacing: 12,
                            childAspectRatio: 0.7,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final product = products[index];
                              return GestureDetector(
                                onTap: () => _onProductTap(product),
                                child: ProductCard(product: product),
                              );
                            },
                            childCount: products.length,
                          ),
                        ),
                      ),
              ],
            ),

      // Bottom Navigation
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onBottomNavTap,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.buttonPrimary,
        unselectedItemColor: AppColors.textLight,
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.category_outlined),
            activeIcon: Icon(Icons.category),
            label: 'Categories',
          ),
          BottomNavigationBarItem(
            icon: _buildCartIconWithBadge(false),
            activeIcon: _buildCartIconWithBadge(true),
            label: 'Cart',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

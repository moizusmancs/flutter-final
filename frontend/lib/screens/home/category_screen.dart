import 'package:flutter/material.dart';
import 'package:frontend/data/models/product_model.dart';
import 'package:frontend/data/repositories/products_repository.dart';
import 'package:frontend/core/network/dio_client.dart';
import 'package:frontend/core/theme/app_colors.dart';
import 'package:frontend/widgets/product_card.dart';
import 'package:frontend/screens/home/product_detail_screen.dart';

class CategoryScreen extends StatefulWidget {
  final String categoryName;
  final int categoryId;

  const CategoryScreen({
    super.key,
    required this.categoryName,
    required this.categoryId,
  });

  @override
  State<CategoryScreen> createState() => _CategoryScreenState();
}

class _CategoryScreenState extends State<CategoryScreen> {
  List<Product> products = [];
  bool isLoading = false;
  bool isLoadingMore = false;
  late ProductsRepository _productsRepository;
  late ScrollController _scrollController;

  int currentPage = 1;
  final int pageSize = 20;
  bool hasMore = true;

  String sortOrder = 'desc';

  final Map<String, String> sortOptions = {
    'desc': 'Latest',
    'asc': 'Oldest',
    'price_desc': 'Highest Price',
    'price_asc': 'Lowest Price',
  };

  @override
  void initState() {
    super.initState();
    _productsRepository = ProductsRepository(DioClient());
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
    _loadProducts();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      if (!isLoadingMore && hasMore) {
        _loadMoreProducts();
      }
    }
  }

  Future<void> _loadProducts({bool refresh = false}) async {
    if (refresh) {
      setState(() {
        currentPage = 1;
        products = [];
        hasMore = true;
      });
    }

    if (mounted) {
      setState(() {
        isLoading = true;
      });
    }

    try {
      final result = await _productsRepository.getProductsByCategory(
        widget.categoryId,
        page: currentPage,
        limit: pageSize,
        sort: sortOrder,
      );

      if (result.success && result.data != null) {
        if (mounted) {
          setState(() {
            products = result.data!;
            isLoading = false;
            hasMore = result.data!.length >= pageSize;
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

  Future<void> _loadMoreProducts() async {
    if (isLoadingMore || !hasMore) return;

    setState(() {
      isLoadingMore = true;
    });

    try {
      final result = await _productsRepository.getProductsByCategory(
        widget.categoryId,
        page: currentPage + 1,
        limit: pageSize,
        sort: sortOrder,
      );

      if (result.success && result.data != null) {
        if (mounted) {
          setState(() {
            currentPage++;
            products.addAll(result.data!);
            isLoadingMore = false;
            hasMore = result.data!.length >= pageSize;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            isLoadingMore = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoadingMore = false;
        });
      }
      print('Error loading more products: $e');
    }
  }

  void _changeSortOrder(String? newSort) {
    if (newSort != null && newSort != sortOrder) {
      setState(() {
        sortOrder = newSort;
      });
      _loadProducts(refresh: true);
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundWhite,
      appBar: AppBar(
        title: Text(widget.categoryName),
        backgroundColor: AppColors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: true,
      ),
      body: isLoading
          ? Center(
              child: CircularProgressIndicator(
                color: AppColors.buttonPrimary,
              ),
            )
          : CustomScrollView(
              controller: _scrollController,
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.all(16.0),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      // Category Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${widget.categoryName} Collection',
                                  style: TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '${products.length} products available',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Sort Dropdown
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              border: Border.all(color: AppColors.border),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: DropdownButton<String>(
                              value: sortOrder,
                              underline: const SizedBox(),
                              icon: Icon(Icons.sort, color: AppColors.textPrimary, size: 20),
                              items: sortOptions.entries.map((entry) {
                                return DropdownMenuItem(
                                  value: entry.key,
                                  child: Text(
                                    entry.value,
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                );
                              }).toList(),
                              onChanged: _changeSortOrder,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                    ]),
                  ),
                ),

                // Products Grid
                products.isEmpty
                    ? SliverFillRemaining(
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.shopping_bag_outlined,
                                size: 80,
                                color: AppColors.textLight,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'No products in this category yet',
                                style: TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 16,
                                ),
                              ),
                            ],
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

                // Loading More Indicator
                if (isLoadingMore)
                  SliverPadding(
                    padding: const EdgeInsets.all(16.0),
                    sliver: SliverToBoxAdapter(
                      child: Center(
                        child: CircularProgressIndicator(
                          color: AppColors.buttonPrimary,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
    );
  }
}

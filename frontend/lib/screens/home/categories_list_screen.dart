import 'package:flutter/material.dart';
import 'package:frontend/data/models/category_model.dart';
import 'package:frontend/data/repositories/categories_repository.dart';
import 'package:frontend/core/network/dio_client.dart';
import 'package:frontend/core/theme/app_colors.dart';
import 'package:frontend/screens/home/category_screen.dart';

class CategoriesListScreen extends StatefulWidget {
  const CategoriesListScreen({super.key});

  @override
  State<CategoriesListScreen> createState() => _CategoriesListScreenState();
}

class _CategoriesListScreenState extends State<CategoriesListScreen> {
  late CategoriesRepository _categoriesRepository;
  bool isLoading = true;

  // Parent categories - hardcoded IDs
  int selectedParentId = 1; // Men by default
  final Map<int, String> parentCategories = {
    1: 'Men',
    2: 'Women',
    3: 'Kids',
  };

  List<Category> subcategories = [];

  @override
  void initState() {
    super.initState();
    _categoriesRepository = CategoriesRepository(DioClient());
    _loadCategoryData();
  }

  Future<void> _loadCategoryData() async {
    if (!mounted) return;

    setState(() {
      isLoading = true;
    });

    try {
      final result = await _categoriesRepository.getCategory(selectedParentId);

      if (result.success && result.data != null) {
        if (mounted) {
          setState(() {
            subcategories = result.data!.subcategories ?? [];
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
              content: Text(result.error ?? 'Failed to load categories'),
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
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading categories: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _onParentCategoryChanged(int parentId) {
    if (parentId != selectedParentId) {
      setState(() {
        selectedParentId = parentId;
      });
      _loadCategoryData();
    }
  }

  void _onSubcategoryTap(Category subcategory) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CategoryScreen(
          categoryName: subcategory.name,
          categoryId: subcategory.id,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundWhite,
      appBar: AppBar(
        title: const Text('Categories'),
        backgroundColor: AppColors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: true,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Parent Category Tabs (Men, Women, Kids)
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: parentCategories.entries.map((entry) {
                final isSelected = entry.key == selectedParentId;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4.0),
                    child: GestureDetector(
                      onTap: () => _onParentCategoryChanged(entry.key),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.buttonPrimary
                              : AppColors.white,
                          borderRadius: BorderRadius.circular(25),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.buttonPrimary
                                : AppColors.border,
                            width: 1,
                          ),
                        ),
                        child: Text(
                          entry.value,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: isSelected
                                ? AppColors.white
                                : AppColors.textPrimary,
                            fontWeight:
                                isSelected ? FontWeight.bold : FontWeight.w500,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Divider
          Divider(
            color: AppColors.divider,
            thickness: 1,
            height: 1,
          ),

          // Subcategories Header
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'Sub Categories',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
          ),

          // Subcategories List
          Expanded(
            child: isLoading
                ? Center(
                    child: CircularProgressIndicator(
                      color: AppColors.buttonPrimary,
                    ),
                  )
                : subcategories.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.category_outlined,
                              size: 80,
                              color: AppColors.textLight,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No subcategories found',
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        itemCount: subcategories.length,
                        separatorBuilder: (context, index) =>
                            const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final subcategory = subcategories[index];
                          return _SubcategoryItem(
                            subcategory: subcategory,
                            onTap: () => _onSubcategoryTap(subcategory),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

class _SubcategoryItem extends StatelessWidget {
  final Category subcategory;
  final VoidCallback onTap;

  const _SubcategoryItem({
    required this.subcategory,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: AppColors.border,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.shadowLight,
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Subcategory Name
            Expanded(
              child: Text(
                subcategory.name,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
            ),

            // Product Count and Arrow
            Row(
              children: [
                if (subcategory.productCount != null) ...[
                  Text(
                    '${subcategory.productCount}',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
                Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: AppColors.textLight,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

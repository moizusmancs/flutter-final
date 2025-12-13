import 'package:flutter/material.dart';
import 'package:frontend/core/theme/app_colors.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback? onMenuTap;
  final VoidCallback? onFavouriteTap;
  final int wishlistCount;

  const CustomAppBar({
    super.key,
    this.onMenuTap,
    this.onFavouriteTap,
    this.wishlistCount = 0,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      leading: IconButton(
        icon: const Icon(Icons.menu),
        onPressed: onMenuTap ?? () => Scaffold.of(context).openDrawer(),
        color: AppColors.textPrimary,
      ),
      title: Text(
        'VougeAR',
        style: TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 22,
          color: AppColors.textPrimary,
          letterSpacing: 0.5,
        ),
      ),
      centerTitle: true,
      backgroundColor: AppColors.white,
      elevation: 0,
      actions: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            IconButton(
              icon: const Icon(Icons.favorite_border),
              onPressed: onFavouriteTap,
              color: AppColors.textPrimary,
            ),
            if (wishlistCount > 0)
              Positioned(
                right: 8,
                top: 8,
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
                    wishlistCount > 99 ? '99+' : wishlistCount.toString(),
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
        ),
      ],
    );
  }
}

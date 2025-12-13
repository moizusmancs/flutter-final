import 'package:flutter/material.dart';
import 'package:frontend/core/theme/app_colors.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final Color? color;
  final bool isSecondary;

  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.color,
    this.isSecondary = false,
  });

  @override
  Widget build(BuildContext context) {
    final buttonColor = color ??
        (isSecondary ? AppColors.buttonSecondary : AppColors.buttonPrimary);

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: buttonColor,
          foregroundColor: AppColors.white,
        ),
        onPressed: onPressed,
        child: Text(text),
      ),
    );
  }
}

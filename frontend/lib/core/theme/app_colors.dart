import 'package:flutter/material.dart';

/// App Color Palette
/// Pink and White theme with professional typography
class AppColors {
  // Primary Colors
  static const Color darkPink = Color(0xFFFB6F92);
  static const Color buttonPrimary = Color(0xFFFB6F92);
  static const Color buttonSecondary = Color(0xFFFF8FAB);

  // Neutral Colors
  static const Color white = Color(0xFFFFFFFF);
  static const Color backgroundWhite = Color(0xFFFAFAFA);

  // Text Colors
  static const Color textPrimary = Color(0xFF212529); // Headings and body
  static const Color textSecondary = Color(0xFF343A40); // Subheadings
  static const Color textLight = Color(0xFF6C757D); // Light text
  static const Color textDisabled = Color(0xFFADB5BD);

  // Additional UI Colors
  static const Color success = Color(0xFF28A745);
  static const Color error = Color(0xFFDC3545);
  static const Color warning = Color(0xFFFFC107);
  static const Color info = Color(0xFF17A2B8);

  // Surface Colors
  static const Color cardBackground = Color(0xFFFFFFFF);
  static const Color divider = Color(0xFFE9ECEF);
  static const Color border = Color(0xFFDEE2E6);

  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [darkPink, buttonSecondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Shadow Colors
  static final Color shadow = Colors.black.withOpacity(0.1);
  static final Color shadowLight = Colors.black.withOpacity(0.05);

  // Disabled States
  static final Color disabledButton = darkPink.withOpacity(0.5);
  static final Color disabledText = textPrimary.withOpacity(0.4);
}

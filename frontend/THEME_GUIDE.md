# VougeAR Theme Guide

## Color Palette

### Primary Colors
```dart
Dark Pink (Primary):    #FB6F92
Button Primary:         #FB6F92
Button Secondary:       #FF8FAB
White:                  #FFFFFF
Background White:       #FAFAFA
```

### Text Colors
```dart
Text Primary (Headings/Body):  #212529
Text Secondary (Subheadings):  #343A40
Text Light:                     #6C757D
Text Disabled:                  #ADB5BD
```

### Additional UI Colors
```dart
Success:    #28A745
Error:      #DC3545
Warning:    #FFC107
Info:       #17A2B8
```

---

## Using the Theme

### 1. Accessing Theme Colors

```dart
import 'package:frontend/core/theme/app_colors.dart';

// In your widget
Container(
  color: AppColors.buttonPrimary,
  child: Text(
    'Hello',
    style: TextStyle(color: AppColors.white),
  ),
)
```

### 2. Using Theme Data

```dart
// Access theme colors via context
final theme = Theme.of(context);

Text(
  'Heading',
  style: theme.textTheme.headlineLarge,
)

// Access color scheme
Container(
  color: theme.colorScheme.primary, // #FB6F92
)
```

---

## Text Styles

### Display (Largest)
```dart
displayLarge:    32px, Bold (700)
displayMedium:   28px, Bold (700)
displaySmall:    24px, SemiBold (600)
```

### Headlines
```dart
headlineLarge:   22px, SemiBold (600)
headlineMedium:  20px, SemiBold (600)
headlineSmall:   18px, SemiBold (600)
```

### Titles
```dart
titleLarge:      18px, SemiBold (600)
titleMedium:     16px, SemiBold (600)  - Uses textSecondary color
titleSmall:      14px, Medium (500)    - Uses textSecondary color
```

### Body
```dart
bodyLarge:       16px, Regular (400)
bodyMedium:      14px, Regular (400)
bodySmall:       12px, Regular (400)   - Uses textSecondary color
```

### Labels
```dart
labelLarge:      14px, Medium (500)
labelMedium:     12px, Medium (500)    - Uses textSecondary color
labelSmall:      11px, Regular (400)   - Uses textLight color
```

---

## Component Styles

### Buttons

#### Elevated Button (Primary)
```dart
ElevatedButton(
  onPressed: () {},
  child: Text('Primary Button'),
)
```
- Background: #FB6F92 (buttonPrimary)
- Text: White
- Padding: 24px horizontal, 14px vertical
- Border Radius: 8px

#### Outlined Button
```dart
OutlinedButton(
  onPressed: () {},
  child: Text('Outlined Button'),
)
```
- Border: #FB6F92, 1.5px width
- Text: #FB6F92
- Background: Transparent

#### Text Button
```dart
TextButton(
  onPressed: () {},
  child: Text('Text Button'),
)
```
- Text: #FB6F92
- No background

### Text Fields

```dart
TextField(
  decoration: InputDecoration(
    labelText: 'Email',
    hintText: 'Enter your email',
  ),
)
```
- Background: White
- Border: #DEE2E6
- Focused Border: #FB6F92, 2px
- Error Border: #DC3545
- Border Radius: 8px

### Cards

```dart
Card(
  child: Padding(
    padding: EdgeInsets.all(16),
    child: Text('Card Content'),
  ),
)
```
- Background: White
- Elevation: 2
- Border Radius: 12px
- Margin: 8px

### App Bar

```dart
AppBar(
  title: Text('Screen Title'),
  actions: [
    IconButton(icon: Icon(Icons.search), onPressed: () {}),
  ],
)
```
- Background: White
- Text: #212529
- Elevation: 0
- Center Title: true

### Bottom Navigation

```dart
BottomNavigationBar(
  items: [
    BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
    BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
  ],
)
```
- Selected Color: #FB6F92
- Unselected Color: #6C757D
- Background: White

---

## Usage Examples

### Example 1: Custom Button with Theme

```dart
import 'package:frontend/core/theme/app_colors.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isPrimary;

  const CustomButton({
    required this.text,
    required this.onPressed,
    this.isPrimary = true,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: isPrimary
            ? AppColors.buttonPrimary
            : AppColors.buttonSecondary,
      ),
      onPressed: onPressed,
      child: Text(text),
    );
  }
}
```

### Example 2: Themed Card

```dart
Card(
  child: Padding(
    padding: EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Product Name',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        SizedBox(height: 8),
        Text(
          'Description goes here',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        SizedBox(height: 12),
        Text(
          '\$99.99',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: AppColors.buttonPrimary,
          ),
        ),
      ],
    ),
  ),
)
```

### Example 3: Gradient Background

```dart
import 'package:frontend/core/theme/app_colors.dart';

Container(
  decoration: BoxDecoration(
    gradient: AppColors.primaryGradient,
  ),
  child: Center(
    child: Text(
      'Welcome',
      style: TextStyle(
        color: AppColors.white,
        fontSize: 24,
        fontWeight: FontWeight.bold,
      ),
    ),
  ),
)
```

---

## Best Practices

### 1. Always Use Theme Colors
```dart
// ✅ Good
Text('Title', style: TextStyle(color: AppColors.textPrimary))

// ❌ Bad
Text('Title', style: TextStyle(color: Color(0xFF212529)))
```

### 2. Use Theme Text Styles
```dart
// ✅ Good
Text('Heading', style: Theme.of(context).textTheme.headlineLarge)

// ❌ Bad
Text('Heading', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600))
```

### 3. Use Semantic Colors
```dart
// ✅ Good - Success message
Container(color: AppColors.success)

// ✅ Good - Error state
Container(color: AppColors.error)
```

### 4. Maintain Consistency
- Use `AppColors.buttonPrimary` for all primary actions
- Use `AppColors.textPrimary` for main content
- Use `AppColors.textSecondary` for supporting text

---

## Updating Custom Widgets

### Update CustomButton

```dart
// OLD
class CustomButton extends StatelessWidget {
  final Color color;

  const CustomButton({
    this.color = Colors.blue, // ❌
  });
}

// NEW
class CustomButton extends StatelessWidget {
  final Color color;

  const CustomButton({
    this.color = AppColors.buttonPrimary, // ✅
  });
}
```

### Update CustomTextField

TextField already respects theme via `inputDecorationTheme`, so no changes needed!

---

## Quick Reference

### Common Color Uses

| Use Case | Color |
|----------|-------|
| Primary Button | `AppColors.buttonPrimary` |
| Secondary Button | `AppColors.buttonSecondary` |
| Link/Action Text | `AppColors.buttonPrimary` |
| Page Background | `AppColors.backgroundWhite` |
| Card Background | `AppColors.white` |
| Main Heading | `AppColors.textPrimary` |
| Subheading | `AppColors.textSecondary` |
| Description Text | `AppColors.textLight` |
| Success Message | `AppColors.success` |
| Error Message | `AppColors.error` |
| Border/Divider | `AppColors.border` / `AppColors.divider` |

---

## Switching Themes

Currently using light theme. To add dark mode support later:

```dart
// In main.dart - already configured!
MaterialApp(
  theme: AppTheme.lightTheme,
  darkTheme: AppTheme.darkTheme,  // ✅ Ready for dark mode
  themeMode: ThemeMode.system,    // Follows system preference
)
```

---

*Follow this guide to maintain visual consistency across the VougeAR app!*

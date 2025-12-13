# VougeAR Flutter E-Commerce Application

## Architecture Overview
Your project follows a **hybrid architecture** combining:
- **Layered architecture** (separation of concerns)
- **Feature-based organization** (screens grouped by domain)

## Current Folder Structure

```
lib/
├── core/                    # Shared/reusable functionality
│   ├── constants/          # API endpoints
│   ├── network/            # HTTP client (Dio) with interceptors
│   ├── theme/              # Material 3 themes & colors
│   └── validators.dart     # Input validation
│
├── data/                   # Data layer
│   ├── models/             # User model with JSON serialization
│   └── repositories/       # Auth repository
│
├── providers/              # State management (Provider)
│   └── auth_provider.dart  # Auth state management
│
├── screens/                # Feature screens
│   ├── auth/              # Login, signup screens
│   ├── home/              # Product listing, details
│   └── cart/              # Shopping cart
│
├── widgets/                # Reusable UI components
│   ├── custom_button.dart
│   ├── custom_textfield.dart
│   └── product_card.dart
│
└── services/               # Business logic/API services
```

## Directory Structure Overview

```
lib/
├── main.dart                          # App entry point
├── core/                              # Core/shared functionality (reusable)
│   ├── constants/
│   │   └── api_constants.dart        # API endpoints and base URL
│   ├── network/
│   │   ├── dio_client.dart           # HTTP client (Dio) with interceptors
│   │   └── api_result.dart           # Generic wrapper for API responses
│   ├── theme/
│   │   ├── app_colors.dart           # Color palette
│   │   └── app_theme.dart            # Material 3 light/dark themes
│   ├── validators.dart               # Input validation functions
│   └── errors/                       # (Empty - prepared for error classes)
│
├── data/                              # Data layer (repositories & models)
│   ├── models/
│   │   ├── user_model.dart           # User entity (with @JsonSerializable)
│   │   └── user_model.g.dart         # Generated JSON serialization code
│   ├── repositories/
│   │   └── auth_repository.dart      # Auth API integration layer
│   └── services/                     # (Empty - prepared for data services)
│
├── models/                            # Business/presentation models
│   └── product_model.dart            # Product entity
│
├── providers/                         # State management (Provider package)
│   └── auth_provider.dart            # Authentication provider
│
├── screens/                           # Feature-based screens/pages
│   ├── auth/
│   │   ├── login_screen.dart         # Login UI
│   │   ├── signup_choice_screen.dart # Auth method selection
│   │   └── signup_email_screen.dart  # Email signup form
│   ├── home/
│   │   ├── home_screen.dart          # Product listing/catalog
│   │   └── product_detail_screen.dart # Single product details
│   └── cart/
│       └── cart_screen.dart          # Shopping cart UI
│
├── services/                          # Business logic/API services
│   └── api_service.dart              # General API service wrapper
│
└── widgets/                           # Reusable UI components
    ├── custom_textfield.dart         # Custom text input widget
    ├── custom_button.dart            # Custom button widget
    ├── category_chip.dart            # Category filter chip
    └── product_card.dart             # Product listing card
```

## Architecture Patterns & Design

**1. Layered Architecture:**
- **Presentation Layer:** `screens/` + `widgets/` + `providers/`
- **Data Layer:** `data/repositories/`, `data/models/`
- **Core/Infrastructure Layer:** `core/network/`, `core/constants/`, `core/theme/`

**2. Feature-Based Organization:**
- Features are grouped by domain: `auth`, `home`, `cart`
- Each feature has its own screens and related UI components

**3. State Management:**
- Uses **Provider** package for reactive state management
- `AuthProvider` manages authentication state with mock mode for testing

**4. API Integration Pattern:**
- `DioClient`: HTTP client wrapper with interceptors, cookie management, and logging
- `AuthRepository`: Repository pattern for auth endpoints
- `ApiResult<T>`: Generic wrapper for type-safe API responses

**5. Data Models:**
- **User Model** (data/models/): JSON serializable with @JsonSerializable() annotation
- **Product Model** (models/): Domain model for products

## Key Dependencies (from pubspec.yaml)

**State Management:**
- `provider: ^6.1.1` - Reactive state management

**HTTP & Networking:**
- `dio: ^5.4.0` - Modern HTTP client
- `cookie_jar: ^4.0.8` + `dio_cookie_manager: ^3.1.1` - Cookie persistence
- `http: ^0.13.6` - Alternative HTTP library

**Storage:**
- `shared_preferences: ^2.2.2` - Key-value storage
- `flutter_secure_storage: ^9.0.0` - Secure credential storage
- `path_provider: ^2.1.1` - Device directory access

**Serialization:**
- `json_annotation: ^4.8.1` - JSON serialization annotations
- `json_serializable: ^6.7.1` - Code generation for JSON

**UI/Utilities:**
- `carousel_slider: 4.2.0` - Image carousels
- `flutter_dotenv: ^5.1.0` - Environment configuration
- `cupertino_icons: ^1.0.8` - iOS-style icons
- `flutter_lints: ^5.0.0` - Code linting

## Key Features Already Implemented
- ✅ Authentication screens (login, signup)
- ✅ Auth provider with **mock mode** enabled (MOCK_AUTH_MODE = true)
- ✅ DioClient with logging & cookie management
- ✅ Material 3 theme system (light/dark mode)
- ✅ Reusable UI widgets
- ✅ Input validators
- ✅ API endpoints configured (base: `http://localhost:4000/api/v1`)

## Current Implementation Status

**Implemented Features:**
- Authentication screens (login, signup)
- Auth provider with mock mode (bypass API for testing)
- DioClient with request/response logging and cookie management
- AuthRepository with signup/login/logout endpoints
- Home and product detail screens (UI structure)
- Shopping cart screen (UI structure)
- Theme system with Material 3 support
- Validators for input fields
- Reusable UI widgets (button, textfield, chips, product card)

**Development Notes:**
- Mock authentication mode is currently **enabled** in `AuthProvider` (MOCK_AUTH_MODE = true)
- API constants defined for all endpoints but backend integration in progress
- Data layer structure prepared but some services empty (data/services/)
- Error handling classes prepared (core/errors/) but not yet implemented
- Dark theme scaffolding present but not fully implemented

## API Endpoints Configuration

**Base URL:** `http://localhost:4000/api/v1`

**Endpoint Categories:**
- **Auth:** `/users/auth/signup`, `/users/auth/login`, `/users/auth/logout`
- **Products:** `/products`, `/products/search`
- **Cart:** `/users/cart`, `/users/cart/clear`
- **Categories:** `/categories`
- **Orders, Wishlist, Addresses, Payments, Coupons** - All endpoints defined

## Key Observations

1. **Architecture Style:** Clean separation between presentation (screens), business logic (providers), and data access (repositories)
2. **Type Safety:** Uses generics extensively (ApiResult<T>, Provider patterns)
3. **Development Readiness:** Comprehensive logging in DioClient, validators in place, mock mode for rapid development
4. **Scalability:** Structure allows easy addition of new features/screens following established patterns
5. **Theme System:** Comprehensive Material 3 theme with light/dark mode support
6. **Error Handling:** Error handling integrated in DioClient and repositories with user-friendly messages

This is a well-structured Flutter project following modern best practices with clear separation of concerns and room for growth as development progresses.

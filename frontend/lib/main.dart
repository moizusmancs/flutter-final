import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:frontend/core/network/dio_client.dart';
import 'package:frontend/core/theme/app_theme.dart';
import 'package:frontend/core/constants/api_constants.dart';
import 'package:frontend/data/repositories/auth_repository.dart';
import 'package:frontend/data/repositories/profile_repository.dart';
import 'package:frontend/providers/auth_provider.dart';
import 'package:frontend/screens/auth/welcome_screen.dart';
import 'package:frontend/screens/home/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Stripe
  Stripe.publishableKey = ApiConstants.stripePublishableKey;
  Stripe.merchantIdentifier = 'merchant.com.vougear.app';
  await Stripe.instance.applySettings();

  // Initialize Dio client
  final dioClient = DioClient();
  await dioClient.initialize();

  runApp(MyApp(dioClient: dioClient));
}

class MyApp extends StatelessWidget {
  final DioClient dioClient;

  const MyApp({super.key, required this.dioClient});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(
            AuthRepository(dioClient),
            ProfileRepository(dioClient),
            dioClient,
          ),
        ),
        // Add more providers here later (CartProvider, WishlistProvider, etc.)
      ],
      child: MaterialApp(
        title: 'VougeAR',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.light,
        home: const AuthInitializer(),
      ),
    );
  }
}

class AuthInitializer extends StatefulWidget {
  const AuthInitializer({super.key});

  @override
  State<AuthInitializer> createState() => _AuthInitializerState();
}

class _AuthInitializerState extends State<AuthInitializer> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final authProvider = context.read<AuthProvider>();
    await authProvider.checkAuth();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    // Show loading screen while checking auth
    if (!authProvider.isInitialized) {
      return Scaffold(
        body: Center(
          child: CircularProgressIndicator(
            color: AppTheme.lightTheme.colorScheme.primary,
          ),
        ),
      );
    }

    // Navigate to appropriate screen based on auth status
    if (authProvider.isAuthenticated) {
      return const HomeScreen();
    } else {
      return const WelcomeScreen();
    }
  }
}

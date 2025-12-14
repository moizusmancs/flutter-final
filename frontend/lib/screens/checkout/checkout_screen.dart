import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/theme/app_colors.dart';
import 'package:frontend/providers/auth_provider.dart';
import 'package:frontend/data/repositories/checkout_repository.dart';
import 'package:frontend/data/repositories/cart_repository.dart';
import 'package:frontend/data/models/address_model.dart';
import 'package:frontend/data/models/cart_item_model.dart';
import 'package:frontend/screens/checkout/add_address_screen.dart';
import 'package:frontend/screens/checkout/order_confirmation_screen.dart';
import 'package:frontend/screens/checkout/card_payment_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  late CheckoutRepository _checkoutRepository;
  late CartRepository _cartRepository;

  List<Address> _addresses = [];
  List<CartItem> _cartItems = [];
  Address? _selectedAddress;
  String _selectedPaymentMethod = 'cod';

  bool _isLoadingAddresses = true;
  bool _isLoadingCart = true;
  bool _isPlacingOrder = false;

  double _cartTotal = 0.0;
  int _cartCount = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      _checkoutRepository = CheckoutRepository(authProvider.dioClient);
      _cartRepository = CartRepository(authProvider.dioClient);
      _loadData();
    });
  }

  Future<void> _loadData() async {
    await Future.wait([
      _loadAddresses(),
      _loadCart(),
    ]);
  }

  Future<void> _loadAddresses() async {
    setState(() {
      _isLoadingAddresses = true;
    });

    final result = await _checkoutRepository.getAddresses();

    if (mounted) {
      setState(() {
        _isLoadingAddresses = false;
        if (result.success && result.data != null) {
          _addresses = result.data!;
          // Auto-select default address
          if (_addresses.isNotEmpty) {
            try {
              _selectedAddress = _addresses.firstWhere((addr) => addr.isDefault);
            } catch (e) {
              // No default address, select first one
              _selectedAddress = _addresses.first;
            }
          }
        }
      });
    }
  }

  Future<void> _loadCart() async {
    setState(() {
      _isLoadingCart = true;
    });

    final result = await _cartRepository.getCart();

    if (mounted) {
      setState(() {
        _isLoadingCart = false;
        if (result.success && result.data != null) {
          _cartItems = result.data!['cart'] as List<CartItem>;
          _cartCount = result.data!['count'] as int;
          _cartTotal = (result.data!['total'] as num).toDouble();
        }
      });
    }
  }

  Future<void> _placeOrder() async {
    if (_selectedAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please select a delivery address'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    if (_cartItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Your cart is empty'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() {
      _isPlacingOrder = true;
    });

    // Create order
    final orderResult = await _checkoutRepository.createOrder(
      addressId: _selectedAddress!.id,
      paymentMethod: _selectedPaymentMethod,
    );

    if (!mounted) return;

    if (!orderResult.success || orderResult.data == null) {
      setState(() {
        _isPlacingOrder = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(orderResult.error ?? 'Failed to create order'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final order = orderResult.data!;

    // Initiate payment
    final paymentResult = await _checkoutRepository.initiatePayment(
      orderId: order.id,
      paymentMethod: _selectedPaymentMethod,
    );

    setState(() {
      _isPlacingOrder = false;
    });

    if (!paymentResult.success) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(paymentResult.error ?? 'Payment initiation failed'),
            backgroundColor: AppColors.error,
          ),
        );
      }
      return;
    }

    // For card payments, navigate to card payment screen
    if (_selectedPaymentMethod == 'card' && paymentResult.data != null) {
      final payment = paymentResult.data!['payment'] as Map<String, dynamic>?;
      final paymentIntentId = payment?['payment_intent_id'] as String?;
      final clientSecret = payment?['client_secret'] as String?;

      if (paymentIntentId == null || clientSecret == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Payment configuration error'),
              backgroundColor: AppColors.error,
            ),
          );
        }
        return;
      }

      if (!mounted) return;

      // Navigate to card payment screen
      final paymentSuccess = await Navigator.push<bool>(
        context,
        MaterialPageRoute(
          builder: (context) => CardPaymentScreen(
            paymentIntentId: paymentIntentId,
            clientSecret: clientSecret,
            orderId: order.id,
            amount: _cartTotal,
          ),
        ),
      );

      if (!mounted) return;

      if (paymentSuccess == true) {
        // Payment successful, navigate to confirmation
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => OrderConfirmationScreen(
              orderId: order.id,
              paymentMethod: _selectedPaymentMethod,
            ),
          ),
        );
      }
      return;
    }

    // For COD, navigate directly to confirmation
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => OrderConfirmationScreen(
            orderId: order.id,
            paymentMethod: _selectedPaymentMethod,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = _isLoadingAddresses || _isLoadingCart;

    return Scaffold(
      backgroundColor: AppColors.backgroundWhite,
      appBar: AppBar(
        title: const Text('Checkout'),
        centerTitle: true,
        backgroundColor: AppColors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: isLoading
          ? Center(
              child: CircularProgressIndicator(color: AppColors.buttonPrimary),
            )
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Cart Items Section
                  _buildCartItems(),

                  const SizedBox(height: 16),

                  // Delivery Address Section
                  _buildAddressSection(),

                  const SizedBox(height: 16),

                  // Payment Method Section
                  _buildPaymentSection(),

                  const SizedBox(height: 16),

                  // Order Summary
                  _buildOrderSummary(),

                  const SizedBox(height: 100),
                ],
              ),
            ),
      bottomSheet: _buildBottomSheet(),
    );
  }

  Widget _buildCartItems() {
    return Container(
      color: AppColors.white,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Order Items ($_cartCount)',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _cartItems.length > 3 ? 3 : _cartItems.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final item = _cartItems[index];
              return _buildCartItemCard(item);
            },
          ),
          if (_cartItems.length > 3)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                '+ ${_cartItems.length - 3} more items',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCartItemCard(CartItem item) {
    return Row(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: item.imageUrl != null
              ? Image.network(
                  item.imageUrl!,
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    width: 60,
                    height: 60,
                    color: AppColors.border,
                    child: Icon(Icons.image, color: AppColors.textLight),
                  ),
                )
              : Container(
                  width: 60,
                  height: 60,
                  color: AppColors.border,
                  child: Icon(Icons.image, color: AppColors.textLight),
                ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.productName,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                '${item.size} • ${item.color} • Qty: ${item.quantity}',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        Text(
          '\$${item.finalPrice.toStringAsFixed(2)}',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppColors.buttonPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildAddressSection() {
    return Container(
      color: AppColors.white,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Delivery Address',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              TextButton.icon(
                onPressed: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const AddAddressScreen(),
                    ),
                  );
                  if (result == true) {
                    _loadAddresses();
                  }
                },
                icon: const Icon(Icons.add, size: 20),
                label: const Text('Add New'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.buttonPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_addresses.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Text(
                  'No addresses found. Please add one.',
                  style: TextStyle(color: AppColors.textSecondary),
                ),
              ),
            )
          else
            ..._addresses.map((address) => _buildAddressCard(address)),
        ],
      ),
    );
  }

  Widget _buildAddressCard(Address address) {
    final isSelected = _selectedAddress?.id == address.id;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedAddress = address;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? AppColors.buttonPrimary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          color: isSelected
              ? AppColors.buttonPrimary.withOpacity(0.05)
              : Colors.transparent,
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: isSelected ? AppColors.buttonPrimary : AppColors.textLight,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (address.isDefault)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.success.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'DEFAULT',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: AppColors.success,
                        ),
                      ),
                    ),
                  const SizedBox(height: 4),
                  Text(
                    address.formattedAddress,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentSection() {
    return Container(
      color: AppColors.white,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Payment Method',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          _buildPaymentOption(
            'Cash on Delivery',
            'cod',
            Icons.money,
          ),
          const SizedBox(height: 8),
          _buildPaymentOption(
            'Card Payment (Stripe)',
            'card',
            Icons.credit_card,
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption(String title, String value, IconData icon) {
    final isSelected = _selectedPaymentMethod == value;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedPaymentMethod = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? AppColors.buttonPrimary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          color: isSelected
              ? AppColors.buttonPrimary.withOpacity(0.05)
              : Colors.transparent,
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: isSelected ? AppColors.buttonPrimary : AppColors.textLight,
            ),
            const SizedBox(width: 12),
            Icon(icon, color: AppColors.textPrimary),
            const SizedBox(width: 12),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderSummary() {
    return Container(
      color: AppColors.white,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Order Summary',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          _buildSummaryRow('Subtotal', '\$${_cartTotal.toStringAsFixed(2)}'),
          _buildSummaryRow('Shipping', 'FREE'),
          Divider(height: 24, color: AppColors.divider),
          _buildSummaryRow(
            'Total',
            '\$${_cartTotal.toStringAsFixed(2)}',
            isTotal: true,
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 18 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 20 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
              color: isTotal ? AppColors.buttonPrimary : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomSheet() {
    return Container(
      padding: const EdgeInsets.all(16),
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
        child: SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isPlacingOrder ? null : _placeOrder,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.buttonPrimary,
              foregroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
            child: _isPlacingOrder
                ? SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      color: AppColors.white,
                      strokeWidth: 2,
                    ),
                  )
                : Text(
                    'Place Order • \$${_cartTotal.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:frontend/core/validators.dart';
import 'package:frontend/widgets/custom_button.dart';
import 'package:frontend/widgets/custom_textfield.dart';
import 'login_screen.dart';

class SignupEmailScreen extends StatefulWidget {
  @override
  State<SignupEmailScreen> createState() => _SignupEmailScreenState();
}

class _SignupEmailScreenState extends State<SignupEmailScreen> {
  final _formKey = GlobalKey<FormState>();
  final nameController = TextEditingController();
  final emailController = TextEditingController();
  final phoneController = TextEditingController();
  final passwordController = TextEditingController();

  void _signup() {
    if (_formKey.currentState!.validate()) {
      print('Name: ${nameController.text}');
      print('Email: ${emailController.text}');
      print('Phone: ${phoneController.text}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Sign Up with Email')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                CustomTextField(
                  label: 'Full Name',
                  controller: nameController,
                  validator: Validators.validateName,
                ),
                CustomTextField(
                  label: 'Email',
                  controller: emailController,
                  validator: Validators.validateEmail,
                ),
                CustomTextField(
                  label: 'Phone Number',
                  controller: phoneController,
                  validator: Validators.validatePhone,
                  keyboardType: TextInputType.phone,
                ),
                CustomTextField(
                  label: 'Password',
                  controller: passwordController,
                  obscureText: true,
                  validator: Validators.validatePassword,
                ),
                SizedBox(height: 20),
                CustomButton(text: 'Sign Up', onPressed: _signup),
                TextButton(
                  onPressed: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => LoginScreen()),
                      (route) => false,
                    );
                  },
                  child: Text('Already a user? Log in'),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}

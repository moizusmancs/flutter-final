import 'package:flutter/material.dart';
import 'package:frontend/core/validators.dart';
import 'package:frontend/screens/auth/signup_choice_screen.dart';
import 'package:frontend/widgets/custom_button.dart';
import 'package:frontend/widgets/custom_textfield.dart';


class LoginScreen extends StatefulWidget {
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  void _login() {
    if (_formKey.currentState!.validate()) {
      // handle login logic
      print('Logging in with: ${emailController.text}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              CustomTextField(
                label: 'Email',
                controller: emailController,
                validator: Validators.validateEmail,
              ),
              CustomTextField(
                label: 'Password',
                controller: passwordController,
                obscureText: true,
                validator: Validators.validatePassword,
              ),
              SizedBox(height: 20),
              CustomButton(text: 'Login', onPressed: _login),
              SizedBox(height: 10),
              CustomButton(
                text: 'Login with Google',
                color: Colors.redAccent,
                onPressed: () => print('Google login'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => SignupChoiceScreen()),
                  );
                },
                child: Text('New user? Create an account'),
              )
            ],
          ),
        ),
      ),
    );
  }
}

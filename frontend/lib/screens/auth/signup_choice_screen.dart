import 'package:flutter/material.dart';
import 'package:frontend/widgets/custom_button.dart';
import 'signup_email_screen.dart';

class SignupChoiceScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Sign Up')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            CustomButton(
              text: 'Sign Up with Google',
              color: Colors.redAccent,
              onPressed: () => print('Google Signup'),
            ),
            SizedBox(height: 16),
            CustomButton(
              text: 'Sign Up with Email',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => SignupEmailScreen()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

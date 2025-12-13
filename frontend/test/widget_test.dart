// This is a basic Flutter widget test.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/network/dio_client.dart';
import 'package:frontend/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Initialize DioClient for testing
    final dioClient = DioClient();
    await dioClient.initialize();

    // Build our app and trigger a frame.
    await tester.pumpWidget(MyApp(dioClient: dioClient));

    // Verify that login screen is shown
    expect(find.text('Login'), findsWidgets);
  });
}

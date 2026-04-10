/// Root application widget for QR Code Maker.
///
/// Configures the [MaterialApp] with a custom [ThemeData] inspired by the
/// Modular House brand palette. The home screen is set to [QrCodeScreen],
/// which contains the complete QR code generation workflow.
library;

import 'package:flutter/material.dart';
import 'screens/qr_code_screen.dart';

/// Top-level stateless widget that bootstraps the application theme and
/// routes. Separated from [main] to facilitate testing and hot reload.
class QrCodeMakerApp extends StatelessWidget {
  const QrCodeMakerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QR Code Maker',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF0F3460),
        brightness: Brightness.light,
        fontFamily: 'Inter',
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
        ),
      ),
      home: const QrCodeScreen(),
    );
  }
}

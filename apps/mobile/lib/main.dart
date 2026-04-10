/// Application entry point.
///
/// Initialises Flutter bindings and runs the root [QrCodeMakerApp] widget.
/// The app is wrapped in [MaterialApp] at the root level to provide theming
/// and navigation support.
library;

import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const QrCodeMakerApp());
}

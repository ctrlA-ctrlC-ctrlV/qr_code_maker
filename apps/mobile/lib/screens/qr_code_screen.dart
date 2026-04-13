/// Main QR code generation screen.
///
/// Composes all feature widgets (input type selector, input fields,
/// customisation panel, preview, and action bar) into a scrollable
/// single-column layout. State is managed locally using [StatefulWidget]
/// to keep the architecture straightforward for this single-screen tool.
library;

import 'package:flutter/material.dart';
import '../models/types.dart';
import '../utils/validation.dart';
import '../utils/qr_encoder.dart';
import '../widgets/input_type_selector.dart';
import '../widgets/qr_input_fields.dart';
import '../widgets/customisation_panel.dart';
import '../widgets/qr_preview.dart';
import '../widgets/action_bar.dart';

/// The primary screen of the application.
///
/// Holds all mutable state for the QR code configuration and wires
/// callbacks to the child widgets. The QR code re-renders in real time
/// as the user adjusts inputs and customisation options.
class QrCodeScreen extends StatefulWidget {
  const QrCodeScreen({super.key});

  @override
  State<QrCodeScreen> createState() => _QrCodeScreenState();
}

class _QrCodeScreenState extends State<QrCodeScreen> {
  /// Current QR code configuration.
  QrCodeConfig _config = const QrCodeConfig();

  /// Raw user input before formatting.
  String _rawValue = '';

  /// Wi-Fi credentials for the Wi-Fi input type.
  WiFiCredentials _wifiCredentials = const WiFiCredentials();

  /// Latest validation result.
  ValidationResult _validation = (isValid: true, errorMessage: '');

  /// Global key for capturing the QR preview as an image.
  final GlobalKey _screenshotKey = GlobalKey();

  /// Whether a valid QR code is currently available for actions.
  bool get _hasQrCode => _config.value.isNotEmpty && _validation.isValid;

  /* ---- State update methods ---- */

  /// Updates the raw input value, re-validates, and recomputes the
  /// formatted QR code value.
  void _setRawValue(String value) {
    final validation = validateInput(_config.inputType, value);
    final formatted = formatInputValue(_config.inputType, value);
    setState(() {
      _rawValue = value;
      _validation = validation;
      _config = _config.copyWith(value: formatted);
    });
  }

  /// Switches the input type, resets the raw value, and re-validates.
  void _setInputType(QrInputType type) {
    setState(() {
      _config = _config.copyWith(inputType: type, value: '');
      _rawValue = '';
      _wifiCredentials = const WiFiCredentials();
      _validation = (isValid: true, errorMessage: '');
    });
  }

  /// Updates Wi-Fi credentials and recomputes the formatted QR value.
  void _setWifiCredentials(WiFiCredentials credentials) {
    final validation = validateInput(
      QrInputType.wifi,
      '',
      wifiCredentials: credentials,
    );
    final formatted = formatInputValue(
      QrInputType.wifi,
      '',
      wifiCredentials: credentials,
    );
    setState(() {
      _wifiCredentials = credentials;
      _validation = validation;
      _config = _config.copyWith(value: formatted);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('QR Code Maker'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              /* Input type selector */
              InputTypeSelector(
                selectedType: _config.inputType,
                onTypeChanged: _setInputType,
              ),
              const SizedBox(height: 16),

              /* Input fields */
              QrInputFields(
                inputType: _config.inputType,
                value: _rawValue,
                onValueChanged: _setRawValue,
                wifiCredentials: _wifiCredentials,
                onWifiChanged: _setWifiCredentials,
                validation: _validation,
              ),
              const SizedBox(height: 24),

              /* QR code preview (wrapped in RepaintBoundary for capture) */
              RepaintBoundary(
                key: _screenshotKey,
                child: QrPreview(
                  data: _config.value,
                  size: _config.size,
                  foregroundColor: Color(_config.foregroundColor),
                  backgroundColor: Color(_config.backgroundColor),
                  errorCorrectionLevel: _config.errorCorrectionLevel,
                ),
              ),
              const SizedBox(height: 16),

              /* Action buttons */
              ActionBar(
                screenshotKey: _screenshotKey,
                hasQrCode: _hasQrCode,
              ),
              const SizedBox(height: 24),

              /* Customisation panel */
              CustomisationPanel(
                size: _config.size,
                onSizeChanged: (v) =>
                    setState(() => _config = _config.copyWith(size: v)),
                errorCorrectionLevel: _config.errorCorrectionLevel,
                onErrorCorrectionChanged: (v) => setState(
                    () => _config = _config.copyWith(errorCorrectionLevel: v)),
                foregroundColor: _config.foregroundColor,
                onForegroundColorChanged: (v) => setState(
                    () => _config = _config.copyWith(foregroundColor: v)),
                backgroundColor: _config.backgroundColor,
                onBackgroundColorChanged: (v) => setState(
                    () => _config = _config.copyWith(backgroundColor: v)),
              ),
              const SizedBox(height: 24),

              /* Footer */
              Text(
                'Built by Zhaoxiang Qiu',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

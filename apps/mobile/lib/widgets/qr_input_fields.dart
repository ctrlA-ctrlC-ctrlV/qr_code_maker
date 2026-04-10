/// QR code input fields widget.
///
/// Dynamically renders the appropriate form fields based on the selected
/// [QrInputType]. For most types a single [TextField] is shown; for Wi-Fi
/// a multi-field form collects SSID, password, encryption, and hidden status.
library;

import 'package:flutter/material.dart';
import '../models/types.dart';
import '../utils/validation.dart';

/// Renders input controls appropriate for [inputType].
///
/// [value] and [onValueChanged] handle the primary text input.
/// [wifiCredentials] and [onWifiChanged] manage the Wi-Fi-specific fields.
class QrInputFields extends StatelessWidget {
  /// Current input type determines which fields are rendered.
  final QrInputType inputType;

  /// Raw text value for non-WiFi input types.
  final String value;

  /// Callback for text value changes.
  final ValueChanged<String> onValueChanged;

  /// Current Wi-Fi credentials state.
  final WiFiCredentials wifiCredentials;

  /// Callback for Wi-Fi credential changes.
  final ValueChanged<WiFiCredentials> onWifiChanged;

  /// Current validation result for displaying errors.
  final ValidationResult validation;

  const QrInputFields({
    super.key,
    required this.inputType,
    required this.value,
    required this.onValueChanged,
    required this.wifiCredentials,
    required this.onWifiChanged,
    required this.validation,
  });

  /// Contextual placeholder text for each input type.
  static const Map<QrInputType, String> _placeholders = {
    QrInputType.plainText: 'Enter text to encode...',
    QrInputType.url: 'https://example.com',
    QrInputType.email: 'user@example.com',
    QrInputType.phone: '+353 1 234 5678',
    QrInputType.wifi: '',
  };

  @override
  Widget build(BuildContext context) {
    /* Wi-Fi input renders a multi-field form. */
    if (inputType == QrInputType.wifi) {
      return _buildWiFiForm(context);
    }

    /* All other types share a single text field. */
    return _buildTextField(context);
  }

  /// Builds the standard single-line or multi-line text field.
  Widget _buildTextField(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          onChanged: onValueChanged,
          controller: TextEditingController.fromValue(
            TextEditingValue(
              text: value,
              selection: TextSelection.collapsed(offset: value.length),
            ),
          ),
          maxLines: inputType == QrInputType.plainText ? 4 : 1,
          maxLength: QrDefaults.maxInputLength,
          decoration: InputDecoration(
            hintText: _placeholders[inputType],
            errorText: validation.isValid ? null : validation.errorMessage,
            counterText: '${value.length} / ${QrDefaults.maxInputLength}',
          ),
        ),
      ],
    );
  }

  /// Builds the Wi-Fi credentials form with SSID, password, encryption,
  /// and hidden network toggle.
  Widget _buildWiFiForm(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        /* SSID field */
        TextField(
          onChanged: (v) => onWifiChanged(wifiCredentials.copyWith(ssid: v)),
          decoration: const InputDecoration(
            labelText: 'Network Name (SSID)',
            hintText: 'My Network',
          ),
        ),
        const SizedBox(height: 12),

        /* Password field */
        TextField(
          onChanged: (v) =>
              onWifiChanged(wifiCredentials.copyWith(password: v)),
          obscureText: true,
          decoration: const InputDecoration(
            labelText: 'Password',
            hintText: 'Enter password',
          ),
        ),
        const SizedBox(height: 12),

        /* Encryption dropdown */
        DropdownButtonFormField<WiFiEncryption>(
          value: wifiCredentials.encryption,
          decoration: const InputDecoration(labelText: 'Encryption'),
          items: const [
            DropdownMenuItem(
              value: WiFiEncryption.wpa,
              child: Text('WPA/WPA2'),
            ),
            DropdownMenuItem(
              value: WiFiEncryption.wep,
              child: Text('WEP'),
            ),
            DropdownMenuItem(
              value: WiFiEncryption.none,
              child: Text('None (Open)'),
            ),
          ],
          onChanged: (v) {
            if (v != null) {
              onWifiChanged(wifiCredentials.copyWith(encryption: v));
            }
          },
        ),
        const SizedBox(height: 8),

        /* Hidden network toggle */
        SwitchListTile(
          title: const Text('Hidden network'),
          value: wifiCredentials.hidden,
          contentPadding: EdgeInsets.zero,
          onChanged: (v) =>
              onWifiChanged(wifiCredentials.copyWith(hidden: v)),
        ),

        /* Validation error */
        if (!validation.isValid)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              validation.errorMessage,
              style: TextStyle(
                color: Theme.of(context).colorScheme.error,
                fontSize: 12,
              ),
            ),
          ),
      ],
    );
  }
}

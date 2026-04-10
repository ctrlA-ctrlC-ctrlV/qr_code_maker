/// Input validation utilities for QR code content.
///
/// Provides a unified [validateInput] function that dispatches to
/// type-specific validators. Each validator returns a simple record
/// of (isValid, errorMessage) to keep the API lightweight.
library;

import '../models/types.dart';

/// Result of a validation check.
///
/// [isValid] indicates whether the input passed.
/// [errorMessage] contains a human-readable reason on failure.
typedef ValidationResult = ({bool isValid, String errorMessage});

/// Validates that [value] is non-empty and within the maximum length.
ValidationResult _validatePlainText(String value) {
  if (value.trim().isEmpty) {
    return (isValid: false, errorMessage: 'Input cannot be empty.');
  }
  if (value.length > QrDefaults.maxInputLength) {
    return (
      isValid: false,
      errorMessage:
          'Input exceeds the maximum length of ${QrDefaults.maxInputLength} characters.'
    );
  }
  return (isValid: true, errorMessage: '');
}

/// Validates that [value] is a well-formed URL with http(s) scheme.
ValidationResult _validateUrl(String value) {
  final base = _validatePlainText(value);
  if (!base.isValid) return base;

  final uri = Uri.tryParse(value);
  if (uri == null || !uri.hasScheme || !['http', 'https'].contains(uri.scheme)) {
    return (
      isValid: false,
      errorMessage: 'Please enter a valid URL (e.g. https://example.com).'
    );
  }
  return (isValid: true, errorMessage: '');
}

/// Validates that [value] resembles a plausible email address.
ValidationResult _validateEmail(String value) {
  final base = _validatePlainText(value);
  if (!base.isValid) return base;

  final emailPattern = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
  if (!emailPattern.hasMatch(value)) {
    return (isValid: false, errorMessage: 'Please enter a valid email address.');
  }
  return (isValid: true, errorMessage: '');
}

/// Validates that [value] matches a basic phone number pattern.
ValidationResult _validatePhone(String value) {
  final base = _validatePlainText(value);
  if (!base.isValid) return base;

  final phonePattern = RegExp(r'^\+?[\d\s\-()]{7,20}$');
  if (!phonePattern.hasMatch(value)) {
    return (isValid: false, errorMessage: 'Please enter a valid phone number.');
  }
  return (isValid: true, errorMessage: '');
}

/// Validates Wi-Fi credentials by requiring a non-empty SSID.
ValidationResult _validateWiFi(WiFiCredentials credentials) {
  if (credentials.ssid.trim().isEmpty) {
    return (isValid: false, errorMessage: 'Network name (SSID) is required.');
  }
  return (isValid: true, errorMessage: '');
}

/// Dispatches to the appropriate validator based on [inputType].
///
/// [value] is the raw string to validate. [wifiCredentials] must be
/// provided when [inputType] is [QrInputType.wifi].
ValidationResult validateInput(
  QrInputType inputType,
  String value, {
  WiFiCredentials? wifiCredentials,
}) {
  switch (inputType) {
    case QrInputType.plainText:
      return _validatePlainText(value);
    case QrInputType.url:
      return _validateUrl(value);
    case QrInputType.email:
      return _validateEmail(value);
    case QrInputType.phone:
      return _validatePhone(value);
    case QrInputType.wifi:
      if (wifiCredentials == null) {
        return (
          isValid: false,
          errorMessage: 'Wi-Fi credentials are required.'
        );
      }
      return _validateWiFi(wifiCredentials);
  }
}

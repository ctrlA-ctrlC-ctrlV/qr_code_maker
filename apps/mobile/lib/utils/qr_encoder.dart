/// QR code encoding and input formatting utilities.
///
/// Transforms structured user input into the raw string that the
/// `qr_flutter` package encodes into a QR code. All formatting runs
/// synchronously on the UI thread.
library;

import '../models/types.dart';

/// Constructs a MECARD-style Wi-Fi configuration string.
///
/// Format: `WIFI:T:<encryption>;S:<ssid>;P:<password>;H:<hidden>;;`
String formatWiFiString(WiFiCredentials credentials) {
  final encryptionStr = switch (credentials.encryption) {
    WiFiEncryption.wpa => 'WPA',
    WiFiEncryption.wep => 'WEP',
    WiFiEncryption.none => 'nopass',
  };

  final parts = <String>[
    'WIFI:T:$encryptionStr',
    'S:${credentials.ssid}',
    'P:${credentials.password}',
  ];

  if (credentials.hidden) {
    parts.add('H:true');
  }

  return '${parts.join(";")};';
}

/// Formats the user-supplied [value] according to its [inputType].
///
/// Email and phone values are wrapped in their respective URI schemes.
/// Wi-Fi values are formatted using MECARD notation.
String formatInputValue(
  QrInputType inputType,
  String value, {
  WiFiCredentials? wifiCredentials,
}) {
  switch (inputType) {
    case QrInputType.email:
      return 'mailto:$value';
    case QrInputType.phone:
      return 'tel:$value';
    case QrInputType.wifi:
      return wifiCredentials != null ? formatWiFiString(wifiCredentials) : value;
    case QrInputType.url:
    case QrInputType.plainText:
      return value;
  }
}

/// Maps [ErrorCorrectionLevel] to the integer expected by `qr_flutter`.
///
/// qr_flutter uses: 0 = L, 1 = M, 2 = Q, 3 = H.
int mapErrorCorrectionLevel(ErrorCorrectionLevel level) {
  return switch (level) {
    ErrorCorrectionLevel.low => 0,
    ErrorCorrectionLevel.medium => 1,
    ErrorCorrectionLevel.quartile => 2,
    ErrorCorrectionLevel.high => 3,
  };
}

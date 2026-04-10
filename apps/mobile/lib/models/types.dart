/// Shared type definitions and constants for QR Code Maker.
///
/// Mirrors the TypeScript shared package to maintain a consistent data model
/// across the React web and Flutter mobile applications. All enumerations and
/// default values are defined here to act as the single source of truth.
library;

/// QR code error correction levels per ISO/IEC 18004.
///
/// - [low]: ~7 % recovery capacity.
/// - [medium]: ~15 % recovery capacity.
/// - [quartile]: ~25 % recovery capacity.
/// - [high]: ~30 % recovery capacity.
enum ErrorCorrectionLevel { low, medium, quartile, high }

/// Supported QR code content types that determine encoding format.
enum QrInputType { plainText, url, email, phone, wifi }

/// Image export formats available for download.
enum ExportFormat { png, svg, jpeg }

/// Wi-Fi encryption protocols for MECARD encoding.
enum WiFiEncryption { wpa, wep, none }

/// Represents a set of Wi-Fi network credentials.
class WiFiCredentials {
  /// Network SSID (name).
  final String ssid;

  /// Network password. Empty for open networks.
  final String password;

  /// Encryption type of the network.
  final WiFiEncryption encryption;

  /// Whether the SSID is hidden (not broadcast).
  final bool hidden;

  const WiFiCredentials({
    this.ssid = '',
    this.password = '',
    this.encryption = WiFiEncryption.wpa,
    this.hidden = false,
  });

  /// Returns a new instance with selectively overridden properties.
  WiFiCredentials copyWith({
    String? ssid,
    String? password,
    WiFiEncryption? encryption,
    bool? hidden,
  }) {
    return WiFiCredentials(
      ssid: ssid ?? this.ssid,
      password: password ?? this.password,
      encryption: encryption ?? this.encryption,
      hidden: hidden ?? this.hidden,
    );
  }
}

/// Complete QR code generation configuration.
class QrCodeConfig {
  /// The raw value to encode.
  final String value;

  /// Semantic type of the input.
  final QrInputType inputType;

  /// Error correction level.
  final ErrorCorrectionLevel errorCorrectionLevel;

  /// Rendered size in logical pixels.
  final double size;

  /// Foreground (module) colour.
  final int foregroundColor;

  /// Background colour.
  final int backgroundColor;

  const QrCodeConfig({
    this.value = '',
    this.inputType = QrInputType.plainText,
    this.errorCorrectionLevel = ErrorCorrectionLevel.medium,
    this.size = 256,
    this.foregroundColor = 0xFF000000,
    this.backgroundColor = 0xFFFFFFFF,
  });

  /// Returns a new instance with selectively overridden properties.
  QrCodeConfig copyWith({
    String? value,
    QrInputType? inputType,
    ErrorCorrectionLevel? errorCorrectionLevel,
    double? size,
    int? foregroundColor,
    int? backgroundColor,
  }) {
    return QrCodeConfig(
      value: value ?? this.value,
      inputType: inputType ?? this.inputType,
      errorCorrectionLevel:
          errorCorrectionLevel ?? this.errorCorrectionLevel,
      size: size ?? this.size,
      foregroundColor: foregroundColor ?? this.foregroundColor,
      backgroundColor: backgroundColor ?? this.backgroundColor,
    );
  }
}

/// Application-wide default values and limits.
class QrDefaults {
  QrDefaults._();

  static const double defaultSize = 256;
  static const double minSize = 128;
  static const double maxSize = 1024;
  static const ErrorCorrectionLevel errorCorrectionLevel =
      ErrorCorrectionLevel.medium;
  static const int foregroundColor = 0xFF000000;
  static const int backgroundColor = 0xFFFFFFFF;
  static const int maxInputLength = 4296;
}

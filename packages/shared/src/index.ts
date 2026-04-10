/**
 * @fileoverview Shared type definitions for QR Code Maker.
 *
 * Defines all TypeScript interfaces, enumerations, and constants used across
 * both the React web application and the Flutter mobile application. Centralising
 * these definitions ensures consistent behaviour and simplifies future extensions.
 */

/* -------------------------------------------------------------------------- */
/*  Error Correction Level                                                    */
/* -------------------------------------------------------------------------- */

/**
 * QR code error correction levels as specified by the ISO/IEC 18004 standard.
 * Higher levels allow more of the code to be damaged while remaining readable,
 * at the cost of increased data density.
 *
 * - L: ~7 % recovery capacity
 * - M: ~15 % recovery capacity
 * - Q: ~25 % recovery capacity
 * - H: ~30 % recovery capacity
 */
export enum ErrorCorrectionLevel {
  L = "L",
  M = "M",
  Q = "Q",
  H = "H",
}

/* -------------------------------------------------------------------------- */
/*  Input Types                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Enumeration of supported QR code content types.
 * Each type determines the encoding format applied before generation.
 */
export enum QrInputType {
  PlainText = "plain_text",
  Url = "url",
  Email = "email",
  Phone = "phone",
  WiFi = "wifi",
}

/* -------------------------------------------------------------------------- */
/*  Export Formats                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Supported image export formats for downloading generated QR codes.
 */
export enum ExportFormat {
  PNG = "png",
  SVG = "svg",
  JPEG = "jpeg",
}

/* -------------------------------------------------------------------------- */
/*  Wi-Fi Encryption Types                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Supported Wi-Fi encryption protocols used when encoding Wi-Fi credentials
 * into a QR code string (MECARD format).
 */
export enum WiFiEncryption {
  WPA = "WPA",
  WEP = "WEP",
  None = "nopass",
}

/* -------------------------------------------------------------------------- */
/*  Data Interfaces                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Represents a set of Wi-Fi network credentials to be encoded.
 */
export interface WiFiCredentials {
  /** Network SSID (name). */
  ssid: string;
  /** Network password. Empty string for open networks. */
  password: string;
  /** Encryption type of the network. */
  encryption: WiFiEncryption;
  /** Whether the SSID is hidden (not broadcast). */
  hidden: boolean;
}

/**
 * Complete configuration for QR code generation and rendering.
 * This interface is the single source of truth consumed by both
 * the encoding logic and the UI components.
 */
export interface QrCodeConfig {
  /** The raw value to encode (text, URL, formatted string, etc.). */
  value: string;
  /** Semantic type of the input, used for validation and formatting. */
  inputType: QrInputType;
  /** Error correction level for the generated QR code. */
  errorCorrectionLevel: ErrorCorrectionLevel;
  /** Rendered size of the QR code in pixels. */
  size: number;
  /** Foreground (module) colour in CSS hex notation, e.g. "#000000". */
  foregroundColor: string;
  /** Background colour in CSS hex notation, e.g. "#ffffff". */
  backgroundColor: string;
}

/* -------------------------------------------------------------------------- */
/*  Sharing Platforms                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Social and messaging platforms available for one-tap sharing.
 */
export enum SharePlatform {
  Twitter = "twitter",
  Facebook = "facebook",
  LinkedIn = "linkedin",
  WhatsApp = "whatsapp",
  Email = "email",
}

/* -------------------------------------------------------------------------- */
/*  Validation                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Result of an input validation check.
 */
export interface ValidationResult {
  /** Whether the input passed validation. */
  isValid: boolean;
  /** Human-readable error message when validation fails; empty string otherwise. */
  errorMessage: string;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Application-wide default values and limits.
 * Grouped into a single frozen object to prevent accidental mutation.
 */
export const QR_DEFAULTS = Object.freeze({
  /** Default QR code size in pixels. */
  size: 256,
  /** Minimum allowed QR code size in pixels. */
  minSize: 128,
  /** Maximum allowed QR code size in pixels. */
  maxSize: 1024,
  /** Default error correction level. */
  errorCorrectionLevel: ErrorCorrectionLevel.M,
  /** Default foreground colour. */
  foregroundColor: "#000000",
  /** Default background colour. */
  backgroundColor: "#ffffff",
  /** Maximum character count for QR code input (version 40, EC level L). */
  maxInputLength: 4296,
});

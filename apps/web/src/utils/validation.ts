/**
 * @fileoverview Input validation utilities for QR code content.
 *
 * Each validator function accepts a raw string and returns a `ValidationResult`
 * indicating whether the input is acceptable. Validation is intentionally
 * lightweight -- it catches obvious user errors without being overly strict.
 */

import {
  QrInputType,
  QR_DEFAULTS,
  type ValidationResult,
  type WiFiCredentials,
  type VCardContact,
} from "@qr-code-maker/shared";

/* -------------------------------------------------------------------------- */
/*  Individual Validators                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Validates that the input is not empty and does not exceed the maximum
 * character limit for QR code encoding.
 */
function validatePlainText(value: string): ValidationResult {
  if (value.trim().length === 0) {
    return { isValid: false, errorMessage: "Input cannot be empty." };
  }
  if (value.length > QR_DEFAULTS.maxInputLength) {
    return {
      isValid: false,
      errorMessage: `Input exceeds the maximum length of ${QR_DEFAULTS.maxInputLength} characters.`,
    };
  }
  return { isValid: true, errorMessage: "" };
}

/**
 * Validates that the input resembles a well-formed URL.
 * Uses the native URL constructor for spec-compliant parsing.
 */
function validateUrl(value: string): ValidationResult {
  const base = validatePlainText(value);
  if (!base.isValid) return base;

  try {
    const parsed = new URL(value);
    /* Only allow http and https schemes to prevent javascript: or data: URIs. */
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { isValid: false, errorMessage: "URL must use http or https protocol." };
    }
    return { isValid: true, errorMessage: "" };
  } catch {
    return { isValid: false, errorMessage: "Please enter a valid URL (e.g. https://example.com)." };
  }
}

/**
 * Validates that the input is a plausible email address using a basic
 * regular expression. Full RFC 5322 compliance is intentionally omitted
 * to keep validation lightweight.
 */
function validateEmail(value: string): ValidationResult {
  const base = validatePlainText(value);
  if (!base.isValid) return base;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    return { isValid: false, errorMessage: "Please enter a valid email address." };
  }
  return { isValid: true, errorMessage: "" };
}

/**
 * Validates that the input contains only digits, spaces, dashes, parentheses,
 * and an optional leading plus sign.
 */
function validatePhone(value: string): ValidationResult {
  const base = validatePlainText(value);
  if (!base.isValid) return base;

  const phonePattern = /^\+?[\d\s\-()]{7,20}$/;
  if (!phonePattern.test(value)) {
    return { isValid: false, errorMessage: "Please enter a valid phone number." };
  }
  return { isValid: true, errorMessage: "" };
}

/**
 * Validates Wi-Fi credentials by ensuring the SSID is present.
 * The password may be empty for open networks.
 */
function validateWiFi(credentials: WiFiCredentials): ValidationResult {
  if (credentials.ssid.trim().length === 0) {
    return { isValid: false, errorMessage: "Network name (SSID) is required." };
  }
  return { isValid: true, errorMessage: "" };
}

/**
 * Validates vCard contact data. At minimum, either the first name or last
 * name must be provided. The notes field is capped at the configured maximum.
 */
function validateVCard(contact: VCardContact): ValidationResult {
  const hasFirstName = contact.firstName.trim().length > 0;
  const hasLastName = contact.lastName.trim().length > 0;

  if (!hasFirstName && !hasLastName) {
    return {
      isValid: false,
      errorMessage: "At least a first name or last name is required.",
    };
  }

  if (contact.notes.length > QR_DEFAULTS.maxNotesLength) {
    return {
      isValid: false,
      errorMessage: `Notes must not exceed ${QR_DEFAULTS.maxNotesLength} characters.`,
    };
  }

  return { isValid: true, errorMessage: "" };
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Dispatches to the appropriate validator based on the input type.
 *
 * @param inputType  - The semantic type of the QR code content.
 * @param value      - The raw string to validate.
 * @param wifiData   - Optional Wi-Fi credentials when inputType is WiFi.
 * @param vCardData  - Optional vCard contact when inputType is VCard.
 * @returns A `ValidationResult` describing whether the input is acceptable.
 */
export function validateInput(
  inputType: QrInputType,
  value: string,
  wifiData?: WiFiCredentials,
  vCardData?: VCardContact
): ValidationResult {
  switch (inputType) {
    case QrInputType.PlainText:
      return validatePlainText(value);
    case QrInputType.Url:
      return validateUrl(value);
    case QrInputType.Email:
      return validateEmail(value);
    case QrInputType.Phone:
      return validatePhone(value);
    case QrInputType.WiFi:
      return wifiData
        ? validateWiFi(wifiData)
        : { isValid: false, errorMessage: "Wi-Fi credentials are required." };
    case QrInputType.VCard:
      return vCardData
        ? validateVCard(vCardData)
        : { isValid: false, errorMessage: "Contact information is required." };
    default:
      return validatePlainText(value);
  }
}

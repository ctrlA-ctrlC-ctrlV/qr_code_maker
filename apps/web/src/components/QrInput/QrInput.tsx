/**
 * @fileoverview QrInput component.
 *
 * Dynamically renders the appropriate input fields based on the selected
 * QR code content type. For most types a single text input is displayed;
 * for Wi-Fi, a multi-field form is rendered with SSID, password, encryption
 * type, and hidden network toggle.
 */

import { type ChangeEvent } from "react";
import {
  QrInputType,
  QR_DEFAULTS,
  WiFiEncryption,
  type ValidationResult,
  type WiFiCredentials,
} from "@qr-code-maker/shared";
import styles from "./QrInput.module.css";

/* -------------------------------------------------------------------------- */
/*  Props Interface                                                           */
/* -------------------------------------------------------------------------- */

interface QrInputProps {
  /** Current input type determines which fields are rendered. */
  inputType: QrInputType;
  /** Raw text value for non-WiFi input types. */
  value: string;
  /** Callback for text value changes. */
  onValueChange: (value: string) => void;
  /** Wi-Fi credentials state. */
  wifiCredentials: WiFiCredentials;
  /** Callback for Wi-Fi credential changes. */
  onWifiChange: (credentials: Partial<WiFiCredentials>) => void;
  /** Validation result to display inline errors. */
  validation: ValidationResult;
}

/* -------------------------------------------------------------------------- */
/*  Placeholder Mapping                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Contextual placeholder text for each input type.
 */
const PLACEHOLDERS: Record<QrInputType, string> = {
  [QrInputType.PlainText]: "Enter text to encode...",
  [QrInputType.Url]: "https://example.com",
  [QrInputType.Email]: "user@example.com",
  [QrInputType.Phone]: "+353 1 234 5678",
  [QrInputType.WiFi]: "",
  [QrInputType.VCard]: "",
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Renders the input controls for QR code content.
 *
 * Standard input types (text, URL, email, phone) share a single <textarea>
 * to allow multi-line entry for plain text. Wi-Fi renders a dedicated
 * multi-field form. Validation feedback is shown beneath the fields.
 */
export function QrInput({
  inputType,
  value,
  onValueChange,
  wifiCredentials,
  onWifiChange,
  validation,
}: QrInputProps) {
  /** Character count for the current input value. */
  const charCount = value.length;
  const isNearLimit = charCount > QR_DEFAULTS.maxInputLength * 0.9;

  /**
   * Handles changes on the primary text input / textarea.
   */
  function handleTextChange(
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void {
    onValueChange(event.target.value);
  }

  /* ---------------------------------------------------------------------- */
  /*  Wi-Fi Form                                                            */
  /* ---------------------------------------------------------------------- */

  if (inputType === QrInputType.WiFi) {
    return (
      <div className={styles.container}>
        <div className={styles.field}>
          <label htmlFor="wifi-ssid" className={styles.label}>
            Network Name (SSID)
          </label>
          <input
            id="wifi-ssid"
            type="text"
            className={styles.input}
            value={wifiCredentials.ssid}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onWifiChange({ ssid: e.target.value })
            }
            placeholder="My Network"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="wifi-password" className={styles.label}>
            Password
          </label>
          <input
            id="wifi-password"
            type="password"
            className={styles.input}
            value={wifiCredentials.password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onWifiChange({ password: e.target.value })
            }
            placeholder="Enter password"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="wifi-encryption" className={styles.label}>
            Encryption
          </label>
          <select
            id="wifi-encryption"
            className={styles.select}
            value={wifiCredentials.encryption}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onWifiChange({ encryption: e.target.value as WiFiEncryption })
            }
          >
            <option value={WiFiEncryption.WPA}>WPA/WPA2</option>
            <option value={WiFiEncryption.WEP}>WEP</option>
            <option value={WiFiEncryption.None}>None (Open)</option>
          </select>
        </div>

        <div className={styles.checkboxField}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={wifiCredentials.hidden}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onWifiChange({ hidden: e.target.checked })
              }
            />
            <span>Hidden network</span>
          </label>
        </div>

        {/* Validation error message */}
        {!validation.isValid && (
          <p className={styles.error} role="alert">
            {validation.errorMessage}
          </p>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*  Standard Text Input                                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <label htmlFor="qr-input" className={styles.label}>
          Content
        </label>
        <textarea
          id="qr-input"
          className={styles.textarea}
          value={value}
          onChange={handleTextChange}
          placeholder={PLACEHOLDERS[inputType]}
          maxLength={QR_DEFAULTS.maxInputLength}
          rows={inputType === QrInputType.PlainText ? 4 : 2}
          aria-invalid={!validation.isValid}
          aria-describedby={!validation.isValid ? "input-error" : undefined}
        />

        {/* Character counter */}
        <div className={styles.meta}>
          <span
            className={`${styles.charCount} ${isNearLimit ? styles.warning : ""}`}
          >
            {charCount} / {QR_DEFAULTS.maxInputLength}
          </span>
        </div>
      </div>

      {/* Validation error message */}
      {!validation.isValid && (
        <p id="input-error" className={styles.error} role="alert">
          {validation.errorMessage}
        </p>
      )}
    </div>
  );
}

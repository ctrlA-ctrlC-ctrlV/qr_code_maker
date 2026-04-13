/**
 * @fileoverview InputTypeSelector component.
 *
 * Renders a segmented button group that allows the user to switch between
 * the supported QR code input types (plain text, URL, email, phone, Wi-Fi).
 * The active type is visually highlighted.
 */

import { type ChangeEvent } from "react";
import { QrInputType } from "@qr-code-maker/shared";
import styles from "./InputTypeSelector.module.css";

/* -------------------------------------------------------------------------- */
/*  Props Interface                                                           */
/* -------------------------------------------------------------------------- */

interface InputTypeSelectorProps {
  /** Currently selected input type. */
  selectedType: QrInputType;
  /** Callback invoked when the user selects a different type. */
  onTypeChange: (type: QrInputType) => void;
}

/* -------------------------------------------------------------------------- */
/*  Label Mapping                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Human-readable labels for each input type, displayed in the selector.
 */
const INPUT_TYPE_LABELS: ReadonlyArray<{ type: QrInputType; label: string }> = [
  { type: QrInputType.PlainText, label: "Text" },
  { type: QrInputType.Url, label: "URL" },
  { type: QrInputType.Email, label: "Email" },
  { type: QrInputType.Phone, label: "Phone" },
  { type: QrInputType.WiFi, label: "Wi-Fi" },
  { type: QrInputType.VCard, label: "vCard" },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Segmented input type selector implemented as a radio button group for
 * accessibility. Uses standard DOM change events and forwards the selected
 * value through the `onTypeChange` callback.
 */
export function InputTypeSelector({
  selectedType,
  onTypeChange,
}: InputTypeSelectorProps) {
  /**
   * Handles the change event on the underlying radio input.
   * Casts the string value back to the QrInputType enum.
   */
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    onTypeChange(event.target.value as QrInputType);
  }

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Content Type</legend>
      <div className={styles.group} role="radiogroup" aria-label="QR code content type">
        {INPUT_TYPE_LABELS.map(({ type, label }) => (
          <label
            key={type}
            className={`${styles.option} ${
              selectedType === type ? styles.active : ""
            }`}
          >
            <input
              type="radio"
              name="inputType"
              value={type}
              checked={selectedType === type}
              onChange={handleChange}
              className="visually-hidden"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

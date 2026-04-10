/**
 * @fileoverview CustomisationPanel component.
 *
 * Provides controls for adjusting QR code visual properties: rendered size,
 * error correction level, and foreground/background colours. All changes
 * propagate upwards via callbacks so the QR code re-renders in real time.
 */

import { type ChangeEvent } from "react";
import { ErrorCorrectionLevel, QR_DEFAULTS } from "@qr-code-maker/shared";
import styles from "./CustomisationPanel.module.css";

/* -------------------------------------------------------------------------- */
/*  Props Interface                                                           */
/* -------------------------------------------------------------------------- */

interface CustomisationPanelProps {
  /** Current QR code size in pixels. */
  size: number;
  /** Callback to update size. */
  onSizeChange: (size: number) => void;
  /** Current error correction level. */
  errorCorrectionLevel: ErrorCorrectionLevel;
  /** Callback to update error correction level. */
  onErrorCorrectionChange: (level: ErrorCorrectionLevel) => void;
  /** Current foreground colour (hex). */
  foregroundColor: string;
  /** Callback to update foreground colour. */
  onForegroundColorChange: (color: string) => void;
  /** Current background colour (hex). */
  backgroundColor: string;
  /** Callback to update background colour. */
  onBackgroundColorChange: (color: string) => void;
}

/* -------------------------------------------------------------------------- */
/*  Error Correction Labels                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Human-readable labels for error correction levels, including recovery
 * capacity percentage for user guidance.
 */
const EC_LABELS: ReadonlyArray<{
  level: ErrorCorrectionLevel;
  label: string;
  description: string;
}> = [
  { level: ErrorCorrectionLevel.L, label: "Low (L)", description: "~7% recovery" },
  { level: ErrorCorrectionLevel.M, label: "Medium (M)", description: "~15% recovery" },
  { level: ErrorCorrectionLevel.Q, label: "Quartile (Q)", description: "~25% recovery" },
  { level: ErrorCorrectionLevel.H, label: "High (H)", description: "~30% recovery" },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Renders the customisation controls in a vertical layout.
 *
 * - Size: a range slider with a numeric readout.
 * - Error correction: a <select> dropdown.
 * - Colours: native colour picker inputs.
 */
export function CustomisationPanel({
  size,
  onSizeChange,
  errorCorrectionLevel,
  onErrorCorrectionChange,
  foregroundColor,
  onForegroundColorChange,
  backgroundColor,
  onBackgroundColorChange,
}: CustomisationPanelProps) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.heading}>Customisation</h3>

      {/* ---- Size slider ---- */}
      <div className={styles.field}>
        <label htmlFor="qr-size" className={styles.label}>
          Size: {size}px
        </label>
        <input
          id="qr-size"
          type="range"
          min={QR_DEFAULTS.minSize}
          max={QR_DEFAULTS.maxSize}
          step={16}
          value={size}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onSizeChange(Number(e.target.value))
          }
          className={styles.range}
        />
        <div className={styles.rangeLabels}>
          <span>{QR_DEFAULTS.minSize}px</span>
          <span>{QR_DEFAULTS.maxSize}px</span>
        </div>
      </div>

      {/* ---- Error correction level ---- */}
      <div className={styles.field}>
        <label htmlFor="ec-level" className={styles.label}>
          Error Correction
        </label>
        <select
          id="ec-level"
          className={styles.select}
          value={errorCorrectionLevel}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            onErrorCorrectionChange(e.target.value as ErrorCorrectionLevel)
          }
        >
          {EC_LABELS.map(({ level, label, description }) => (
            <option key={level} value={level}>
              {label} - {description}
            </option>
          ))}
        </select>
      </div>

      {/* ---- Colour pickers ---- */}
      <div className={styles.colorRow}>
        <div className={styles.colorField}>
          <label htmlFor="fg-color" className={styles.label}>
            Foreground
          </label>
          <div className={styles.colorInputWrapper}>
            <input
              id="fg-color"
              type="color"
              value={foregroundColor}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onForegroundColorChange(e.target.value)
              }
              className={styles.colorInput}
            />
            <span className={styles.colorValue}>{foregroundColor}</span>
          </div>
        </div>

        <div className={styles.colorField}>
          <label htmlFor="bg-color" className={styles.label}>
            Background
          </label>
          <div className={styles.colorInputWrapper}>
            <input
              id="bg-color"
              type="color"
              value={backgroundColor}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onBackgroundColorChange(e.target.value)
              }
              className={styles.colorInput}
            />
            <span className={styles.colorValue}>{backgroundColor}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

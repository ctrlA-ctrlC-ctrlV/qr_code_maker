/**
 * @fileoverview QrPreview component.
 *
 * Displays the generated QR code image in a centred preview area. Handles
 * three visual states: empty (no input), loading (generation in progress),
 * and ready (QR code displayed). Error states are communicated via an
 * inline alert.
 */

import styles from "./QrPreview.module.css";

/* -------------------------------------------------------------------------- */
/*  Props Interface                                                           */
/* -------------------------------------------------------------------------- */

interface QrPreviewProps {
  /** Base64-encoded data URL of the generated QR code. Empty when idle. */
  qrDataUrl: string;
  /** Whether QR generation is currently running. */
  isGenerating: boolean;
  /** Error message from the generator; empty when no error is present. */
  error: string;
  /** Display size of the QR code in pixels. */
  size: number;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Renders the QR code preview with contextual feedback.
 *
 * The component does not perform any encoding itself; it receives the fully
 * generated data URL from the parent and renders it as an <img> element.
 */
export function QrPreview({
  qrDataUrl,
  isGenerating,
  error,
  size,
}: QrPreviewProps) {
  /* Error state */
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <p className={styles.errorText} role="alert">
            {error}
          </p>
        </div>
      </div>
    );
  }

  /* Loading state */
  if (isGenerating) {
    return (
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <div className={styles.spinner} aria-label="Generating QR code" />
          <p className={styles.placeholderText}>Generating...</p>
        </div>
      </div>
    );
  }

  /* Empty / idle state */
  if (!qrDataUrl) {
    return (
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <svg
            className={styles.icon}
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="3" height="3" />
            <line x1="21" y1="14" x2="21" y2="14.01" />
            <line x1="21" y1="21" x2="21" y2="21.01" />
            <line x1="17" y1="21" x2="17" y2="21.01" />
            <line x1="14" y1="21" x2="14" y2="21.01" />
            <line x1="21" y1="17" x2="21" y2="17.01" />
          </svg>
          <p className={styles.placeholderText}>
            Enter content to generate a QR code
          </p>
        </div>
      </div>
    );
  }

  /* QR code ready */
  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <img
          src={qrDataUrl}
          alt="Generated QR code"
          width={size}
          height={size}
          className={styles.image}
        />
      </div>
    </div>
  );
}

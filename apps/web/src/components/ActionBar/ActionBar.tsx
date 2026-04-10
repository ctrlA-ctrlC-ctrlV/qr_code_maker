/**
 * @fileoverview ActionBar component.
 *
 * Renders download and share action buttons below the QR code preview.
 * Download buttons export in PNG, SVG, and JPEG formats. Share buttons
 * use the Web Share API where available, falling back to platform-specific
 * share URLs opened in new tabs.
 */

import { useCallback } from "react";
import {
  ExportFormat,
  SharePlatform,
  type QrCodeConfig,
} from "@qr-code-maker/shared";
import { downloadQrCode } from "../../utils/qrEncoder";
import {
  isWebShareSupported,
  webShare,
  shareToPlatform,
} from "../../utils/sharing";
import styles from "./ActionBar.module.css";

/* -------------------------------------------------------------------------- */
/*  Props Interface                                                           */
/* -------------------------------------------------------------------------- */

interface ActionBarProps {
  /** Current QR code configuration used for export. */
  config: QrCodeConfig;
  /** Whether a valid QR code is currently available for actions. */
  hasQrCode: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Static Data                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Download format options with labels.
 */
const DOWNLOAD_OPTIONS: ReadonlyArray<{
  format: ExportFormat;
  label: string;
}> = [
  { format: ExportFormat.PNG, label: "PNG" },
  { format: ExportFormat.SVG, label: "SVG" },
  { format: ExportFormat.JPEG, label: "JPEG" },
];

/**
 * Share platform options with labels and SVG icon identifiers.
 */
const SHARE_OPTIONS: ReadonlyArray<{
  platform: SharePlatform;
  label: string;
}> = [
  { platform: SharePlatform.Twitter, label: "X / Twitter" },
  { platform: SharePlatform.Facebook, label: "Facebook" },
  { platform: SharePlatform.LinkedIn, label: "LinkedIn" },
  { platform: SharePlatform.WhatsApp, label: "WhatsApp" },
  { platform: SharePlatform.Email, label: "Email" },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Renders grouped download and share action buttons.
 *
 * Actions are disabled when no valid QR code is available. The share
 * section conditionally renders the Web Share API button on supported
 * browsers, alongside direct platform links.
 */
export function ActionBar({ config, hasQrCode }: ActionBarProps) {
  /**
   * Initiates a download in the specified format.
   */
  const handleDownload = useCallback(
    async (format: ExportFormat) => {
      if (!hasQrCode) return;
      try {
        await downloadQrCode(config, format);
      } catch {
        /* Download failures are intentionally silent; the browser's native
           download UI provides sufficient feedback. */
      }
    },
    [config, hasQrCode]
  );

  /**
   * Attempts the Web Share API first. Falls back to a platform link if
   * the native share is unavailable or the user cancels.
   */
  const handleShare = useCallback(
    async (platform: SharePlatform) => {
      if (!hasQrCode) return;

      const shareData = {
        title: "QR Code - Modular House",
        text: "Check out this QR code generated with QR Code Maker by Modular House.",
        url: window.location.href,
      };

      /* Attempt native share on supported browsers. */
      if (isWebShareSupported()) {
        const shared = await webShare(shareData);
        if (shared) return;
      }

      /* Fall back to platform-specific share link. */
      shareToPlatform(platform, shareData);
    },
    [hasQrCode]
  );

  return (
    <div className={styles.bar}>
      {/* Download section */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Download</h4>
        <div className={styles.buttonGroup}>
          {DOWNLOAD_OPTIONS.map(({ format, label }) => (
            <button
              key={format}
              type="button"
              className={styles.button}
              disabled={!hasQrCode}
              onClick={() => handleDownload(format)}
              aria-label={`Download QR code as ${label}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Share section */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Share</h4>
        <div className={styles.buttonGroup}>
          {SHARE_OPTIONS.map(({ platform, label }) => (
            <button
              key={platform}
              type="button"
              className={`${styles.button} ${styles.shareButton}`}
              disabled={!hasQrCode}
              onClick={() => handleShare(platform)}
              aria-label={`Share via ${label}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

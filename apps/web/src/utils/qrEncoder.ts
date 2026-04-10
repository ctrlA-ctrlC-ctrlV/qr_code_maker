/**
 * @fileoverview QR code encoding and formatting utilities.
 *
 * Transforms structured user input into the raw string that will be encoded
 * into a QR code, and exposes methods for generating QR code data in multiple
 * output formats (data URL, SVG string, Blob).
 *
 * All encoding runs entirely on the client. No network requests are made.
 */

import QRCode from "qrcode";
import {
  ErrorCorrectionLevel,
  ExportFormat,
  QrInputType,
  type QrCodeConfig,
  type WiFiCredentials,
} from "@qr-code-maker/shared";

/* -------------------------------------------------------------------------- */
/*  Input Formatting                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Constructs a MECARD-style Wi-Fi configuration string.
 *
 * Format: WIFI:T:<encryption>;S:<ssid>;P:<password>;H:<hidden>;;
 *
 * @param credentials - Wi-Fi network details provided by the user.
 * @returns A string suitable for QR code encoding.
 */
export function formatWiFiString(credentials: WiFiCredentials): string {
  const parts = [
    `WIFI:T:${credentials.encryption}`,
    `S:${credentials.ssid}`,
    `P:${credentials.password}`,
  ];

  if (credentials.hidden) {
    parts.push("H:true");
  }

  return parts.join(";") + ";;";
}

/**
 * Formats the user-supplied value according to its declared input type.
 * For most types no transformation is needed; email and phone values are
 * wrapped in their respective URI schemes.
 */
export function formatInputValue(
  inputType: QrInputType,
  value: string,
  wifiCredentials?: WiFiCredentials
): string {
  switch (inputType) {
    case QrInputType.Email:
      return `mailto:${value}`;
    case QrInputType.Phone:
      return `tel:${value}`;
    case QrInputType.WiFi:
      return wifiCredentials ? formatWiFiString(wifiCredentials) : value;
    case QrInputType.Url:
    case QrInputType.PlainText:
    default:
      return value;
  }
}

/* -------------------------------------------------------------------------- */
/*  QR Code Generation                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Maps the application's ErrorCorrectionLevel enum to the single-character
 * values expected by the `qrcode` library.
 */
function mapErrorCorrectionLevel(
  level: ErrorCorrectionLevel
): "L" | "M" | "Q" | "H" {
  return level as "L" | "M" | "Q" | "H";
}

/**
 * Shared options builder consumed by all `qrcode` library calls.
 */
function buildQrOptions(config: QrCodeConfig): QRCode.QRCodeToDataURLOptions {
  return {
    errorCorrectionLevel: mapErrorCorrectionLevel(config.errorCorrectionLevel),
    width: config.size,
    margin: 2,
    color: {
      dark: config.foregroundColor,
      light: config.backgroundColor,
    },
  };
}

/**
 * Generates a QR code as a base64-encoded data URL (PNG).
 * Suitable for direct use as the `src` attribute of an <img> element.
 */
export async function generateQrDataUrl(config: QrCodeConfig): Promise<string> {
  return QRCode.toDataURL(config.value, buildQrOptions(config));
}

/**
 * Generates a QR code as an SVG string.
 * Useful for high-resolution, scalable exports.
 */
export async function generateQrSvgString(
  config: QrCodeConfig
): Promise<string> {
  return QRCode.toString(config.value, {
    ...buildQrOptions(config),
    type: "svg",
  });
}

/**
 * Generates a QR code rendered onto an off-screen HTMLCanvasElement.
 * The canvas can then be used to export Blob data in any raster format.
 */
async function generateQrCanvas(
  config: QrCodeConfig
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, config.value, buildQrOptions(config));
  return canvas;
}

/* -------------------------------------------------------------------------- */
/*  Export / Download                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Converts a canvas element to a Blob of the specified MIME type.
 *
 * @param canvas  - The canvas containing the rendered QR code.
 * @param mimeType - Target MIME type (e.g. "image/png").
 * @returns A Promise resolving to the image Blob.
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to generate image blob."));
        }
      },
      mimeType,
      0.95
    );
  });
}

/**
 * Triggers a file download in the browser by creating a temporary anchor
 * element, assigning the object URL, and programmatically clicking it.
 *
 * @param blob     - The file content.
 * @param filename - The suggested download filename.
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  /* Clean up to prevent memory leaks. */
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Exports the QR code in the requested format and initiates a browser download.
 *
 * @param config - Current QR code configuration (value, size, colours, etc.).
 * @param format - Desired export format (PNG, JPEG, or SVG).
 */
export async function downloadQrCode(
  config: QrCodeConfig,
  format: ExportFormat
): Promise<void> {
  const filename = `qr-code.${format}`;

  switch (format) {
    case ExportFormat.PNG: {
      const canvas = await generateQrCanvas(config);
      const blob = await canvasToBlob(canvas, "image/png");
      downloadBlob(blob, filename);
      break;
    }

    case ExportFormat.JPEG: {
      const canvas = await generateQrCanvas(config);
      const blob = await canvasToBlob(canvas, "image/jpeg");
      downloadBlob(blob, filename);
      break;
    }

    case ExportFormat.SVG: {
      const svgString = await generateQrSvgString(config);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      downloadBlob(blob, filename);
      break;
    }
  }
}

/**
 * @fileoverview Custom hook for debounced, real-time QR code generation.
 *
 * Listens to changes in the QR code configuration and regenerates the
 * encoded image (as a data URL) after a short debounce interval. This
 * prevents excessive re-encoding while the user is still typing and keeps
 * the UI responsive.
 */

import { useState, useEffect, useRef } from "react";
import type { QrCodeConfig } from "@qr-code-maker/shared";
import { generateQrDataUrl } from "../utils/qrEncoder";

/** Default debounce delay in milliseconds. */
const DEBOUNCE_MS = 150;

/**
 * Return type of the useQrGenerator hook.
 */
interface UseQrGeneratorReturn {
  /** Base64-encoded data URL of the current QR code, or empty string. */
  qrDataUrl: string;
  /** Whether a QR code generation is currently in progress. */
  isGenerating: boolean;
  /** Human-readable error message if generation failed; empty otherwise. */
  error: string;
}

/**
 * Generates a QR code data URL reactively whenever the provided config changes.
 *
 * The generation is debounced to avoid unnecessary work during rapid input.
 * If the config value is empty, the hook resets to an idle state without
 * attempting generation.
 *
 * @param config  - Current QR code configuration.
 * @param isValid - Whether the current input passes validation. Generation
 *                  is skipped when the input is invalid.
 */
export function useQrGenerator(
  config: QrCodeConfig,
  isValid: boolean
): UseQrGeneratorReturn {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  /**
   * A ref-based counter guards against stale async completions. Each effect
   * invocation increments the counter; only the result whose generation ID
   * matches the latest counter value is applied to state.
   */
  const generationIdRef = useRef<number>(0);

  useEffect(() => {
    /* Skip generation when the input is empty or invalid. */
    if (!config.value || !isValid) {
      setQrDataUrl("");
      setError("");
      setIsGenerating(false);
      return;
    }

    const currentId = ++generationIdRef.current;
    setIsGenerating(true);
    setError("");

    const timer = setTimeout(async () => {
      try {
        const dataUrl = await generateQrDataUrl(config);

        /* Discard result if a newer generation has been initiated. */
        if (currentId === generationIdRef.current) {
          setQrDataUrl(dataUrl);
          setIsGenerating(false);
        }
      } catch (err: unknown) {
        if (currentId === generationIdRef.current) {
          const message =
            err instanceof Error ? err.message : "QR code generation failed.";
          setError(message);
          setQrDataUrl("");
          setIsGenerating(false);
        }
      }
    }, DEBOUNCE_MS);

    /* Cancel the pending debounce timer on cleanup. */
    return () => clearTimeout(timer);
  }, [config.value, config.size, config.errorCorrectionLevel, config.foregroundColor, config.backgroundColor, isValid]);

  return { qrDataUrl, isGenerating, error };
}

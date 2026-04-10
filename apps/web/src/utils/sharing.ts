/**
 * @fileoverview Social sharing utilities.
 *
 * Provides platform-specific share functionality using the Web Share API
 * when available, with deterministic fallback URLs for each supported
 * platform. All sharing actions are client-side only.
 */

import { SharePlatform } from "@qr-code-maker/shared";

/* -------------------------------------------------------------------------- */
/*  Interfaces                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Data required to construct a share action.
 */
interface ShareData {
  /** Title of the shared content. */
  title: string;
  /** Descriptive text accompanying the share. */
  text: string;
  /** URL to be shared (typically a link to the generated QR code image). */
  url: string;
}

/* -------------------------------------------------------------------------- */
/*  Web Share API                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Determines whether the current browser supports the Web Share API.
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== "undefined" && "share" in navigator;
}

/**
 * Invokes the Web Share API with the provided data.
 * Returns `true` if the share completed successfully, `false` otherwise
 * (e.g. user cancelled, or API is unavailable).
 */
export async function webShare(data: ShareData): Promise<boolean> {
  if (!isWebShareSupported()) return false;

  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
    });
    return true;
  } catch {
    /* AbortError is thrown when the user cancels the share sheet. */
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  Fallback Share Links                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Builds a platform-specific share URL. These URLs open in a new tab and
 * pre-fill the share dialog on each platform.
 *
 * @param platform - Target social platform.
 * @param data     - The content to share.
 * @returns A fully-qualified URL string.
 */
export function buildShareUrl(
  platform: SharePlatform,
  data: ShareData
): string {
  const encodedUrl = encodeURIComponent(data.url);
  const encodedText = encodeURIComponent(data.text);
  const encodedTitle = encodeURIComponent(data.title);

  switch (platform) {
    case SharePlatform.Twitter:
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;

    case SharePlatform.Facebook:
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case SharePlatform.LinkedIn:
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    case SharePlatform.WhatsApp:
      return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;

    case SharePlatform.Email:
      return `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`;
  }
}

/**
 * Opens the share URL in a new browser tab. Falls back gracefully if the
 * popup is blocked by the browser.
 */
export function shareToPlatform(
  platform: SharePlatform,
  data: ShareData
): void {
  const url = buildShareUrl(platform, data);
  window.open(url, "_blank", "noopener,noreferrer");
}

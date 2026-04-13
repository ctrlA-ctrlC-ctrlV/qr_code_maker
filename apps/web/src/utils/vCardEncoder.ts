/**
 * @fileoverview vCard 3.0 payload generator.
 *
 * Builds a standards-compliant vCard 3.0 string from a `VCardContact` object.
 * Version 3.0 is chosen over 4.0 for broader device compatibility, including
 * older Android handsets. The generated payload is UTF-8 encoded and suitable
 * for direct embedding in a QR code.
 *
 * Only properties that contain non-empty values are included in the output,
 * keeping the payload as compact as possible to stay within QR code capacity.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc2426 (vCard 3.0 specification)
 */

import { type VCardContact } from "@qr-code-maker/shared";

/* -------------------------------------------------------------------------- */
/*  Internal Helpers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Escapes special characters in vCard property values as required by RFC 2426.
 * Backslashes, semicolons, and commas must be preceded by a backslash.
 * Newlines are encoded as literal `\n`.
 */
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Appends a vCard property line to the accumulator array only when the
 * provided value is non-empty after trimming.
 *
 * @param lines    - Mutable array of vCard lines being assembled.
 * @param property - The vCard property name (e.g. "TEL;TYPE=CELL").
 * @param value    - The raw value; skipped if empty.
 */
function addLineIfPresent(
  lines: string[],
  property: string,
  value: string
): void {
  const trimmed = value.trim();
  if (trimmed.length > 0) {
    lines.push(`${property}:${escapeVCardValue(trimmed)}`);
  }
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Generates a vCard 3.0 string from the supplied contact information.
 *
 * The output follows RFC 2426 structure:
 * ```
 * BEGIN:VCARD\r\n
 * VERSION:3.0\r\n
 * N:LastName;FirstName;;;\r\n
 * FN:FirstName LastName\r\n
 * ...\r\n
 * END:VCARD
 * ```
 *
 * @param contact - Contact data populated by the user form.
 * @returns A complete vCard 3.0 string ready for QR code encoding.
 */
export function generateVCardString(contact: VCardContact): string {
  const lines: string[] = [];

  /* vCard envelope - required header. */
  lines.push("BEGIN:VCARD");
  lines.push("VERSION:3.0");

  /* ---- Structured name (N) and formatted name (FN) ---- */
  const firstName = contact.firstName.trim();
  const lastName = contact.lastName.trim();

  /*
   * N property: LastName;FirstName;MiddleName;Prefix;Suffix
   * Only first and last name are populated; middle, prefix, and suffix
   * are left empty as the form does not collect them.
   */
  lines.push(
    `N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`
  );

  /*
   * FN (formatted name) is required by RFC 2426. Constructed from
   * whichever name parts are available, with a space separator.
   *
   * NOTE: Some third-party QR scanner apps (e.g. Xiaomi Camera) have a
   * known bug where the FN value is placed into the "Given Name" contact
   * field alongside the structured N property, resulting in a duplicated
   * name. Google Lens and iOS Camera parse the same vCard correctly.
   */
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  lines.push(`FN:${escapeVCardValue(fullName)}`);

  /* ---- Phone numbers ---- */
  addLineIfPresent(lines, "TEL;TYPE=CELL", contact.phoneMobile);
  addLineIfPresent(lines, "TEL;TYPE=WORK", contact.phoneWork);

  /* ---- Email addresses ---- */
  addLineIfPresent(lines, "EMAIL;TYPE=HOME", contact.emailPersonal);
  addLineIfPresent(lines, "EMAIL;TYPE=WORK", contact.emailWork);

  /* ---- Organisation and title ---- */
  addLineIfPresent(lines, "TITLE", contact.jobTitle);
  addLineIfPresent(lines, "ORG", contact.company);

  /* ---- Website ---- */
  addLineIfPresent(lines, "URL", contact.website);

  /* ---- Address ----
   * ADR property: PO Box;Extended;Street;City;Region;PostalCode;Country
   * PO Box and Extended Address are left empty.
   */
  const street = contact.streetAddress.trim();
  const city = contact.city.trim();
  const region = contact.stateRegion.trim();
  const postal = contact.postalCode.trim();
  const country = contact.country.trim();

  const hasAddress = [street, city, region, postal, country].some(
    (part) => part.length > 0
  );

  if (hasAddress) {
    const adrParts = [
      "",
      "",
      escapeVCardValue(street),
      escapeVCardValue(city),
      escapeVCardValue(region),
      escapeVCardValue(postal),
      escapeVCardValue(country),
    ];
    lines.push(`ADR;TYPE=WORK:${adrParts.join(";")}`);
  }

  /* ---- Notes ---- */
  addLineIfPresent(lines, "NOTE", contact.notes);

  /* vCard envelope - required footer. */
  lines.push("END:VCARD");

  /*
   * RFC 2426 Section 2.4.2 requires CRLF (\r\n) line terminators.
   * iOS is lenient about LF-only endings but some Android QR scanners
   * (e.g. Xiaomi Camera) may misparse properties when only LF is used.
   */
  return lines.join("\r\n");
}

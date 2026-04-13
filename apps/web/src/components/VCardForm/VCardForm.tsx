/**
 * @fileoverview VCardForm component.
 *
 * Renders a structured contact information form whose fields map directly
 * to vCard 3.0 properties. The form exposes all fields defined in the
 * `VCardContact` interface and emits partial updates through a single
 * `onContactChange` callback, following the same pattern used by the
 * Wi-Fi credentials form.
 *
 * Validation feedback (from the parent) is displayed beneath the form.
 */

import { type ChangeEvent } from "react";
import { QR_DEFAULTS, type VCardContact, type ValidationResult } from "@qr-code-maker/shared";
import styles from "./VCardForm.module.css";

/* -------------------------------------------------------------------------- */
/*  Props Interface                                                           */
/* -------------------------------------------------------------------------- */

interface VCardFormProps {
  /** Current vCard contact state. */
  contact: VCardContact;
  /** Callback to partially update the contact — only changed fields needed. */
  onContactChange: (fields: Partial<VCardContact>) => void;
  /** Validation result to display inline errors below the form. */
  validation: ValidationResult;
}

/* -------------------------------------------------------------------------- */
/*  Field Descriptors                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Declarative definition of every form field. Using a descriptor array keeps
 * the JSX free of repetition and makes it straightforward to add fields in
 * the future (Open-Closed Principle).
 */
interface FieldDescriptor {
  /** Key in the VCardContact object. */
  key: keyof VCardContact;
  /** Human-readable label displayed above the input. */
  label: string;
  /** Placeholder hint text. */
  placeholder: string;
  /** HTML input type attribute. */
  type: "text" | "email" | "tel" | "url";
  /** Whether this field is required for form validity. */
  required: boolean;
  /** Optional max character length. */
  maxLength?: number;
  /** When true, renders a <textarea> instead of <input>. */
  multiline?: boolean;
}

/**
 * Ordered list of form fields grouped logically: name, phone, email,
 * professional, web, address, and notes.
 */
const FIELD_DESCRIPTORS: ReadonlyArray<FieldDescriptor> = [
  /* -- Name -- */
  { key: "firstName", label: "First Name", placeholder: "John", type: "text", required: true },
  { key: "lastName", label: "Last Name", placeholder: "Doe", type: "text", required: true },

  /* -- Phone -- */
  { key: "phoneMobile", label: "Phone (Mobile)", placeholder: "+353 87 123 4567", type: "tel", required: false },
  { key: "phoneWork", label: "Phone (Work)", placeholder: "+353 1 234 5678", type: "tel", required: false },

  /* -- Email -- */
  { key: "emailPersonal", label: "Email (Personal)", placeholder: "john@example.com", type: "email", required: false },
  { key: "emailWork", label: "Email (Work)", placeholder: "john@company.com", type: "email", required: false },

  /* -- Professional -- */
  { key: "jobTitle", label: "Job Title", placeholder: "Project Manager", type: "text", required: false },
  { key: "company", label: "Company / Organisation", placeholder: "My Company", type: "text", required: false },

  /* -- Web -- */
  { key: "website", label: "Website", placeholder: "https://company.com", type: "url", required: false },

  /* -- Address -- */
  { key: "streetAddress", label: "Street Address", placeholder: "123 Main Street", type: "text", required: false },
  { key: "city", label: "City", placeholder: "Dublin", type: "text", required: false },
  { key: "stateRegion", label: "State / Region", placeholder: "Leinster", type: "text", required: false },
  { key: "postalCode", label: "Postal Code", placeholder: "D01 AB12", type: "text", required: false },
  { key: "country", label: "Country", placeholder: "Ireland", type: "text", required: false },

  /* -- Notes -- */
  { key: "notes", label: "Notes", placeholder: "Additional notes (max 200 chars)", type: "text", required: false, maxLength: QR_DEFAULTS.maxNotesLength, multiline: true },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Renders the vCard contact form with all fields defined in the descriptor
 * array. Each field dispatches a partial update through `onContactChange`
 * using standard DOM change events.
 */
export function VCardForm({ contact, onContactChange, validation }: VCardFormProps) {
  /**
   * Generic change handler factory. Returns an event handler bound to the
   * specified VCardContact field key.
   */
  function handleFieldChange(key: keyof VCardContact) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      onContactChange({ [key]: event.target.value });
    };
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {FIELD_DESCRIPTORS.map((field) => (
          <div
            key={field.key}
            className={`${styles.field} ${field.multiline ? styles.fullWidth : ""}`}
          >
            <label htmlFor={`vcard-${field.key}`} className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}> *</span>}
            </label>

            {field.multiline ? (
              <textarea
                id={`vcard-${field.key}`}
                className={styles.textarea}
                value={contact[field.key]}
                onChange={handleFieldChange(field.key)}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                rows={3}
              />
            ) : (
              <input
                id={`vcard-${field.key}`}
                type={field.type}
                className={styles.input}
                value={contact[field.key]}
                onChange={handleFieldChange(field.key)}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
              />
            )}

            {/* Character counter for notes field */}
            {field.key === "notes" && (
              <div className={styles.meta}>
                <span
                  className={`${styles.charCount} ${
                    contact.notes.length > (field.maxLength ?? Infinity) * 0.9
                      ? styles.warning
                      : ""
                  }`}
                >
                  {contact.notes.length} / {field.maxLength}
                </span>
              </div>
            )}
          </div>
        ))}
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

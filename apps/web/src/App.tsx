/**
 * @fileoverview Root App component for QR Code Maker.
 *
 * Composes all major feature modules — input, customisation, preview, and
 * actions — into a responsive two-column layout. On mobile devices the
 * layout collapses to a single column with the preview at the top.
 *
 * State is managed centrally by the `useQrConfig` hook and fed to child
 * components via props. QR code generation is handled by `useQrGenerator`,
 * which debounces encoding so the preview updates in near-real-time as the
 * user types.
 */

import { QrInputType } from "@qr-code-maker/shared";
import { useQrConfig } from "./hooks/useQrConfig";
import { useQrGenerator } from "./hooks/useQrGenerator";
import { InputTypeSelector } from "./components/InputTypeSelector";
import { QrInput } from "./components/QrInput";
import { VCardForm } from "./components/VCardForm";
import { CustomisationPanel } from "./components/CustomisationPanel";
import { QrPreview } from "./components/QrPreview";
import { ActionBar } from "./components/ActionBar";
import styles from "./App.module.css";

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function App() {
  /* Centralised configuration state and actions. */
  const {
    rawValue,
    inputType,
    wifiCredentials,
    vCardContact,
    config,
    validation,
    setRawValue,
    setInputType,
    setWifiCredentials,
    setVCardContact,
    setSize,
    setErrorCorrectionLevel,
    setForegroundColor,
    setBackgroundColor,
  } = useQrConfig();

  /* Reactive QR code generation driven by the current config. */
  const { qrDataUrl, isGenerating, error } = useQrGenerator(
    config,
    validation.isValid
  );

  /** Whether a downloadable / shareable QR code is currently available. */
  const hasQrCode = Boolean(qrDataUrl) && !isGenerating && !error;

  return (
    <div className={styles.layout}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>QR Code Maker</h1>
        <p className={styles.subtitle}>
          Generate, customise, and share QR codes locally in your browser.
        </p>
      </header>

      {/* Main content area */}
      <main className={styles.main}>
        {/* Left column: inputs and options */}
        <section className={styles.controls} aria-label="QR code configuration">
          <InputTypeSelector
            selectedType={inputType}
            onTypeChange={setInputType}
          />

          {inputType === QrInputType.VCard ? (
            <VCardForm
              contact={vCardContact}
              onContactChange={setVCardContact}
              validation={validation}
            />
          ) : (
            <QrInput
              inputType={inputType}
              value={rawValue}
              onValueChange={setRawValue}
              wifiCredentials={wifiCredentials}
              onWifiChange={setWifiCredentials}
              validation={validation}
            />
          )}

          <CustomisationPanel
            size={config.size}
            onSizeChange={setSize}
            errorCorrectionLevel={config.errorCorrectionLevel}
            onErrorCorrectionChange={setErrorCorrectionLevel}
            foregroundColor={config.foregroundColor}
            onForegroundColorChange={setForegroundColor}
            backgroundColor={config.backgroundColor}
            onBackgroundColorChange={setBackgroundColor}
          />
        </section>

        {/* Right column: preview and actions */}
        <section className={styles.preview} aria-label="QR code preview">
          <QrPreview
            qrDataUrl={qrDataUrl}
            isGenerating={isGenerating}
            error={error}
            size={config.size}
          />

          <ActionBar config={config} hasQrCode={hasQrCode} />
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          Built by{" "}
          <strong>Modular House</strong> &mdash; Dublin, Ireland
        </p>
      </footer>
    </div>
  );
}

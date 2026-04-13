/**
 * @fileoverview Custom React hook for QR code configuration state management.
 *
 * Encapsulates all mutable state related to the QR code (input value,
 * customisation options, validation) and exposes a stable API through which
 * components can read and update the configuration.
 *
 * Follows the reducer pattern to keep state transitions predictable while
 * remaining lightweight enough for this single-page tool.
 */

import { useReducer, useCallback } from "react";
import {
  ErrorCorrectionLevel,
  QrInputType,
  QR_DEFAULTS,
  WiFiEncryption,
  type QrCodeConfig,
  type ValidationResult,
  type VCardContact,
  type WiFiCredentials,
} from "@qr-code-maker/shared";
import { validateInput } from "../utils/validation";
import { formatInputValue } from "../utils/qrEncoder";

/* -------------------------------------------------------------------------- */
/*  State Shape                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Internal state managed by the reducer. Separates the raw user input
 * from the fully-resolved QR code configuration so that formatting is
 * applied only when needed.
 */
interface QrConfigState {
  /** Raw user input before any URI-scheme formatting. */
  rawValue: string;
  /** Semantic type of the current input. */
  inputType: QrInputType;
  /** Wi-Fi credentials (only relevant when inputType is WiFi). */
  wifiCredentials: WiFiCredentials;
  /** vCard contact fields (only relevant when inputType is VCard). */
  vCardContact: VCardContact;
  /** Visual and encoding settings. */
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  foregroundColor: string;
  backgroundColor: string;
  /** Latest validation result for the current input. */
  validation: ValidationResult;
}

/* -------------------------------------------------------------------------- */
/*  Actions                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Discriminated union of all actions that can modify QR config state.
 * Using a tagged union ensures exhaustive handling in the reducer.
 */
type QrConfigAction =
  | { type: "SET_RAW_VALUE"; payload: string }
  | { type: "SET_INPUT_TYPE"; payload: QrInputType }
  | { type: "SET_WIFI_CREDENTIALS"; payload: Partial<WiFiCredentials> }
  | { type: "SET_VCARD_CONTACT"; payload: Partial<VCardContact> }
  | { type: "SET_SIZE"; payload: number }
  | { type: "SET_ERROR_CORRECTION"; payload: ErrorCorrectionLevel }
  | { type: "SET_FOREGROUND_COLOR"; payload: string }
  | { type: "SET_BACKGROUND_COLOR"; payload: string };

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

/** Initial Wi-Fi credentials used when the form first renders. */
const defaultWiFiCredentials: WiFiCredentials = {
  ssid: "",
  password: "",
  encryption: WiFiEncryption.WPA,
  hidden: false,
};

/** Empty vCard contact used when the form first renders. */
const defaultVCardContact: VCardContact = {
  firstName: "",
  lastName: "",
  phoneMobile: "",
  phoneWork: "",
  emailPersonal: "",
  emailWork: "",
  jobTitle: "",
  company: "",
  website: "",
  streetAddress: "",
  city: "",
  stateRegion: "",
  postalCode: "",
  country: "",
  notes: "",
};

/** Fully populated initial state derived from shared defaults. */
const initialState: QrConfigState = {
  rawValue: "",
  inputType: QrInputType.PlainText,
  wifiCredentials: defaultWiFiCredentials,
  vCardContact: defaultVCardContact,
  size: QR_DEFAULTS.size,
  errorCorrectionLevel: QR_DEFAULTS.errorCorrectionLevel,
  foregroundColor: QR_DEFAULTS.foregroundColor,
  backgroundColor: QR_DEFAULTS.backgroundColor,
  validation: { isValid: true, errorMessage: "" },
};

/* -------------------------------------------------------------------------- */
/*  Reducer                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Pure reducer function. Re-validates input on every value or type change
 * so that the UI always reflects the current validity status.
 */
function qrConfigReducer(
  state: QrConfigState,
  action: QrConfigAction
): QrConfigState {
  switch (action.type) {
    case "SET_RAW_VALUE": {
      const validation = validateInput(
        state.inputType,
        action.payload,
        state.inputType === QrInputType.WiFi ? state.wifiCredentials : undefined,
        state.inputType === QrInputType.VCard ? state.vCardContact : undefined
      );
      return { ...state, rawValue: action.payload, validation };
    }

    case "SET_INPUT_TYPE": {
      /*
       * Reset the raw value and type-specific state when switching types to
       * avoid stale validation artefacts (e.g. a URL left over when switching
       * to Phone).
       */
      const validation = validateInput(action.payload, "", undefined, undefined);
      return {
        ...state,
        inputType: action.payload,
        rawValue: "",
        wifiCredentials: defaultWiFiCredentials,
        vCardContact: defaultVCardContact,
        validation,
      };
    }

    case "SET_WIFI_CREDENTIALS": {
      const merged = { ...state.wifiCredentials, ...action.payload };
      const validation = validateInput(QrInputType.WiFi, "", merged);
      return { ...state, wifiCredentials: merged, validation };
    }

    case "SET_VCARD_CONTACT": {
      const merged = { ...state.vCardContact, ...action.payload };
      const validation = validateInput(QrInputType.VCard, "", undefined, merged);
      return { ...state, vCardContact: merged, validation };
    }

    case "SET_SIZE":
      return { ...state, size: action.payload };

    case "SET_ERROR_CORRECTION":
      return { ...state, errorCorrectionLevel: action.payload };

    case "SET_FOREGROUND_COLOR":
      return { ...state, foregroundColor: action.payload };

    case "SET_BACKGROUND_COLOR":
      return { ...state, backgroundColor: action.payload };

    default:
      return state;
  }
}

/* -------------------------------------------------------------------------- */
/*  Hook Return Type                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Public interface exposed by the useQrConfig hook.
 */
interface UseQrConfigReturn {
  /** Current raw input value. */
  rawValue: string;
  /** Current input type. */
  inputType: QrInputType;
  /** Wi-Fi credentials state. */
  wifiCredentials: WiFiCredentials;
  /** vCard contact state. */
  vCardContact: VCardContact;
  /** Resolved QR code configuration ready for encoding. */
  config: QrCodeConfig;
  /** Latest validation result. */
  validation: ValidationResult;
  /** Update the raw text input. */
  setRawValue: (value: string) => void;
  /** Switch the input type. */
  setInputType: (type: QrInputType) => void;
  /** Partially update Wi-Fi credentials. */
  setWifiCredentials: (credentials: Partial<WiFiCredentials>) => void;
  /** Partially update vCard contact fields. */
  setVCardContact: (fields: Partial<VCardContact>) => void;
  /** Update QR code rendered size. */
  setSize: (size: number) => void;
  /** Update error correction level. */
  setErrorCorrectionLevel: (level: ErrorCorrectionLevel) => void;
  /** Update foreground colour. */
  setForegroundColor: (color: string) => void;
  /** Update background colour. */
  setBackgroundColor: (color: string) => void;
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Provides centralised QR code configuration state and actions.
 *
 * The hook derives a resolved `QrCodeConfig` from the internal state on every
 * render, applying input formatting (e.g. prepending "mailto:" to email input)
 * automatically. Components consuming this hook do not need to know about
 * formatting rules.
 */
export function useQrConfig(): UseQrConfigReturn {
  const [state, dispatch] = useReducer(qrConfigReducer, initialState);

  /* Derive the formatted value that will actually be encoded. */
  const formattedValue = formatInputValue(
    state.inputType,
    state.rawValue,
    state.inputType === QrInputType.WiFi ? state.wifiCredentials : undefined,
    state.inputType === QrInputType.VCard ? state.vCardContact : undefined
  );

  /** Assembled configuration object consumed by the encoder and renderer. */
  const config: QrCodeConfig = {
    value: formattedValue,
    inputType: state.inputType,
    errorCorrectionLevel: state.errorCorrectionLevel,
    size: state.size,
    foregroundColor: state.foregroundColor,
    backgroundColor: state.backgroundColor,
  };

  /* Stable callbacks wrapped with useCallback to prevent unnecessary re-renders. */
  const setRawValue = useCallback(
    (value: string) => dispatch({ type: "SET_RAW_VALUE", payload: value }),
    []
  );

  const setInputType = useCallback(
    (type: QrInputType) => dispatch({ type: "SET_INPUT_TYPE", payload: type }),
    []
  );

  const setWifiCredentials = useCallback(
    (credentials: Partial<WiFiCredentials>) =>
      dispatch({ type: "SET_WIFI_CREDENTIALS", payload: credentials }),
    []
  );

  const setVCardContact = useCallback(
    (fields: Partial<VCardContact>) =>
      dispatch({ type: "SET_VCARD_CONTACT", payload: fields }),
    []
  );

  const setSize = useCallback(
    (size: number) => dispatch({ type: "SET_SIZE", payload: size }),
    []
  );

  const setErrorCorrectionLevel = useCallback(
    (level: ErrorCorrectionLevel) =>
      dispatch({ type: "SET_ERROR_CORRECTION", payload: level }),
    []
  );

  const setForegroundColor = useCallback(
    (color: string) => dispatch({ type: "SET_FOREGROUND_COLOR", payload: color }),
    []
  );

  const setBackgroundColor = useCallback(
    (color: string) => dispatch({ type: "SET_BACKGROUND_COLOR", payload: color }),
    []
  );

  return {
    rawValue: state.rawValue,
    inputType: state.inputType,
    wifiCredentials: state.wifiCredentials,
    vCardContact: state.vCardContact,
    config,
    validation: state.validation,
    setRawValue,
    setInputType,
    setWifiCredentials,
    setVCardContact,
    setSize,
    setErrorCorrectionLevel,
    setForegroundColor,
    setBackgroundColor,
  };
}

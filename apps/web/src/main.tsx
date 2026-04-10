/**
 * @fileoverview Application entry point.
 *
 * Mounts the root React component into the DOM node identified by "root".
 * StrictMode is enabled to surface potential issues during development.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/global.css";

/**
 * Retrieve the root DOM element. The non-null assertion is safe because
 * index.html always contains a <div id="root"> element.
 */
const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

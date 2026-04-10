import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Vite configuration for the QR Code Maker React web application.
 *
 * - Aliases the shared package so imports resolve directly to source files,
 *   avoiding a separate build step during development.
 * - Uses the official React plugin for Fast Refresh (HMR).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      /* Map the shared workspace package to its source for seamless imports. */
      "@qr-code-maker/shared": path.resolve(
        __dirname,
        "../../packages/shared/src"
      ),
    },
  },
  build: {
    /* Target modern browsers for smaller bundles. */
    target: "es2020",
    /* Enable source maps for production debugging when needed. */
    sourcemap: true,
  },
});

/**
 * @fileoverview CSS Modules type declaration.
 *
 * Provides TypeScript type information for `.module.css` imports so that
 * class names resolve to `string` and the compiler does not report errors
 * on CSS Module imports.
 */

declare module "*.module.css" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

/** @type {import('@types/eslint').ESLint.Options['baseConfig']} */
// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier", "promise"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:promise/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "prettier/prettier": ["error", { endOfLine: "crlf" }],
  },
};

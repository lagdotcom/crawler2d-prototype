/** @type {import('@types/eslint').ESLint.Options['baseConfig']} */
// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parserOptions: { project: "./tsconfig.json" },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier", "promise"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict",
    "plugin:promise/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "prettier/prettier": ["error", { endOfLine: "crlf" }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
  },
};

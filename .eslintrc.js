module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true
  },
  plugins: [
      "@typescript-eslint",
      "prettier"
  ],
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended"
  ],
  overrides: [],
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/prefer-as-const": "off"
  }
}
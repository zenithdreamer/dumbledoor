import baseConfig from "@dumbledoor/eslint-config/base";
import reactConfig from "@dumbledoor/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [],
  },
  ...baseConfig,
  ...reactConfig,
];

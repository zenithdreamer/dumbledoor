import baseConfig, { restrictEnvAccess } from "@dumbledoor/eslint-config/base";
import nextjsConfig from "@dumbledoor/eslint-config/nextjs";
import reactConfig from "@dumbledoor/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];

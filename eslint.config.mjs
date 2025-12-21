import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";

export default tseslint.config(
  // 1. Dateien ignorieren
  {
    ignores: ["node_modules/", ".next/", "dist/", "build/"],
  },
  // 2. Basis-Konfigurationen laden
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // 3. Deine spezifischen Regeln
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Bei Next.js/Modern React wichtig
    },
  }
);

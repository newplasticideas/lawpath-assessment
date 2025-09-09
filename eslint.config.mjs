import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * ESLint flat config
 *
 * - Starts with an "ignores" block (replaces .eslintignore)
 * - Extends Next.js core + TypeScript rules
 * - You can add custom rules in the last object if needed
 */
const eslintConfig = [
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "build",
      "coverage",
      "**/*.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // example customizations:
      "@typescript-eslint/no-explicit-any": "warn", // or "off" if it's too noisy
      "react/react-in-jsx-scope": "off", // Next.js doesn’t require React import
    },
  },
];

export default eslintConfig;

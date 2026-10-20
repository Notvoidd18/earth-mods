import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
    ],
  },
  ...compat.config({
    extends: ["next", "next/core-web-vitals", "next/typescript"],
  }),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;

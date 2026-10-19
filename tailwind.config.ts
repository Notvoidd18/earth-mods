import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        institutional: {
          50: "#f4f7f5",
          100: "#e4ece7",
          200: "#c7d9ce",
          300: "#9fbeaf",
          400: "#719d8b",
          500: "#4e806e",
          600: "#3b6757",
          700: "#2f5246",
          800: "#274239",
          900: "#182b24",
          950: "#0c1713",
        },
        parchment: {
          50: "#fbfaf7",
          100: "#f5f3ec",
          200: "#eae5d7",
          300: "#dbd1be",
          400: "#c6b79f",
          500: "#b4a185",
          900: "#2a2620",
        },
        gold: {
          400: "#d4b36a",
          500: "#b8974a",
          600: "#967833",
          700: "#755c24",
        },
        seal: {
          600: "#9e2a2b",
          700: "#7f1d1d",
          800: "#541313",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "Times", "serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "'Courier New'",
          "monospace",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 2px 4px 0 rgba(18, 43, 28, 0.06), 0 1px 2px 0 rgba(18, 43, 28, 0.04)",
        docket: "0 4px 12px -2px rgba(18, 43, 28, 0.12), 0 2px 6px -1px rgba(18, 43, 28, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;

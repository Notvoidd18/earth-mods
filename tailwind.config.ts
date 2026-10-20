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
          deep: "#142D24",       // Deep forest green
          primary: "#244638",    // Primary forest green
          secondary: "#3B5D4A",  // Secondary forest green
          accent: "#4D735C",     // Medium institutional green
          tint: "#E6ECE8",       // Very light sage wash
        },
        parchment: {
          50: "#FFFCF5",         // Pure archival paper
          100: "#F7F3E9",        // Warm archival parchment
          200: "#EFE9DA",        // Docket background
          300: "#E2D9C5",        // Aged docket paper
          border: "#DCD4C3",     // Crisp institutional border
          darkborder: "#C2B69F", // Accent docket border
        },
        ink: {
          900: "#242820",        // Primary reading ink
          700: "#444840",        // Secondary institutional ink
          500: "#6D7065",        // Muted archival note ink
          300: "#9A9E94",        // Faint border ink
        },
        gold: {
          500: "#C4AC6C",
          600: "#B39A5A",        // Directorate aged gold
          700: "#8F773B",
        },
        seal: {
          red: "#8B302B",        // Official Directorate seal red
          redtint: "#FBEBEA",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "Times", "serif"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "Inter",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "'Courier New'",
          "monospace",
        ],
      },
      boxShadow: {
        docket: "0 1px 3px rgba(36, 40, 32, 0.06), 0 1px 2px rgba(36, 40, 32, 0.04)",
        "docket-lg": "0 10px 25px -5px rgba(20, 45, 36, 0.1), 0 8px 10px -6px rgba(20, 45, 36, 0.06)",
        seal: "0 0 0 2px #8B302B, 0 4px 12px rgba(139, 48, 43, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;

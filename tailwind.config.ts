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
        // --- Paleta primaria: naranja ferretero ---
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f57c00", // base (Figma)
          600: "#e56f00", // hover
          700: "#cc5f00", // pressed
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        // --- Paleta secundaria: azul acero ---
        secondary: {
          50: "#eaf1fa",
          100: "#d8e4f5",
          200: "#b7cdea",
          300: "#8eafd9",
          400: "#4e77b6",
          500: "#1e3a5f", // base (Figma)
          600: "#1a3355", // hover
          700: "#162c4a", // pressed
          800: "#12243f",
          900: "#0d1b30",
          950: "#172554",
        },
        // --- Paleta de neutros ---
        neutral: {
          50:  "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        // --- Semánticos ---
        success: {
          50:  "#f0fdf4",
          500: "#22c55e",
          700: "#15803d",
        },
        warning: {
          50:  "#fffbeb",
          500: "#f59e0b",
          700: "#b45309",
        },
        danger: {
          50:  "#fef2f2",
          500: "#ef4444",
          700: "#b91c1c",
        },
        // --- Compatibilidad con variables CSS de Next.js ---
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;

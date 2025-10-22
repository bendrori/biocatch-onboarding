import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(0, 0%, 89%)",
        input: "hsl(0, 0%, 89%)",
        ring: "hsl(0, 0%, 10%)",
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(0, 0%, 3.9%)",
        primary: {
          DEFAULT: "hsl(0, 0%, 9%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        secondary: {
          DEFAULT: "hsl(0, 0%, 96.1%)",
          foreground: "hsl(0, 0%, 9%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 0%, 40%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        muted: {
          DEFAULT: "hsl(0, 0%, 96.1%)",
          foreground: "hsl(0, 0%, 45.1%)",
        },
        accent: {
          DEFAULT: "hsl(0, 0%, 96.1%)",
          foreground: "hsl(0, 0%, 9%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(0, 0%, 3.9%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(0, 0%, 3.9%)",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;


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
        winner: {
          primary: "#3A388E",
          accent: "#B6E3D4",
          bg: "#0c0c0e",
          card: "#16161a",
          "card-hover": "#1c1c22",
          border: "rgba(255,255,255,0.08)",
          text: "#e2e8f0",
          muted: "#6b7280",
          error: "#f43f5e",
          success: "#10b981",
          warning: "#f59e0b",
        },
      },
      fontFamily: {
        heebo: ["Heebo", "sans-serif"],
        rubik: ["Rubik", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

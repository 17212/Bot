import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#0f0f0f",
        primary: "#39FF14",
        heading: "#EDEDED",
        body: "#A0A0A0",
        glass: "rgba(255,255,255,0.08)"
      },
      fontFamily: {
        heading: ["Orbitron", "Cairo", "sans-serif"],
        body: ["Inter", "Tajawal", "sans-serif"]
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px"
      },
      boxShadow: {
        glass: "0 10px 40px rgba(0,0,0,0.45)"
      }
    }
  },
  plugins: []
};

export default config;

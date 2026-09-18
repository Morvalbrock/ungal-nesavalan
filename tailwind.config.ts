import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1200px" }
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1a1310",
          soft: "#3d2a22",
          muted: "#6b544a"
        },
        cream: {
          DEFAULT: "#fbf6ef",
          warm: "#f4ead9"
        },
        maroon: {
          DEFAULT: "#7a1f2b",
          deep: "#5a1520"
        },
        gold: {
          DEFAULT: "#b8893a",
          soft: "#d4b071"
        },
        border: "#e8ddc9"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        card: "6px"
      }
    }
  },
  plugins: []
};

export default config;

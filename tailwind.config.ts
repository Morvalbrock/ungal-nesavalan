import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1240px" }
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
          warm: "#f4ead9",
          deep: "#efe1c6"
        },
        ivory: "#f8f1e3",
        maroon: {
          DEFAULT: "#7a1f2b",
          deep: "#5a1520",
          dark: "#3d0d15"
        },
        gold: {
          DEFAULT: "#b8893a",
          soft: "#d4b071",
          deep: "#8a6420"
        },
        terracotta: "#b5502a",
        moss: "#4a5a2a",
        indigo_deep: "#243a6b",
        border: "#e8ddc9"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        card: "4px"
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,19,16,0.04), 0 8px 24px -12px rgba(26,19,16,0.12)",
        elev: "0 24px 60px -30px rgba(26,19,16,0.28)"
      },
      letterSpacing: {
        widest2: "0.32em"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        fadeUp: "fadeUp 0.6s ease-out both",
        shimmer: "shimmer 2s linear infinite"
      },
      backgroundImage: {
        "grain":
          "radial-gradient(rgba(122,31,43,0.04) 1px, transparent 1px)",
        "gold-line":
          "linear-gradient(90deg, transparent, rgba(184,137,58,0.5), transparent)"
      }
    }
  },
  plugins: []
};

export default config;

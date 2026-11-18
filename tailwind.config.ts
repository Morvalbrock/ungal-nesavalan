import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1440px" }
    },
    extend: {
      colors: {
        brand: {
          plum: "#3e0c47",
          deep: "#4a0e4e",
          purple: "#581c87",
          violet: "#6b21a8",
          lavenderLight: "#f6f0fb",
          lavenderMuted: "#ede4f5",
          lavenderBorder: "#e2d3f0",
          gold: "#c59a3f",
          goldDark: "#a3792c",
          goldLight: "#fef3c7"
        },
        ink: {
          DEFAULT: "#140A1F",
          soft: "#2B1D3D",
          muted: "#6E5C86"
        },
        cream: {
          DEFAULT: "#FFFFFF",
          warm: "#F6EDFB",
          deep: "#E7D5EF"
        },
        ivory: "#FBF6FE",
        maroon: {
          DEFAULT: "#5B2A86",
          deep: "#40175F",
          dark: "#2A0E47"
        },
        gold: {
          DEFAULT: "#C89B3C",
          soft: "#E0BD6F",
          deep: "#9A7628"
        },
        terracotta: "#B5502A",
        moss: "#6B5A80",
        indigo_deep: "#2A0E47",
        border: "#EADBF5"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        heritage: ["var(--font-heritage)", "var(--font-display)", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        card: "14px",
        stack: "20px",
        pill: "999px"
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
          "radial-gradient(rgba(91,42,134,0.05) 1px, transparent 1px)",
        "gold-line":
          "linear-gradient(90deg, transparent, rgba(200,155,60,0.55), transparent)"
      }
    }
  },
  plugins: []
};

export default config;

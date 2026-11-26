/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      // Escala tipografica curta. Quanto maior o texto, menor o tracking
      // e mais justa a entrelinha.
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.005em" }],
        ui: ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "0" }],
        sm: ["0.875rem", { lineHeight: "1.375rem", letterSpacing: "0" }],
        base: ["1rem", { lineHeight: "1.5rem", letterSpacing: "-0.005em" }],
        lg: ["1.125rem", { lineHeight: "1.625rem", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.015em" }],
        "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.02em" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.025em" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.03em" }],
        "5xl": ["3rem", { lineHeight: "1.08", letterSpacing: "-0.035em" }],
        "6xl": ["3.75rem", { lineHeight: "1.04", letterSpacing: "-0.04em" }],
      },
      colors: {
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-2": "var(--color-surface-2)",
        "surface-3": "var(--color-surface-3)",
        border: "var(--color-border)",
        foreground: "var(--color-text)",
        "foreground-muted": "var(--color-text-muted)",
        "foreground-subtle": "var(--color-text-subtle)",
        primary: "var(--color-primary)",
        "primary-strong": "var(--color-primary-strong)",
        accent: "var(--color-accent)",
        "accent-strong": "var(--color-accent-strong)",
        danger: "var(--color-danger)",
        "danger-strong": "var(--color-danger-strong)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        coral: {
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-in-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  // ...
};

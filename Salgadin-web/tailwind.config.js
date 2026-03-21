/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  theme: {
    extend: {
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

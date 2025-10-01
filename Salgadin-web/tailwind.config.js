/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
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

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#16a34a",
          dark: "#15803d",
          light: "#22c55e",
        },
        ink: {
          900: "#0b1220",
          800: "#111a2e",
          700: "#1a2540",
          600: "#243154",
        },
      },
    },
  },
  plugins: [],
};

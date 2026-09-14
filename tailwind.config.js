/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Project palette
        brand: {
          900: "#0D47A1",
          500: "#2196F3",
          200: "#90CAF9",
          50: "#E3F2FD",
        },
        navy: {
          DEFAULT: "#0D47A1",
          light: "#1559BF",
          dark: "#08306B",
        },
        primary: {
          DEFAULT: "#0D47A1",
          dark: "#08306B",
          light: "#E3F2FD",
        },
        accent: "#2196F3",
      },
      boxShadow: {
        brand: "0 10px 30px -12px rgba(13, 71, 161, 0.35)",
        "brand-sm": "0 2px 10px -4px rgba(13, 71, 161, 0.25)",
      },
    },
  },
  plugins: [],
};

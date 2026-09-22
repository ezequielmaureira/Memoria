/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bone: "#f5f0e6",
        cream: "#ede2ce",
        carbon: "#1c1a17",
        sepia: "#8a6a4b",
        earth: "#6b5643",
        rust: "#a3572f",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

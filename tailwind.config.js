/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4fa",
          100: "#dce5f3",
          200: "#bccde8",
          300: "#8eacd9",
          400: "#5d88c5",
          500: "#3b6cae",
          600: "#2b5593",
          700: "#1f4278",
          800: "#1a3763",
          900: "#0f2444",
          950: "#0a1830",
        },
        teal: {
          50: "#effcf9",
          100: "#d7f7ef",
          200: "#b0efe0",
          300: "#7be2cc",
          400: "#3dccb0",
          500: "#1caF98",
          600: "#108d7c",
          700: "#107165",
          800: "#125a52",
          900: "#144b44",
          950: "#062d2a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#046bd2",
          "blue-dark": "#045cb4",
          dark: "#1e293b",
          secondary: "#334155",
          light: "#F0F5FA",
          yellow: "#fad23b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D32F2F",
          light: "#EF5350",
          dark: "#B71C1C",
        },
        secondary: "#FFFFFF",
        tertiary: "#F5F5F5",
      },
    },
  },
  plugins: [],
}

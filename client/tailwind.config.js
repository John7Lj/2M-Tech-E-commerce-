/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  // REMOVED important: true  ← this was the bug!
  // Boolean true adds !important to every utility, so bg-white and dark:bg-black
  // both get !important and CSS picks the last-written rule (dark colors win always).
  theme: {
    extend: {
      colors: {
        // ── Brand ────────────────────────────────────────────────────────
        // Uses CSS variables defined in index.css so dark mode changes colours.
        // Tailwind reads them as RGB channels → "rgb(var(--color-primary))"
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          light:   'rgb(var(--color-primary-light) / <alpha-value>)',
          dark:    'rgb(var(--color-primary-dark)  / <alpha-value>)',
        },

        // ── Surfaces ─────────────────────────────────────────────────────
        secondary: {
          DEFAULT: 'rgb(var(--color-bg)            / <alpha-value>)',
          dark:    'rgb(var(--color-secondary-dark) / <alpha-value>)',
        },
        accent: 'rgb(var(--color-accent) / <alpha-value>)',

        // ── Neutral scale (unchanged – these don't need theme-switching) ─
        gray: {
          50:  '#F9F9F9',
          100: '#F2F2F2',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
      },
    },
  },
  plugins: [],
}
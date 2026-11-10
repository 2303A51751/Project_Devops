/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8edf4',
          100: '#c5d1e3',
          200: '#9fb3d1',
          300: '#7895bf',
          400: '#5b7fb2',
          500: '#3e69a5',
          600: '#38619d',
          700: '#305693',
          800: '#284c89',
          900: '#1e3a5f',
          950: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

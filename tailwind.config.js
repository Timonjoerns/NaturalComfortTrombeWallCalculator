/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm': {
          50: '#faf8f6',
          100: '#f5f0ec',
          200: '#ebe3dd',
          300: '#e0d4cc',
          400: '#c9ada7',
          500: '#b09b8c',
          600: '#9b8b7e',
          700: '#7a6f66',
        },
      },
    },
  },
  plugins: [],
}

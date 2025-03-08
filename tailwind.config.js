/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'midi-dark': '#1a1a1a',
        'midi-accent': '#00a8ff',
        'midi-success': '#00c853',
        'midi-error': '#ff1744'
      }
    }
  },
  plugins: [],
} 
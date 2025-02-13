/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'roboto-condensed': ['"Roboto Condensed"', 'serif'],
      },
      colors: {
        'habit-orange': '#ba5106',
        'habit-dark': {
          DEFAULT: '#1C1C1C',
          card: '#242424',
          deeper: '#0A0A0A',
        }
      },
    },
  },
  plugins: [],
};
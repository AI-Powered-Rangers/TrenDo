/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FFF3EE',
          100: '#FFE2D4',
          200: '#FFC0A4',
          300: '#FF9C73',
          400: '#FF7D4F',
          500: '#FF5C2A',
          600: '#E84412',
          700: '#B5340D',
        },
        ink: {
          50: '#F2F4FA',
          100: '#D6DBEC',
          200: '#A4ADCC',
          300: '#6F7AA4',
          400: '#3F4A77',
          500: '#23305C',
          600: '#172149',
          700: '#0E1738',
          800: '#070D24',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans KR"', 'system-ui', 'sans-serif'],
        display: ['"Clash Display"', '"Noto Sans KR"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 6px 28px -10px rgba(23,33,73,0.25)',
      },
    },
  },
  plugins: [],
}

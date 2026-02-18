/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6fffa',
          100: '#b2f5ea',
          500: '#4fd1c7',
          600: '#38b2ac',
          700: '#319795',
        },
        secondary: {
          50: '#bee3f8',
          100: '#90cdf4',
          500: '#4299e1',
          600: '#3182ce',
          700: '#2c5282',
        },
        success: {
          50: '#c6f6d5',
          100: '#9ae6b4',
          500: '#48bb78',
          600: '#38a169',
          700: '#2f855a',
        },
        warning: {
          50: '#feebc8',
          100: '#fbd38d',
          500: '#ed8936',
          600: '#dd6b20',
          700: '#c05621',
        },
        error: {
          50: '#fed7d7',
          100: '#feb2b2',
          500: '#e53e3e',
          600: '#c53030',
          700: '#9b2c2c',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
      animation: {
        'bounce-gentle': 'bounce 1s ease-in-out',
        'pulse-slow': 'pulse 2s infinite',
        'celebrate': 'celebrate 0.6s ease',
      },
      keyframes: {
        celebrate: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.02) rotate(1deg)' },
          '75%': { transform: 'scale(1.02) rotate(-1deg)' },
        },
      },
    },
  },
  plugins: [],
}
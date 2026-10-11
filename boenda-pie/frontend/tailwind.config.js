/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          50: '#fff5f9',
          100: '#ffe6f0',
          200: '#fccce5',
          300: '#f8cee8', // Base Pink
          400: '#f4b8da',
          500: '#f0a3d0', // Main Button (Darker Pink)
          600: '#d98cb5', // Hover
          700: '#a0336e', // Text
          800: '#8c2b5f',
          900: '#75234f',
        },
        slate: {
          50: '#fffaf5',
          100: '#fff4e7',
          200: '#ffdbb5',
          300: '#f0e8e0',
          400: '#d6cec4',
          500: '#9b8b7c',
          600: '#7a6a5b',
          700: '#6b5748',
          800: '#4a3b2f',
          900: '#3d2c1e',
          950: '#2b1e13',
        },
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          dark: '#451a03'
        },
        warm: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917'
        }
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
};

const colors = require('tailwindcss/colors');

const brandBrown = {
  50: '#f7f3f0',
  100: '#ece3db',
  200: '#d7c2b5',
  300: '#bfa08c',
  400: '#a67d64',
  500: '#8c5a3d',
  600: '#754b33',
  700: '#5e3c29',
  800: '#472d1f',
  900: '#2f1e14',
  950: '#1a100a',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      colors: {
        // Ánh xạ tất cả hệ màu về tông màu nâu đất (Earth / Warm) để tạo giao diện Monochromatic đồng nhất
        blue: brandBrown,
        cyan: brandBrown,
        indigo: brandBrown,
        purple: brandBrown,
        emerald: brandBrown,
        teal: brandBrown,
        violet: brandBrown,
        pink: brandBrown,
        amber: brandBrown,
        yellow: brandBrown,
        orange: brandBrown,
        red: brandBrown,
      },
      borderRadius: {
        'sm': '10px',
        DEFAULT: '10px',
        'md': '10px',
        'lg': '10px',
        'xl': '10px',
        '2xl': '10px',
        '3xl': '10px',
      }
    },
  },
  plugins: [],
};

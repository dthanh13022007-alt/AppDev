/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e293b',
          hover: '#0f172a',
        },
        surface: {
          DEFAULT: '#ffffff',
          canvas: '#fafaf9',
          subtle: '#f5f5f4',
        },
        food: {
          DEFAULT: '#d97706',
          light: '#fef3c7',
        },
        success: {
          DEFAULT: '#059669',
          light: '#ecfdf5',
        },
        danger: {
          DEFAULT: '#e11d48',
          light: '#fff1f2',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ]
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
}

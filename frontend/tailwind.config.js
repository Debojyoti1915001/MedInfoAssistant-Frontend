/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f5f7fb',
          100: '#e8ecf7',
          200: '#d0d8ee',
          300: '#a8b8e1',
          400: '#7a94d4',
          500: '#4a5fbe',
          600: '#3d4fa3',
          700: '#2d3682',
          800: '#1f2860',
          900: '#141a3d',
        },
        slate: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
    },
  },
  plugins: [],
}

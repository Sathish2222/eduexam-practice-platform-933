/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#374151',
        secondary: '#6B7280',
        success: '#059669',
        error: '#EF4444',
        background: '#f9fafb',
        surface: '#ffffff',
        textMain: '#111827',
      },
    },
  },
  plugins: [],
}

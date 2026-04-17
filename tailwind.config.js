/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-bg': '#0f172a',
        'deep-hover': '#1e293b',
        primary: "#4f46e5",
        secondary: "#1e293b",
        'light-bg': '#f8fafc',
      },
    },
  },
  plugins: [],
}
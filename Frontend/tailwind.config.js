/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'text-blue-400',
    'text-red-500',
    'text-emerald-400',
    'text-pink-500',
    'text-purple-400',
    'text-yellow-400',
    'text-sky-500',
    'text-green-500',
    'text-vx-primary'
  ],
  theme: {
    extend: {
      colors: {
        'vx-primary': '#6366f1',
        'vx-neon': '#f43f5e',
        'vx-accent': '#10b981',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Geist', 'sans-serif'],
        body: ['Geist', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        zinc: {
          950: '#09090b', 925: '#0d0d10',
        },
        blue: { neon: '#3B82F6' },
      },
    },
  },
  plugins: [],
}

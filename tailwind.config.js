/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // السطر ده هو اللي هيخلي Tailwind يقرأ كل شغلك
  ],
  theme: {
    extend: {
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
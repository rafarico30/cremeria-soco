/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        footColor: '#D4A5A5',
        greyColor: '#C4CCCC',
        redColor: '#AC5252',
        priceColor: '#A46C64',
        letterColor: '#5C2C2C',
        greycolor2: '#D9D9D9',
      },
      fontFamily:{
        'lobsterTwo' : ['Lobster Two', 'sans-serif']
      }
      
    },
  },
  plugins: [],
}

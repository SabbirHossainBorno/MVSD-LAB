// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', 
    './public/**/*.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        openSans: ['Open Sans', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif'],
        playfairDisplay: ['Playfair Display', 'serif'],
        oswald: ['Oswald', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sourceSansPro: ['Source Sans Pro', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

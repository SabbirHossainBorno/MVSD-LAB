// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Ensure your content paths are correct
    './public/**/*.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],  // Add Poppins font
        roboto: ['Roboto', 'sans-serif'],    // Add Roboto font
      },
    },
  },
  plugins: [],
};
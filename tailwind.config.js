module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      animation: {
        gradient: 'gradient 3s ease infinite',
        textGlow: 'textGlow 2s ease-in-out infinite', // Add textGlow animation
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [
    // Adding plugin to add custom scrollbar
    function ({ addComponents }) {
      addComponents({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-thumb': {
          'background-color': 'rgba(255, 255, 255, 0.4)', // light color for thumb
          'border-radius': '10px',
        },
        '.scrollbar-track': {
          'background': 'transparent',
        },
        /* Custom scrollbar styling for webkit browsers (Chrome, Safari) */
        '::-webkit-scrollbar': {
          width: '4px', // slim scrollbar width
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderRadius: '10px',
        },
        '::-webkit-scrollbar-track': {
          background: 'transparent',
        },
      });
    },
  ],
};

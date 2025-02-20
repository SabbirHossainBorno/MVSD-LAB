module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 2s infinite',
        'gradient': 'gradient 3s ease infinite',
        'textGlow': 'textGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.15' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      grayscale: {
        35: '35%',
      },
      colors: {
        'amber-500/20': 'rgba(245, 158, 11, 0.2)',
        'green-500/20': 'rgba(16, 185, 129, 0.2)',
      },
    },
  },
  plugins: [
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
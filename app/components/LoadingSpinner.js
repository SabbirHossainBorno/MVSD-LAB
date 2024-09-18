import React from 'react';

const LoadingSpinner = () => (
  <div className="relative flex justify-center items-center min-h-screen">
    {/* Spinner */}
    <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-gradient-start border-transparent border-t-purple-500 border-b-purple-500"></div>
    
    {/* Image */}
    <img 
      src="https://www.svgrepo.com/show/509001/avatar-thinking-9.svg" 
      alt="Thinking Avatar" 
      className="rounded-full h-28 w-28"
    />
  </div>
);

export default LoadingSpinner;

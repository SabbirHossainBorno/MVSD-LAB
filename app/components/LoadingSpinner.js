import React from 'react';
import Image from 'next/image';

const LoadingSpinner = () => (
  <div className="relative flex justify-center items-center min-h-screen">
    {/* Spinner */}
    <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-gradient-start border-transparent border-t-purple-500 border-b-purple-500"></div>
    
    {/* Image */}
    <Image 
      src="https://www.svgrepo.com/show/509001/avatar-thinking-9.svg" 
      alt="Thinking Avatar" 
      width={112} 
      height={112} 
      className="rounded-full" 
    />
  </div>
);

export default LoadingSpinner;

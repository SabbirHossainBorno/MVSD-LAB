import React, { useState } from "react";
import Link from "next/link";
import Image from 'next/image';

export default function HomeHero() {
  // State to control the overlay visibility
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const handleOverlayOpen = () => {
    setIsOverlayOpen(true);
  };

  const handleOverlayClose = () => {
    setIsOverlayOpen(false);
  };

  return (
    <section className="hero min-h-screen flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-8 lg:px-12 py-6 md:py-12 bg-[url('/images/hero-bg.png')] bg-cover bg-center relative overflow-hidden">
      <div className="container max-w-[1600px] mx-auto flex flex-col-reverse md:flex-row items-center justify-between">
        {/* Left Side */}
        <div className="flex-1 w-full md:w-1/2 text-center md:text-left relative p-6 md:p-8 lg:p-10">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-gray-900 leading-tight">
              Where <span className="text-blue-600">Automotive</span> Meets <span className="text-green-600">AI</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl mb-6 text-gray-700 leading-relaxed text-justify">
              <span className="font-semibold text-blue-500">MVSD Lab</span>, a leading research facility in Automotive Engineering. We specialize in Light and Heavy Ground Vehicles, Sports Vehicles, Drones, Artificial Intelligence, and Autonomous Driving Systems. Our innovations enhance vehicle performance, safety, and efficiency. From pioneering AI-driven automotive systems to advancing self-driving technology, we are committed to pushing the boundaries of mobility and technology. Join us as we explore new frontiers in the automotive industry.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center md:justify-start">
              <Link
                href="/learn-more"
                className="relative inline-flex items-center justify-center px-6 py-3 rounded text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-300 group"
              >
                <span className="absolute w-12 h-12 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-1000 -z-10"></span>
                <span className="relative font-semibold text-base">Learn More</span>
              </Link>
              <button
                onClick={handleOverlayOpen}
                className="relative inline-flex items-center justify-center px-6 py-3 rounded text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all duration-300 group"
              >
                <span className="absolute w-12 h-12 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-1000 -z-10"></span>
                <span className="relative font-semibold text-base">Watch Video</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 w-full md:w-1/2 flex justify-center items-center">
        <Image 
          src="/images/hero-img.png" // Correct image path
          alt="Hero Image" 
          width={1200} // Example width, adjust based on your layout
          height={800} // Example height, adjust based on aspect ratio
          className="w-full h-auto max-w-md sm:max-w-lg md:max-w-xl transform hover:scale-110 transition-transform duration-500" 
        />
        </div>
      </div>

      {/* Overlay for YouTube Video */}
      {isOverlayOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
          onClick={handleOverlayClose} // Close overlay when clicked outside
        >
          <div
            className="relative bg-black p-4 rounded shadow-lg w-full sm:w-4/5 lg:w-1/2"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the video player
          >
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700 p-2 rounded-full transition-all duration-300 flex items-center justify-center"
              onClick={handleOverlayClose}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>

            {/* YouTube Video Player */}
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/TUDiG7PcLBs?autoplay=1"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video"
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
}
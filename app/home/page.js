//app/home/page.js
'use client'; // Ensure this directive is at the top

import Navbar from '../components/Navbar'; // Adjust the path as needed
import Footer from '../components/Footer'; // Adjust the path as needed
import Link from 'next/link';

export default function Home() {
  // Set a fixed height for the navbar
  const navbarHeight = '60px'; // Change this to your actual navbar height

  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main style={{ paddingTop: navbarHeight }}> {/* Set padding-top directly */}
        {/* Hero Section */}
        <section className="hero h-screen flex flex-col md:flex-row items-center justify-center md:justify-between px-4 md:px-8 lg:px-12 py-6 md:py-12 bg-[url('/images/hero-bg.png')] bg-cover bg-center bg-blur-sm relative overflow-hidden">
          {/* Left Side */}
          <div className="flex-1 md:w-1/2 mb-6 md:mb-0 text-center md:text-left relative bg-gradient-to-br from-gray-50 to-gray-200 p-4 md:p-8 lg:p-12 overflow-hidden rounded-lg shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent opacity-80 rounded-lg"></div>
            <div className="relative z-10 p-4 md:p-8 lg:p-12">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
                AUTOMOTIVE MEETS AI
              </h1>
              <p className="text-sm md:text-base lg:text-lg mb-4 text-gray-700 leading-relaxed">
                MVSD Lab is a leader in Automotive Engineering, specializing in Light and Heavy Ground Vehicles, Sports Vehicles, Drones, AI, and Autonomous Driving Systems. We are dedicated to advancing vehicle performance, safety, and efficiency. Discover our innovations and join us in shaping the future of mobility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-left">
              <Link
                href="/learn-more"
                className="relative rounded px-5 py-2.5 overflow-hidden group bg-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-blue-400 transition-all ease-out duration-300"
              >
                <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                <span className="relative">Learn More</span>
              </Link>
              <Link
                href="/watch-video"
                className="relative rounded px-5 py-2.5 overflow-hidden group bg-green-500 hover:bg-gradient-to-r hover:from-green-500 hover:to-green-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-green-400 transition-all ease-out duration-300"
              >
                <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                <span className="relative">Watch Video</span>
              </Link>

              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex-1 md:w-1/2 flex justify-center items-center relative">
            <img
              src="/images/hero-img.png"
              alt="Hero Image"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl transform hover:scale-110 transition-transform duration-500"
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

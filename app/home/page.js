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

            <div className="relative z-10 px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16 bg-gradient-to-r from-blue-100 to-blue-200 shadow-xl rounded-lg">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-gray-900 text-center leading-tight">
                Where <span className="text-blue-600">Automotive</span> Meets <span className="text-green-600">AI</span>
              </h1>
              <p className="text-sm md:text-base lg:text-lg mb-6 text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
                At <span className="font-semibold">MVSD Lab</span>, we innovate in Automotive Engineering, from Light and Heavy Ground Vehicles to Sports Cars, Drones, and Autonomous Driving Systems. Join us as we redefine vehicle performance, safety, and efficiency, shaping the future of mobility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
                <Link
                  href="/learn-more"
                  className="relative inline-flex items-center justify-center px-6 py-2.5 rounded-full text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-300 group"
                >
                  <span className="absolute w-12 h-12 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-1000 -z-10"></span>
                  <span className="relative font-semibold text-base">Learn More</span>
                </Link>
                <Link
                  href="/watch-video"
                  className="relative inline-flex items-center justify-center px-6 py-2.5 rounded-full text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all duration-300 group"
                >
                  <span className="absolute w-12 h-12 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-1000 -z-10"></span>
                  <span className="relative font-semibold text-base">Watch Video</span>
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



        <section id="about" class="about py-16 bg-gray-100">
          {/* Section Title */}
          <div class="container mx-auto text-center mb-8">
            <h2 class="text-4xl font-bold text-gray-800 mb-4">About</h2>
            <p class="text-lg text-gray-600">Who We Are</p>
          </div>

          <div class="container mx-auto">
            <div class="flex flex-wrap items-center">
              {/* Right Side Content*/}
              <div class="w-full lg:w-1/2 flex flex-col justify-center p-6">
                <div class="content">
                  <h2 class="text-3xl font-semibold text-gray-800 mb-4">
                    MVSD Lab specializes in Automotive Engineering, focusing on Ground Vehicles, Sports Vehicles, Drones, AI,
                    and Autonomous Driving Systems.
                  </h2>
                  <p class="text-gray-600 text-lg mb-6">
                    Our lab enhances vehicle performance, safety, and efficiency. We pioneer AI-driven automotive systems and
                    advance self-driving technology, setting new industry standards. Join us as we push the boundaries of
                    mobility and technology.
                  </p>
                  <div class="text-center lg:text-left">
                    <a
                      href="#"
                      class="btn-read-more inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                      <span>Read More</span>
                      <i class="bi bi-arrow-right ml-2"></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Side IMG*/}
              <div class="w-full lg:w-1/2 flex justify-center items-center p-6">
                <img src="/images/about.jpg" alt="About Image" className="rounded-lg shadow-lg" />
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

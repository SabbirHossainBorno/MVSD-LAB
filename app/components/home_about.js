import React from "react";

export default function HomeAbout() {
  return (
    <section id="about" className="py-16 bg-gradient-to-r from-gray-100 to-gray-200">
          {/* Section Title */}
          <div className="container mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              About Us
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Who We Are and What We Do
            </p>
          </div>

          {/* Content Container */}
          <div className="container mx-auto flex flex-wrap lg:flex-nowrap items-center">
            {/* Left Side Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-6">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-6 leading-snug">
                Shaping the Future of Automotive Engineering
              </h2>
              <p className="text-gray-600 text-lg md:text-xl mb-6">
                MVSD Lab specializes in Light and Heavy Ground Vehicles, Sports Vehicles, Drones, AI, and Autonomous Driving Systems.
                We innovate vehicle performance, safety, and efficiency while leading advancements in self-driving technology and AI-driven mobility systems.
              </p>
              <div className="text-center lg:text-left">
                <a
                  href="#"
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold text-lg rounded shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
                >
                  <span>Read More</span>
                  <i className="bi bi-arrow-right ml-3 text-lg"></i>
                </a>
              </div>
            </div>

            {/* Right Side Image */}
            <div className="w-full lg:w-1/2 flex justify-center items-center p-6">
              <img
                src="/images/about.jpg"
                alt="About MVSD Lab"
                className="rounded-lg shadow-lg max-w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>
  );
}

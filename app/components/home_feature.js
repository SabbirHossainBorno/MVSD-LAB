import React from "react";

export default function HomeFeature() {
  return (
    <section className="py-16 bg-gradient-to-r from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center">
        {/* Left Side: Features List */}
        <div className="w-full md:w-1/2 px-6 md:px-12 lg:px-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6 animate-fadeIn">
            Discover Our Key Features
          </h2>
          <p className="text-lg text-gray-700 mb-10 animate-fadeIn delay-200">
            Explore the cutting-edge technology and services that set us apart.
            Our platform combines innovation and functionality for a seamless
            experience.
          </p>

          <ul className="space-y-6">
            {[
              "Automotive Engineering",
              "Light and Heavy Ground Vehicles",
              "Sports Vehicles",
              "Drones",
              "Artificial Intelligence",
              "Autonomous Driving Systems",
            ].map((feature, index) => (
              <li
                key={index}
                className={`flex items-center text-lg text-gray-800 animate-slideInLeft delay-${
                  index * 100
                }`}
              >
                <svg
                  className="w-6 h-6 text-blue-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Image */}
        <div className="w-full md:w-1/2 px-4 mt-8 md:mt-0 animate-fadeIn delay-500">
          <img
            src="/images/features.png" // Use the correct image path
            alt="Features"
            className="rounded-lg shadow-xl w-full h-auto object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
}

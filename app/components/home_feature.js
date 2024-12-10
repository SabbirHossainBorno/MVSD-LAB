import React, { useEffect, useState } from "react";

export default function HomeFeature() {
  return (
    <section className="py-16 bg-gradient-to-r from-white to-gray-100">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center">
        {/* Left Side: Features List */}
        <div className="w-full md:w-1/2 px-4">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6 animate-fadeIn">
            Our Amazing Features
          </h2>
          <p className="text-lg text-gray-700 mb-8 animate-fadeIn delay-200">
            Discover the incredible features that make our solution stand out.
            Experience seamless functionality with these top-tier features.
          </p>

          <ul className="space-y-6">
            <li className="flex items-center text-lg text-gray-800 animate-slideInLeft">
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
              Automotive Engineering
            </li>
            <li className="flex items-center text-lg text-gray-800 animate-slideInLeft delay-100">
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
              Light and Heavy Ground Vehicles
            </li>
            <li className="flex items-center text-lg text-gray-800 animate-slideInLeft delay-200">
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
              Sports Vehicles
            </li>
            <li className="flex items-center text-lg text-gray-800 animate-slideInLeft delay-300">
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
              Drones
            </li>
            <li className="flex items-center text-lg text-gray-800 animate-slideInLeft delay-400">
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
              Artificial Intelligence
            </li>
            <li className="flex items-center text-lg text-gray-800 animate-slideInLeft delay-500">
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
              Autonomous Driving Systems
            </li>
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
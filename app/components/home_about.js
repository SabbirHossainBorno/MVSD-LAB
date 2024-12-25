import React from "react";
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Image from 'next/image';

const images = [
  "/images/about_banner/about_banner (1).jpg",
  "/images/about_banner/about_banner (2).jpg",
  "/images/about_banner/about_banner (3).jpg",
  "/images/about_banner/about_banner (4).jpg",
  "/images/about_banner/about_banner (5).jpg",
  "/images/about_banner/about_banner (6).jpg",
  "/images/about_banner/about_banner (7).jpg",
  "/images/about_banner/about_banner (8).jpg",
  "/images/about_banner/about_banner (9).jpg",
  "/images/about_banner/about_banner (10).jpg",
  "/images/about_banner/about_banner (11).jpg",
  "/images/about_banner/about_banner (12).jpg",
];

export default function HomeAbout() {
  const settings = {
    dots: false, // Hide navigation dots
    arrows: false, // Hide navigation arrows
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    pauseOnHover: true,
  };

  return (
    <section id="about" className="py-16 bg-gradient-to-r from-gray-100 to-gray-200">
      <div className="container mx-auto text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          About Us
        </h2>
        <p className="text-lg md:text-xl text-gray-600">
          Who We Are and What We Do
        </p>
      </div>

      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center">
        <div className="w-full lg:w-1/2 p-6 flex justify-center lg:justify-end lg:pr-32">
          <div className="max-w-md">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-6 leading-snug">
              Shaping the Future of Automotive Engineering
            </h2>
            <p className="text-base md:text-lg lg:text-xl mb-6 text-gray-700 leading-relaxed text-justify">
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
        </div>

        <div className="w-full lg:w-1/2 p-6 flex justify-center lg:justify-start lg:pl-20">
          <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <Slider {...settings}>
              {images.map((src, index) => (
                <div key={index} className="flex justify-center">
                  <Image 
                    src={src} 
                    alt={`About MVSD Lab ${index + 1}`} 
                    width={500}  // You can adjust this based on your desired width
                    height={300} // Adjust this to maintain the correct aspect ratio
                    className="rounded-lg w-full h-auto object-cover" 
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </section>
  );
}
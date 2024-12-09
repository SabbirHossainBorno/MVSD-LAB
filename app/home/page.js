//app/home/page.js
'use client'; // Ensure this directive is at the top

import { useState } from 'react'; // Import useState from React
import Navbar from '../components/Navbar'; // Adjust the path as needed
import Footer from '../components/Footer'; // Adjust the path as needed
import Link from 'next/link';
import Image from 'next/image'; // Correct import statement


export default function Home() {
  // Set a fixed height for the navbar
  const navbarHeight = '60px'; // Change this to your actual navbar height

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "What is the primary focus of MVSD Lab?",
      answer:
        "Our primary focus is on Automotive Engineering, specializing in Light and Heavy Ground Vehicles, Sports Vehicles, Drones, Artificial Intelligence, and Autonomous Driving Systems. We aim to enhance vehicle performance, safety, and efficiency through innovative research and development.",
    },
    {
      question: "What types of vehicles does MVSD Lab work on?",
      answer:
        "MVSD Lab works on a variety of vehicles, including Light and Heavy Ground Vehicles, Sports Vehicles, and Drones. We apply advanced technologies and AI to improve these vehicles' capabilities.",
    },
    {
      question: "How does MVSD Lab contribute to the advancement of autonomous driving technology?",
      answer:
        "We pioneer AI-driven automotive systems and develop cutting-edge self-driving technologies. Our research aims to make autonomous driving safer, more reliable, and efficient, pushing the boundaries of what's possible in mobility.",
    },
    {
      question: "What role does artificial intelligence play in MVSD Lab's research?",
      answer:
        "Artificial Intelligence is central to our research, particularly in developing AI-driven automotive systems and autonomous driving technologies. We leverage AI to enhance vehicle performance, improve safety measures, and create more efficient transportation solutions.",
    },
    {
      question: "How does MVSD Lab ensure the safety of its innovations?",
      answer:
        "Safety is a top priority at MVSD Lab. Our innovations undergo rigorous testing and validation processes, combining theoretical analysis with experiments and simulations to ensure the highest safety and reliability standards.",
    },
    {
      question: "Can academic or industrial partners collaborate with MVSD Lab?",
      answer:
        "Yes, MVSD Lab actively collaborates with academic institutions and industrial partners. We believe that partnerships are crucial for advancing research and development, and we welcome opportunities to work with others in the automotive and technology sectors.",
    },
    {
      question: "What are some recent projects MVSD Lab has worked on?",
      answer:
        "Recent projects include developing AI-driven automotive systems, enhancing autonomous driving technologies, and improving the performance and efficiency of various ground and sports vehicles. We also work on integrating advanced AI and drone technologies.",
    },
    {
      question: "How does MVSD Lab stay ahead in automotive innovation?",
      answer:
        "We stay ahead by continually investing in research and development, collaborating with leading academic and industrial partners, and staying abreast of the latest technological advancements in AI, autonomous systems, and vehicle engineering.",
    },
    {
      question: "What is MVSD Lab's approach to sustainable automotive engineering?",
      answer:
        "MVSD Lab is committed to sustainability by developing efficient, environmentally-friendly technologies that reduce emissions and enhance fuel efficiency. Our research includes exploring alternative energy sources and optimizing vehicle designs for minimal environmental impact.",
    },
    {
      question: "How can I get involved with MVSD Lab's research?",
      answer:
        "You can get involved by reaching out to us for potential collaboration opportunities, internships, or research partnerships. We welcome inquiries from individuals and organizations interested in contributing to our innovative projects.",
    },
    {
      question: "What impact does MVSD Lab aim to have on the automotive industry?",
      answer:
        "MVSD Lab aims to revolutionize the automotive industry by introducing groundbreaking technologies that enhance vehicle performance, safety, and efficiency. Our innovations strive to set new standards in mobility and drive the future of transportation.",
    },
    {
      question: "How does MVSD Lab handle data and privacy concerns in its research?",
      answer:
        "We prioritize data security and privacy in all our research activities. Our protocols ensure that all data is handled responsibly and ethically, complying with relevant regulations and standards to protect the privacy of individuals and partners involved in our projects.",
    },
  ];

  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen">
      <Navbar />

        {/* ----------------------------------------------------MAIN-------------------------------------------------------------- */}
      <main style={{ paddingTop: navbarHeight }}> {/* Set padding-top directly */}


        {/* -----------------------------------------------HERO SECTION----------------------------------------------------------- */}
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


        {/* --------------------------------------------- ABOUT SECTION----------------------------------------------------------- */}
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
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold text-lg rounded-full shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
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


        {/* ------------------------------------------- LATEST RESEARCHES--------------------------------------------------------- */}
        <section className="flex flex-col justify-center max-w-6xl min-h-screen px-4 py-10 mx-auto sm:px-6">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between mb-10">
            <h2 className="text-4xl font-bold leading-tight text-gray-800 md:text-5xl">
            Latest Researches
            </h2>
            <a
              href="#"
              className="text-base font-bold text-blue-600 uppercase border-b-2 border-transparent hover:border-blue-600 mt-4 md:mt-0"
            >
              Go To Research Area →
            </a>
          </div>
          {/* Cards Container */}
          <div className="flex flex-wrap -mx-4">

    
        {/* Card 1 */}
        <div className="w-full px-4 mb-8 sm:w-1/2 lg:w-1/3">
          <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105">
            {/* Card Image */}
            <div className="relative">
              <img
                src="/images/research/research-1.jpg"
                alt="Card img"
                className="object-cover object-center w-full h-48"
              />
              <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-bold uppercase px-2 py-1 rounded-br-lg">
                New
              </div>
            </div>
            {/* Card Content */}
            <div className="flex flex-col justify-between flex-grow p-6 border-t">
              {/* Card Header */}
              <div>
                <a
                  href="#"
                  className="text-xs font-bold uppercase text-blue-600 hover:underline mb-2 inline-block"
                >
                  Reliable Schemas
                </a>
                <a
                  href="#"
                  className="block text-2xl font-bold leading-tight text-gray-800 hover:text-blue-600 hover:underline mb-4"
                >
                  What Zombies Can Teach You About Food
                </a>
                <p className="text-gray-600 text-sm">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla delectus corporis commodi aperiam cupiditate.
                </p>
              </div>
              {/* Read More Link */}
              <div className="mt-4 flex items-center justify-between">
                <a
                  href="#"
                  className="text-blue-600 text-base font-bold uppercase border-b-2 border-transparent hover:border-blue-600"
                >
                  Read More →
                </a>
                <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">
                  <i className="bi bi-bookmark"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="w-full px-4 mb-8 sm:w-1/2 lg:w-1/3">
          <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            {/* Card Image */}
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img
                src="/images/research/research-2.jpg"
                alt="Research Image"
                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            {/* Card Content */}
            <div className="flex flex-col justify-between flex-grow p-6">
              {/* Card Header */}
              <div>
                <a
                  href="#"
                  className="text-sm font-semibold uppercase text-blue-500 tracking-wide mb-2 inline-block hover:text-blue-600 transition-colors"
                >
                  Client-based Adoption
                </a>
                <a
                  href="#"
                  className="block text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors mb-4"
                >
                  Old School Art
                </a>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Discover the intersection of classic techniques and modern creativity in this thought-provoking exploration.
                </p>
              </div>
              
              {/* Read More Link */}
              <div className="mt-6">
                <a
                  href="#"
                  className="inline-flex items-center text-blue-500 font-medium hover:text-blue-600 transition-colors"
                >
                  Read More
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 ml-1"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5l6 6m0 0l-6 6m6-6H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>


        {/* Card 3 */}
        <div className="w-full px-4 mb-8 sm:w-1/2 lg:w-1/3">
          <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105">
            {/* Card Image */}
            <div className="relative">
              <img
                src="/images/research/research-3.jpg"
                alt="Card img"
                className="object-cover object-center w-full h-48 transition-transform duration-500 ease-in-out transform hover:scale-110"
              />
              <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-bold uppercase px-2 py-1 rounded-br-lg">
                Featured
              </div>
            </div>
            {/* Card Content */}
            <div className="flex flex-col justify-between flex-grow p-6 border-t">
              {/* Card Header */}
              <div>
                <a
                  href="#"
                  className="text-xs font-bold uppercase text-blue-600 hover:underline mb-2 inline-block"
                >
                  Intellectual Capital
                </a>
                <a
                  href="#"
                  className="block text-2xl font-bold leading-tight text-gray-800 hover:text-blue-600 hover:underline mb-4"
                >
                  5 Things To Do About Rain
                </a>
                <p className="text-gray-600 text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ratione neque eius ea possimus.
                </p>
              </div>
              {/* Read More Link */}
              <div className="mt-4 flex items-center justify-between">
                <a
                  href="#"
                  className="text-blue-600 text-base font-bold uppercase border-b-2 border-transparent hover:border-blue-600"
                >
                  Read More →
                </a>
                <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">
                  <i className="bi bi-bookmark"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        

        {/* Card 4 */}
        <div className="w-full px-4 mb-8 sm:w-1/2 lg:w-1/3">
          <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow hover:shadow-lg transition">
            {/* Card Image */}
            <img
              src="/images/research/research-4.jpg"
              alt="Card img"
              className="object-cover object-center w-full h-48"
            />
            {/* Card Content */}
            <div className="flex flex-col justify-between flex-grow p-6 border-t">
              {/* Card Header */}
              <div>
                <a
                  href="#"
                  className="text-xs font-bold uppercase text-blue-600 hover:underline mb-2 inline-block"
                >
                  Client-based Adoption
                </a>
                <a
                  href="#"
                  className="block text-2xl font-bold leading-tight text-gray-800 hover:text-blue-600 hover:underline mb-4"
                >
                  Old School Art
                </a>
                <p className="text-gray-600 text-sm">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla delectus.
                </p>
              </div>
              {/* Read More Link */}
              <div className="mt-4">
                <a
                  href="#"
                  className="text-blue-600 text-base font-bold uppercase border-b-2 border-transparent hover:border-blue-600"
                >
                  Read More →
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
        </section>


        {/* -------------------------------------------------FEATURES------------------------------------------------------------- */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center">
            {/* Left Side: Features List */}
            <div className="w-full md:w-1/2 px-4">
              <h2 className="text-5xl font-extrabold text-gray-900 mb-6 animate-fadeIn">Our Amazing Features</h2>
              <p className="text-lg text-gray-700 mb-8 animate-fadeIn delay-200">
                Discover the incredible features that make our solution stand out. Experience seamless functionality with these top-tier features.
              </p>

              <ul className="space-y-6">
                <li className="flex items-center text-lg text-gray-800 animate-slideInLeft">
                  <input type="checkbox" id="feature1" checked className="mr-3 scale-125 accent-blue-600" />
                  <label htmlFor="feature1">Automotive Engineering</label>
                </li>
                <li className="flex items-center text-lg text-gray-800 animate-slideInLeft delay-100">
                  <input type="checkbox" id="feature2" checked className="mr-3 scale-125 accent-blue-600" />
                  <label htmlFor="feature2">Light and Heavy Ground Vehicles</label>
                </li>
                <li className="flex items-center text-lg text-gray-800 animate-slideInLeft delay-200">
                  <input type="checkbox" id="feature3" checked className="mr-3 scale-125 accent-blue-600" />
                  <label htmlFor="feature3">Sports Vehicles</label>
                </li>
                <li className="flex items-center text-lg text-gray-800 animate-slideInLeft delay-300">
                  <input type="checkbox" id="feature4" checked className="mr-3 scale-125 accent-blue-600" />
                  <label htmlFor="feature4">Drones</label>
                </li>
                <li className="flex items-center text-lg text-gray-800 animate-slideInLeft delay-400">
                  <input type="checkbox" id="feature5" checked className="mr-3 scale-125 accent-blue-600" />
                  <label htmlFor="feature5">Artificial Intelligence</label>
                </li>
                <li className="flex items-center text-lg text-gray-800 animate-slideInLeft delay-500">
                  <input type="checkbox" id="feature6" checked className="mr-3 scale-125 accent-blue-600" />
                  <label htmlFor="feature6">Autonomous Driving Systems</label>
                </li>
              </ul>
            </div>

            {/* Right Side: Image */}
            <div className="w-full md:w-1/2 px-4 mt-8 md:mt-0 animate-fadeIn delay-500">
              <img
                src="/images/features.png" // Use the correct image path
                alt="Features"
                className="rounded-lg shadow-xl w-full h-auto object-cover transition-transform duration-500 ease-in-out transform hover:scale-110"
              />
            </div>
          </div>
        </section>

        {/* -------------------------------------------------STATE------------------------------------------------------------- */}
        <section
        id="stats"
        className="py-20 bg-gradient-to-br from-blue-100 via-white to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800">Our Achievements</h2>
            <p className="text-gray-600 mt-3 text-lg">
              A quick glance at what we've accomplished so far.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Stats Item */}
            <div
              className="stats-item flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-xl 
                transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div
                className="bg-orange-100 p-4 rounded-full mb-6"
              >
                <i className="bi bi-journal-richtext text-orange-500 text-5xl"></i>
              </div>
              <span className="text-4xl font-extrabold text-gray-800">232</span>
              <p className="text-gray-600 text-lg mt-2">Research Papers</p>
            </div>
            {/* Stats Item */}
            <div
              className="stats-item flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-xl 
                transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div
                className="bg-blue-100 p-4 rounded-full mb-6"
              >
                <i className="bi bi-people text-blue-500 text-5xl"></i>
              </div>
              <span className="text-4xl font-extrabold text-gray-800">521</span>
              <p className="text-gray-600 text-lg mt-2">Students</p>
            </div>
            {/* Stats Item */}
            <div
              className="stats-item flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-xl 
                transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div
                className="bg-green-100 p-4 rounded-full mb-6"
              >
                <i className="bi bi-person-badge text-green-500 text-5xl"></i>
              </div>
              <span className="text-4xl font-extrabold text-gray-800">14</span>
              <p className="text-gray-600 text-lg mt-2">Professors</p>
            </div>
            {/* Stats Item */}
            <div
              className="stats-item flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-xl 
                transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div
                className="bg-red-100 p-4 rounded-full mb-6"
              >
                <i className="bi bi-briefcase text-red-500 text-5xl"></i>
              </div>
              <span className="text-4xl font-extrabold text-gray-800">15</span>
              <p className="text-gray-600 text-lg mt-2">Projects</p>
            </div>
          </div>
        </div>
      </section>


        {/* ---------------------------------------------------FAQ------------------------------------------------------------- */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg border transition-all duration-300 ease-in-out 
                    ${activeIndex === index ? "bg-white border-blue-500 shadow-lg" : "bg-white border-gray-200 hover:shadow-md"} 
                  cursor-pointer`}
                  onClick={() => toggleAnswer(index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {index + 1}. {faq.question}
                    </h3>
                    <button
                      aria-label={activeIndex === index ? "Collapse Answer" : "Expand Answer"}
                      className={`transition-transform duration-300 transform ${
                        activeIndex === index ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-blue-500"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {activeIndex === index && (
                    <p className="text-gray-700 mt-4 leading-relaxed">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>



      </main>
      <Footer />
    </div>
  );
}
  
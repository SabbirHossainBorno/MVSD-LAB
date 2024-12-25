import React, { useState, useEffect } from "react";
import Image from 'next/image';

const clients = [
  "/images/clients/client-1.png",
  "/images/clients/client-2.png",
  "/images/clients/client-3.png",
  "/images/clients/client-4.png",
  "/images/clients/client-5.png",
  "/images/clients/client-6.png",
  "/images/clients/client-7.png",
  "/images/clients/client-8.png",
];

export default function HomeClients() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getDisplayedClients = (index) => {
    const totalClients = clients.length;
    return [
      clients[(index - 2 + totalClients) % totalClients],
      clients[(index - 1 + totalClients) % totalClients],
      clients[index],
      clients[(index + 1) % totalClients],
      clients[(index + 2) % totalClients],
    ];
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % clients.length);
    }, 3000); // 3 seconds per slide

    return () => clearInterval(timer);
  }, []);

  const displayedClients = getDisplayedClients(currentIndex);

  return (
    <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Our Esteemed Clients
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            We are proud to have worked with these amazing clients.
          </p>
        </div>

        {/* Client Carousel */}
        <div className="relative">
          <div className="flex items-center justify-center space-x-6">
            {displayedClients.map((client, index) => {
              const isCurrent = index === 2; // Middle index is the current client
              const sizeClass = isCurrent
                ? "h-24 sm:h-28 md:h-32"
                : "h-16 sm:h-20 md:h-24";
              const opacity = isCurrent ? "opacity-100 z-10" : "opacity-50";

              return (
                <div
                  key={index}
                  className={`transition-all duration-700 ease-in-out transform ${opacity}`}
                >
                  <Image 
                    src={client} 
                    alt={`Client ${index}`} 
                    width={200} // Adjust the width based on your design
                    height={100} // Adjust the height to maintain aspect ratio
                    className={`object-contain ${sizeClass}`} 
                  />
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 space-x-3">
            {clients.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-4 w-4 rounded-full transition-colors duration-300 focus:outline-none ${
                  index === currentIndex
                    ? "bg-blue-600"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
import React, { useState, useEffect } from "react";

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === clients.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // 3 seconds per slide

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            We Work with the Best Clients
          </h2>
          <p className="text-gray-600 mt-4 text-base sm:text-lg">
            Here are some of the amazing clients we have worked with.
          </p>
        </div>

        {/* Client Carousel */}
        <div className="relative">
          <div className="flex items-center justify-center h-24 sm:h-32">
            {clients.map((client, index) => (
              <div
                key={index}
                className={`absolute transition-opacity duration-700 ease-in-out transform ${
                  index === currentIndex
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-75"
                }`}
              >
                <img
                  src={client}
                  alt={`Client ${index + 1}`}
                  className="h-16 sm:h-20 md:h-24"
                />
              </div>
            ))}
            {/* Previous Client */}
            {clients[currentIndex - 1] && (
              <div className="absolute left-0 transform -translate-x-1/4 scale-50 opacity-50 z-0">
                <img
                  src={clients[currentIndex - 1]}
                  alt={`Client ${currentIndex}`}
                  className="h-12 sm:h-16 md:h-20"
                />
              </div>
            )}
            {/* Next Client */}
            {clients[currentIndex + 1] && (
              <div className="absolute right-0 transform translate-x-1/4 scale-50 opacity-50 z-0">
                <img
                  src={clients[currentIndex + 1]}
                  alt={`Client ${currentIndex + 2}`}
                  className="h-12 sm:h-16 md:h-20"
                />
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2 sm:space-x-4">
            {clients.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 w-3 sm:h-4 sm:w-4 rounded-full transition-colors duration-300 focus:outline-none ${
                  index === currentIndex
                    ? "bg-blue-500"
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

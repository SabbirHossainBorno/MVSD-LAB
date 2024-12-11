import React, { useState, useEffect } from "react";

const testimonials = [
  {
    quote:
      "This platform has significantly enhanced my learning experience. The resources are incredible!",
    name: "Jane Doe",
    role: "Student",
    image: "/images/testimonials/testimonials-1.jpg",
  },
  {
    quote:
      "Collaborating with such a talented team has been a privilege. The environment is highly professional.",
    name: "John Smith",
    role: "Professor",
    image: "/images/testimonials/testimonials-2.jpg",
  },
  {
    quote:
      "Our projects have received immense support and exposure, leading to remarkable achievements.",
    name: "Emily Johnson",
    role: "Researcher",
    image: "/images/testimonials/testimonials-3.jpg",
  },
  {
    quote:
      "I am impressed by the level of dedication and resources provided. It’s a game changer.",
    name: "Michael Brown",
    role: "Lecturer",
    image: "/images/testimonials/testimonials-4.jpg",
  },
  {
    quote:
      "The collaborative environment fosters innovation and growth. Truly remarkable!",
    name: "Sarah Wilson",
    role: "Scientist",
    image: "/images/testimonials/testimonials-5.jpg",
  },
];

export default function HomeTestimonial() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5 seconds per slide

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            What They Are Saying About Us
          </h2>
          <p className="text-gray-600 mt-4 text-base sm:text-lg">
            Hear from our students, professors, and researchers.
          </p>
        </div>

        {/* Testimonial Slider */}
        <div className="relative">
          <div className="flex items-center justify-center h-64 sm:h-80">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute transition-opacity duration-700 ease-in-out transform ${
                  index === currentIndex
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-95"
                }`}
              >
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 border-2 border-blue-500"
                  />
                  <p className="text-sm sm:text-base italic text-gray-700 mb-4">
                  &quot;{testimonial.quote}&quot;
                  </p>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800">
                    {testimonial.name}
                  </h4>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {testimonial.role}
                  </span>
                </div>
              </div>
            ))}
            {/* Previous Card */}
            {testimonials[currentIndex - 1] && (
              <div className="absolute left-0 transform -translate-x-1/4 scale-75 opacity-50 z-0 hidden sm:block">
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
                  <img
                    src={testimonials[currentIndex - 1].image}
                    alt={testimonials[currentIndex - 1].name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-4 border-2 border-blue-500"
                  />
                  <p className="text-xs sm:text-sm italic text-gray-700 mb-4">
                  &quot;{testimonials[currentIndex - 1].quote}&quot;
                  </p>
                  <h4 className="text-base sm:text-lg font-bold text-gray-800">
                    {testimonials[currentIndex - 1].name}
                  </h4>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {testimonials[currentIndex - 1].role}
                  </span>
                </div>
              </div>
            )}
            {/* Next Card */}
            {testimonials[currentIndex + 1] && (
              <div className="absolute right-0 transform translate-x-1/4 scale-75 opacity-50 z-0 hidden sm:block">
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
                  <img
                    src={testimonials[currentIndex + 1].image}
                    alt={testimonials[currentIndex + 1].name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-4 border-2 border-blue-500"
                  />
                  <p className="text-xs sm:text-sm italic text-gray-700 mb-4">
                  &quot;{testimonials[currentIndex + 1].quote}&quot;
                  </p>
                  <h4 className="text-base sm:text-lg font-bold text-gray-800">
                    {testimonials[currentIndex + 1].name}
                  </h4>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {testimonials[currentIndex + 1].role}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2 sm:space-x-4">
            {testimonials.map((_, index) => (
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
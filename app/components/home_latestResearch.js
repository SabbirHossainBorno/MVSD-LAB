import React from "react";
import Image from 'next/image';

// Card Component
function Card({ imageSrc, label, title, description, link, isNew }) {
  return (
    <div className="w-full px-4 mb-8 sm:w-1/2 lg:w-1/3">
      <div className="flex flex-col h-full overflow-hidden bg-white rounded shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105">
        {/* Card Image */}
        <div className="relative">
        <Image 
          src={imageSrc} // dynamic source for the image
          alt={title} // dynamic alt text
          width={800} // Adjust width as needed
          height={300} // Adjust height to maintain aspect ratio
          className="object-cover object-center w-full h-48" 
        />
          {isNew && (
            <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-bold uppercase px-2 py-1 rounded-br-lg">
              New
            </div>
          )}
        </div>
        {/* Card Content */}
        <div className="flex flex-col justify-between flex-grow p-6 border-t">
          {/* Card Header */}
          <div>
            <a
              href={link}
              className="text-xs font-bold uppercase text-blue-600 hover:underline mb-2 inline-block"
            >
              {label}
            </a>
            <a
              href={link}
              className="block text-2xl font-bold leading-tight text-gray-800 hover:text-blue-600 hover:underline mb-4"
            >
              {title}
            </a>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
          {/* Read More Link */}
          <div className="mt-4 flex items-center justify-between">
            <a
              href={link}
              className="text-blue-600 text-base font-bold uppercase border-b-2 border-transparent hover:border-blue-600"
            >
              Read More →
            </a>
            <button
              aria-label="Bookmark"
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              <i className="bi bi-bookmark"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function HomeLatestResearch() {
  const researchData = [
    {
      imageSrc: "/images/research/research-1.jpg",
      label: "Reliable Schemas",
      title: "What Zombies Can Teach You About Food",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla delectus corporis commodi aperiam cupiditate.",
      link: "#",
      isNew: true,
    },
    {
      imageSrc: "/images/research/research-2.jpg",
      label: "Innovative Solutions",
      title: "Exploring AI in the World of Automotive",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla delectus corporis commodi aperiam cupiditate.",
      link: "#",
      isNew: true,
    },
    {
      imageSrc: "/images/research/research-3.jpg",
      label: "Emerging Technologies",
      title: "The Future of Robotics in Daily Life",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla delectus corporis commodi aperiam cupiditate.",
      link: "#",
      isNew: true,
    },
    {
      imageSrc: "/images/research/research-4.jpg",
      label: "Tech Advancements",
      title: "How Virtual Reality is Shaping the Future",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla delectus corporis commodi aperiam cupiditate.",
      link: "#",
      isNew: true,
    },
  ];

  return (
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
        {researchData.map((research, index) => (
          <Card key={index} {...research} />
        ))}
      </div>
    </section>
  );
}

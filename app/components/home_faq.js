import React, { useState } from "react";

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

export default function HomeFAQ() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [showMore, setShowMore] = useState(false);

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {/* Show the first 5 FAQ questions */}
          {faqData.slice(0, 5).map((faq, index) => (
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

          {/* Show the rest of the FAQ questions when "Show More" is clicked */}
          {showMore &&
            faqData.slice(5).map((faq, index) => (
              <div
                key={index + 5} // Adjust the key to avoid collision
                className={`p-6 rounded-lg border transition-all duration-300 ease-in-out 
                  ${activeIndex === index + 5 ? "bg-white border-blue-500 shadow-lg" : "bg-white border-gray-200 hover:shadow-md"} 
                cursor-pointer`}
                onClick={() => toggleAnswer(index + 5)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {index + 6}. {faq.question}
                  </h3>
                  <button
                    aria-label={activeIndex === index + 5 ? "Collapse Answer" : "Expand Answer"}
                    className={`transition-transform duration-300 transform ${
                      activeIndex === index + 5 ? "rotate-180" : "rotate-0"
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
                {activeIndex === index + 5 && (
                  <p className="text-gray-700 mt-4 leading-relaxed">{faq.answer}</p>
                )}
              </div>
            ))}
        </div>

        {/* Show More/Hide Button */}
        <div className="text-center mt-8">
          <button
            onClick={toggleShowMore}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {showMore ? "Hide More FAQs" : "Show More FAQs"}
          </button>
        </div>
      </div>
    </section>
  );
}

import React, { useEffect, useState } from "react";

export default function HomeStats() {
  const [professorCount, setProfessorCount] = useState(null);
  const statsData = [
    { value: 232, label: "Research Papers", image: "/images/stats/research-paper.png" },
    { value: 521, label: "Students", image: "/images/stats/students.png" },
    { value: professorCount, label: "Professors", image: "/images/stats/professors.png" }, // Dynamic value
    { value: 14, label: "Thesis", image: "/images/stats/thesis.png" },
    { value: 14, label: "Journal", image: "/images/stats/journal.png" },
    { value: 15, label: "Projects", image: "/images/stats/projects.png" },
  ];

  // Fetch stats data from the home_stats API
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const response = await fetch("/api/home_stats");
        const data = await response.json();
        
        // Set the professor count dynamically from the API response
        setProfessorCount(data.professorCount);
      } catch (error) {
        console.error("Error fetching stats data:", error);
      }
    };

    fetchStatsData();
  }, []); // Empty dependency array ensures it runs once on mount

  return (
    <section id="stats" className="py-16 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold text-gray-800 mb-4">Our Achievements</h2>
          <p className="text-gray-600 text-lg">A quick glance at what we&apos;ve accomplished so far.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center text-center bg-white p-6 rounded shadow-xl transition-transform transform hover:scale-105 hover:shadow-2xl duration-300 ease-in-out"
            >
              <div className="w-20 h-20 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <img src={stat.image} alt={stat.label} className="w-12 h-12 object-contain" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
              <p className="text-gray-600 mt-2 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

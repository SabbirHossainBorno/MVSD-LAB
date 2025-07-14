//app/home/course/page.js
'use client';
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ScrollToTop from '../../components/ScrollToTop';
import Link from 'next/link';
import LoadingSpinner from '../../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { FaBook, FaGraduationCap, FaChalkboardTeacher, FaCalendarAlt, FaClock, FaUsers } from 'react-icons/fa';

export default function CoursePage() {
  const [activeTab, setActiveTab] = useState('undergraduate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced dummy course data
  const undergraduateCourses = [
    {
      id: 1,
      code: "CS101",
      title: "Introduction to Computer Science",
      semester: "Fall 2024",
      description: "Fundamental concepts of computer science, programming paradigms, and problem-solving techniques",
      instructor: "Dr. Sarah Johnson",
      credits: 4,
      duration: "14 weeks",
      schedule: "Mon/Wed 9:00-10:30 AM",
      level: "Beginner",
      prerequisites: "None",
      enrollment: 120
    },
    {
      id: 2,
      code: "CS201",
      title: "Data Structures and Algorithms",
      semester: "Spring 2025",
      description: "Study of fundamental data structures and algorithm design with complexity analysis",
      instructor: "Prof. Michael Chen",
      credits: 4,
      duration: "15 weeks",
      schedule: "Tue/Thu 1:00-2:30 PM",
      level: "Intermediate",
      prerequisites: "CS101",
      enrollment: 95
    },
    {
      id: 3,
      code: "CS301",
      title: "Database Systems",
      semester: "Fall 2024",
      description: "Design and implementation of relational database systems and SQL programming",
      instructor: "Dr. Emily Rodriguez",
      credits: 3,
      duration: "14 weeks",
      schedule: "Mon/Wed/Fri 11:00-12:00 PM",
      level: "Intermediate",
      prerequisites: "CS201",
      enrollment: 85
    },
    {
      id: 4,
      code: "CS401",
      title: "Operating Systems",
      semester: "Spring 2025",
      description: "Principles and design of operating systems including processes, memory management, and file systems",
      instructor: "Prof. James Wilson",
      credits: 4,
      duration: "15 weeks",
      schedule: "Tue/Thu 10:00-11:30 AM",
      level: "Advanced",
      prerequisites: "CS201, CS301",
      enrollment: 75
    },
    {
      id: 5,
      code: "CS501",
      title: "Computer Networks",
      semester: "Fall 2024",
      description: "Fundamentals of computer networking, protocols, and network security principles",
      instructor: "Dr. Patricia Brown",
      credits: 3,
      duration: "14 weeks",
      schedule: "Wed/Fri 2:00-3:30 PM",
      level: "Advanced",
      prerequisites: "CS401",
      enrollment: 70
    },
    {
      id: 6,
      code: "CS601",
      title: "Software Engineering",
      semester: "Spring 2025",
      description: "Principles and practices of software development methodologies and project management",
      instructor: "Prof. Robert Davis",
      credits: 4,
      duration: "15 weeks",
      schedule: "Mon/Thu 3:00-4:30 PM",
      level: "Advanced",
      prerequisites: "CS401",
      enrollment: 80
    },
    {
      id: 7,
      code: "CS321",
      title: "Artificial Intelligence Fundamentals",
      semester: "Fall 2024",
      description: "Introduction to AI concepts including search algorithms, knowledge representation, and machine learning basics",
      instructor: "Dr. Alan Turing",
      credits: 4,
      duration: "14 weeks",
      schedule: "Tue/Fri 9:00-10:30 AM",
      level: "Intermediate",
      prerequisites: "CS201",
      enrollment: 110
    },
    {
      id: 8,
      code: "CS421",
      title: "Human-Computer Interaction",
      semester: "Spring 2025",
      description: "Design principles for creating intuitive user interfaces and evaluating user experience",
      instructor: "Dr. Grace Hopper",
      credits: 3,
      duration: "15 weeks",
      schedule: "Mon/Wed 1:00-2:30 PM",
      level: "Intermediate",
      prerequisites: "CS301",
      enrollment: 65
    }
  ];

  const graduateCourses = [
    {
      id: 1,
      code: "CS701",
      title: "Advanced Algorithms",
      semester: "Fall 2024",
      description: "Advanced topics in algorithm design, analysis, and computational complexity theory",
      instructor: "Dr. Thomas Anderson",
      credits: 4,
      duration: "14 weeks",
      schedule: "Mon 6:00-9:00 PM",
      level: "Graduate",
      prerequisites: "Graduate standing",
      enrollment: 40
    },
    {
      id: 2,
      code: "CS702",
      title: "Machine Learning",
      semester: "Spring 2025",
      description: "Fundamentals of machine learning, pattern recognition, and neural networks",
      instructor: "Dr. Lisa Zhang",
      credits: 4,
      duration: "15 weeks",
      schedule: "Tue 6:00-9:00 PM",
      level: "Graduate",
      prerequisites: "CS701",
      enrollment: 45
    },
    {
      id: 3,
      code: "CS703",
      title: "Cloud Computing",
      semester: "Fall 2024",
      description: "Design and implementation of scalable cloud-based systems and distributed computing",
      instructor: "Prof. David Miller",
      credits: 3,
      duration: "14 weeks",
      schedule: "Wed 6:00-9:00 PM",
      level: "Graduate",
      prerequisites: "CS701",
      enrollment: 35
    },
    {
      id: 4,
      code: "CS704",
      title: "Computer Vision",
      semester: "Spring 2025",
      description: "Techniques for image processing, object recognition, and 3D reconstruction",
      instructor: "Dr. Rachel Green",
      credits: 4,
      duration: "15 weeks",
      schedule: "Thu 6:00-9:00 PM",
      level: "Graduate",
      prerequisites: "CS702",
      enrollment: 30
    },
    {
      id: 5,
      code: "CS705",
      title: "Natural Language Processing",
      semester: "Fall 2024",
      description: "Computational approaches to language understanding, sentiment analysis, and machine translation",
      instructor: "Prof. Kevin Lee",
      credits: 4,
      duration: "14 weeks",
      schedule: "Mon/Wed 4:00-5:30 PM",
      level: "Graduate",
      prerequisites: "CS702",
      enrollment: 38
    },
    {
      id: 6,
      code: "CS706",
      title: "Blockchain Technology",
      semester: "Spring 2025",
      description: "Fundamentals of blockchain, smart contracts, and decentralized applications",
      instructor: "Dr. Amanda Clark",
      credits: 3,
      duration: "15 weeks",
      schedule: "Tue/Thu 4:00-5:30 PM",
      level: "Graduate",
      prerequisites: "CS701",
      enrollment: 42
    },
    {
      id: 7,
      code: "CS721",
      title: "Deep Learning Architectures",
      semester: "Fall 2024",
      description: "Advanced neural network architectures including CNNs, RNNs, and transformers",
      instructor: "Dr. Geoffrey Hinton",
      credits: 4,
      duration: "14 weeks",
      schedule: "Thu 6:00-9:00 PM",
      level: "Graduate",
      prerequisites: "CS702",
      enrollment: 32
    },
    {
      id: 8,
      code: "CS722",
      title: "Quantum Computing",
      semester: "Spring 2025",
      description: "Principles of quantum computation and quantum algorithm design",
      instructor: "Dr. Peter Shor",
      credits: 4,
      duration: "15 weeks",
      schedule: "Fri 1:00-4:00 PM",
      level: "Graduate",
      prerequisites: "CS701, Linear Algebra",
      enrollment: 28
    }
  ];

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-white text-gray-900 min-h-screen">
        <Navbar />
        <main className="container mx-auto py-12 px-4 max-w-4xl text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded shadow-md">
            <h2 className="text-2xl font-bold mb-4">Error Loading Courses</h2>
            <p className="mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-colors shadow-md"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentCourses = activeTab === 'undergraduate' ? undergraduateCourses : graduateCourses;

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navbar />
      <main>
        <section className="relative flex items-center justify-center h-[35vh] md:h-[45vh] bg-cover bg-center">
          <div
            className="absolute inset-0 bg-[url('/images/hero-bg3.png')] bg-cover bg-center"
            style={{ opacity: 0.5 }}
          ></div>
          <div className="relative z-10 text-center p-6 md:p-8 max-w-4xl mx-auto mt-8 md:mt-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 mt-10 leading-tight"
              >
              MVSD LAB Courses
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg lg:text-xl text-gray-800 mb-4"
              >
              Explore our comprehensive curriculum for undergraduate and graduate students
            </motion.p>
            <motion.div
              className="mt-8 flex justify-center w-full px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.8, ease: [0.77, 0, 0.175, 1] }}
            >
              <div className="inline-flex bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg p-1.5 rounded-full shadow-xl border border-white/20 max-w-full">
                <motion.button
                  onClick={() => setActiveTab('undergraduate')}
                  className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-700 ${
                    activeTab === 'undergraduate'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-transparent text-gray-100 opacity-90 hover:opacity-100 hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.05, transition: { duration: 0.6, ease: [0.77, 0, 0.175, 1] } }}
                  whileTap={{ scale: 0.95, transition: { duration: 0.4 } }}
                >
                  Undergraduate
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab('graduate')}
                  className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-700 ${
                    activeTab === 'graduate'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-transparent text-gray-100 opacity-90 hover:opacity-100 hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.05, transition: { duration: 0.6, ease: [0.77, 0, 0.175, 1] } }}
                  whileTap={{ scale: 0.95, transition: { duration: 0.4 } }}
                >
                  Graduate
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 py-4">
          <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <nav className="text-sm md:text-base font-medium text-gray-800 mb-2 md:mb-0">
              <ol className="list-reset flex items-center space-x-2">
                <li>
                  <Link href="/home" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">Home</Link>
                </li>
                <li>/</li>
                <li className="text-gray-800 font-medium">Course</li>
              </ol>
            </nav>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-blue-50/20 via-teal-50/20 to-blue-50/20">
          <div className="container mx-auto max-w-7xl px-4">
            <motion.div 
              className="bg-white/70 backdrop-blur-2xl rounded shadow-2xl p-6 md:p-8 border border-white/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Header with consistent spacing */}
              <div className="text-center mb-12">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <span className="bg-gradient-to-r from-blue-600 to-teal-500 text-transparent bg-clip-text">
                    Academic Curriculum
                  </span>
                </motion.h2>
                <motion.p 
                  className="text-gray-700 max-w-2xl mx-auto text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {activeTab === 'undergraduate' 
                    ? "Undergraduate courses preparing students for industry and research" 
                    : "Graduate-level courses for advanced specialization and research"}
                </motion.p>
              </div>

              {/* Responsive grid with consistent header heights */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {currentCourses.map((course) => (
                  <motion.div 
                    key={course.id}
                    variants={item}
                    className="bg-white/80 backdrop-blur-lg rounded overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group border border-white/60"
                    whileHover={{ y: -5 }}
                  >
                    {/* Course header with fixed height */}
                    <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded shadow-lg min-h-[140px] relative flex flex-col justify-between transition-transform hover:scale-105">
                      <div className="flex items-center">
                        <div className="mr-4 bg-white/20 backdrop-blur-sm p-3 rounded flex-shrink-0">
                          <FaBook className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white line-clamp-2">
                            {course.title}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                          {course.credits} credits
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                          {course.code}
                        </span>
                        <span className="bg-black/10 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                          {course.semester}
                        </span>
                      </div>
                    </div>
                    
                    {/* Course content with consistent spacing */}
                    <div className="p-6">
                      <p className="text-gray-700 mb-6 min-h-[90px]">{course.description}</p>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded mr-3 flex-shrink-0">
                            <FaChalkboardTeacher className="text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Instructor</p>
                            <p className="text-sm font-medium truncate">{course.instructor}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-teal-100 p-2 rounded mr-3 flex-shrink-0">
                            <FaCalendarAlt className="text-teal-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Schedule</p>
                            <p className="text-sm font-medium">{course.schedule}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-purple-100 p-2 rounded mr-3 flex-shrink-0">
                            <FaClock className="text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="text-sm font-medium">{course.duration}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-amber-100 p-2 rounded mr-3 flex-shrink-0">
                            <FaUsers className="text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Enrollment</p>
                            <p className="text-sm font-medium">{course.enrollment} students</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-5 border-t border-gray-200/50">
                        <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center sm:justify-start text-sm">
                          View Syllabus
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-4 py-2 rounded text-sm font-medium transition-all shadow-md hover:shadow-lg whitespace-nowrap">
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Empty state with enhanced glass effect */}
              {currentCourses.length === 0 && (
                <motion.div 
                  className="text-center py-16 border border-gray-200/30 rounded bg-white/80 backdrop-blur-xl mt-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="max-w-md mx-auto px-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-100/50 to-teal-100/50 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                      <FaGraduationCap className="h-12 w-12 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">No Courses Available</h3>
                    <p className="text-gray-600 mb-6">
                      {activeTab === 'undergraduate' 
                        ? "Currently no undergraduate courses listed for this semester" 
                        : "Currently no graduate courses listed for this semester"}
                    </p>
                    <button 
                      onClick={() => setActiveTab(activeTab === 'undergraduate' ? 'graduate' : 'undergraduate')}
                      className="inline-flex items-center bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl"
                    >
                      Browse {activeTab === 'undergraduate' ? 'Graduate' : 'Undergraduate'} Courses
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Stats Section with glass design */}
              <motion.div 
                className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {[
                  { 
                    title: "Total Courses", 
                    value: undergraduateCourses.length + graduateCourses.length,
                    color: "blue",
                    gradient: "from-blue-400 to-teal-400"
                  },
                  { 
                    title: "Undergrad Students", 
                    value: undergraduateCourses.reduce((sum, course) => sum + course.enrollment, 0),
                    color: "teal",
                    gradient: "from-teal-400 to-green-400"
                  },
                  { 
                    title: "Grad Students", 
                    value: graduateCourses.reduce((sum, course) => sum + course.enrollment, 0),
                    color: "purple",
                    gradient: "from-purple-400 to-pink-400"
                  },
                  { 
                    title: "Faculty Members", 
                    value: undergraduateCourses.length + graduateCourses.length,
                    color: "amber",
                    gradient: "from-amber-400 to-orange-400"
                  }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-white/80 backdrop-blur-lg rounded p-6 text-center border border-white/60 shadow-lg"
                  >
                    <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
                    <div className="text-gray-700 font-medium mb-4">{stat.title}</div>
                    <div className={`h-1.5 bg-gradient-to-r ${stat.gradient} rounded-full`}></div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <ScrollToTop />
      <Footer />
    </div>
  );
}
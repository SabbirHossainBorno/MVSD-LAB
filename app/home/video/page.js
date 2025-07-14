//app/home/video/page.js
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ScrollToTop from '../../components/ScrollToTop';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaSearch, FaClock, FaGraduationCap, FaCalendarAlt, FaTimes, FaList } from 'react-icons/fa';

export default function VideoLibrary() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [videoList, setVideoList] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const videoRef = useRef(null);

  // Video categories
  const categories = [
    { id: 'all', name: 'All Videos' },
    { id: 'lectures', name: 'Lecture Recordings' },
    { id: 'tutorials', name: 'Tutorials' },
    { id: 'projects', name: 'Project Walkthroughs' },
    { id: 'research', name: 'Research Talks' },
    { id: 'interviews', name: 'Expert Interviews' },
  ];

  // Fixed date formatting function
  const formatDate = (dateString) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = new Date(dateString);
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Simulate data loading
  useEffect(() => {
    const loadVideos = () => {
      const videos = [
        {
          id: 1,
          title: "Introduction to Automotive Car",
          category: "lectures",
          instructor: "Dr. Lisa Zhang",
          duration: "48:22",
          date: "2024-05-15",
          views: 1240,
          thumbnail: "/Storage/Course/CRS01MVSD/CRS01MVSD_THUMB.jpg",
          videoUrl: "/Storage/Course/CRS01MVSD/playlist/CRS01MVSDV1.mp4",
          playlistCode: "CRS01MVSD",
          description: "Fundamental concepts of machine learning, including supervised and unsupervised learning approaches"
        },
        {
          id: 2,
          title: "Python Data Analysis Tutorial",
          category: "tutorials",
          instructor: "Prof. Michael Chen",
          duration: "32:15",
          date: "2024-04-28",
          views: 2870,
          thumbnail: "/images/python-thumb.jpg",
          videoUrl: "/Storage/Course/CRS02DATA/playlist/CRS02DATAV1.mp4",
          playlistCode: "CRS02DATA",
          description: "Hands-on tutorial for data analysis using Pandas and NumPy libraries in Python"
        },
        {
          id: 3,
          title: "Neural Network Architectures",
          category: "lectures",
          instructor: "Dr. Geoffrey Hinton",
          duration: "56:42",
          date: "2024-06-02",
          views: 980,
          thumbnail: "/images/nn-thumb.jpg",
          videoUrl: "/Storage/Course/CRS03NN/playlist/CRS03NNV1.mp4",
          playlistCode: "CRS03NN",
          description: "Deep dive into various neural network architectures including CNNs, RNNs and transformers"
        },
        {
          id: 4,
          title: "Building a Blockchain from Scratch",
          category: "projects",
          instructor: "Dr. Amanda Clark",
          duration: "41:30",
          date: "2024-03-17",
          views: 3560,
          thumbnail: "/images/blockchain-thumb.jpg",
          videoUrl: "/Storage/Course/CRS04BLOCK/playlist/CRS04BLOCKV1.mp4",
          playlistCode: "CRS04BLOCK",
          description: "Step-by-step guide to implementing a basic blockchain in JavaScript"
        },
        {
          id: 5,
          title: "The Future of Quantum Computing",
          category: "research",
          instructor: "Dr. Peter Shor",
          duration: "38:50",
          date: "2024-05-30",
          views: 1750,
          thumbnail: "/images/quantum-thumb.jpg",
          videoUrl: "/Storage/Course/CRS05QUANT/playlist/CRS05QUANTV1.mp4",
          playlistCode: "CRS05QUANT",
          description: "Research presentation on recent advances and future prospects of quantum computing"
        },
        {
          id: 6,
          title: "Interview with AI Ethics Expert",
          category: "interviews",
          instructor: "Dr. Sarah Johnson",
          duration: "52:18",
          date: "2024-04-10",
          views: 2100,
          thumbnail: "/images/ethics-thumb.jpg",
          videoUrl: "/Storage/Course/CRS06ETHICS/playlist/CRS06ETHICSV1.mp4",
          playlistCode: "CRS06ETHICS",
          description: "Discussion on ethical considerations in artificial intelligence development"
        },
        {
          id: 7,
          title: "Advanced React Patterns",
          category: "tutorials",
          instructor: "Prof. Emily Rodriguez",
          duration: "45:22",
          date: "2024-06-12",
          views: 1420,
          thumbnail: "/images/react-thumb.jpg",
          videoUrl: "/Storage/Course/CRS07REACT/playlist/CRS07REACTV1.mp4",
          playlistCode: "CRS07REACT",
          description: "Practical guide to advanced React patterns and performance optimization"
        },
        {
          id: 8,
          title: "Cloud Deployment Strategies",
          category: "projects",
          instructor: "Prof. David Miller",
          duration: "36:45",
          date: "2024-05-05",
          views: 1890,
          thumbnail: "/images/cloud-thumb.jpg",
          videoUrl: "/Storage/Course/CRS08CLOUD/playlist/CRS08CLOUDV1.mp4",
          playlistCode: "CRS08CLOUD",
          description: "Comparing different cloud deployment strategies for scalable applications"
        },
        {
          id: 9,
          title: "Computer Vision Applications",
          category: "lectures",
          instructor: "Dr. Rachel Green",
          duration: "51:10",
          date: "2024-04-22",
          views: 1560,
          thumbnail: "/images/vision-thumb.jpg",
          videoUrl: "/Storage/Course/CRS09VISION/playlist/CRS09VISIONV1.mp4",
          playlistCode: "CRS09VISION",
          description: "Exploring real-world applications of computer vision technology"
        },
        {
          id: 10,
          title: "Startup Founder Interview",
          category: "interviews",
          instructor: "John Techman",
          duration: "47:33",
          date: "2024-06-08",
          views: 1320,
          thumbnail: "/images/startup-thumb.jpg",
          videoUrl: "/Storage/Course/CRS10STARTUP/playlist/CRS10STARTUPV1.mp4",
          playlistCode: "CRS10STARTUP",
          description: "Conversation with a successful tech startup founder about the journey"
        },
        {
          id: 11,
          title: "Natural Language Processing Basics",
          category: "tutorials",
          instructor: "Prof. Kevin Lee",
          duration: "39:28",
          date: "2024-03-29",
          views: 2430,
          thumbnail: "/images/nlp-thumb.jpg",
          videoUrl: "/Storage/Course/CRS11NLP/playlist/CRS11NLPV1.mp4",
          playlistCode: "CRS11NLP",
          description: "Introduction to NLP concepts with practical examples using Python"
        },
        {
          id: 12,
          title: "Database Optimization Techniques",
          category: "lectures",
          instructor: "Dr. Alan Turing",
          duration: "43:17",
          date: "2024-05-19",
          views: 1670,
          thumbnail: "/images/database-thumb.jpg",
          videoUrl: "/Storage/Course/CRS12DB/playlist/CRS12DBV1.mp4",
          playlistCode: "CRS12DB",
          description: "Advanced techniques for optimizing database performance and queries"
        }
      ];
      
      setVideoList(videos);
      setIsLoading(false);
    };

    const timer = setTimeout(loadVideos, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter videos based on active category and search query
  const filteredVideos = videoList.filter(video => {
    const matchesCategory = activeFilter === 'all' || video.category === activeFilter;
    const matchesSearch = searchQuery === '' || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  };

  // Video event handlers
  const handleVideoWaiting = () => setIsBuffering(true);
  const handleVideoPlaying = () => setIsBuffering(false);
  const handleVideoCanPlay = () => setIsBuffering(false);

  // Show loading spinner while data is loading
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative flex items-center justify-center min-h-[60vh] bg-cover bg-center">
          <div
            className="absolute inset-0 bg-[url('/images/hero-bg3.png')] bg-cover bg-center"
            style={{ opacity: 0.5 }}
          ></div>
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12 md:py-16">
            <div className="flex flex-col items-center text-center">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 mt-10 leading-tight"
                >
                MVSD LAB Video Library
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base md:text-lg lg:text-xl text-gray-800 mb-4"
                >
                Access lectures, tutorials, and expert talks from our research lab
              </motion.p>
              
              {/* Stats Banner */}
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded p-6 border border-blue-100 shadow-md w-full max-w-4xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="bg-blue-100 p-3 rounded flex-shrink-0">
                      <FaPlay className="text-blue-600 text-xl" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-800">{videoList.length}</h3>
                      <p className="text-gray-600">Total Videos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="bg-indigo-100 p-3 rounded flex-shrink-0">
                      <FaClock className="text-indigo-600 text-xl" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-800">120+</h3>
                      <p className="text-gray-600">Hours of Content</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="bg-purple-100 p-3 rounded flex-shrink-0">
                      <FaGraduationCap className="text-purple-600 text-xl" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-800">25+</h3>
                      <p className="text-gray-600">Expert Instructors</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 py-4">
          <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <nav className="text-sm md:text-base font-medium text-gray-800 mb-2 md:mb-0">
              <ol className="list-reset flex items-center space-x-2">
                <li>
                  <Link href="/home" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">Home</Link>
                </li>
                <li>/</li>
                <li className="text-gray-800 font-medium">Video Library</li>
              </ol>
            </nav>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="bg-white/80 backdrop-blur-2xl rounded shadow-xl p-6 md:p-8 border border-white/80">
              {/* Filters and Search */}
              <div className="mb-12">
                {/* Full-width search bar */}
                <div className="w-full mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search videos by title, instructor, or keyword..."
                      className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                
                {/* Category Filters */}
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  {categories.map(category => (
                    <motion.button
                      key={category.id}
                      onClick={() => setActiveFilter(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeFilter === category.id
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Video Grid */}
              {filteredVideos.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filteredVideos.map(video => (
                    <motion.div 
                      key={video.id}
                      variants={item}
                      className="bg-white rounded overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group border border-gray-200"
                      whileHover={{ y: -5 }}
                    >
                      {/* Video Thumbnail */}
                      <div 
                        className="relative cursor-pointer"
                        onClick={() => setSelectedVideo(video)}
                      >
                        {video.thumbnail ? (
                          <div className="bg-gray-200 w-full h-48 bg-cover bg-center" 
                               style={{ backgroundImage: `url(${video.thumbnail})` }} />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded w-full h-48" />
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-blue-600 p-4 rounded-full">
                            <FaPlay className="text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      
                      {/* Video Info */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {video.title}
                          </h3>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {video.description}
                        </p>
                        
                        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-dashed" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">{video.instructor}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <FaCalendarAlt />
                            <span>{formatDate(video.date)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {categories.find(c => c.id === video.category)?.name}
                          </span>
                          
                          <div className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                            <FaList className="mr-1" />
                            <span>{video.playlistCode}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <FaSearch className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">No Videos Found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search or filter criteria
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilter('all');
                    }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl w-full max-w-4xl overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="relative">
                  {/* Custom Loading Spinner - shown during buffering */}
                  {isBuffering && (
                    <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
                      <LoadingSpinner />
                    </div>
                  )}
                  
                  {/* Video Player */}
                  <video 
                    ref={videoRef}
                    src={selectedVideo.videoUrl}
                    className="w-full h-auto max-h-[70vh]"
                    controls
                    autoPlay
                    onWaiting={handleVideoWaiting}
                    onPlaying={handleVideoPlaying}
                    onCanPlay={handleVideoCanPlay}
                    onSeeking={handleVideoWaiting}
                    onSeeked={handleVideoCanPlay}
                    // Hide browser's loading spinner
                    style={{ 
                      // Hide native controls during buffering
                      opacity: isBuffering ? 0 : 1,
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                  
                  <button 
                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-30"
                    onClick={() => setSelectedVideo(null)}
                  >
                    <FaTimes />
                  </button>
                </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedVideo.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-dashed" />
                    <div>
                      <p className="font-medium text-gray-800">{selectedVideo.instructor}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaCalendarAlt />
                    <span>{formatDate(selectedVideo.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaClock />
                    <span>{selectedVideo.duration}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {categories.find(c => c.id === selectedVideo.category)?.name}
                    </span>
                    
                    <div className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                      <FaList className="mr-1" />
                      <span>Playlist Code: {selectedVideo.playlistCode}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700">
                  {selectedVideo.description}
                </p>
                
                <div className="mt-6 flex flex-wrap justify-between items-center gap-4">
                  <div className="text-gray-600">
                    {selectedVideo.views.toLocaleString()} views
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors flex items-center"
                      onClick={() => setSelectedVideo(null)}
                    >
                      <FaTimes className="mr-2" />
                      Close
                    </button>
                    
                    <Link 
                      href={`/home/video/single_playlist`}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <FaList className="mr-2" />
                      View Playlist
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ScrollToTop />
      <Footer />
    </div>
  );
}
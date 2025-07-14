'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ScrollToTop from '../../components/ScrollToTop';
import LoadingSpinner from '../../components/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaMapMarkerAlt, FaTimes, FaSearch } from 'react-icons/fa';

export default function GalleryPage() {
  const [activePhoto, setActivePhoto] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Photo data with details
  const photos = [
    {
      id: 1,
      filename: "H_GMVSD01.jpg",
      title: "Annual Research Symposium",
      date: "2024-06-15",
      location: "Main Auditorium",
      description: "Our annual research symposium showcasing cutting-edge projects from students and faculty"
    },
    {
      id: 2,
      filename: "H_GMVSD02.jpg",
      title: "Robotics Workshop",
      date: "2024-05-22",
      location: "Engineering Lab 3",
      description: "Hands-on workshop on advanced robotics and automation systems"
    },
    {
      id: 3,
      filename: "H_GMVSD03.jpg",
      title: "Industry Collaboration Signing",
      date: "2024-04-10",
      location: "Innovation Hub",
      description: "Signing ceremony for our new partnership with leading tech companies"
    },
    {
      id: 4,
      filename: "H_GMVSD04.jpg",
      title: "Graduation Ceremony",
      date: "2024-03-28",
      location: "University Quadrangle",
      description: "Celebrating our graduating class of 2024 with faculty and families"
    },
    {
      id: 5,
      filename: "H_GMVSD05.jpg",
      title: "International Conference",
      date: "2024-02-15",
      location: "Conference Center",
      description: "Our lab hosting the annual international conference on machine learning"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activePhoto) {
        if (e.key === 'Escape') setActivePhoto(null);
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto]);

  // Filter photos based on search
  const filteredPhotos = photos.filter(photo => 
    photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photo.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

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
                MVSD LAB Gallery
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base md:text-lg lg:text-xl text-gray-800 mb-4"
                >
                Capturing moments from our research, events, and achievements
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
                      <FaCamera className="text-blue-600 text-xl" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-800">{photos.length}</h3>
                      <p className="text-gray-600">Featured Photos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="bg-indigo-100 p-3 rounded flex-shrink-0">
                      <FaCalendarAlt className="text-indigo-600 text-xl" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-800">5+</h3>
                      <p className="text-gray-600">Events Captured</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="bg-purple-100 p-3 rounded flex-shrink-0">
                      <FaMapMarkerAlt className="text-purple-600 text-xl" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-800">4</h3>
                      <p className="text-gray-600">Unique Locations</p>
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
                  <a href="/home" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">Home</a>
                </li>
                <li>/</li>
                <li className="text-gray-800 font-medium">Gallery</li>
              </ol>
            </nav>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="bg-white/80 backdrop-blur-2xl rounded shadow-xl p-6 md:p-8 border border-white/80">
              {/* Search */}
              <div className="mb-8">
                <div className="relative max-w-2xl mx-auto">
                  <input
                    type="text"
                    placeholder="Search photos by title, description, or location..."
                    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              {/* Featured Photo Slider */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Featured Moments</h2>
                
                <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded aspect-video bg-gray-200 border border-gray-300 shadow-lg">
                  <div className="relative w-full h-full">
                    {photos.map((photo, index) => (
                      <div 
                        key={photo.id}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                          index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(/Storage/Gallery/${photo.filename})` }}
                        />
                        
                        {/* Photo Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                          <h3 className="text-xl font-bold">{photo.title}</h3>
                          <div className="flex flex-wrap items-center mt-2 text-sm opacity-90">
                            <div className="flex items-center mr-4">
                              <FaCalendarAlt className="mr-2" />
                              <span>{formatDate(photo.date)}</span>
                            </div>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-2" />
                              <span>{photo.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Navigation Arrows */}
                  <button 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                    onClick={prevSlide}
                  >
                    <FaChevronLeft />
                  </button>
                  
                  <button 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                    onClick={nextSlide}
                  >
                    <FaChevronRight />
                  </button>
                  
                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {photos.map((_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index === currentIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Photo Grid */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Our Gallery</h2>
                
                {filteredPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPhotos.map(photo => (
                      <motion.div 
                        key={photo.id}
                        className="bg-white rounded overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-200"
                        whileHover={{ y: -5 }}
                        onClick={() => setActivePhoto(photo)}
                      >
                        <div className="relative h-64">
                          <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(/Storage/Gallery/${photo.filename})` }}
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-blue-600 p-4 rounded-full">
                              <FaCamera className="text-white text-xl" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {photo.title}
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2" />
                              <span>{formatDate(photo.date)}</span>
                            </div>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-2" />
                              <span>{photo.location}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-6">
                      <FaSearch className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">No Photos Found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search criteria
                    </p>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Photo Detail Modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div 
            className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded w-full max-w-4xl overflow-hidden"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="relative w-full h-[50vh]">
                {/* Loading spinner for image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
                
                {/* Actual image */}
                <img 
                  src={`/Storage/Gallery/${activePhoto.filename}`} 
                  alt={activePhoto.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onLoad={(e) => {
                    // Hide spinner when image loads
                    e.target.parentElement.querySelector('.absolute').style.display = 'none';
                  }}
                />
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{activePhoto.title}</h2>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center text-gray-700">
                    <FaCalendarAlt className="mr-2 text-blue-600" />
                    <span>{formatDate(activePhoto.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <FaMapMarkerAlt className="mr-2 text-blue-600" />
                    <span>{activePhoto.location}</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  {activePhoto.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Photo ID: {activePhoto.filename}
                  </div>
                  
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    onClick={() => setActivePhoto(null)}
                  >
                    Close
                  </button>
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
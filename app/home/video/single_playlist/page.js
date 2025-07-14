//app/home/video/single_playlist/page.js
'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ScrollToTop from '../../../components/ScrollToTop';
import Link from 'next/link';
import { FaUsers, FaPlay, FaClock, FaListUl, FaGraduationCap, FaChalkboardTeacher, FaFileAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function VideoPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Course details
  const course = {
    code: "CRS01MVSD",
    title: "Multimodal Video Scene Description",
    instructor: "Dr. Sarah Johnson",
    thumbnail: "/Storage/Course/CRS01MVSD/CRS01MVSD_THUMB.jpg",
    description: "This course explores the integration of multiple modalities (video, audio, text) for comprehensive scene description and understanding. Students will learn cutting-edge techniques in multimodal learning, attention mechanisms, and cross-modal alignment.",
    duration: "14 weeks",
    level: "Advanced",
    credits: 4,
    totalVideos: 10,
    totalDuration: "8 hours 45 minutes"
  };

  // Video data
  const videos = [
    {
      id: 1,
      title: "Introduction to Multimodal Learning",
      fileName: "CRS01MVSDV1.mp4",
      duration: "12:45",
      thumbnail: "/Storage/Course/CRS01MVSD/CRS01MVSD_THUMB.jpg",
      description: "Fundamental concepts of multimodal learning and its applications in video scene description.",
      views: 245,
      date: "2024-08-15"
    },
    {
      id: 2,
      title: "Video Processing Techniques",
      fileName: "CRS01MVSDV2.mp4",
      duration: "18:32",
      thumbnail: "/images/video-thumb2.jpg",
      description: "Advanced video processing methods for feature extraction and temporal modeling.",
      views: 198,
      date: "2024-08-22"
    },
    {
      id: 3,
      title: "Audio Feature Extraction",
      fileName: "CRS01MVSDV3.mp4",
      duration: "22:15",
      thumbnail: "/images/video-thumb3.jpg",
      description: "Methods for extracting meaningful audio features and synchronizing with visual data.",
      views: 176,
      date: "2024-08-29"
    },
    {
      id: 4,
      title: "Text-Video Alignment",
      fileName: "CRS01MVSDV4.mp4",
      duration: "25:41",
      thumbnail: "/images/video-thumb4.jpg",
      description: "Techniques for aligning textual descriptions with corresponding video segments.",
      views: 162,
      date: "2024-09-05"
    },
    {
      id: 5,
      title: "Attention Mechanisms",
      fileName: "CRS01MVSDV5.mp4",
      duration: "30:18",
      thumbnail: "/images/video-thumb5.jpg",
      description: "Implementing attention mechanisms for focusing on relevant multimodal features.",
      views: 154,
      date: "2024-09-12"
    },
    {
      id: 6,
      title: "Cross-Modal Fusion",
      fileName: "CRS01MVSDV6.mp4",
      duration: "28:56",
      thumbnail: "/images/video-thumb6.jpg",
      description: "Strategies for effectively fusing information from different modalities.",
      views: 142,
      date: "2024-09-19"
    },
    {
      id: 7,
      title: "Temporal Modeling",
      fileName: "CRS01MVSDV7.mp4",
      duration: "35:22",
      thumbnail: "/images/video-thumb7.jpg",
      description: "Modeling temporal dynamics in video sequences for scene understanding.",
      views: 135,
      date: "2024-09-26"
    },
    {
      id: 8,
      title: "Evaluation Metrics",
      fileName: "CRS01MVSDV8.mp4",
      duration: "19:45",
      thumbnail: "/images/video-thumb8.jpg",
      description: "Standard evaluation metrics for multimodal video description systems.",
      views: 128,
      date: "2024-10-03"
    },
    {
      id: 9,
      title: "Case Study: Sports Analysis",
      fileName: "CRS01MVSDV9.mp4",
      duration: "42:10",
      thumbnail: "/images/video-thumb9.jpg",
      description: "Applying multimodal techniques to sports video analysis and commentary generation.",
      views: 121,
      date: "2024-10-10"
    },
    {
      id: 10,
      title: "Advanced Applications",
      fileName: "CRS01MVSDV10.mp4",
      duration: "38:27",
      thumbnail: "/images/video-thumb10.jpg",
      description: "Exploring cutting-edge applications of multimodal video description in various domains.",
      views: 118,
      date: "2024-10-17"
    }
  ];

  const filteredVideos = activeTab === 'all' 
    ? videos 
    : videos.filter(video => video.id <= 5); // Simplified filter for demo

  const playVideo = (video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
  };

  const closePlayer = () => {
    setIsPlaying(false);
    setTimeout(() => setCurrentVideo(null), 300);
  };

  // Simulate video progress for demo
  useEffect(() => {
    let interval;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 0.5, 100));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative text-gray-800 py-16 md:py-24"> {/* Changed text-white to text-gray-800 */}
        <div className="absolute inset-0 bg-[url('/images/hero-bg3.png')] bg-cover bg-center" style={{ opacity: 0.5 }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/3 mb-8 md:mb-0">
              <div className="relative rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 md:h-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
                  <button 
                    onClick={() => playVideo(videos[0])}
                    className="bg-blue-600 hover:bg-blue-700 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <FaPlay className="text-white ml-1" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3 md:pl-12">
              <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
                {course.code}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"> {/* Added text-gray-900 */}
                {course.title}
              </h1>
              <p className="text-lg text-gray-700 mb-6 max-w-3xl"> {/* Changed text-blue-100 to text-gray-700 */}
                {course.description}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-gray-800"> {/* Added text-gray-800 */}
                  <FaChalkboardTeacher className="mr-2 text-blue-600" /> {/* Changed to blue-600 */}
                  <span className="font-medium">{course.instructor}</span>
                </div>
                <div className="flex items-center bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-gray-800"> {/* Added text-gray-800 */}
                  <FaClock className="mr-2 text-blue-600" /> {/* Changed to blue-600 */}
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-gray-800"> {/* Added text-gray-800 */}
                  <FaGraduationCap className="mr-2 text-blue-600" /> {/* Changed to blue-600 */}
                  <span className="font-medium">{course.level}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => playVideo(videos[0])}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center shadow-lg"
                >
                  <FaPlay className="mr-2" /> Start Watching
                </button>
                <button className="bg-white/90 hover:bg-white text-gray-800 px-6 py-3 rounded-lg font-medium flex items-center shadow-lg border border-gray-200"> {/* Changed text and bg */}
                  <FaFileAlt className="mr-2 text-gray-700" /> {/* Changed to gray-700 */}
                  Download Syllabus
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <section className="bg-gray-100 py-3">
        <div className="container mx-auto px-4">
          <nav className="text-sm font-medium text-gray-600">
            <ol className="list-reset flex">
              <li>
                <Link href="/home" className="text-blue-600 hover:text-blue-700">Home</Link>
              </li>
              <li><span className="mx-2">/</span></li>
              <li>
                <Link href="/video" className="text-blue-600 hover:text-blue-700">Video</Link>
              </li>
              <li><span className="mx-2">/</span></li>
              <li className="text-gray-800">{course.title}</li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Video List Section */}
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <FaListUl className="mr-2 text-blue-600" />
                  Course Videos
                </h2>
                
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Videos
                  </button>
                  <button 
                    onClick={() => setActiveTab('recent')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeTab === 'recent' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Recent
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {filteredVideos.map((video, index) => (
                  <motion.div 
                    key={video.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div 
                        className="relative w-full md:w-64 h-48 cursor-pointer"
                        onClick={() => playVideo(video)}
                      >
                        <div className="bg-gray-200 border-2 border-dashed w-full h-full" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <button className="bg-blue-600 hover:bg-blue-700 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                            <FaPlay className="text-white ml-1" />
                          </button>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs text-blue-600 font-medium mb-1">
                              Video {video.id}
                            </div>
                            <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                            <p className="text-gray-600 text-sm mb-4">{video.description}</p>
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                            {video.date}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-sm">
                          <span className="flex items-center mr-4">
                            <FaClock className="mr-1" /> {video.duration}
                          </span>
                          <span className="flex items-center">
                            <FaUsers className="mr-1" /> {video.views} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Course Details Sidebar */}
            <div className="lg:w-1/3">
              <div className="bg-gray-50 rounded-xl shadow-md p-6 mb-8 border border-gray-200">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FaGraduationCap className="mr-2 text-blue-600" />
                  Course Details
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-gray-600">Course Code</span>
                    <span className="font-medium">{course.code}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-gray-600">Instructor</span>
                    <span className="font-medium">{course.instructor}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-gray-600">Level</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-gray-600">Credits</span>
                    <span className="font-medium">{course.credits}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-gray-600">Total Videos</span>
                    <span className="font-medium">{course.totalVideos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Duration</span>
                    <span className="font-medium">{course.totalDuration}</span>
                  </div>
                </div>
                
                <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow-md">
                  Download Course Materials
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-6 border border-blue-100">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FaListUl className="mr-2 text-blue-600" />
                  Course Progress
                </h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span>25%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: '25%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {videos.slice(0, 3).map(video => (
                    <div key={video.id} className="flex items-center">
                      <div className="mr-3">
                        <div className="bg-gray-200 border-2 border-dashed rounded w-16 h-16" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{video.title}</h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <FaClock className="mr-1" /> {video.duration}
                        </div>
                      </div>
                      <div className="ml-2">
                        <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="mt-4 w-full text-blue-600 hover:text-blue-800 font-medium py-2">
                  View All Videos
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Player Modal */}
      {currentVideo && (
        <motion.div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: isPlaying ? 1 : 0 }}
          onClick={closePlayer}
        >
          <motion.div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: isPlaying ? 1 : 0.9, y: isPlaying ? 0 : 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Player Header */}
            <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-medium">{currentVideo.title}</h3>
              <button 
                onClick={closePlayer}
                className="text-white hover:text-gray-300 text-xl"
              >
                &times;
              </button>
            </div>
            
            {/* Video Player */}
            <div className="relative bg-black">
              <div className="bg-gray-200 border-2 border-dashed w-full h-96" />
              
              {/* Play Button */}
              <button 
                className={`absolute inset-0 flex items-center justify-center ${isPlaying ? 'hidden' : ''}`}
                onClick={() => setIsPlaying(true)}
              >
                <div className="bg-blue-600 hover:bg-blue-700 w-20 h-20 rounded-full flex items-center justify-center shadow-xl">
                  <FaPlay className="text-white text-2xl ml-1" />
                </div>
              </button>
              
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-800/70 h-2">
                <div 
                  className="bg-blue-600 h-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Video Info */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h4 className="text-xl font-bold mb-2 sm:mb-0">{currentVideo.title}</h4>
                <div className="flex items-center text-gray-600">
                  <FaClock className="mr-1" /> {currentVideo.duration}
                </div>
              </div>
              <p className="text-gray-700 mb-6">{currentVideo.description}</p>
              
              <div className="flex justify-between">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium">
                  Download Video
                </button>
                <div className="text-gray-600">
                  <span className="font-medium">{currentVideo.views}</span> views
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      <ScrollToTop />
      <Footer />
    </div>
  );
}
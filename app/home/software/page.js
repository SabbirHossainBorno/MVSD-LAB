// app/home/software/page.js
'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ScrollToTop from '../../components/ScrollToTop';
import LoadingSpinner from '../../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { FaDownload, FaEnvelope, FaUsers, FaFileAlt, FaGraduationCap, FaArrowLeft, FaQuoteRight, FaCog, FaList, FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function SoftwarePage() {
  const [activeSoftware, setActiveSoftware] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllTeam, setShowAllTeam] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const softwareList = [
    {
      id: 1,
      title: "NOMA Simulator",
      subtitle: "NOMA (Non-Orthogonal Multiple Access) Simulator",
      description: "A comprehensive simulator for NOMA Downlink System Level analysis, enabling researchers to model and analyze various user pairing schemes and capacity maximization algorithms.",
      downloads: [
        { 
          title: "Download the NOMA Simulator application here", 
          link: "#" 
        },
        { 
          title: "Download the NOMA Simulator paper here", 
          link: "#" 
        },
        { 
          title: "Download the tutorial here", 
          link: "#" 
        }
      ],
      instruction: `To get access to the download link, please send an e-mail to MVSD LAB (labmvsd@gmail.com) that contains:

Identity (name, date of birth, e-mail, phone number, address, and institution)
The reason/purpose for using the NOMA Simulator.`,
      citation: `A. Khan, M. A. Usman, M. R. Usman, M. Ahmad, and S.-Y. Shin, "Link and System-Level NOMA Simulator: The Reproducibility of Research," Electronics, vol. 10, no. 19, p. 2388, Sep. 2021.`,
      team: [
        "Prof. Soo Young Shin",
        "Dr. Arsla Khan",
        "Dr. Arslan Usman",
        "Dr. Rehan Usman",
        "Mohammed Belal Uddin",
        "Denny Kusuma Hendraningrat",
        "Irfan Azam",
        "Muneeb Ahmad",
        "Yong Bi Kwon",
        "Bhaskara Narottama",
        "I Nyoman Apraz Ramatryana"
      ],
      features: [
        "NOMA Downlink System Level Simulation",
        "Multiple user pairing schemes",
        "Capacity maximization algorithms",
        "Performance analysis tools",
        "Customizable channel models",
        "Real-time visualization",
        "Exportable results in multiple formats"
      ],
      references: [
        `Muhammad Basit Shahab, Mohammad Irfan, Md. Fazlul Kader, Soo Young Shin. "User pairing schemes for capacity maximization in non-orthogonal multiple access systems", Wireless Communications and Mobile Computing, Volume 16, No. 17, pp 2884-2894 September 2016.`,
        `A. Benjebbour, Y. Saito, Y. Kishiyama, A. Li, A. Harada, and T. Nakamura, "Concept and practical considerations of non-orthogonal multiple access (NOMA) for future radio access," in Proc. IEEE ISPACS, 2013, pp. 770-774.`,
        `Z. Ding, Y. Liu, J. Choi, Q. Sun, M. Elkashlan, and H. V. Poor, "Application of non-orthogonal multiple access in LTE and 5G networks," IEEE Commun. Mag., vol. 55, no. 2, pp. 185-191, Feb. 2017.`,
        `Y. Saito, Y. Kishiyama, A. Benjebbour, T. Nakamura, A. Li, and K. Higuchi, "Non-orthogonal multiple access (NOMA) for cellular future radio access," in Proc. IEEE VTC Spring, 2013, pp. 1-5.`
      ],
      updated: "2019-12-13"
    },
    {
      id: 2,
      title: "Massive MIMO NOMA Simulator",
      subtitle: "Massive Multiple-Input-Multiple-Output (mMIMO) NOMA Simulator",
      description: "Advanced simulator combining Massive MIMO and NOMA technologies for 5G-Downlink Link Level analysis, featuring multi-cell scenarios and sophisticated user grouping algorithms.",
      downloads: [
        { 
          title: "Download the mMIMO-NOMA Simulator Application here", 
          link: "#" 
        },
        { 
          title: "Download the mMIMO-NOMA (Single-cell)(2Vs3 User Grouping) Simulator Application here", 
          link: "#" 
        },
        { 
          title: "Download the Matlab Runtime Installer here", 
          link: "#" 
        },
        { 
          title: "Download the User Manual and License Agreement here", 
          link: "#" 
        },
        { 
          title: "Download the tutorial here", 
          link: "#" 
        }
      ],
      instruction: `To get access to the download link, please send an e-mail to MVSD LAB (labmvsd@gmail.com) that contains:

Identity (name, date of birth, e-mail, phone number, address, and institution)
The reason/purpose for using the mMIMO-NOMA Simulator.`,
      team: [
        "Prof. Soo Young Shin",
        "Irfan Azam",
        "Muneeb Ahmad",
        "I Nyoman Apraz Ramatryana",
        "Bhaskara Narottama"
      ],
      parameters: [
        "Massive MIMO configurations (up to 256 antennas)",
        "NOMA user grouping algorithms",
        "5G downlink simulation",
        "Link-level performance analysis",
        "Multi-cell and single-cell scenarios",
        "Customizable channel models",
        "Real-time SNR visualization",
        "Throughput optimization tools"
      ],
      updated: "2022-03-15"
    }
  ];

  const handleSoftwareSelect = (software) => {
    setLoading(true);
    setTimeout(() => {
      setActiveSoftware(software);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  const handleBackToList = () => {
    setLoading(true);
    setTimeout(() => {
      setActiveSoftware(null);
      setLoading(false);
    }, 600);
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 min-h-screen">
        <Navbar />
        <main className="container mx-auto py-12 px-4 max-w-4xl text-center">
          <div className="bg-red-50/80 backdrop-blur-lg border border-red-200/50 text-red-700 px-6 py-8 rounded shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Error Loading Software</h2>
            <p className="mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-2 px-6 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

    if (activeSoftware) {
    return (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 min-h-screen">
        <Navbar />
        <main>
            <section className="relative py-16 md:py-20">
            <div className="container mx-auto max-w-6xl px-4">
                <motion.button 
                onClick={handleBackToList}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-10 transition-colors group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                <FaArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Software List
                </motion.button>
                
                <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="lg:w-2/3">
                    <motion.div 
                    className="bg-white/90 backdrop-blur-lg rounded shadow-xl overflow-hidden border border-white/60 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    >
                    <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-8 text-white">
                        <div className="flex items-start">
                        <div className="bg-white/20 p-4 rounded mr-6">
                            <FaFileAlt className="h-10 w-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{activeSoftware.title}</h1>
                            <p className="text-xl text-blue-100">{activeSoftware.subtitle}</p>
                        </div>
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <div className="prose max-w-none mb-8">
                        <p className="text-lg text-gray-700">{activeSoftware.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-blue-50/50 p-6 rounded border border-blue-100">
                            <div className="flex items-center mb-4">
                            <div className="bg-blue-100 p-2 rounded mr-4">
                                <FaCalendarAlt className="text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Last Updated</h3>
                            </div>
                            <p className="text-gray-700">{activeSoftware.updated}</p>
                        </div>
                        
                        <div className="bg-teal-50/50 p-6 rounded border border-teal-100">
                            <div className="flex items-center mb-4">
                            <div className="bg-teal-100 p-2 rounded mr-4">
                                <FaUsers className="text-teal-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Development Team</h3>
                            </div>
                            <p className="text-gray-700">{activeSoftware.team.length} contributors</p>
                        </div>
                        </div>
                        
                        {/* Features/Parameters */}
                        <div className="mb-10">
                        <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800 border-b pb-3">
                            <FaList className="text-blue-600 mr-3" />
                            {activeSoftware.features ? "Key Features" : "Key Parameters"}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(activeSoftware.features || activeSoftware.parameters).map((item, index) => (
                            <motion.div
                                key={index}
                                className="flex items-start p-4 bg-white border border-gray-200 rounded hover:shadow-md transition-all"
                                whileHover={{ y: -3 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                            >
                                <div className="bg-blue-100 p-1.5 rounded-full mr-3 mt-1">
                                <div className="bg-gradient-to-r from-blue-500 to-teal-500 w-2 h-2 rounded-full"></div>
                                </div>
                                <p className="text-gray-700">{item}</p>
                            </motion.div>
                            ))}
                        </div>
                        </div>
                    </div>
                    </motion.div>
                    
                    {/* References */}
                    {activeSoftware.references && (
                    <motion.div
                        className="bg-white/90 backdrop-blur-lg rounded shadow-xl overflow-hidden border border-white/60"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800 border-b pb-3">
                            <FaQuoteRight className="text-blue-600 mr-3" />
                            References
                        </h2>
                        
                        <div className="space-y-5">
                            {activeSoftware.references.map((ref, index) => (
                            <motion.div 
                                key={index}
                                className="flex p-5 bg-gray-50 rounded"
                                whileHover={{ backgroundColor: "#f9fafb" }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                            >
                                <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 text-white font-bold text-sm">
                                {index + 1}
                                </div>
                                <p className="text-gray-700">{ref}</p>
                            </motion.div>
                            ))}
                        </div>
                        </div>
                    </motion.div>
                    )}
                </div>
                
                {/* Sidebar */}
                <div className="lg:w-1/3">
                    {/* Download Section */}
                    <motion.div 
                    className="bg-white/90 backdrop-blur-lg rounded shadow-xl overflow-hidden border border-white/60 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    >
                    <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white">
                        <h2 className="text-2xl font-bold flex items-center">
                        <FaDownload className="mr-3" />
                        Download Links
                        </h2>
                    </div>
                    
                    <div className="p-6">
                        <div className="space-y-4">
                        {activeSoftware.downloads.map((download, index) => (
                            <motion.div
                            key={index}
                            className="flex flex-col p-5 bg-gray-50 rounded border border-gray-200 hover:border-blue-300 transition-all"
                            whileHover={{ y: -3, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            >
                            <div className="flex items-center mb-3">
                                <div className="bg-blue-100 p-2 rounded mr-4">
                                <FaDownload className="text-blue-600" />
                                </div>
                                <h3 className="font-medium text-gray-800">{download.title}</h3>
                            </div>
                            <a 
                                href={download.link}
                                className="mt-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded font-medium hover:from-blue-700 hover:to-teal-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                            >
                                Download Now
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </a>
                            </motion.div>
                        ))}
                        </div>
                    </div>
                    </motion.div>
                    
                    {/* Access Instructions */}
                    <motion.div 
                    className="bg-white/90 backdrop-blur-lg rounded shadow-xl overflow-hidden border border-white/60"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    >
                    <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white">
                        <h2 className="text-2xl font-bold flex items-center">
                        <FaEnvelope className="mr-3" />
                        Access Instructions
                        </h2>
                    </div>
                    
                    <div className="p-6">
                        <div className="bg-blue-50/50 p-5 rounded border border-blue-100 mb-6">
                        <pre className="whitespace-pre-wrap font-sans text-gray-700">
                            {activeSoftware.instruction}
                        </pre>
                        </div>
                        
                        <a 
                        href="mailto:labmvsd@gmail.com" 
                        className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded font-medium hover:from-blue-700 hover:to-teal-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                        >
                        <FaEnvelope className="mr-2" />
                        Contact MVSD LAB
                        </a>
                    </div>
                    </motion.div>
                    
                    {/* Development Team */}
                    {/* Development Team */}
<motion.div 
  className="bg-white/90 backdrop-blur-lg rounded shadow-xl overflow-hidden border border-white/60 mt-8"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.4 }}
>
  <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white">
    <h2 className="text-2xl font-bold flex items-center">
      <FaUsers className="mr-3" />
      Development Team
    </h2>
  </div>
  
  <div className="p-6">
    <div className="flex flex-wrap gap-4">
      {activeSoftware.team.slice(0, showAllTeam ? activeSoftware.team.length : 4).map((member, index) => (
        <motion.div
          key={index}
          className="flex-1 min-w-[200px] bg-gray-50 rounded border border-gray-200 p-4 hover:bg-gray-100 transition-colors"
          whileHover={{ y: -3 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + index * 0.05 }}
        >
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 flex-shrink-0">
              {member.split(' ').map(n => n[0]).join('')}
            </div>
            <p className="text-sm font-medium text-gray-700 break-words">
              {member}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
    
    {activeSoftware.team.length > 4 && (
      <div className="flex justify-center mt-6">
        <motion.button
          onClick={() => setShowAllTeam(!showAllTeam)}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showAllTeam ? (
            <>
              Show Less
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </>
          ) : (
            <>
              Show More ({activeSoftware.team.length - 4})
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </motion.button>
      </div>
    )}
  </div>
</motion.div>
                </div>
                </div>
                
                {/* Citation */}
                {activeSoftware.citation && (
                <motion.div 
                    className="mt-8 bg-white/90 backdrop-blur-lg rounded shadow-xl overflow-hidden border border-white/60"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white">
                    <h2 className="text-2xl font-bold flex items-center">
                        <FaQuoteRight className="mr-3" />
                        Citation
                    </h2>
                    </div>
                    
                    <div className="p-8">
                    <div className="bg-gray-50 p-6 rounded border border-gray-200">
                        <p className="text-gray-700 italic">{activeSoftware.citation}</p>
                    </div>
                    </div>
                </motion.div>
                )}
            </div>
            </section>
        </main>
        <ScrollToTop />
        <Footer />
        </div>
    );
    }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 min-h-screen">
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
              transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 mt-10 leading-tight"
            >
              Research Software
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg lg:text-xl text-gray-800 mb-4 max-w-2xl mx-auto"
            >
              Download our advanced research software tools and simulators developed by MVSD LAB
            </motion.p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-gray-100/80 via-gray-200/80 to-gray-300/80 backdrop-blur-sm py-4">
          <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <nav className="text-sm md:text-base font-medium text-gray-800 mb-2 md:mb-0">
              <ol className="list-reset flex items-center space-x-2">
                <li>
                  <Link href="/home" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">Home</Link>
                </li>
                <li>/</li>
                <li className="text-gray-800 font-medium">Software</li>
              </ol>
            </nav>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {softwareList.map((software, index) => (
                <motion.div
                  key={software.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col h-full bg-gradient-to-br from-white/70 to-blue-50/70 backdrop-blur-lg rounded shadow-xl overflow-hidden border border-white/40 hover:shadow-2xl transition-all"
                >
                  {/* Header with glass effect */}
                  <div className="bg-gradient-to-r from-blue-600/90 to-teal-600/90 p-6 text-white min-h-[180px] flex flex-col justify-center relative overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <h3 className="text-2xl font-bold mb-2">{software.title}</h3>
                      <p className="text-lg">{software.subtitle}</p>
                      <motion.div 
                        className="mt-2 text-sm opacity-80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        Last updated: {software.updated}
                      </motion.div>
                    </motion.div>
                  </div>
                  
                  <div className="flex flex-col flex-grow p-6">
                    <div className="flex-grow">
                      <p className="text-gray-700 mb-4">
                        {software.description}
                      </p>
                      
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                          <FaDownload className="mr-2 text-blue-600" />
                          Available Downloads:
                        </h4>
                        <ul className="space-y-2">
                          {software.downloads.slice(0, 3).map((download, idx) => (
                            <motion.li 
                              key={idx} 
                              className="flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + idx * 0.05 }}
                            >
                              <div className="bg-gradient-to-r from-blue-500 to-teal-500 w-3 h-3 rounded-full mt-2 mr-2"></div>
                              <span className="text-gray-700 flex-1">{download.title}</span>
                            </motion.li>
                          ))}
                          {software.downloads.length > 3 && (
                            <motion.li 
                              className="text-gray-600 italic"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.7 }}
                            >
                              + {software.downloads.length - 3} more downloads
                            </motion.li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    <motion.button
                      onClick={() => handleSoftwareSelect(software)}
                      className="mt-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-3 rounded font-medium hover:from-blue-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center group"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <FaFileAlt className="mr-2 group-hover:rotate-12 transition-transform" />
                      View Details & Downloads
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="mt-20 bg-gradient-to-r from-blue-500/90 to-teal-500/90 backdrop-blur-md rounded p-8 text-white text-center border border-white/30 shadow-2xl relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="relative z-10 max-w-3xl mx-auto">
                <motion.div 
                  className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded flex items-center justify-center mb-6"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring" }}
                >
                  <FaEnvelope className="h-10 w-10" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-4">Need Help with Our Software?</h3>
                <p className="mb-6 text-lg">
                  Contact the MVSD LAB for support and inquiries
                </p>
                <motion.a 
                  href="mailto:labmvsd@gmail.com" 
                  className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded font-bold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaEnvelope className="mr-2" />
                  labmvsd@gmail.com
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <ScrollToTop />
      <Footer />
    </div>
  );
}
// app/home/members/page.js
'use client';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ScrollToTop from '../../components/ScrollToTop';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const cardVariants = {
  hover: {
    y: -10,
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)",
    transition: { duration: 0.3 }
  }
};

export default function Member() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [members, setMembers] = useState({
    director: [],
    professor: [],
    phd: [],
    masters: [],
    postdoc: [],
    staff: [],
    alumni: []
  });
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All Members' },
    { key: 'director', label: 'Directors' },
    { key: 'professor', label: 'Professors' },
    { key: 'phd', label: 'PhD Candidates' },
    { key: 'masters', label: 'Master Candidates' },
    { key: 'postdoc', label: 'Post Doc' },
    { key: 'staff', label: 'Staff' },
    { key: 'alumni', label: 'Alumni' },
  ];

  // Calculate summary counts
  const totalMembers = Object.values(members).flat().length;
  const directorCount = members.director.length;
  const professorCount = members.professor.length;
  const phdCount = members.phd.length;
  const mastersCount = members.masters.length;
  const postdocCount = members.postdoc.length;
  const staffCount = members.staff.length;
  const alumniCount = members.alumni.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/member');
        const allMembers = response.data;
        
        // Categorize members
        const categorized = {
          director: allMembers.filter(m => 
            m.type === 'Director' && m.status === 'Active' && m.alumni_status !== 'Valid'
          ),
          professor: allMembers.filter(m => 
            m.type === 'Professor' && m.status === 'Active' && m.alumni_status !== 'Valid'
          ),
          phd: allMembers.filter(m => 
            m.type === 'PhD Candidate' && m.status === 'Active' && m.alumni_status !== 'Valid'
          ),
          masters: allMembers.filter(m => 
            m.type === 'Master\'s Candidate' && m.status === 'Active' && m.alumni_status !== 'Valid'
          ),
          postdoc: allMembers.filter(m => 
            m.type === 'Post Doc Candidate' && m.status === 'Active' && m.alumni_status !== 'Valid'
          ),
          staff: allMembers.filter(m => 
            m.type === 'Staff Member' && m.status === 'Active' && m.alumni_status !== 'Valid'
          ),
          alumni: allMembers.filter(m => m.alumni_status === 'Valid')
        };
        
        setMembers(categorized);
      } catch (error) {
        console.error('Error fetching member data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Function to filter members in a category by search query
  const getFilteredMembers = (category) => {
    let list = members[category] || [];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(member => 
        (member.first_name && member.first_name.toLowerCase().includes(query)) ||
        (member.last_name && member.last_name.toLowerCase().includes(query)) ||
        (member.email && member.email.toLowerCase().includes(query))
      );
    }
    
    return list;
  };

  // Get the members to display based on active filter
  const getMembersToDisplay = () => {
    if (activeFilter === 'all') {
      return {
        director: getFilteredMembers('director'),
        professor: getFilteredMembers('professor'),
        phd: getFilteredMembers('phd'),
        masters: getFilteredMembers('masters'),
        postdoc: getFilteredMembers('postdoc'),
        staff: getFilteredMembers('staff'),
      };
    } else {
      return {
        [activeFilter]: getFilteredMembers(activeFilter)
      };
    }
  };

  // Get current filter label
  const currentFilter = filterOptions.find(opt => opt.key === activeFilter) || filterOptions[0];

  const renderSocialMediaIcons = (socialmedia) => {
    const iconMap = {
      Facebook: '/images/social_icon/facebook.png',
      X: '/images/social_icon/x.png',
      Instagram: '/images/social_icon/instagram.png',
      Linkedin: '/images/social_icon/linkedin.png',
      GitHub: '/images/social_icon/github.png',
      Website: '/images/social_icon/website.png',
      Other: '/images/social_icon/other.png',
    };

    return socialmedia.map((media) => (
      <a
        key={`${media.socialmedia_name}-${media.link}`}
        href={media.link}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-all duration-300 hover:opacity-80 hover:scale-110"
        aria-label={media.socialmedia_name}
      >
        <Image 
          src={iconMap[media.socialmedia_name]}
          alt={media.socialmedia_name}
          width={24}
          height={24}
          className="w-6 h-6"
          quality={100}
        />
      </a>
    ));
  };

const MemberCard = ({ member, type = 'normal' }) => {
  const isAlumni = type === 'alumni';
  const [expanded, setExpanded] = useState(false);
  
  const colors = {
    normal: { accent: 'from-blue-500 to-cyan-500' },
    alumni: { accent: 'from-purple-500 to-indigo-600' },
    director: { accent: 'from-amber-500 to-orange-500' },
    professor: { accent: 'from-emerald-500 to-teal-600' }
  };
  
  const cardType = isAlumni ? 'alumni' : 
                  member.type === 'Director' ? 'director' : 
                  member.type === 'Professor' ? 'professor' : 'normal';
  
  // Determine if bio needs truncation
  const bioNeedsTruncation = member.short_bio && member.short_bio.length > 180;
  const displayBio = bioNeedsTruncation && !expanded 
    ? `${member.short_bio.substring(0, 180)}...` 
    : member.short_bio;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.08)" }}
      className={`bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 
                  transition-all duration-300 flex flex-col relative group
                  ${expanded ? 'min-h-[420px]' : 'h-[400px]'}`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colors[cardType].accent}`}></div>
      
      <div className="p-6 flex flex-col h-full">
        <div className="flex flex-col items-center relative z-10">
          {/* Avatar with gradient border */}
          <div className="relative mb-5">
            <div className={`relative w-28 h-28 rounded-full p-1 bg-gradient-to-r ${colors[cardType].accent}`}>
              <div className="rounded-full overflow-hidden border-4 border-white w-full h-full">
                <Image 
                  src={member.photo || '/images/placeholder-avatar.jpg'}
                  alt={`${member.first_name} ${member.last_name}`}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
            
            {/* Alumni badge */}
            {isAlumni && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                Alumni
              </div>
            )}
            
            {/* Role badge */}
            {!isAlumni && (
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${colors[cardType].accent} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow`}>
                {member.type.split(' ')[0]}
              </div>
            )}
          </div>
          
          {/* Name with gradient text */}
          <h3 className={`font-bold text-xl text-center mb-1 bg-gradient-to-r ${colors[cardType].accent} bg-clip-text text-transparent`}>
            {member.first_name} <span className="font-extrabold">{member.last_name}</span>
          </h3>
          
          {/* Designation */}
          <p className="text-gray-600 text-center font-medium mb-2">
            {member.designation || member.type}
          </p>
          
          {/* Email with tooltip */}
          <div className="relative group/email mb-3">
            <p className="text-xs text-gray-500 truncate max-w-[180px] cursor-help">
              {member.email}
            </p>
            {member.email && member.email.length > 22 && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/email:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {member.email}
              </div>
            )}
          </div>
        </div>
        
        {/* Bio section with expandable functionality */}
        <div className="mt-2 flex-grow overflow-hidden">
          {member.short_bio && (
            <div className="h-full flex flex-col">
              <div className={`flex-grow ${expanded ? 'overflow-y-auto' : 'overflow-hidden'}`}>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {displayBio}
                </p>
              </div>
              
              {/* See More/Less button */}
              {bioNeedsTruncation && (
                <div className="pt-2 mt-auto">
                  <button 
                    onClick={() => setExpanded(!expanded)}
                    className={`text-sm font-medium w-full py-1 rounded-md transition-colors
                      ${expanded 
                        ? 'text-blue-600 hover:text-blue-800' 
                        : 'text-blue-500 hover:text-blue-700'}`}
                  >
                    {expanded ? 'See Less' : 'See More'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Social media icons */}
        {member.socialmedia && member.socialmedia.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-center space-x-3">
              {renderSocialMediaIcons(member.socialmedia)}
            </div>
          </div>
        )}
      </div>
      
      {/* Hover effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-gray-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
    </motion.div>
  );
};
  const DirectorCard = ({ director }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 flex items-center justify-center p-8 bg-gradient-to-r from-blue-100 to-indigo-100">
            <div className="relative w-64 h-64 rounded-full overflow-hidden border-8 border-white shadow-2xl">
              <Image 
                src={director.photo || '/images/placeholder-avatar.jpg'}
                alt={`${director.first_name} ${director.last_name}`}
                width={256}
                height={256}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
            </div>
          </div>
          
          <div className="md:w-3/5 p-8 flex flex-col justify-center">
            <div className="text-center md:text-left">
              <div className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                LAB DIRECTOR
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {director.first_name} {director.last_name}
              </h2>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                {director.socialmedia && renderSocialMediaIcons(director.socialmedia)}
              </div>
              
              <p className="text-gray-600 text-lg mb-6">
                {director.short_bio || "Leading innovation in automotive technologies and AI research"}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">Contact</h4>
                  <p className="text-blue-600 text-sm">{director.email}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">Research Focus</h4>
                  <p className="text-gray-600 text-sm">Autonomous Vehicles, AI Systems, Sensor Fusion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSection = (title, members, type = 'normal') => {
    if (!members || members.length === 0) return null;
    
    return (
      <section className="py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <div className="relative inline-block">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 relative z-10 px-6">
              {title}
            </h2>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute bottom-1 left-0 h-2 bg-blue-200 opacity-70 z-0"
            ></motion.div>
          </div>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className={`grid gap-8 ${
            type === 'director' ? 'md:grid-cols-1 max-w-4xl mx-auto' : 
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {type === 'director' ? (
            members.map(director => (
              <DirectorCard key={director.id} director={director} />
            ))
          ) : (
            members.map(member => (
              <motion.div
                key={member.id}
                variants={cardVariants}
              >
                <MemberCard 
                  member={member} 
                  type={type === 'alumni' ? 'alumni' : 'normal'} 
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </section>
    );
  };

  if (loading) {
    return <LoadingSpinner/>;
  }

  return (
  <div className="bg-white text-gray-900 min-h-screen">
    <Navbar />

    {/* Main Content */}
    <main>
<section className="relative flex items-center justify-center h-[30vh] md:h-[40vh] bg-cover bg-center">
  <div
    className="absolute inset-0 bg-[url('/images/hero-bg3.png')] bg-cover bg-center"
    style={{ opacity: 0.5 }}
  ></div>

  <div className="relative z-10 text-center p-6 md:p-8 max-w-2xl mx-auto">
    <motion.h1 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 mt-10 leading-tight"
    >
      Members of MVSD LAB
    </motion.h1>
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-base md:text-lg lg:text-xl text-gray-800 mb-2"
    >
      Meet our talented team driving innovation in automotive technologies and AI
    </motion.p>
  </div>
  
  {/* Compact Summary Cards */}
  <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 z-20">
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-2 text-center border border-blue-100"
        >
          <div className="text-lg md:text-xl font-bold text-blue-600">{totalMembers}</div>
          <div className="text-[10px] xs:text-xs text-gray-600 truncate">Total</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-2 text-center border border-amber-100"
        >
          <div className="text-lg md:text-xl font-bold text-amber-600">{directorCount}</div>
          <div className="text-[10px] xs:text-xs text-gray-600 truncate">Director</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-2 text-center border border-emerald-100"
        >
          <div className="text-lg md:text-xl font-bold text-emerald-600">{professorCount}</div>
          <div className="text-[10px] xs:text-xs text-gray-600 truncate">Professors</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-2 text-center border border-cyan-100"
        >
          <div className="text-lg md:text-xl font-bold text-cyan-600">{phdCount}</div>
          <div className="text-[10px] xs:text-xs text-gray-600 truncate">PhD</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-2 text-center border border-violet-100"
        >
          <div className="text-lg md:text-xl font-bold text-violet-600">{mastersCount}</div>
          <div className="text-[10px] xs:text-xs text-gray-600 truncate">Masters</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm p-2 text-center border border-rose-100"
        >
          <div className="text-lg md:text-xl font-bold text-rose-600">{postdocCount}</div>
          <div className="text-[10px] xs:text-xs text-gray-600 truncate">Post Doc</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-sm p-2 text-center border border-indigo-100"
        >
          <div className="text-lg md:text-xl font-bold text-indigo-600">{alumniCount}</div>
          <div className="text-[10px] xs:text-xs text-gray-600 truncate">Alumni</div>
        </motion.div>
      </div>
    </div>
  </div>
</section>

      {/* Modern Filter and Search Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-6 border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Breadcrumb */}
            <nav className="text-sm font-medium text-gray-800">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/home" className="text-blue-600 hover:text-blue-700 transition-colors duration-300 ease-in-out">
                    Home
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-600">Members</li>
              </ol>
            </nav>
            
            <div className="flex flex-col sm:flex-row w-full max-w-3xl gap-3">
              {/* Modern Glass Dropdown Filter */}
              <div className="relative w-full" ref={dropdownRef}>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-between w-full pl-4 pr-3 py-3 rounded-xl bg-white border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors duration-300 text-gray-700 font-medium"
                >
                  <div className="flex items-center">
                    <span className="mr-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </span>
                    {currentFilter.label}
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {/* Glass Dropdown Options */}
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute z-20 mt-2 w-full"
                    >
                      <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/50 overflow-hidden">
                        <ul className="py-2 max-h-[360px] overflow-y-auto">
                          {filterOptions.map((option) => (
                            <li key={option.key}>
                              <button
                                className={`flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50/80 transition-colors duration-200 ${
                                  activeFilter === option.key ? 'bg-blue-50 font-semibold' : ''
                                }`}
                                onClick={() => {
                                  setActiveFilter(option.key);
                                  setIsFilterOpen(false);
                                }}
                              >
                                <span className="flex-1">{option.label}</span>
                                {activeFilter === option.key && (
                                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Modern Glass Search Bar */}
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M16.65 11.65a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"></path>
                  </svg>
                </div>
                <motion.input
                  whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                  type="text"
                  placeholder="Search by name, email..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm placeholder-gray-400 text-gray-700 border border-gray-300 shadow-sm focus:outline-none transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Members Section */}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Render each section based on the active filter and search */}
        {Object.entries(getMembersToDisplay()).map(([category, memberList]) => {
          if (!memberList || memberList.length === 0) return null;

          switch (category) {
            case 'director':
              return renderSection("Lab Leadership", memberList, 'director');
            case 'professor':
              return renderSection("Professors", memberList);
            case 'phd':
              return renderSection("PhD Candidates", memberList);
            case 'masters':
              return renderSection("Master's Candidates", memberList);
            case 'postdoc':
              return renderSection("Post Doc Researchers", memberList);
            case 'staff':
              return renderSection("Staff Members", memberList);
            default:
              return null;
          }
        })}
        
        {/* Alumni Section - only shown when all or alumni is selected */}
        {(activeFilter === 'all' || activeFilter === 'alumni') && getFilteredMembers('alumni').length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl px-6 my-16 shadow-inner"
          >
            <div className="text-center mb-12">
              <motion.h2 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Our Esteemed Alumni
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 max-w-2xl mx-auto"
              >
                Where they are now: Discover the career paths of our former lab members
              </motion.p>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 100 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="h-1 bg-purple-600 rounded-full mx-auto mt-4"
              ></motion.div>
            </div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {getFilteredMembers('alumni').map(alumni => (
                <motion.div
                  key={alumni.id}
                  variants={cardVariants}
                >
                  <MemberCard member={alumni} type="alumni" />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}
        
        {/* Empty State */}
        {Object.values(getMembersToDisplay()).every(arr => !arr || arr.length === 0) && 
         (activeFilter !== 'alumni' || getFilteredMembers('alumni').length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <div className="inline-block p-6 bg-blue-50 rounded-full mb-6">
              <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Members Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We couldn't find any members matching your search. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </div>
    </main>
    
    <ScrollToTop />
    <Footer />
  </div>
);
}
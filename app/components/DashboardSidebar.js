'use client';

import Link from 'next/link';
import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MdOutlineAddCircleOutline, MdList } from 'react-icons/md';
import { FiAward, FiBook, FiBriefcase, FiBookOpen, FiImage, FiVideo, FiCode } from 'react-icons/fi';
import { GiArchiveResearch } from "react-icons/gi";

export default function DashboardSidebar({ isOpen, toggleDashboardSidebar }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();

  // Detect desktop screen size
  useEffect(() => {
    const checkDesktop = () => {
      const isDesktop = window.innerWidth >= 768;
      setIsDesktop(isDesktop);
      // Auto-close mobile menu on desktop
      if (isDesktop && !isOpen) toggleDashboardSidebar(true);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, [isOpen]);

  const handleClickOutside = useCallback((event) => {
    if (!isDesktop && !event.target.closest('aside') && isOpen) {
      toggleDashboardSidebar();
    }
  }, [isOpen, isDesktop, toggleDashboardSidebar]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  const handleDropdownClick = (dropdown, forceClose = false) => {
    if (forceClose) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    }
  };

  const isActive = (path) => pathname === path;
  const isDropdownActive = (paths) => paths.some((path) => pathname.startsWith(path));

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  const dropdownVariants = {
    open: { opacity: 1, height: 'auto' },
    closed: { opacity: 0, height: 0 }
  };

  const navItemVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.02 }
  };

  return (
    <motion.aside
      initial={false}
      animate={isDesktop ? "open" : isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className={`fixed top-0 left-0 w-64 h-full bg-gray-900 text-white z-50 shadow-lg md:relative md:translate-x-0 ${
        isDesktop ? '' : 'overflow-y-auto'
      }`}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Logo Section */}
      <div className="p-3 border-b border-gray-700/50 relative group">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center"
        >
          <Image 
            src="/images/dashboardSidebar_logo.svg" 
            alt="MVSD Lab Logo" 
            width={240} 
            height={160}
            className="w-40 sm:w-44 md:w-48 h-auto hover:scale-105 transition-transform duration-300"
          />
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-30 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-160px)]">
        {/* Dashboard */}
        <motion.div variants={navItemVariants} whileHover="hover" className="group">
          <Link href="/dashboard">
            <div className={`flex items-center p-2 rounded space-x-2 cursor-pointer transition-all ${
              isActive('/dashboard') ? 'bg-indigo-600/30 text-indigo-400' : 'hover:bg-gray-800/50'
            }`}>
              <Image src="/icons/dashboard.png" alt="Dashboard" width={24} height={24} className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </div>
          </Link>
        </motion.div>

        {/* Home */}
        <motion.div variants={navItemVariants} whileHover="hover" className="group">
          <Link href="/home">
            <div className={`flex items-center p-2 rounded space-x-2 cursor-pointer transition-all ${
              isActive('/home') ? 'bg-indigo-600/30 text-indigo-400' : 'hover:bg-gray-800/50'
            }`}>
              <Image src="/icons/home.png" alt="Home" width={24} height={24} className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </div>
          </Link>
        </motion.div>

        {/* Subscriber List */}
        <motion.div variants={navItemVariants} whileHover="hover" className="group">
          <Link href="/dashboard/subscribers_list">
            <div className={`flex items-center p-2 rounded space-x-2 cursor-pointer transition-all ${
              isActive('/dashboard/subscribers_list') ? 'bg-indigo-600/30 text-indigo-400' : 'hover:bg-gray-800/50'
            }`}>
              <Image src="/icons/subscriber_list.png" alt="Subscriber List" width={24} height={24} className="w-5 h-5" />
              <span className="font-medium">Subscriber List</span>
            </div>
          </Link>
        </motion.div>

        {/* Alumni Directory */}
        <motion.div variants={navItemVariants} whileHover="hover" className="group">
          <Link href="/dashboard/alumni_list">
            <div className={`flex items-center p-2 rounded space-x-2 cursor-pointer transition-all ${
              isActive('/dashboard/alumni_list') ? 'bg-indigo-600/30 text-indigo-400' : 'hover:bg-gray-800/50'
            }`}>
              <Image src="/icons/alumni_list.svg" alt="Alumni List" width={24} height={24} className="w-5 h-5" />
              <span className="font-medium">Alumni Directory</span>
            </div>
          </Link>
        </motion.div>

        {/* Director Dropdown */}
        <motion.div className="relative">
          <motion.button
            onClick={() => handleDropdownClick('director')}
            className={`w-full flex items-center justify-between p-2 rounded space-x-2 cursor-pointer transition-all ${
              isDropdownActive([
                '/dashboard/director_add', 
                '/dashboard/director_list', 
                '/dashboard/director_details/',
                '/dashboard/director_edit/'
              ]) ? 'bg-indigo-600/30' : 'hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Image src="/icons/director.png" alt="Director" width={24} height={24} className="w-5 h-5" />
              <span className="font-medium">Director</span>
            </div>
            <motion.div animate={{ rotate: activeDropdown === 'director' ? 180 : 0 }}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {activeDropdown === 'director' && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={dropdownVariants}
                className="ml-8 pl-3 border-l-2 border-indigo-500/20"
              >
                <Link href="/dashboard/director_add">
                  <div 
                    className="p-2 hover:bg-indigo-500/10 rounded transition-colors flex items-center gap-2"
                    onClick={() => handleDropdownClick('professor', true)}
                  >
                    <MdOutlineAddCircleOutline className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                    <span className="text-sm font-medium text-gray-300 hover:text-indigo-400">
                      Add Director
                    </span>
                  </div>
                </Link>

                <Link href="/dashboard/director_list">
                  <div 
                    className="p-2 hover:bg-indigo-500/10 rounded transition-colors flex items-center gap-2"
                    onClick={() => handleDropdownClick('professor', true)}
                  >
                    <MdList className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                    <span className="text-sm font-medium text-gray-300 hover:text-indigo-400">
                      Director List
                    </span>
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Professor Dropdown */}
        <motion.div className="relative">
          <motion.button
            onClick={() => handleDropdownClick('professor')}
            className={`w-full flex items-center justify-between p-2 rounded space-x-2 cursor-pointer transition-all ${
              isDropdownActive([
                '/dashboard/professor_add', 
                '/dashboard/professor_list', 
                '/dashboard/professor_details/',
                '/dashboard/professor_edit/'
              ]) ? 'bg-indigo-600/30' : 'hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Image src="/icons/professor.png" alt="Professor" width={24} height={24} className="w-5 h-5" />
              <span className="font-medium">Professor</span>
            </div>
            <motion.div animate={{ rotate: activeDropdown === 'professor' ? 180 : 0 }}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {activeDropdown === 'professor' && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={dropdownVariants}
                className="ml-8 pl-3 border-l-2 border-indigo-500/20"
              >
                <Link href="/dashboard/professor_add">
                  <div className="p-2 hover:bg-indigo-500/10 rounded transition-colors flex items-center gap-2"
                  onClick={() => handleDropdownClick('director', true)}
                  >
                    <MdOutlineAddCircleOutline className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                    <span className="text-sm font-medium text-gray-300 hover:text-indigo-400">Add Professor</span>
                  </div>
                </Link>
                <Link href="/dashboard/professor_list">
                  <div className="p-2 hover:bg-indigo-500/10 rounded transition-colors flex items-center gap-2"
                  onClick={() => handleDropdownClick('director', true)}
                  >
                    <MdList className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                    <span className="text-sm font-medium text-gray-300 hover:text-indigo-400">Professor List</span>
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Add Member Dropdown */}
        <motion.div className="relative">
          <motion.button
            onClick={() => handleDropdownClick('addMember')}
            className={`w-full flex items-center justify-between p-2 rounded space-x-2 cursor-pointer transition-all ${
              isDropdownActive(['/dashboard/member_add']) ? 'bg-indigo-600/30' : 'hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Image src="/icons/add_member.png" alt="Add Member" width={24} height={24} className="w-5 h-5" />
              <span className="font-medium">Add Member</span>
            </div>
            <motion.div animate={{ rotate: activeDropdown === 'addMember' ? 180 : 0 }}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {activeDropdown === 'addMember' && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={dropdownVariants}
                className="ml-8 pl-3 border-l-2 border-indigo-500/20"
              >
                {[
                  { 
                    path: '/dashboard/member_add/phd_candidate_add', 
                    label: 'PhD Candidate',
                    icon: <FiAward className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                  },
                  { 
                    path: '/dashboard/member_add/masters_candidate_add', 
                    label: "Master's",
                    icon: <GiArchiveResearch className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                  },
                  { 
                    path: '/dashboard/member_add/postdoc_candidate_add', 
                    label: 'Post Doc',
                    icon: <FiBook className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                  },
                  { 
                    path: '/dashboard/member_add/staff_member_add', 
                    label: 'Staff',
                    icon: <FiBriefcase className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                  }
                ].map((item) => (
                  <Link key={item.path} href={item.path}>
                    <div className="p-2 hover:bg-indigo-500/10 rounded transition-colors flex items-center gap-2"
                    onClick={() => handleDropdownClick('addMember', true)}
                    >
                      {item.icon}
                      <span className="text-sm font-medium text-gray-300 hover:text-indigo-400">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Member List Dropdown */}
        <motion.div className="relative">
          <motion.button
            onClick={() => handleDropdownClick('memberList')}
            className={`w-full flex items-center justify-between p-2 rounded space-x-2 cursor-pointer transition-all ${
              isDropdownActive(['/dashboard/member_list']) ? 'bg-indigo-600/30' : 'hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Image src="/icons/member_list.svg" alt="Member List" width={24} height={24} className="w-5 h-5" />
              <span className="font-medium">Member List</span>
            </div>
            <motion.div animate={{ rotate: activeDropdown === 'memberList' ? 180 : 0 }}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {activeDropdown === 'memberList' && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={dropdownVariants}
                className="ml-8 pl-3 border-l-2 border-indigo-500/20"
              >
                {[
                  {
                    path: '/dashboard/member_list/phd_candidate_list',
                    label: 'PhD',
                    icon: <FiAward className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                  },
                  {
                    path: '/dashboard/member_list/masters_candidate_list',
                    label: "Master's",
                    icon: <GiArchiveResearch className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                  },
                  {
                    path: '/dashboard/member_list/postdoc_candidate_list',
                    label: 'Post Docs',
                    icon: <FiBook className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                  },
                  {
                    path: '/dashboard/member_list/staff_member_list',
                    label: 'Staff Members',
                    icon: <FiBriefcase className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                  }
                ].map((item) => (
                  <Link key={item.path} href={item.path}>
                    <div className="p-2 hover:bg-indigo-500/10 rounded transition-colors flex items-center gap-2"
                    onClick={() => handleDropdownClick('memberList', true)}
                    >
                      {item.icon}
                      <span className="text-sm font-medium text-gray-300 hover:text-indigo-400">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* System Monitor */}
        <motion.div variants={navItemVariants} whileHover="hover" className="group">
          <Link href="/dashboard/system_monitor">
            <div className={`flex items-center p-2 rounded space-x-2 cursor-pointer transition-all ${
              isActive('/dashboard/system_monitor') ? 'bg-indigo-600/30 text-indigo-400' : 'hover:bg-gray-800/50'
            }`}>
              <Image src="/icons/SystemMonitor.png" alt="System Monitor" width={24} height={24} className="w-5 h-5" />
              <span className="font-medium">System Monitor</span>
            </div>
          </Link>
        </motion.div>

        {/* Messages */}
        <motion.div variants={navItemVariants} whileHover="hover" className="group">
          <Link href="/dashboard/message">
            <div className={`flex items-center p-2 rounded space-x-2 cursor-pointer transition-all ${
              isActive('/dashboard/message') ? 'bg-indigo-600/30 text-indigo-400' : 'hover:bg-gray-800/50'
            }`}>
              <Image src="/icons/message.png" alt="Message" width={24} height={24} className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </div>
          </Link>
        </motion.div>
        {/* NEW: Under Development Section */}
        <div className="pt-4 border-t border-gray-700/50 mt-2">
          <p className="text-xs uppercase text-gray-400 tracking-wider pl-2 mb-2">Under Development</p>
          
          {/* Publication/Research */}
          <motion.div variants={navItemVariants} whileHover="hover" className="group">
            <div className={`flex items-center p-2 rounded space-x-2 cursor-not-allowed transition-all opacity-50`}>
              <FiBookOpen className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Publication/Research</span>
            </div>
          </motion.div>

          {/* Gallery */}
          <motion.div variants={navItemVariants} whileHover="hover" className="group">
            <div className={`flex items-center p-2 rounded space-x-2 cursor-not-allowed transition-all opacity-50`}>
              <FiImage className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Gallery</span>
            </div>
          </motion.div>

          {/* Course */}
          <motion.div variants={navItemVariants} whileHover="hover" className="group">
            <div className={`flex items-center p-2 rounded space-x-2 cursor-not-allowed transition-all opacity-50`}>
              <FiBook className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Course</span>
            </div>
          </motion.div>

          {/* Video */}
          <motion.div variants={navItemVariants} whileHover="hover" className="group">
            <div className={`flex items-center p-2 rounded space-x-2 cursor-not-allowed transition-all opacity-50`}>
              <FiVideo className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Video</span>
            </div>
          </motion.div>

          {/* Software */}
          <motion.div variants={navItemVariants} whileHover="hover" className="group">
            <div className={`flex items-center p-2 rounded space-x-2 cursor-not-allowed transition-all opacity-50`}>
              <FiCode className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Software</span>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <p className="text-xs text-center text-gray-400">
          © {new Date().getFullYear()} <a href="https://www.mvsdlab.com" target="_blank" className="font-semibold text-white hover:text-indigo-400 transition duration-300">
            MVSD LAB
          </a>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            Innovation Through Collaboration
          </span>
        </p>
      </div>
    </motion.aside>
  );
}
'use client';

import Link from 'next/link';
import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardSidebar({ isOpen, toggleDashboardSidebar }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const pathname = usePathname();

  const handleClickOutside = useCallback((event) => {
    if (!event.target.closest('aside') && isOpen) {
      toggleDashboardSidebar();
    }
  }, [isOpen, toggleDashboardSidebar]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  const handleDropdownClick = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const isActive = (path) => pathname === path;
  const isDropdownActive = (paths) => paths.some((path) => pathname.startsWith(path));

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 }
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
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className="fixed md:relative top-0 left-0 w-72 h-full bg-gray-900/80 backdrop-blur-lg text-white z-50 shadow-2xl overflow-hidden md:translate-x-0"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700/50 relative group">
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
            className="hover:scale-105 transition-transform duration-300"
          />
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-30 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-160px)]">
        {/* Dashboard */}
        <motion.div variants={navItemVariants} whileHover="hover" className="group">
          <Link href="/dashboard">
            <div className={`flex items-center p-3 rounded-xl space-x-3 cursor-pointer transition-all ${
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
            <div className={`flex items-center p-3 rounded-xl space-x-3 cursor-pointer transition-all ${
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
            <div className={`flex items-center p-3 rounded-xl space-x-3 cursor-pointer transition-all ${
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
            <div className={`flex items-center p-3 rounded-xl space-x-3 cursor-pointer transition-all ${
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
            className={`w-full flex items-center justify-between p-3 rounded-xl space-x-3 cursor-pointer transition-all ${
              isDropdownActive(['/dashboard/director_add', '/dashboard/director_list']) ? 'bg-indigo-600/30' : 'hover:bg-gray-800/50'
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
                  <div className="p-2 hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-gray-300 hover:text-indigo-400">Add Director</span>
                  </div>
                </Link>
                <Link href="/dashboard/director_list">
                  <div className="p-2 hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-gray-300 hover:text-indigo-400">Director List</span>
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
            className={`w-full flex items-center justify-between p-3 rounded-xl space-x-3 cursor-pointer transition-all ${
              isDropdownActive(['/dashboard/professor_add', '/dashboard/professor_list']) ? 'bg-indigo-600/30' : 'hover:bg-gray-800/50'
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
                  <div className="p-2 hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-gray-300 hover:text-indigo-400">Add Professor</span>
                  </div>
                </Link>
                <Link href="/dashboard/professor_list">
                  <div className="p-2 hover:bg-indigo-500/10 rounded-lg transition-colors">
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
            className={`w-full flex items-center justify-between p-3 rounded-xl space-x-3 cursor-pointer transition-all ${
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
                  { path: '/dashboard/member_add/phd_candidate_add', label: 'PhD Candidate' },
                  { path: '/dashboard/add_member/post_doc_candidate', label: 'Post Doc' },
                  { path: '/dashboard/add_member/masc_candidate', label: "Master's" },
                  { path: '/dashboard/add_member/staff', label: 'Staff' }
                ].map((item) => (
                  <Link key={item.path} href={item.path}>
                    <div className="p-2 hover:bg-indigo-500/10 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-300 hover:text-indigo-400">{item.label}</span>
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
            className={`w-full flex items-center justify-between p-3 rounded-xl space-x-3 cursor-pointer transition-all ${
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
                <Link href="/dashboard/member_list/phd_candidate_list">
                  <div className="p-2 hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-gray-300 hover:text-indigo-400">PhD Candidates</span>
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* System Monitor */}
        <motion.div variants={navItemVariants} whileHover="hover" className="group">
          <Link href="/dashboard/system_monitor">
            <div className={`flex items-center p-3 rounded-xl space-x-3 cursor-pointer transition-all ${
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
            <div className={`flex items-center p-3 rounded-xl space-x-3 cursor-pointer transition-all ${
              isActive('/dashboard/message') ? 'bg-indigo-600/30 text-indigo-400' : 'hover:bg-gray-800/50'
            }`}>
              <Image src="/icons/message.png" alt="Message" width={24} height={24} className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </div>
          </Link>
        </motion.div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <p className="text-xs text-center text-gray-400">
          © {new Date().getFullYear()} MVSD LAB
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            Innovation Through Collaboration
          </span>
        </p>
      </div>
    </motion.aside>
  );
}
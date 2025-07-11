// app/member_dashboard/page.js
'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../components/withAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import AddPublication from './add_publication/page';
import PublicationList from './list_publication/page';
import { 
  FiHome, FiFileText, FiUsers, FiSettings, FiLogOut, FiChevronDown, 
  FiChevronUp, FiBox, FiDatabase, FiStar, FiClock, FiMenu, FiX 
} from 'react-icons/fi';
import { FaSun, FaMoon } from 'react-icons/fa';
import { LiaProjectDiagramSolid } from "react-icons/lia";

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: '-100%' },
};

const menuItems = [
  { 
    name: 'Dashboard', 
    icon: <FiHome className="w-5 h-5" />,
    link: 'dashboard',
    subItems: []
  },
  { 
    name: 'Research/Publication', 
    icon: <LiaProjectDiagramSolid className="w-5 h-5" />,
    subItems: [
      { name: 'Add Publication', link: 'add_publication' },
      { name: 'Publication List', link: 'list_publication' }
    ]
  }
];


const MemberDashboard = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialLoad, setInitialLoad] = useState(true);

  // Responsive layout effects
  useEffect(() => {
    setMounted(true);
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setSidebarOpen(desktop); // Auto-open sidebar on desktop
    };
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    // Initial checks
    checkDesktop();
    checkMobile();
    
    // Event listeners for resize
    window.addEventListener('resize', checkDesktop);
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkDesktop);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/member_dashboard');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setMemberData(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        router.push('/login');
      }
    };
    fetchData();
  }, [router]);

  // Access denied notification effect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('accessDenied')) {
      params.delete('accessDenied');
      router.replace(window.location.pathname);
    }
    setInitialLoad(false);
  }, [router]);
  

  // Logout handler
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Logout failed');
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  // Submenu toggle handler
  const toggleSubMenu = (menuName) => {
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

  if (!mounted || loading) return <LoadingSpinner />;

  return (
    <div className={`min-h-screen overflow-x-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Mobile Menu Toggle */}
      {!isDesktop && (
        <AnimatePresence>
          {!sidebarOpen && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(true)}
              className={`fixed z-[70] top-4 left-4 p-2 lg:hidden ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}
            >
              <FiMenu className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={isDesktop ? "open" : "closed"}
        animate={isDesktop ? "open" : sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 w-72 z-[60] flex flex-col justify-between ${
          darkMode 
            ? 'bg-gray-800 border-r border-gray-700' 
            : 'bg-white border-r border-gray-200'
        }`}
      >
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative p-2 flex flex-col items-center">
            {/* Close Button */}
            {!isDesktop && (
              <FiX 
                onClick={() => setSidebarOpen(false)}
                className={`absolute top-3 right-3 cursor-pointer ${
                  darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'
                } transition-colors`}
              />
            )}

            {/* Centered Logo */}
            <div className="w-full flex justify-center mb-2">
            <Image 
              src={darkMode ? "/images/memberDashboardSidebar_logo_dark.svg" : "/images/memberDashboardSidebar_logo_light.svg"} 
              alt="Dashboard Logo"
              width={150} // Adjust width as needed
              height={64} // Adjust height as needed
              priority // Ensures the image loads quickly
            />
            </div>

            {/* Subtle Separator */}
            <div className={`w-full h-px ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} />
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <div key={item.name}>
                <motion.div
                  className={`flex items-center p-3 rounded cursor-pointer ${
                    activeMenu === item.link || item.subItems.some(sub => sub.link === activeMenu)
                      ? `${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`
                      : `${darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-100/50 text-gray-700'}`
                  }`}
                  onClick={() => {
                    item.link && setActiveMenu(item.link);
                    item.subItems.length === 0 && setSidebarOpen(false);
                    toggleSubMenu(item.name);
                  }}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium flex-1">{item.name}</span>
                  {item.subItems.length > 0 && (
                    <motion.span
                      animate={{ rotate: openSubMenu === item.name ? 180 : 0 }}
                      className="text-lg"
                    >
                      {openSubMenu === item.name ? <FiChevronUp /> : <FiChevronDown />}
                    </motion.span>
                  )}
                </motion.div>
                {/* Submenu Items */}
                {item.subItems.length > 0 && openSubMenu === item.name && (
                  <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`ml-6 mt-2 pl-4 border-l-2 ${
                    darkMode 
                      ? 'border-gray-600/50' 
                      : 'border-gray-300/50'
                  }`}
                >
                  {/* In the navigation menu where subItems are mapped */}
                {item.subItems.map((subItem) => (
                  <div
                    key={subItem.name}
                    className={`p-2.5 text-sm rounded mb-1 transition-colors cursor-pointer select-none ${
                      darkMode 
                        ? 'hover:bg-gray-700/30 text-gray-300' 
                        : 'hover:bg-gray-100/70 text-gray-700'
                    }`}
                    onClick={() => {
                      setActiveMenu(subItem.link);
                      setSidebarOpen(false);
                    }}
                  >
                    {subItem.name}
                  </div>
                ))}
                </motion.div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Fixed Footer at Bottom */}
      <div className={`p-4 text-center border-t ${
        darkMode 
          ? 'border-gray-700 text-gray-400' 
          : 'border-gray-200 text-gray-500'
      }`}>
        <p className="text-xs">
          ©{" "}
          <a 
            href="https://www.mvsdlab.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`hover:underline ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            MVSD LAB
          </a>, {new Date().getFullYear()}, All Rights Reserved.
        </p>
    </div>

  </motion.aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isDesktop ? 'ml-72' : ''}`}>
      <nav className={`fixed top-0 ${isDesktop ? 'left-72' : 'left-0'} right-0 z-50 p-4 border-b ${
        darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
      <div className="flex items-center justify-between">
        {/* Dark Mode Toggle (Desktop only) */}
        <div className="hidden md:flex items-center space-x-4">
          <motion.div 
            className={`relative w-14 h-8 rounded-full p-1 cursor-pointer ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
            onClick={() => setDarkMode(!darkMode)}
          >
            <motion.div
              className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center shadow ${
                darkMode 
                  ? 'bg-gray-600 text-yellow-400' 
                  : 'bg-white text-blue-600'
              }`}
              animate={{
                x: darkMode ? 26 : 0,
                transition: { type: 'spring', stiffness: 300 }
              }}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </motion.div>
          </motion.div>
        </div>

        {/* Dashboard Title */}
        <div className="flex justify-center items-center h-full w-full">
          <h1 className={`text-lg md:text-xl font-bold ${
            darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400' 
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600'
          }`}>
            MEMBER DASHBOARD
          </h1>
        </div>

        {/* Modern Profile Section */}
        <div className="relative">
        <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center space-x-4 cursor-pointer group"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            {/* Profile Image with Status Indicator */}
            <div className="relative w-12 h-12"> {/* Ensures fixed size */}
              <Image
                src={memberData?.photo || '/default-avatar.jpg'}
                alt="Profile"
                width={48}
                height={48}
                className="w-full h-full rounded-full border-2 object-cover"
              />

              {/* Animated Status Dot */}
              {memberData?.status === 'Active' && (
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ 
                          opacity: [0.4, 1, 0.4],
                          scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                          darkMode ? 'border-gray-800' : 'border-white'
                      } bg-green-400`}
                  />
              )}
            </div>

            {/* Modern Desktop Profile Info */}
            {isDesktop && (
              <div className="transition-all flex flex-col leading-tight">
                {/* ID */}
                <span className="font-mono font-bold text-md bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                  {memberData?.id}
                </span>
                
                {/* Type (Below ID) */}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                  {memberData?.type}
                </span>
              </div>
            )}
          </motion.div>


      {/* Profile Dropdown Menu */}
      <AnimatePresence>
        {profileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className={`absolute right-0 mt-3 max-w-[90vw] min-w-[16rem] rounded shadow-2xl backdrop-blur-lg ${
              darkMode 
                ? 'bg-gray-800/95 border border-gray-700/60' 
                : 'bg-white/95 border border-gray-200/60'
            }`}
          >
            {/* Profile Header */}
            <div className={`p-4 border-b ${
              darkMode ? 'border-gray-700/60' : 'border-gray-200/60'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="min-w-0">
                  <p className={`font-medium truncate ${
                    darkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    {memberData?.first_name} {memberData?.last_name}
                  </p>
                  <p className={`text-sm break-words overflow-wrap-anywhere ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {memberData?.email}
                  </p>
                  {/* Mobile-only Type Display */}
                  {isMobile && (
                    <div className="mt-1">
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-500' : 'text-gray-600'
                      }`}>
                        {memberData?.type}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Dark Mode Toggle */}
            <div className="md:hidden p-4 border-b">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Theme
                </span>
                <motion.div 
                  className={`relative w-14 h-8 rounded-full p-1 cursor-pointer ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <motion.div
                    className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center shadow ${
                      darkMode 
                        ? 'bg-gray-600 text-yellow-400' 
                        : 'bg-white text-blue-600'
                    }`}
                    animate={{
                      x: darkMode ? 26 : 0,
                      transition: { type: 'spring', stiffness: 300 }
                    }}
                  >
                    {darkMode ? <FaSun /> : <FaMoon />}
                  </motion.div>
                </motion.div>        
            </div>
          </div>

          <div className="p-2 space-y-1">
          <motion.button
            whileHover={{ x: 5 }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700/50' 
                : 'hover:bg-gray-100/50'
            }`}
          >
            <FiSettings className={`text-lg ${
              darkMode ? 'text-purple-400' : 'text-blue-500'
            }`}/>
            <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
              Account Settings
            </span>
          </motion.button>

          <motion.button
            whileHover={{ x: 5 }}
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-colors ${
              darkMode 
                ? 'hover:bg-red-500/20' 
                : 'hover:bg-red-100/50'
            }`}
          >
            <FiLogOut className={`text-lg ${
              darkMode ? 'text-red-400' : 'text-red-500'
            }`}/>
            <span className={darkMode ? 'text-red-400' : 'text-red-500'}>
              Sign Out
            </span>
          </motion.button>
        </div>

        {/* Interactive ID Badge */}
        <motion.div
          whileHover={{ scale: 1.05, boxShadow: darkMode 
            ? '0 4px 24px -2px rgba(99, 102, 241, 0.3)' 
            : '0 4px 24px -2px rgba(79, 70, 229, 0.2)' }}
          whileTap={{ scale: 0.98 }}
          className={`relative px-4 py-2 rounded border mx-auto my-2 ${
            darkMode 
              ? 'border-gray-700/60 bg-gray-800/80 backdrop-blur-lg' 
              : 'border-gray-200/60 bg-white/90 backdrop-blur-lg'
          }`}
          style={{ width: 'fit-content' }}
        >
          <div className="flex items-center gap-2 justify-center"> {/* Added justify-center */}
            {/* Animated Icon */}
            <motion.div 
              animate={{ rotate: [0, 15, -15, 0] }} 
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </motion.div>

            {/* ID Text with Gradient Underline */}
            <div className="relative text-center"> {/* Added text-center */}
              <span className={`font-mono text-sm tracking-wider block ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {memberData?.id}
              </span>
            </div>
          </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="p-8 h-full pt-28"> {/* Added pt-20 for spacing */}
        {activeMenu === 'dashboard' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Research Papers', value: 12, icon: <FiFileText /> },
              { title: 'Publications', value: 3, icon: <LiaProjectDiagramSolid /> },
              { title: 'Ongoing Projects', value: 8, icon: <FiDatabase /> }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded shadow-sm ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700/80' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    {React.cloneElement(card.icon, {
                      className: `w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`
                    })}
                  </div>
                  <span className={`text-3xl font-bold ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {card.value}
                  </span>
                </div>
                <h3 className={`mt-4 text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {card.title}
                </h3>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-8 p-6 rounded ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Recent Activity
              </h2>
              <FiClock className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded flex items-center space-x-4 ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    darkMode ? 'bg-green-400' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <div className={`h-3 rounded-full mb-2 w-3/4 ${
                      darkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`} />
                    <div className={`h-2 rounded-full w-1/2 ${
                      darkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`} />
                  </div>
                  <div className={`h-2 rounded-full w-1/4 ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`} />
                </motion.div>
              ))}
            </div>
          </motion.div>
          </>
          )}

          {/* Add Publication Page */}
          {activeMenu === 'add_publication' && (
            <AddPublication darkMode={darkMode} />
          )}
        
          {/* Publication List Page (You can create similarly) */}
          {activeMenu === 'list_publication' && (
            <PublicationList darkMode={darkMode} />
          )}
        </div>

      </main>
    </div>
  );
}

export default withAuth(MemberDashboard, 'member'); // <-- Required role
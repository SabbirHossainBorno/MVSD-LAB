// app/member_dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../components/withAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaSun, FaMoon } from 'react-icons/fa';
import { FiChevronDown, FiChevronUp, FiSettings, FiLogOut } from 'react-icons/fi';

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: '-100%' },
};

const menuItems = [
  { 
    name: 'Dashboard', 
    icon: '📊',
    link: 'dashboard',
    subItems: []
  },
  { 
    name: 'Research', 
    icon: '🔬',
    subItems: [
      { name: 'Publications', link: 'publications' },
      { name: 'Projects', link: 'projects' }
    ]
  },
  { 
    name: 'Collaborations', 
    icon: '🤝',
    subItems: [
      { name: 'Partners', link: 'partners' },
      { name: 'Conferences', link: 'conferences' }
    ]
  },
  { 
    name: 'Settings', 
    icon: '⚙️',
    link: 'settings',
    subItems: []
  }
];

const MemberDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [isDesktop, setIsDesktop] = useState(true); // Default to desktop to match server render
  const [mounted, setMounted] = useState(false); // Track client-side mount
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true); // Mark client-side mount
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setSidebarOpen(desktop);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

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

  useEffect(() => {
    if (searchParams.get('accessDenied')) {
      toast.error('Access Denied! You do not have permission to view this page.');
    }
  }, [searchParams]);

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

  const toggleSubMenu = (menuName) => {
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

  if (!mounted || loading) return <LoadingSpinner />;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Mobile Menu Toggle */}
      {!isDesktop && (
        <motion.button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`fixed z-50 top-6 ${sidebarOpen ? 'right-6' : 'left-6'} p-2 lg:hidden ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}
          animate={sidebarOpen ? 'open' : 'closed'}
          variants={{
            open: { rotate: 180 },
            closed: { rotate: 0 }
          }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {sidebarOpen ? '✕' : '☰'}
        </motion.button>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={isDesktop ? "open" : "closed"}
        animate={isDesktop ? "open" : sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 w-64 z-40 shadow-xl ${
          darkMode 
            ? 'bg-gray-800/95 backdrop-blur-md text-gray-100' 
            : 'bg-white/95 backdrop-blur-md text-gray-800'
        }`}
      >
        <div className="p-4 flex justify-center items-center">
          <img 
            src={darkMode ? "/images/memberDashboardSidebar_logo_dark.svg" : "/images/memberDashboardSidebar_logo_light.svg"} 
            alt="MVSD Lab Logo" 
            className="h-14 w-auto"
          />
        </div>

        <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.name}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`flex items-center p-3 rounded cursor-pointer transition-all ${
                activeMenu === item.link 
                  ? 'bg-blue-500/10 text-blue-600' 
                  : 'hover:bg-gray-100/20'
              }`}
              onClick={() => {
                item.link && setActiveMenu(item.link);
                item.subItems.length === 0 && setSidebarOpen(false);
                toggleSubMenu(item.name);
              }}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              <span className="font-medium flex-1">{item.name}</span>
              {item.subItems.length > 0 && (
                <motion.span
                  initial={{ rotate: 0 }}
                  animate={{ rotate: openSubMenu === item.name ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg"
                >
                  {openSubMenu === item.name ? <FiChevronUp /> : <FiChevronDown />}
                </motion.span>
              )}
            </motion.div>
            {item.subItems.length > 0 && openSubMenu === item.name && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="ml-8 mt-1 space-y-1"
              >
                {item.subItems.map((subItem) => (
                  <div
                    key={subItem.name}
                    className="p-2 text-sm rounded hover:bg-gray-100/20 cursor-pointer"
                    onClick={() => setActiveMenu(subItem.link)}
                  >
                    {subItem.name}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </nav>
      </motion.aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isDesktop ? 'ml-64' : ''}`}>
        <nav className={`p-4 ${
          darkMode 
            ? 'bg-gray-800/80 backdrop-blur-sm' 
            : 'bg-white/80 backdrop-blur-sm'
        }`}>
          <div className="flex items-center justify-between">
         {/* Toggle switch component */}
            <motion.div 
              className={`relative w-14 h-8 rounded-full p-1 cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-r from-gray-800 to-gray-700' 
                  : 'bg-gradient-to-r from-blue-200 to-blue-100'
              }`}
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
                  darkMode 
                    ? 'bg-gray-600 text-yellow-400' 
                    : 'bg-white text-blue-600'
                }`}
                animate={{
                  x: darkMode ? 26 : 0,
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                whileTap={{ scale: 0.9 }}
              >
                {darkMode ? (
                  <FaSun className="w-4 h-4 transition-opacity duration-200" />
                ) : (
                  <FaMoon className="w-4 h-4 transition-opacity duration-200" />
                )}
              </motion.div>
              
              {/* Optional background icons */}
              <div className="flex justify-between w-full h-full">
                <FaMoon className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-transparent'}`} />
                <FaSun className={`w-4 h-4 ${!darkMode ? 'text-gray-500' : 'text-transparent'}`} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20, rotateX: -30 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="flex flex-col items-center gap-3 relative group"
            >
              {/* Animated Background Effect */}
              <div className={`absolute -inset-2 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-500/40 to-purple-500/40' 
                  : 'bg-gradient-to-r from-blue-300/40 to-purple-300/40'
              }`}></div>

              {/* Modern Title with Gradient Text */}
              <h1 className={`text-center font-extrabold bg-clip-text ${
                darkMode 
                  ? 'text-transparent bg-gradient-to-r from-blue-400 to-purple-300' 
                  : 'text-transparent bg-gradient-to-r from-blue-600 to-purple-600'
              }`}
              style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
                MEMBER<span className="sr-only"> </span>
                <span className="font-light mx-2">|</span>DASHBOARD
              </h1>
            </motion.div>

            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => setProfileOpen(!profileOpen)}
                tabIndex={0}
              >
                <div className="relative">
                  <Image
                    src={memberData?.photo || '/default-avatar.jpg'}
                    alt="Profile"
                    width={52}
                    height={52}
                    className={`rounded border-3 transition-all duration-300 ${
                      darkMode 
                        ? 'border-purple-400/30 hover:border-purple-400/60' 
                        : 'border-blue-100 hover:border-blue-200'
                    }`}
                  />
                  <div className={`absolute inset-0 rounded shadow-lg ${
                    darkMode ? 'shadow-purple-500/10' : 'shadow-blue-500/10'
                  }`}/>
                </div>
                
                <div className="flex flex-col items-start">
                  <span className={`font-semibold text-lg transition-colors ${
                    darkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    {memberData?.first_name}
                  </span>
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {memberData?.type}
                  </span>
                </div>
                
                <motion.div
                  animate={{ rotate: profileOpen ? 180 : 0 }}
                  className={`text-xl ${
                    darkMode ? 'text-purple-300' : 'text-blue-500'
                  }`}
                >
                  <FiChevronDown />
                </motion.div>
              </motion.div>

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
                    style={{
                      boxShadow: darkMode 
                        ? '0 8px 32px rgba(0,0,0,0.28)' 
                        : '0 8px 32px rgba(0,0,0,0.08)'
                    }}
                  >
                    {/* Profile Header */}
                    <div className={`p-4 border-b ${
                      darkMode ? 'border-gray-700/60' : 'border-gray-200/60'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <Image
                          src={memberData?.photo || '/default-avatar.jpg'}
                          alt="Profile"
                          width={44}
                          height={44}
                          className="rounded border-2 border-white/20 flex-shrink-0"
                        />
                        <div className="min-w-0"> {/* Added min-w-0 for text truncation */}
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
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
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
                      className={`relative px-4 py-2 rounded border ${
                        darkMode 
                          ? 'border-gray-700/60 bg-gray-800/80 backdrop-blur-lg' 
                          : 'border-gray-200/60 bg-white/90 backdrop-blur-lg'
                      }`}
                    >
                      <div className="flex items-center gap-2">
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
                        <div className="relative">
                          <span className={`font-mono text-sm tracking-wider ${
                            darkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {memberData?.id}
                          </span>
                          <div className={`absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r ${
                            darkMode 
                              ? 'from-blue-400/60 to-purple-400/60' 
                              : 'from-blue-500/60 to-purple-500/60'
                          }`}></div>
                        </div>
                      </div>

                      {/* Animated Background Pattern */}
                      <div className={`absolute inset-0 rounded opacity-10 ${
                        darkMode ? 'bg-[url("/pattern-dark.svg")]' : 'bg-[url("/pattern-light.svg")]'
                      }`}></div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Research Papers', value: 12 },
              { title: 'Ongoing Projects', value: 3 },
              { title: 'Collaborations', value: 8 }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded shadow-lg transition-all ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700/80' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <h3 className={`text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {card.title}
                </h3>
                <p className={`text-3xl font-bold mt-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {card.value}
                </p>
                <motion.div 
                  className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.2 }}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-8 p-6 rounded shadow-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h2 className={`text-xl font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${
                      darkMode ? 'bg-green-400' : 'bg-green-500'
                    }`} />
                    <div className={`h-4 w-1/3 rounded ${
                      darkMode ? 'bg-gray-600' : 'bg-gray-200'
                    }`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(MemberDashboard);
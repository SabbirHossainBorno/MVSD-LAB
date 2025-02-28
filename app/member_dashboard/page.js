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

  if (!mounted || loading) return <LoadingSpinner />;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Mobile Menu Toggle */}
      {!isDesktop && (
        <motion.button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`fixed z-50 top-6 right-6 p-2 lg:hidden ${
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
                }}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </motion.div>
              {item.subItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ml-8 mt-1 space-y-1"
                >
                  {item.subItems.map((subItem) => (
                    <div
                      key={subItem.name}
                      className="p-2 text-sm rounded hover:bg-gray-100/20 cursor-pointer"
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
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.1 }}
              className={`p-2 rounded-full shadow-lg ${
                darkMode 
                  ? 'bg-gray-700 text-yellow-400' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {darkMode ? '🌞' : '🌙'}
            </motion.button>

            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center space-y-1"
            >
              <h1 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                MEMBER DASHBOARD PANEL
              </h1>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1 rounded ${
                  darkMode 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'bg-gradient-to-r from-blue-400 to-purple-400 text-white'
                }`}
              >
                <span className="font-mono text-sm tracking-wide">
                  {memberData?.id}
                </span>
              </motion.div>
            </motion.div>

            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setProfileOpen(!profileOpen)}
                onBlur={() => setProfileOpen(false)}
                tabIndex={0}
              >
                <Image
                  src={memberData?.photo || '/default-avatar.jpg'}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-blue-500"
                />
                <span className={`font-medium ${
                  darkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  {memberData?.first_name}
                </span>
              </motion.div>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-48 rounded shadow-xl ${
                      darkMode 
                        ? 'bg-gray-800 border border-gray-700' 
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <button className="w-full px-4 py-3 text-left hover:bg-gray-100/20">
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left hover:bg-red-500/10 text-red-500"
                    >
                      Logout
                    </button>
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
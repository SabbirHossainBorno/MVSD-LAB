// app/member_dashboard/page.js
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../components/withAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import AddPublication from './add_publication/page';
import MemberDashboardNavbar from '../components/MemberDashboardNavbar';
import MemberDashboardSidebar from '../components/MemberDashboardSidebar';

const MemberDashboard = () => {
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

  useEffect(() => {
    setMounted(true);
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setSidebarOpen(desktop);
    };

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkDesktop();
    checkMobile();

    window.addEventListener('resize', checkDesktop);
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkDesktop);
      window.removeEventListener('resize', checkMobile);
    };
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
      <MemberDashboardNavbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        memberData={memberData}
        handleLogout={handleLogout}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        isDesktop={isDesktop}
        isMobile={isMobile}
      />
      <MemberDashboardSidebar
        darkMode={darkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        openSubMenu={openSubMenu}
        setOpenSubMenu={setOpenSubMenu}
        isDesktop={isDesktop}
      />
      <main className={`transition-all duration-300 ${isDesktop ? 'ml-64' : ''}`}>
        <div className="p-6 h-full">
          {activeMenu === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Research Papers', value: 12, icon: <FiFileText /> },
                  { title: 'Ongoing Projects', value: 3, icon: <FiDatabase /> },
                  { title: 'Collaborations', value: 8, icon: <FiUsers /> }
                ].map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded shadow-sm ${darkMode ? 'bg-gray-800 hover:bg-gray-700/80' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {React.cloneElement(card.icon, {
                          className: `w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`
                        })}
                      </div>
                      <span className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {card.value}
                      </span>
                    </div>
                    <h3 className={`mt-4 text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {card.title}
                    </h3>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-8 p-6 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
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
                      className={`p-4 rounded flex items-center space-x-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'}`} />
                      <div className="flex-1">
                        <div className={`h-3 rounded-full mb-2 w-3/4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                        <div className={`h-2 rounded-full w-1/2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                      </div>
                      <div className={`h-2 rounded-full w-1/4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
          {activeMenu === 'add_publication' && (
            <AddPublication darkMode={darkMode} />
          )}
          {activeMenu === 'list_publication' && (
            <div>{/* Your publication list component */}</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default withAuth(MemberDashboard);
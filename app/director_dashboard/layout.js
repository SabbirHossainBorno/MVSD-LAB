'use client';

import { useState, useEffect } from 'react';
import DirectorDashboardNavbar from '../components/DirectorDashboardNavbar';
import DirectorDashboardSidebar from '../components/DirectorDashboardSidebar';
import withAuth from '../components/withAuth';
import { motion, AnimatePresence } from 'framer-motion';

function DirectorsLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Close sidebar when switching from mobile to desktop
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [sidebarOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebarOpen && isMobile && sidebar && !sidebar.contains(e.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen, isMobile]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Fixed position with higher z-index */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ease-in-out 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static`}
      >
        <DirectorDashboardSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      </div>
      
      {/* Overlay for mobile - below sidebar but above content */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 w-full min-w-0">
        {/* Navbar with lower z-index than sidebar */}
        <div className="z-20">
          <DirectorDashboardNavbar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default withAuth(DirectorsLayout, 'director');
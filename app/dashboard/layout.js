// app/dashboard/layout.js
'use client';

import { useState, useCallback, useEffect } from 'react'; // Added useEffect import
import PropTypes from 'prop-types';
import Cookies from 'js-cookie'; // Added Cookies import
import Sidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import withAuth from '../components/withAuth';
import '../../app/globals.css';

function DashboardLayout({ children, isAuthenticated }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Added useEffect for cleanup
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('Cleaning up session before unload');
      Cookies.remove('lastActivity');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const toggleDashboardSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
      {isAuthenticated && (
        <>
          <Sidebar isOpen={isSidebarOpen} toggleDashboardSidebar={toggleDashboardSidebar} />
          <div className="flex-1 flex flex-col">
            <DashboardNavbar toggleDashboardSidebar={toggleDashboardSidebar} />
            <main className="flex-1 overflow-y-auto bg-gray-900 p-4">
              {children}
            </main>
          </div>
        </>
      )}
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default withAuth(DashboardLayout, 'admin');
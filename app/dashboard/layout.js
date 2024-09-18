// dashboard/layout.js
'use client';

import { useState } from 'react';
import Sidebar from '../components/DashboardSidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import DashboardWrapper from '../components/DashboardWrapper'; // Ensure correct path
import '../../app/globals.css';

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleDashboardSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <DashboardWrapper>
      {({ children }) => (
        <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
          <Sidebar isOpen={isSidebarOpen} toggleDashboardSidebar={toggleDashboardSidebar} />
          <div className="flex-1 flex flex-col">
            <DashboardNavbar toggleDashboardSidebar={toggleDashboardSidebar} />
            <main className="flex-1 overflow-y-auto bg-gray-900 p-4">
              {children}
            </main>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}

export default DashboardLayout;

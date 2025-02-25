// app/member_dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../components/withAuth'; // Ensure correct path
import LoadingSpinner from '../components/LoadingSpinner'; // Add a loading spinner component

function MemberDashboard() {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [memberData, setMemberData] = useState(null);
  const router = useRouter();

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
      name: 'Settings', 
      icon: '⚙️',
      link: 'settings',
      subItems: []
    }
  ];

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

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Logout failed');
      
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed z-50 top-4 left-4 p-2 lg:hidden ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 z-40 ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
      >
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">MVSD Lab</h2>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.name}>
              <div
                className={`flex items-center p-2 rounded-lg cursor-pointer ${
                  activeMenu === item.link ? 'bg-blue-100 dark:bg-blue-900' : ''
                } hover:bg-gray-100 dark:hover:bg-gray-700`}
                onClick={() => {
                  item.link && setActiveMenu(item.link);
                  item.subItems.length === 0 && setSidebarOpen(false);
                }}
              >
                <span className="mr-2">{item.icon}</span>
                <span>{item.name}</span>
              </div>
              {item.subItems.length > 0 && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <div
                      key={subItem.name}
                      className="p-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {subItem.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Navbar */}
        <nav className={`p-4 border-b ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-end items-center space-x-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              {darkMode ? '🌞' : '🌙'}
            </button>

            <div className="relative">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setProfileOpen(!profileOpen)}
                onBlur={() => setProfileOpen(false)}
                tabIndex={0}
              >
                <Image
                  src={memberData?.photo || '/default-avatar.jpg'}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>
                  {memberData?.first_name}
                </span>
              </div>

              {profileOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg">
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className={`p-6 rounded-xl shadow-sm ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Research Papers</h3>
              <p className={`text-2xl font-bold mt-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>12</p>
            </div>

            <div className={`p-6 rounded-xl shadow-sm ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Ongoing Projects</h3>
              <p className={`text-2xl font-bold mt-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>3</p>
            </div>

            <div className={`p-6 rounded-xl shadow-sm ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Collaborations</h3>
              <p className={`text-2xl font-bold mt-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>8</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(MemberDashboard);
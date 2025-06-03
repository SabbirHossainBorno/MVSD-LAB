'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Bell, User, Menu, LogOut } from 'react-feather';
import Cookies from 'js-cookie';

export default function DirectorDashboardNavbar({ onMenuClick, onDarkModeToggle }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [directorData, setDirectorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [avatarError, setAvatarError] = useState(false);

  // Fetch director data from dashboard API
  useEffect(() => {
    const fetchDirectorData = async () => {
      try {
        const response = await fetch('/api/director_dashboard');
        if (response.ok) {
          const data = await response.json();
          setDirectorData(data.director);
        } else {
          console.error('Failed to fetch director data');
        }
      } catch (error) {
        console.error('Error fetching director data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectorData();
  }, []);

  // Dark mode initialization
  useEffect(() => {
    const isDark = Cookies.get('darkMode') === 'true';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    if (onDarkModeToggle) onDarkModeToggle(isDark);
  }, [onDarkModeToggle]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    Cookies.set('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
    if (onDarkModeToggle) onDarkModeToggle(newMode);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left section with menu button and centered title */}
      <div className="flex items-center flex-1">
        <button 
          className="md:hidden mr-4 text-gray-600 dark:text-gray-300"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
        
        {/* Centered title */}
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white text-center">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              MVSD LAB
            </span> Director Dashboard
          </h1>
        </div>
      </div>
      
      {/* Right section with icons */}
      <div className="flex items-center space-x-6">
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-yellow-300 shadow transition-all hover:scale-105"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 relative shadow transition-all hover:scale-105"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-lg z-50 border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">No new notifications</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 group"
          >
            {!loading && directorData?.photo && !avatarError ? (
              <img 
                src={directorData.photo} 
                alt={directorData.fullName} 
                className="w-10 h-10 rounded-full object-cover shadow group-hover:scale-105 transition-transform"
                onError={() => setAvatarError(true)} // Set error state on failure
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow group-hover:scale-105 transition-transform">
                {!loading ? (directorData?.firstName?.charAt(0) || 'D') : 'D'}
              </div>
            )}
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md z-50 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {directorData?.email || 'director@mvsdlab.edu'}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {directorData?.id || 'DR-2024-001'}
                </p>
              </div>
              <button 
                onClick={() => router.push('/director_profile')}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <User size={16} className="mr-2" />
                My Profile
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
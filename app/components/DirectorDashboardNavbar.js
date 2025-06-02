'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Bell, User, Menu } from 'react-feather';
import Cookies from 'js-cookie';

export default function DirectorDashboardNavbar({ onMenuClick, onDarkModeToggle }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isDark = Cookies.get('darkMode') === 'true';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    onDarkModeToggle(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    Cookies.set('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
    onDarkModeToggle(newMode);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Mock director data
  const directorId = "DR-2024-001";
  const email = "director@mvsdlab.edu";

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button 
          className="md:hidden mr-4 text-gray-600 dark:text-gray-300"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            MVSD LAB
          </span> Director Dashboard
        </h1>
      </div>
      
      <div className="flex items-center space-x-6">
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-yellow-300 shadow transition-all hover:scale-105"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 relative shadow transition-all hover:scale-105"
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow group-hover:scale-105 transition-transform">
              {email.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-gray-700 dark:text-gray-300 font-medium">
              {directorId}
            </span>
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md z-50 py-1 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{email}</p>
                <p className="text-xs text-gray-500">{directorId}</p>
              </div>
              <button 
                onClick={() => router.push('/director_profile')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <User size={16} className="mr-2" />
                My Profile
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
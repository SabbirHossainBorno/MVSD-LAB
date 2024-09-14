'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardNavbar({ toggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New subscriber added', read: false },
    { id: 2, message: 'User profile updated', read: false },
  ]);
  const [currentTime, setCurrentTime] = useState('');

  // Update the time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };

    // Initial time setting
    updateTime();

    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (notificationId) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-gray-900 p-4 flex items-center justify-between shadow-md relative z-10">
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="text-white md:hidden focus:outline-none hover:bg-gray-800 p-2 rounded transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Title */}
      <div className="flex items-center flex-1 justify-center text-white text-xl font-semibold hidden md:flex">
        DASHBOARD
      </div>

      <div className="relative flex items-center space-x-4 md:space-x-6">
        {/* Clock Display */}
        <div className="text-white text-lg hidden md:flex items-center">
          <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg shadow-md">
            <span className="font-mono text-xl">{currentTime}</span>
          </div>
        </div>

        {/* Notifications Button */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative text-white hover:bg-gray-800 p-2 rounded-full transition-colors flex items-center"
        >
          <img src="/images/notification.png" alt="Notifications" className="w-6 h-6"/>
          {notifications.some(notification => !notification.read) && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 shadow-lg rounded-lg border border-gray-700 overflow-hidden z-20">
            <ul className="max-h-60 overflow-y-auto">
              {notifications.map(notification => (
                <li
                  key={notification.id}
                  className={`p-4 ${notification.read ? 'bg-gray-700' : 'bg-gray-600'} border-b border-gray-700 cursor-pointer hover:bg-gray-500 transition-colors`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  {notification.message}
                </li>
              ))}
              {notifications.length === 0 && (
                <li className="p-4 text-gray-400">No notifications</li>
              )}
            </ul>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="text-white hover:bg-gray-800 p-2 rounded-full transition-colors flex items-center"
        >
          <img src="/images/logout.png" alt="Logout" className="w-6 h-6"/>
        </button>

        {/* Profile Menu Button */}
        <div className="relative flex items-center">
          <span className="text-white mr-2 hidden md:block">ADMIN</span>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative text-white hover:bg-gray-800 p-2 rounded-full transition-colors"
          >
            <img src="/images/admin.png" alt="Profile" className="w-8 h-8 rounded-full"/>
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 shadow-lg rounded-lg border border-gray-700 overflow-hidden z-20">
              <ul>
                <li className="p-3 border-b border-gray-700 hover:bg-gray-700">
                  <Link href="/profile" className="block text-gray-300">Profile</Link>
                </li>
                <li className="p-3 border-b border-gray-700 hover:bg-gray-700">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-gray-300"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

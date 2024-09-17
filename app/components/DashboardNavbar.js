'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardNavbar({ toggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notification');
        const result = await response.json();
        if (response.ok) {
          // Sort notifications so that unread ones come first
          const sortedNotifications = result.sort((a, b) => a.status === 'Unread' ? -1 : 1);
          setNotifications(sortedNotifications);
        } else {
          console.error(result.message);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notificationId) => {
    try {
      await fetch(`/api/notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId, status: 'Read' }),
      });

      setNotifications(notifications.map(notification =>
        notification.id === notificationId ? { ...notification, status: 'Read' } : notification
      ));
    } catch (error) {
      console.error('Failed to update notification status:', error);
    }
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
      <button
        onClick={toggleSidebar}
        className="text-white md:hidden focus:outline-none hover:bg-gray-800 p-2 rounded transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <div className="flex items-center flex-1 justify-center text-white text-xl font-semibold hidden md:flex">
        DASHBOARD
      </div>

      <div className="relative flex items-center space-x-4 md:space-x-6">
        <div className="text-white text-lg hidden md:flex items-center">
          <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg shadow-md">
            <span className="font-mono text-xl">{currentTime}</span>
          </div>
        </div>

        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative text-white hover:bg-gray-800 p-2 rounded-full transition-colors flex items-center"
        >
          <img src="/images/notification.png" alt="Notifications" className="w-6 h-6"/>
          {notifications.some(notification => notification.status === 'Unread') && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 shadow-lg rounded-lg border border-gray-700 overflow-hidden z-20">
            <ul className="max-h-60 overflow-y-auto">
              {notifications.map(notification => (
                <li
                  key={notification.id}
                  className={`p-4 ${notification.status === 'Read' ? 'bg-gray-700' : 'bg-gray-600'} border-b border-gray-700 cursor-pointer hover:bg-gray-500 transition-colors`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  {notification.title}
                </li>
              ))}
              {notifications.length === 0 && (
                <li className="p-4 text-gray-400">No notifications</li>
              )}
            </ul>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="text-white hover:bg-gray-800 p-2 rounded-full transition-colors flex items-center"
        >
          <img src="/images/logout.png" alt="Logout" className="w-6 h-6"/>
        </button>

        <div className="relative flex items-center">
          <span className="text-white mr-2 hidden md:block">ADMIN</span>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative text-white hover:bg-gray-800 p-2 rounded-full transition-colors"
          >
            <img src="/images/admin.png" alt="Profile" className="w-8 h-8 rounded-full"/>
          </button>

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

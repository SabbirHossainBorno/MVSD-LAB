'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { FaSun, FaMoon } from 'react-icons/fa'; // Import icons
import { FiBell } from 'react-icons/fi';

export default function DashboardNavbar({ toggleDashboardSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [theme, setTheme] = useState('dark'); // Add theme state
  const notificationRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notification');
        const result = await response.json();
        if (response.ok) {
          const sortedNotifications = result.sort((a, b) =>
            a.status === 'Unread' ? -1 : 1
          );
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

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, status: 'Read' } : notification
        )
      );
    } catch (error) {
      console.error('Failed to update notification status:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.map((notification) =>
          fetch('/api/notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: notification.id, status: 'Read' }),
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Read' })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatRelativeTime = (timestamp) => {
    const difference = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return new Date(timestamp).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        Cookies.remove('email');
        Cookies.remove('sessionId');
        Cookies.remove('lastActivity');
        // Clear all cookies
        document.cookie.split(";").forEach(cookie => {
          document.cookie = cookie.trim().replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        toast.success('Logout Successful', {
          position: 'top-right', // Show toast message on success
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000); // Redirect after a delay for the toast to appear
      } else {
        toast.error('Logout Failed', {
          position: 'top-right',
        });
        console.error('Logout Failed');
      }
    } catch (error) {
      toast.error('Logout Failed', {
        position: 'top-right',
      });
      console.error('Logout Failed:', error);
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <>
      <nav className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} p-4 flex items-center justify-between shadow-md relative z-10`}>
        <button
          onClick={toggleDashboardSidebar}
          className={`${theme === 'dark' ? 'text-white' : 'text-black'} md:hidden focus:outline-none hover:bg-gray-800 p-2 rounded transition-colors`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <div className="flex items-center justify-center flex-1 text-transparent text-3xl lg:text-4xl font-bold tracking-tight md:text-4xl">
          <span className={`uppercase bg-clip-text ${theme === 'dark' ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500' : 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500'} animate-textGlow`}>
            Dashboard
          </span>
        </div>

        <div className="relative flex items-center space-x-4 md:space-x-6">
          <div className="relative flex items-center justify-center h-12 hidden md:flex">
            {/* Animated Gradient Background */}
            <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'} animate-gradient rounded blur opacity-40`}></div>

            {/* Main Content */}
            <div className={`relative z-10 flex items-center space-x-2 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} p-2 rounded shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
              <div className="text-center">
                <span className={`font-mono text-lg ${theme === 'dark' ? 'text-white' : 'text-black'} tracking-wide`}>
                  {currentTime}
                </span>
              </div>
              {/* Animated Pulse Dot */}
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`${theme === 'dark' ? 'text-white' : 'text-black'} hover:bg-gray-800 p-1 rounded-full transition-colors flex items-center`}
          >
            {theme === 'dark' ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>




          <div className="relative flex items-center space-x-4 md:space-x-6">
  {/* Notification Button */}
  <button
    onClick={() => setShowNotifications((prev) => !prev)}
    className={`relative ${theme === 'dark' ? 'text-white' : 'text-black'} hover:bg-gray-800 p-1 rounded-full transition-colors flex items-center`}
  >
    <FiBell size={20} className="md:hidden" /> {/* Smaller icon for mobile */}
    <FiBell size={20} className="hidden md:block" /> {/* Larger icon for desktop */}
    {notifications.some((notification) => notification.status === 'Unread') && (
      <span className="absolute top-2 right-2 transform translate-x-1/2 -translate-y-1/2 flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 animate-ping"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
      </span>
    )}
  </button>

  {/* Notification Tray */}
  {showNotifications && (
    <div
      ref={notificationRef}
      className={`absolute top-full right-0 mt-2 w-full max-w-sm ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} shadow-lg rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} z-30 sm:w-80`}
    >
      {/* Header */}
      <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} flex justify-between items-center`}>
        <h4 className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-black'} font-semibold`}>Notifications</h4>
        <button
          onClick={markAllAsRead}
          className={`text-sm ${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'} hover:text-blue-400 transition`}
        >
          Mark all as read
        </button>
      </div>

      {/* Notification List */}
      <ul className={`max-h-60 overflow-y-auto divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-300'}`}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-4 cursor-pointer transition-all ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} ${notification.status === 'Read' ? (theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200') : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm font-medium ${notification.status === 'Unread' ? (theme === 'dark' ? 'text-white' : 'text-black') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}`}
                >
                  {notification.title}
                </span>
                {notification.status === 'Unread' && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {formatRelativeTime(notification.created_at)}
              </p>
            </li>
          ))
        ) : (
          <li className={`p-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-700'} text-sm text-center`}>You have no notifications</li>
        )}
      </ul>

      {/* Footer */}
      <div className={`p-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} text-center border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
        <button className={`text-sm ${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'} hover:text-blue-400`}>View All</button>
      </div>
    </div>
  )}
</div>

        <button
          onClick={handleLogout}
          className={`${theme === 'dark' ? 'text-white' : 'text-black'} hover:bg-gray-800 p-2 rounded-full transition-colors flex items-center`}
        >
          <Image
            src="/images/logout.png" // Path to your image
            alt="Logout"
            width={24} // Set width
            height={24} // Set height
            className="object-contain"
          />
        </button>

        <div className="relative flex items-center">
          <span className={`${theme === 'dark' ? 'text-white' : 'text-black'} mr-2 hidden md:block`}>ADMIN</span>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`${theme === 'dark' ? 'text-white' : 'text-black'} hover:bg-gray-800 p-2 rounded-full transition-colors`}
          >
            <Image
              src="/images/admin.png" // Path to your image
              alt="Profile"
              width={32} // Set width for the profile image
              height={32} // Set height for the profile image
              className="rounded-full"
            />
          </button>

          {showProfileMenu && (
            <div className={`absolute top-full right-0 mt-2 w-48 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} shadow-lg rounded border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} overflow-hidden z-20`}>
              <ul>
                <li className={`p-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} hover:bg-gray-700`}>
                  <Link href="/profile" className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Profile</Link>
                </li>
                <li className={`p-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} hover:bg-gray-700`}>
                  <button
                    onClick={handleLogout}
                    className={`block w-full text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
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
    <ToastContainer />
  </>
);
}
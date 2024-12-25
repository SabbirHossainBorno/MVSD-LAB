'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function DashboardNavbar({ toggleDashboardSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
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

  return (
    <>
    <nav className="bg-gray-900 p-4 flex items-center justify-between shadow-md relative z-10">
      <button
        onClick={toggleDashboardSidebar}
        className="text-white md:hidden focus:outline-none hover:bg-gray-800 p-2 rounded transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <div className="flex items-center justify-center flex-1 text-[#4A90E2] text-xl lg:text-2xl font-bold tracking-tight md:text-2xl">
        <span className="uppercase">Dashboard</span>
      </div>

      <div className="relative flex items-center space-x-4 md:space-x-6">
      <div className="text-white text-lg hidden md:flex items-center justify-center">
  <div className="relative flex items-center space-x-4 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 p-3 rounded-lg shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out">
    {/* Animated Background */}
    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 animate-pulse rounded-lg blur-md opacity-50"></div>

    {/* Main Content */}
    <span className="font-mono text-3xl text-white z-10 animate-fadeIn">
      {currentTime}
    </span>
  </div>
</div>

        <div className="relative flex items-center space-x-4 md:space-x-6">
          {/* Notification Button */}
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative text-white hover:bg-gray-800 p-2 rounded-full transition-colors flex items-center"
          >
            <img src="/images/notification.png" alt="Notifications" className="w-6 h-6" />
            {notifications.some((notification) => notification.status === 'Unread') && (
              <span className="absolute top-2 right-2 transform translate-x-1/2 -translate-y-1/2 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
            )}
          </button>

          {/* Notification Tray */}
          {showNotifications && (
            <div
              ref={notificationRef}
              className="absolute top-full right-0 mt-2 w-11/12 max-w-sm bg-gray-900 shadow-lg rounded-lg border border-gray-700 z-30 sm:w-80"
            >
              {/* Header */}
              <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                <h4 className="text-lg text-white font-semibold">Notifications</h4>
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-500 hover:text-blue-400 transition"
                >
                  Mark all as read
                </button>
              </div>

              {/* Notification List */}
              <ul className="max-h-60 overflow-y-auto divide-y divide-gray-700">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`p-4 cursor-pointer transition-all hover:bg-gray-700 ${
                        notification.status === 'Read' ? 'bg-gray-800' : 'bg-gray-700'
                      }`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-sm font-medium ${
                            notification.status === 'Unread' ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          {notification.title}
                        </span>
                        {notification.status === 'Unread' && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-gray-500 text-sm text-center">You have no notifications</li>
                )}
              </ul>

              {/* Footer */}
              <div className="p-3 bg-gray-800 text-center border-t border-gray-700">
                <button className="text-sm text-blue-500 hover:text-blue-400">View All</button>
              </div>
            </div>
          )}
        </div>

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
    <ToastContainer />
    </>
  );
}

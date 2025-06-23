//app/components/DashboardNavbar.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import LoadingSpinner from '../components/LoadingSpinner';
import withAuth from './withAuth';

function DashboardNavbar({ toggleDashboardSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null); // Add profile state
  const notificationRef = useRef(null);

  const getAbbreviation = () => {
  if (timezone === 'Asia/Dhaka') return 'BDT'; // Force BDT for Dhaka
  const date = new Date();
  const timeZonePart = Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  }).formatToParts(date).find(part => part.type === 'timeZoneName');
  return timeZonePart?.value || '';
};


const toggleTimezone = () => {
  setTimezone((prev) =>
    prev === 'America/New_York' ? 'Asia/Dhaka' : 'America/New_York'
  );
};


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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        const result = await response.json();
        if (response.ok) {
          setProfile(result);
        } else {
          console.error(result.error);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);



  // Update current time
  useEffect(() => {
  const updateTime = () => {
    const now = new Date();

    // Format time for selected timezone
    const formattedTime = now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setCurrentTime(formattedTime);

    // Format full date (e.g., 23 June, 2025)
    const formattedDate = now.toLocaleDateString('en-GB', {
      timeZone: timezone,
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    setCurrentDate(formattedDate);
  };

  updateTime();
  const interval = setInterval(updateTime, 1000);
  return () => clearInterval(interval);
}, [timezone]);





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
      const unreadNotifications = notifications.filter(notification => notification.status === 'Unread');
      await Promise.all(
        unreadNotifications.map((notification) =>
          fetch('/api/notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: notification.id, status: 'Read' }),
          })
        )
      );
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.status === 'Unread' ? { ...notification, status: 'Read' } : notification
        )
      );
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
    setLoading(true);
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
          position: 'top-right',
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
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
    } finally {
      setLoading(false);
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



      <div className="flex items-center justify-center flex-1 text-transparent text-3xl lg:text-4xl font-bold tracking-tight md:text-4xl">
        <span className="uppercase bg-clip-text bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 animate-textGlow">
          Dashboard
        </span>
      </div>
      

      {/* Current Time Area */}
      <div className="relative flex items-center space-x-4 md:space-x-6">


        <div className="relative hidden md:flex items-center justify-center h-12">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-gradient rounded blur opacity-40"></div>

          {/* Main Content */}
          <div className="relative z-10 flex items-center space-x-2 bg-gray-900 p-2 rounded shadow border border-gray-700">
            <div className="text-center leading-tight">
              <span className="font-mono text-lg text-white tracking-wide">
                {currentTime}
              </span>
              <div className="text-[10px] text-gray-400">{currentDate}</div>
            </div>
            <button
              onClick={toggleTimezone}
              className="text-xs font-semibold bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 transition-all min-w-[40px] text-center"
              title="Click to switch timezone"
            >
              {getAbbreviation()}
            </button>
            {/* Animated Pulse Dot */}
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          </div>
        </div>


      <div className="relative flex items-center space-x-4 md:space-x-6">
      {/* Notification Area */}
      <div className="relative flex items-center">
        {/* Notification Button */}
        <button
          onClick={() => setShowNotifications((prev) => !prev)}
          className="relative flex items-center justify-center w-11 h-11 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors shadow-md p-2"
          aria-label="Toggle Notifications"
        >
          <Image
            src="/images/notification.png"
            alt="Notifications"
            width={24}
            height={24}
            className="object-contain"
          />
          {notifications.some((n) => n.status === 'Unread') && (
            <span className="absolute top-1 right-1 flex items-center justify-center h-3 w-3">
              <span className="absolute inline-flex h-full w-full bg-red-500 rounded-full animate-ping opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 bg-red-600 rounded-full"></span>
            </span>
          )}
        </button>

        {/* Notification Tray */}
        {showNotifications && (
            <div
              ref={notificationRef}
              className="absolute top-full right-0 mt-2 transform translate-x-24 w-[90vw] max-w-md bg-gray-900 shadow-lg rounded border border-gray-700 z-30 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Notifications</h4>
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-blue-400 hover:underline"
                >
                  Mark all as read
                </button>
              </div>

              {/* Notification List */}
              <ul className="max-h-96 overflow-y-auto divide-y divide-gray-700">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <li
                      key={notification.serial}
                      className={`p-4 hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-all ${
                        notification.status === 'Unread' ? 'bg-gray-800' : 'bg-gray-900'
                      }`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            notification.status === 'Unread' ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                      </div>
                      {notification.status === 'Unread' && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-gray-500 text-sm">
                    You have no notifications
                  </li>
                )}
              </ul>

              {/* Footer */}
              <div className="p-3 bg-gray-800 text-center">
                <button className="text-sm font-medium text-blue-400 hover:underline">
                  View All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


        {/* Logout Area */}
        <div className="relative flex items-center">
          <button
            onClick={handleLogout}
            className="relative flex items-center justify-center w-11 h-11 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors shadow-md p-2"
          >
            <Image
              src="/images/logout.png" // Path to your image
              alt="Logout"
              width={24} // Set width
              height={24} // Set height
              className="object-contain"
            />
          </button>
        </div>

        <div className="relative flex items-center">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative flex items-center justify-center w-11 h-11 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors shadow-md p-2"
          >
            {profile && (
              <div className="relative">
                <Image
                  src={profile.profile_picture}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                {profile.status === 'Active' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
                )}
              </div>
            )}
          </button>
          {showProfileMenu && profile && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 shadow-lg rounded border border-gray-700 overflow-hidden z-20">
              <ul>
                <li className="p-3 border-b border-gray-700 hover:bg-gray-700">
                  <span className="block text-gray-300">{profile.email}</span>
                </li>
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
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <LoadingSpinner />
        </div>
      )}
      <ToastContainer />
    </>
  );
}
export default withAuth(DashboardNavbar, 'admin'); // Specify required role here
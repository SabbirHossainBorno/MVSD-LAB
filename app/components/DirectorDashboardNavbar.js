//app/components/DirectorDashboardNavbar.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, User, Menu, LogOut, ChevronDown } from 'react-feather';
import { motion } from 'framer-motion';

export default function DirectorDashboardNavbar({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [directorData, setDirectorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [avatarError, setAvatarError] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(true);
  
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch director data
  useEffect(() => {
    const fetchDirectorData = async () => {
      try {
        const response = await fetch('/api/director_dashboard');
        if (response.ok) {
          const data = await response.json();
          setDirectorData(data.director);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDirectorData();
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setNotificationLoading(true);
        const response = await fetch('/api/notification');
        if (response.ok) {
          const data = await response.json();
          // Filter for publication notifications only
          const pubNotifications = data.filter(notif => 
            notif.id && notif.id.startsWith('PUB')
          );
          setNotifications(pubNotifications);
        }
      } finally {
        setNotificationLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Format notification time
  const formatNotificationTime = (dateString) => {
    if (!dateString) return "Just now";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    
    return `${diffInDays} days ago`;
  };

  // Mark notification as read
  const markAsRead = async (serial) => {
    try {
      // Optimistic UI update
      setNotifications(prev => prev.map(n => 
        n.serial === serial ? { ...n, status: 'Read' } : n
      ));
      
      // Update in the backend
      await fetch('/api/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationSerial: serial, status: 'Read' })
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert if error
      setNotifications(prev => prev.map(n => 
        n.serial === serial ? { ...n, status: 'Unread' } : n
      ));
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const unreadSerials = notifications
      .filter(n => n.status === 'Unread')
      .map(n => n.serial);
    
    if (unreadSerials.length === 0) return;
    
    try {
      // Optimistic UI update
      setNotifications(prev => prev.map(n => 
        unreadSerials.includes(n.serial) ? { ...n, status: 'Read' } : n
      ));
      
      // Update in the backend
      await fetch('/api/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notificationSerials: unreadSerials, 
          status: 'Read' 
        })
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert if error
      setNotifications(prev => prev.map(n => 
        unreadSerials.includes(n.serial) ? { ...n, status: 'Unread' } : n
      ));
    }
  };

  const unreadNotifications = notifications.filter(n => n.status === 'Unread').length;

  return (
    <nav className="bg-[rgba(5,10,20,0.92)] backdrop-blur-xl py-3 px-6 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800/70 shadow-2xl"> 
      {/* Left section with menu button */}
      <div className="flex items-center">
        <button 
          className="md:hidden mr-2 text-sky-400 hover:text-white transition-colors"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
      </div>
      
      {/* Centered title */}
      <div className="flex-1 flex justify-center">
        <div className="relative group">
          <h1 className="text-2xl md:text-3xl font-bold text-center tracking-tight">
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                Director Portal
              </span>
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400/40 to-indigo-400/40 rounded-full transition-all duration-300 group-hover:opacity-100 group-hover:from-sky-400 group-hover:to-indigo-400"></div>
            </span>
          </h1>
        </div>
      </div>
      
      {/* Right section with icons */}
      <div className="flex items-center space-x-5">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="p-2 rounded-full relative group"
          >
            <div className="relative">
              <div className="p-1.5 rounded-full bg-slate-800/60 group-hover:bg-slate-800 transition-colors">
                <Bell size={25} className={`transition-colors ${notificationsOpen ? 'text-white' : 'text-sky-400'}`} />
              </div>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </div>
          </button>
          
          {/* Notifications dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[rgba(8,15,30,0.97)] backdrop-blur-xl shadow-2xl rounded-xl z-50 border border-slate-800/70 overflow-hidden transform transition-all duration-200">
              <div className="p-4 border-b border-slate-800/70">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white">Notification</h3>
                  <span className="text-xs text-sky-400">{unreadNotifications} Unread</span>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notificationLoading ? (
                  <div className="p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-sky-500"></div>
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.serial}
                      className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        notification.status === 'Unread' ? 'bg-slate-800/30' : ''
                      }`}
                      onClick={() => markAsRead(notification.serial)}
                    >
                      <div className="flex items-start">
                        <div className={`mr-3 mt-1 w-2 h-2 rounded-full ${
                          notification.status === 'Unread' ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'
                        }`}></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            {formatNotificationTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm text-slate-500">No New Publications</p>
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-800/70">
                  <button 
                    className="text-xs text-sky-400 hover:text-sky-300 w-full text-center"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center space-x-2 group"
          >
            {!loading && directorData?.photo && !avatarError ? (
              <img 
                src={directorData.photo} 
                alt={directorData.fullName} 
                className={`w-9 h-9 rounded-full object-cover border-2 shadow-lg transition-all ${profileOpen ? 'border-sky-400' : 'border-sky-500/40'}`}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all ${profileOpen ? 'bg-gradient-to-br from-sky-400 to-indigo-500 border-2 border-sky-400' : 'bg-gradient-to-br from-sky-500 to-indigo-600 border-2 border-sky-500/40'}`}>
                {!loading ? (directorData?.firstName?.charAt(0) || 'D') : 'D'}
              </div>
            )}
            <ChevronDown 
              size={16} 
              className={`text-sky-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {/* Profile dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-[rgba(8,15,30,0.97)] backdrop-blur-xl shadow-2xl rounded-xl z-50 border border-slate-800/70 overflow-hidden transform transition-all duration-200">
              <div className="p-4 border-b border-slate-800/70">
                <div className="flex items-center">
                  {!loading && directorData?.photo && !avatarError ? (
                    <img 
                      src={directorData.photo} 
                      alt={directorData.fullName} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-sky-500/40 mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3 border-2 border-sky-500/40">
                      {!loading ? (directorData?.firstName?.charAt(0) || 'D') : 'D'}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white truncate max-w-[140px]">
                      {directorData?.fullName || 'Director Name'}
                    </p>
                    <p className="text-xs text-sky-400 mt-0.5 truncate max-w-[140px]">
                      {directorData?.id || 'DR-2024-001'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <button 
                  onClick={() => {
                    setProfileOpen(false);
                    router.push('/director_profile');
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800/40 transition-colors"
                >
                  <User size={16} className="mr-3 text-sky-400" />
                  My Profile
                </button>
                <button 
                  onClick={() => {
                    setProfileOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-800/40 transition-colors"
                >
                  <LogOut size={16} className="mr-3 text-rose-400" />
                  Logout
                </button>
              </div>
              
              <div className="px-4 py-3 border-t border-slate-800/70">
                <p className="text-xs text-slate-500 truncate">
                  {directorData?.email || 'director@mvsdlab.edu'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
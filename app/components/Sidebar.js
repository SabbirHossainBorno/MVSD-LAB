'use client';

import Link from 'next/link';
import { useEffect, useCallback, useState } from 'react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleClickOutside = useCallback((event) => {
    if (!event.target.closest('aside') && isOpen) {
      toggleSidebar();
    }
  }, [isOpen, toggleSidebar]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <aside className={`fixed top-0 left-0 w-64 bg-gray-900 text-white h-full p-6 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:w-64 md:flex md:flex-col z-50 shadow-lg`}>
      {/* Close Button */}
      <button
        onClick={toggleSidebar}
        className="text-white md:hidden absolute top-4 right-4 z-60 bg-indigo-800 rounded-full p-2 transition-transform transform hover:scale-105"
        aria-label="Close Sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-8">
        <img src="/images/logo.png" alt="Logo" className="w-20 h-20 object-contain mb-4"/>
        <h1 className="text-3xl font-semibold tracking-wider">MVSD LAB</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-4 space-y-2">
        <Link href="/dashboard">
          <a className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="w-6 h-6 text-gray-300 group-hover:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"></path>
            </svg>
            <span className="text-lg font-medium">Dashboard</span>
          </a>
        </Link>
        <Link href="/home">
          <a className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="w-6 h-6 text-gray-300 group-hover:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"></path>
            </svg>
            <span className="text-lg font-medium">Home</span>
          </a>
        </Link>
        <Link href="/dashboard/professor">
          <a className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="w-6 h-6 text-gray-300 group-hover:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12l-9 5-9-5" />
            </svg>
            <span className="text-lg font-medium">Add Professor</span>
          </a>
        </Link>
        <Link href="/dashboard/users_list">
          <a className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="w-6 h-6 text-gray-300 group-hover:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"></path>
            </svg>
            <span className="text-lg font-medium">Users List</span>
          </a>
        </Link>
        <Link href="/dashboard/subscribers_list">
          <a className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="w-6 h-6 text-gray-300 group-hover:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a
'use client';

import Link from 'next/link';
import { useEffect, useCallback, useState } from 'react';

export default function DashboardSidebar({ isOpen, toggleDashboardSidebar }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleClickOutside = useCallback((event) => {
    if (!event.target.closest('aside') && isOpen) {
      toggleDashboardSidebar();
    }
  }, [isOpen, toggleDashboardSidebar]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <aside className={`fixed top-0 left-0 w-64 bg-gray-900 text-white h-full p-6 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:w-64 md:flex md:flex-col z-50 shadow-lg`}>
      {/* Close Button */}
      <button
        onClick={toggleDashboardSidebar}
        className="text-white md:hidden absolute top-4 right-4 z-60 bg-indigo-800 rounded-full p-2 transition-transform transform hover:scale-105"
        aria-label="Close DashboardSidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-2">
        <img src="/images/logo.png" alt="Logo" className="w-20 h-20 object-contain mb-2"/>
        <h1 className="text-2xl font-semibold tracking-wider">MVSD LAB</h1>
        <hr className="w-full border-t-4 border-indigo-600 mt-2 rounded"/>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-4 space-y-2">
        <Link href="/dashboard">
          <div className="block p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/dashboard.png" alt="Dashboard" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Dashboard</span>
          </div>
        </Link>
        <Link href="/home">
          <div className="block p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/home.png" alt="Home" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Home</span>
          </div>
        </Link>
        <Link href="/dashboard/professor_add">
          <div className="block p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/add_professor.png" alt="Add Professor" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Add Professor</span>
          </div>
        </Link>
        <Link href="/dashboard/users_list">
          <div className="block p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/user_list.png" alt="Users List" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Users List</span>
          </div>
        </Link>
        <Link href="/dashboard/subscribers_list">
          <div className="block p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/subscriber_list.png" alt="Subscriber List" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Subscriber List</span>
          </div>
        </Link>
        <Link href="/dashboard/professor_list">
          <div className="block p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/professor_list.png" alt="Professors List" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Professor List</span>
          </div>
        </Link>

        {/* Add Member Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="block w-full p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer"
          >
            <img src="/icons/add_member.png" alt="Add Member" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Add Member</span>
            <svg className={`w-4 h-4 ml-auto transition-transform transform ${showDropdown ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="relative w-full mt-2 bg-gray-900 rounded-lg shadow-xl z-20">
              <Link href="/dashboard/add_member/staff">
                <div className="block px-4 py-2 rounded transition-colors hover:bg-indigo-600 flex items-center space-x-2 cursor-pointer">
                  <span className="text-sm font-medium text-white">Staff</span>
                </div>
              </Link>
              <Link href="/dashboard/add_member/post_doc_candidate">
                <div className="block px-4 py-2 rounded transition-colors hover:bg-indigo-600 flex items-center space-x-2 cursor-pointer">
                  <span className="text-sm font-medium text-white">Post Doc Candidate</span>
                </div>
              </Link>
              <Link href="/dashboard/add_member/masc_candidate">
                <div className="block px-4 py-2 rounded transition-colors hover:bg-indigo-600 flex items-center space-x-2 cursor-pointer">
                  <span className="text-sm font-medium text-white">MASc Candidate</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* System Monitor Option */}
        <Link href="/dashboard/system_monitor">
          <div className="block p-3 mt-2 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/SystemMonitor.png" alt="System Monitor" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">System Monitor</span>
          </div>
        </Link>


      </nav>
    </aside>
  );
}

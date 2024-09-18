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
      <div className="flex flex-col items-center mb-8">
        <img src="/images/logo.png" alt="Logo" className="w-20 h-20 object-contain mb-4"/>
        <h1 className="text-3xl font-semibold tracking-wider">MVSD LAB</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-4 space-y-2">
        <Link href="/dashboard">
          <div className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/dashboard.png" alt="Dashboard" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Dashboard</span>
          </div>
        </Link>
        <Link href="/home">
          <div className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/home.png" alt="Home" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Home</span>
          </div>
        </Link>
        <Link href="/dashboard/professor">
          <div className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/add_professor.png" alt="Add Professor" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Add Professor</span>
          </div>
        </Link>
        <Link href="/dashboard/users_list">
          <div className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/user_list.png" alt="Users List" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Users List</span>
          </div>
        </Link>
        <Link href="/dashboard/subscribers_list">
          <div className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/subscriber_list.png" alt="Subscriber List" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Subscriber List</span>
          </div>
        </Link>
        <Link href="/dashboard/professors_list">
          <div className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <img src="/icons/professor_list.png" alt="Professors List" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Professors List</span>
          </div>
        </Link>

        {/* Add Member Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="block w-full p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer"
          >
            <img src="/icons/add_member.png" alt="Add Member" className="w-6 h-6 text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Add Member</span>
            <svg className={`w-4 h-4 ml-auto transition-transform transform ${showDropdown ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {showDropdown && (
            <div className="absolute left-0 w-full mt-2 bg-gray-800 rounded-lg shadow-lg z-10">
              <Link href="/dashboard/add_member/staff">
                <div className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
                  <span className="text-lg font-medium">Staff</span>
                </div>
              </Link>
              <Link href="/dashboard/add_member/post_doc_candidate">
                <div className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
                  <span className="text-lg font-medium">Post Doc Candidate</span>
                </div>
              </Link>
              <Link href="/dashboard/add_member/masc_candidate">
                <div className="block p-3 rounded-lg transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
                  <span className="text-lg font-medium">MASc Candidate</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

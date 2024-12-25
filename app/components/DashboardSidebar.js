'use client';

import Link from 'next/link';
import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';

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
    <aside className={`fixed top-0 left-0 w-64 bg-gray-900 text-white h-full p-6 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:w-64 md:flex md:flex-col z-50 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent`}>
      {/* Logo and Title - Fixed */}
      <div className="flex flex-col items-center mb-2 sticky top-0 bg-gray-900 p-6 z-40">
        <Image src="/images/logo.png" alt="Logo" width={80} height={80} className="object-contain mb-2"/>
        <h1 className="text-2xl font-semibold tracking-wider">MVSD LAB</h1>
        <hr className="w-full border-t-4 border-indigo-600 mt-2 rounded"/>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-4 space-y-2 overflow-y-auto pr-2">
        <Link href="/dashboard">
          <div className="block p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <Image src="/icons/dashboard.png" alt="Dashboard" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Dashboard</span>
          </div>
        </Link>
        <Link href="/home">
          <div className="block p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <Image src="/icons/home.png" alt="Home" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Home</span>
          </div>
        </Link>
        <Link href="/dashboard/professor_add">
          <div className="block p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <Image src="/icons/add_professor.png" alt="Add Professor" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Add Professor</span>
          </div>
        </Link>
        <Link href="/dashboard/users_list">
          <div className="block p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <Image src="/icons/user_list.png" alt="Users List" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Users List</span>
          </div>
        </Link>
        <Link href="/dashboard/subscribers_list">
          <div className="block p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <Image src="/icons/subscriber_list.png" alt="Subscriber List" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Subscriber List</span>
          </div>
        </Link>
        <Link href="/dashboard/professor_list">
          <div className="block p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <Image src="/icons/professor_list.png" alt="Professors List" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Professor List</span>
          </div>
        </Link>

        {/* Add Member Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="block w-full p-3 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer"
          >
            <Image src="/icons/add_member.png" alt="Add Member" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
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
            <Image src="/icons/SystemMonitor.png" alt="System Monitor" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">System Monitor</span>
          </div>
        </Link>

        {/* Message */}
        <Link href="/dashboard/message">
          <div className="block p-3 mt-2 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-3 cursor-pointer">
            <Image src="/icons/message.png" alt="Message" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-lg font-medium">Message</span>
          </div>
        </Link>
      </nav>
    </aside>
  );
}

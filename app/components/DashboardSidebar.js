'use client';

import Link from 'next/link';
import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar({ isOpen, toggleDashboardSidebar }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const pathname = usePathname();

  const handleClickOutside = useCallback((event) => {
    if (!event.target.closest('aside') && isOpen) {
      toggleDashboardSidebar();
    }
  }, [isOpen, toggleDashboardSidebar]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  const handleDropdownClick = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleLinkClick = () => {
    setActiveDropdown(null);
  };

  const isActive = (path) => pathname === path;
  const isDropdownActive = (paths) => paths.some((path) => pathname.startsWith(path));

  return (
    <aside className={`fixed top-0 left-0 w-64 bg-gray-900 text-white h-full p-6 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:w-64 md:flex md:flex-col z-50 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent`}>
      {/* Logo and Title - Fixed */}
      <div className="flex flex-col items-center justify-center sticky top-0 bg-gray-900 p-2 z-40">
        <Image src="/images/dashboardSidebar_logo.svg" alt="Logo" width={340} height={240} className="object-contain mb-1"/>
        <hr className="w-full border-t-4 border-indigo-600 mt-1 rounded"/>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-2">
        <Link href="/dashboard">
          <div className={`block w-full p-2 mb-2 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-2 cursor-pointer ${isActive('/dashboard') ? 'bg-indigo-700' : ''}`}>
            <Image src="/icons/dashboard.png" alt="Dashboard" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-md font-medium">Dashboard</span>
          </div>
        </Link>
        <Link href="/home">
          <div className={`block w-full p-2 mb-2 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-2 cursor-pointer ${isActive('/home') ? 'bg-indigo-700' : ''}`}>
            <Image src="/icons/home.png" alt="Home" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-md font-medium">Home</span>
          </div>
        </Link>
        <Link href="/dashboard/subscribers_list">
          <div className={`block w-full p-2 mb-2 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-2 cursor-pointer ${isActive('/dashboard/subscribers_list') ? 'bg-indigo-700' : ''}`}>
            <Image src="/icons/subscriber_list.png" alt="Subscriber List" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-md font-medium">Subscriber List</span>
          </div>
        </Link>
        <Link href="/dashboard/professor_add">
          <div className={`block w-full p-2 mb-2 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-2 cursor-pointer ${isActive('/dashboard/professor_add') ? 'bg-indigo-700' : ''}`}>
            <Image src="/icons/add_professor.png" alt="Add Professor" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-md font-medium">Add Professor</span>
          </div>
        </Link>
        <Link href="/dashboard/professor_list">
          <div className={`block w-full p-2 mb-2 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-2 cursor-pointer ${isActive('/dashboard/professor_list') ? 'bg-indigo-700' : ''}`}>
            <Image src="/icons/professor_list.png" alt="Professors List" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-md font-medium">Professor List</span>
          </div>
        </Link>

        <Link href="/dashboard/alumni_list">
          <div className={`block w-full p-2 mb-2 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-2 cursor-pointer ${isActive('/dashboard/alumni_list') ? 'bg-indigo-700' : ''}`}>
            <Image src="/icons/alumni_list.svg" alt="Alumni List" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-md font-medium">Alumni Directory</span>
          </div>
        </Link>

        {/* Add Member Dropdown */}
        <div className="relative">
          <button
            onClick={() => handleDropdownClick('addMember')}
            className={`block w-full p-2 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-2 cursor-pointer ${isDropdownActive(['/dashboard/member_add']) ? 'bg-indigo-700' : ''}`}
          >
            <Image src="/icons/add_member.png" alt="Add Member" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-md font-medium">Add Member</span>
            <svg className={`w-4 h-4 ml-auto transition-transform transform ${activeDropdown === 'addMember' ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {activeDropdown === 'addMember' && (
            <div className="relative w-full mt-2 mb-2 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded shadow-lg z-20">
              <Link href="/dashboard/member_add/phd_candidate_add" onClick={handleLinkClick}>
                <div className="block px-4 py-2 rounded transition-colors hover:bg-indigo-600 flex items-center space-x-2 cursor-pointer">
                  <span className="text-sm font-semibold text-white">PHd</span>
                </div>
              </Link>
              <Link href="/dashboard/add_member/post_doc_candidate" onClick={handleLinkClick}>
                <div className="block px-4 py-2 rounded transition-colors hover:bg-indigo-600 flex items-center space-x-2 cursor-pointer">
                  <span className="text-sm font-semibold text-white">Post Doc</span>
                </div>
              </Link>
              <Link href="/dashboard/add_member/masc_candidate" onClick={handleLinkClick}>
                <div className="block px-4 py-2 rounded transition-colors hover:bg-indigo-600 flex items-center space-x-2 cursor-pointer">
                  <span className="text-sm font-semibold text-white">Master&apos;s</span>
                </div>
              </Link>
              <Link href="/dashboard/add_member/staff" onClick={handleLinkClick}>
                <div className="block px-4 py-2 rounded transition-colors hover:bg-indigo-600 flex items-center space-x-2 cursor-pointer">
                  <span className="text-sm font-semibold text-white">Staff</span>
                </div>
              </Link>

            </div>
          )}
        </div>

        {/* Member List Dropdown */}
        <div className="relative">
          <button
            onClick={() => handleDropdownClick('memberList')}
            className={`block w-full p-2 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-2 cursor-pointer ${isDropdownActive(['/dashboard/member_list']) ? 'bg-indigo-700' : ''}`}
          >
            <Image src="/icons/member_list.svg" alt="Member List" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-md font-medium">Member List</span>
            <svg className={`w-4 h-4 ml-auto transition-transform transform ${activeDropdown === 'memberList' ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
            </button>

            {/* Dropdown Menu */}
            {activeDropdown === 'memberList' && (
              <div className="relative w-full mt-2 mb-2 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded shadow-lg z-20">
                <Link href="/dashboard/member_list/phd_candidate_list" onClick={handleLinkClick}>
                  <div className="block px-4 py-2 rounded transition-colors hover:bg-indigo-600 flex items-center space-x-2 cursor-pointer">
                    <span className="text-sm font-semibold text-white">PHd</span>
                  </div>
                </Link>
              </div>
            )}
        </div>

        {/* System Monitor Option */}
        <Link href="/dashboard/system_monitor">
          <div className={`block w-full p-2 mb-2 mt-2 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-2 cursor-pointer ${isActive('/dashboard/system_monitor') ? 'bg-indigo-700' : ''}`}>
            <Image src="/icons/SystemMonitor.png" alt="System Monitor" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-md font-medium">System Monitor</span>
          </div>
        </Link>

        {/* Message */}
        <Link href="/dashboard/message">
          <div className={`block w-full p-2 mb-2 rounded transition-colors hover:bg-indigo-700 group flex items-center space-x-2 cursor-pointer ${isActive('/dashboard/message') ? 'bg-indigo-700' : ''}`}>
            <Image src="/icons/message.png" alt="Message" width={24} height={24} className="text-gray-300 group-hover:text-white"/>
            <span className="text-md font-medium">Message</span>
          </div>
        </Link>
      </nav>

      {/* Footer */}
      <div className="sticky bottom-0 w-full bg-transparent mt-2 z-40 flex justify-center items-center">
        <p className="text-xs text-gray-400 font-medium text-center">
          ©  
          <a href="https://www.mvsdlab.com" target="_blank" className="font-semibold text-white hover:text-indigo-400 transition duration-300">
            MVSD LAB
          </a>  
          , 2025, All Rights Reserved.
        </p>
      </div>



    </aside>
  );
}
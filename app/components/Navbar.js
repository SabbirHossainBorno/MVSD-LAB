'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileNav = () => setIsMobileNavActive(!isMobileNavActive);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        
        {/* Logo */}
        <Link href="/home" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="/images/logo.png" className="h-10" alt="MVSD LAB Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">MVSD LAB</span>
        </Link>

        {/* Right section - Get Started Button and Mobile Menu Button */}
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <Link href="/login">
            <button
              type="button"
              className="flex items-center text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-4 py-2 text-center dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-800"
            >
              <img src="/images/login.png" alt="Login Icon" className="w-5 h-5 me-2" />
              Login
            </button>
          </Link>

          {/* Mobile menu button */}
          <button
            data-collapse-toggle="navbar-sticky"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded={isMobileNavActive}
            onClick={toggleMobileNav}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className={`${isMobileNavActive ? 'block' : 'hidden'} items-center justify-between w-full md:flex md:w-auto md:order-1`} id="navbar-sticky">
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            
            <li>
              <Link href="/home" className={`block py-2 px-3 rounded md:p-0 ${pathname === '/home' ? 'text-blue-700 dark:text-blue-500' : 'text-gray-900 dark:text-white'} hover:bg-gray-100 dark:hover:bg-gray-700`}>
                Home
              </Link>
            </li>

            <li className="relative group">
              <Link href="/member">
                <button
                  className={`flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent ${pathname.startsWith('/member') ? 'text-blue-700' : ''}`}
                >
                  Member
                  <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l4 4 4-4" />
                  </svg>
                </button>
              </Link>
              
              {/* Dropdown menu */}
              <div className={`absolute z-10 hidden group-hover:block bg-white rounded-lg shadow-md w-44 dark:bg-gray-700 ${pathname.startsWith('/member') ? 'block' : ''}`}>
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-400">
                  <li>
                    <Link href="/member/professor" className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 ${pathname === '/member/professor' ? 'text-blue-700 dark:text-blue-500' : 'text-gray-700 dark:text-gray-400'}`}>
                      Professor
                    </Link>
                  </li>
                  <li>
                    <Link href="/member/staff" className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 ${pathname === '/member/staff' ? 'text-blue-700 dark:text-blue-500' : 'text-gray-700 dark:text-gray-400'}`}>
                      Staff
                    </Link>
                  </li>
                  <li>
                    <Link href="/member/post_doc_researcher" className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 ${pathname === '/member/post_doc_researcher' ? 'text-blue-700 dark:text-blue-500' : 'text-gray-700 dark:text-gray-400'}`}>
                      Post Doc Researcher
                    </Link>
                  </li>
                  <li>
                    <Link href="/member/phd_candidate" className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 ${pathname === '/member/phd_candidate' ? 'text-blue-700 dark:text-blue-500' : 'text-gray-700 dark:text-gray-400'}`}>
                      Ph.D Candidate
                    </Link>
                  </li>
                  <li>
                    <Link href="/member/masc_candidate" className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 ${pathname === '/member/masc_candidate' ? 'text-blue-700 dark:text-blue-500' : 'text-gray-700 dark:text-gray-400'}`}>
                      MASc Candidate
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li>
              <Link href="/services" className={`block py-2 px-3 rounded md:p-0 ${pathname === '/services' ? 'text-blue-700 dark:text-blue-500' : 'text-gray-900 dark:text-white'} hover:bg-gray-100 dark:hover:bg-gray-700`}>
                Services
              </Link>
            </li>

            <li>
              <Link href="/contact" className={`block py-2 px-3 rounded md:p-0 ${pathname === '/contact' ? 'text-blue-700 dark:text-blue-500' : 'text-gray-900 dark:text-white'} hover:bg-gray-100 dark:hover:bg-gray-700`}>
                Contact
              </Link>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}

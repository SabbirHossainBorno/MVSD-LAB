'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const pathname = usePathname();
  const dropdownRef = useRef(null); // Reference for dropdown container

  const toggleMobileNav = () => setIsMobileNavActive(!isMobileNavActive);

  const handleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`${
        isScrolled ? 'bg-white text-gray-900 shadow-lg' : 'bg-transparent text-white'
      } fixed w-full z-20 top-0 left-0 transition-colors duration-300`}
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <Link href="/home" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src="/images/logo.png"
            className="h-10 transition-transform duration-300 hover:scale-110"
            alt="MVSD LAB Logo"
          />
          <span className="self-center text-2xl font-bold tracking-wide text-[#012970]">MVSD LAB</span>
        </Link>

        {/* Right Section */}
        <div className="flex md:order-2">
        <Link
          href="/login"
          className="relative inline-flex items-center justify-center p-2 px-3 py-1 overflow-hidden font-medium text-[#012970] transition duration-300 ease-out border-2 border-[#012970] rounded-md shadow-md group"
        >
          <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-[#012970] group-hover:translate-x-0 ease">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </span>
          <span className="absolute flex items-center justify-center w-full h-full text-[#012970] transition-all duration-300 transform group-hover:translate-x-full ease">
            Login
          </span>
          <span className="relative invisible">Login</span>
        </Link>


          {/* Mobile Menu Button */}
          <button
            type="button"
            className="inline-flex items-center p-2 ml-3 w-10 h-10 text-[#012970] md:hidden hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            onClick={toggleMobileNav}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div
          ref={dropdownRef} // Reference for dropdown container
          className={`${
            isMobileNavActive ? 'block' : 'hidden'
          } w-full md:flex md:w-auto md:order-1`}
        >
          <ul className="flex flex-col p-4 mt-4 bg-white text-gray-900 rounded-md md:flex-row md:space-x-1 md:mt-0 md:bg-transparent md:text-[#012970] md:p-0">
          <li>
            <Link
              href="/home"
              className={`py-2 px-3 block hover:text-blue-700 font-medium ${
                pathname === '/home' ? 'text-blue-500 font-medium' : ''
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/services"
              className={`py-2 px-3 block hover:text-blue-700 font-medium ${
                pathname === '/services' ? 'text-blue-500 font-medium' : ''
              }`}
            >
              Services
            </Link>
          </li>

          {/* Member Dropdown */}
          <li className="relative group">
            <button
              className="flex items-center justify-between py-2 px-3 w-full hover:text-blue-700 font-medium rounded-md"
              onClick={() => handleDropdown('member')}
            >
              Member
              <svg
                className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                  openDropdown === 'member' ? 'rotate-180' : ''
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`${
                openDropdown === 'member' ? 'block' : 'hidden'
              } md:absolute md:w-48 bg-gray-100 md:shadow-lg md:rounded-md md:mt-2 md:left-0 w-full rounded-md transition-all duration-300`}
            >
              <ul className="rounded-md">
                <li>
                  <Link
                    href="/member/professor"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded-md ${
                      pathname === '/member/professor' ? 'text-blue-500' : ''
                    }`}
                  >
                    Professor
                  </Link>
                </li>
                <li>
                  <Link
                    href="/member/staff"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded-md ${
                      pathname === '/member/staff' ? 'text-blue-500' : ''
                    }`}
                  >
                    Staff
                  </Link>
                </li>
              </ul>
            </div>
          </li>


          {/* Test Dropdown */}
          <li className="relative group">
            <button
              className="flex items-center justify-between py-2 px-3 w-full hover:text-blue-700 font-medium rounded-md"
              onClick={() => handleDropdown('test')}
            >
              Test
              <svg
                className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                  openDropdown === 'test' ? 'rotate-180' : ''
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`${
                openDropdown === 'test' ? 'block' : 'hidden'
              } md:absolute md:w-48 bg-gray-100 md:shadow-lg md:rounded-md md:mt-2 md:left-0 w-full rounded-md transition-all duration-300`}
            >
              <ul className="rounded-md">
                <li>
                  <Link
                    href="/test/option1"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded-md ${
                      pathname === '/test/option1' ? 'text-blue-500' : ''
                    }`}
                  >
                    Option 1
                  </Link>
                </li>
                <li>
                  <Link
                    href="/test/option2"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded-md ${
                      pathname === '/test/option2' ? 'text-blue-500' : ''
                    }`}
                  >
                    Option 2
                  </Link>
                </li>
              </ul>
            </div>
          </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

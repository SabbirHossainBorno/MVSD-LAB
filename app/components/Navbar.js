'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMember, setOpenMember] = useState(false);
  const [openTest, setOpenTest] = useState(false);
  const pathname = usePathname();

  const toggleMobileNav = () => {
    setIsMobileNavActive(!isMobileNavActive);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

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
          <Link href="/login">
            <button
              type="button"
              className="flex items-center bg-blue-500 text-white font-medium rounded px-4 py-2 shadow-md hover:shadow-lg hover:bg-blue-600 transition duration-300 focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              <img src="/images/login.png" alt="Login Icon" className="w-5 h-5 mr-2" />
              Login
            </button>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center p-2 ml-3 w-10 h-10 text-white md:hidden hover:bg-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
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
          className={`${
            isMobileNavActive ? 'block' : 'hidden'
          } w-full md:flex md:w-auto md:order-1 transition-all duration-500 ease-in-out`}
        >
          <ul className="flex flex-col p-4 mt-4 bg-white text-gray-900 rounded-lg md:flex-row md:space-x-1 md:mt-0 md:bg-transparent md:text-[#012970] md:p-0">
            <li>
              <Link
                href="/home"
                className={`flex items-center py-2 px-3 w-full md:w-auto transition duration-300 hover:text-blue-700 font-medium ${
                  pathname === '/home' ? 'text-blue-500' : ''
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className={`flex items-center py-2 px-3 w-full md:w-auto transition duration-300 hover:text-blue-700 font-medium ${
                  pathname === '/services' ? 'text-blue-500' : ''
                }`}
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className={`flex items-center py-2 px-3 w-full md:w-auto transition duration-300 hover:text-blue-700 font-medium ${
                  pathname === '/contact' ? 'text-blue-500' : ''
                }`}
              >
                Contact
              </Link>
            </li>
            <li className="relative group">
              <button
                className="flex items-center py-2 px-3 w-full md:w-auto transition duration-300 hover:text-blue-700 font-medium"
                onClick={() => setOpenMember(!openMember)}
              >
                Member
                <svg
                  className={`w-4 h-4 ml-1 transition-transform duration-300 ${openMember ? 'rotate-180' : ''}`}
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
                className={`absolute left-0 ${openMember ? 'block' : 'hidden'} w-48 mt-2 rounded-md shadow-lg bg-white text-gray-900`}
              >
                <ul className="py-2">
                  <li>
                    <Link href="/member/professor" className="block px-4 py-2 hover:bg-gray-100 font-medium">
                      Professor
                    </Link>
                  </li>
                  <li>
                    <Link href="/member/staff" className="block px-4 py-2 hover:bg-gray-100 font-medium">
                      Staff
                    </Link>
                  </li>
                  <li>
                    <Link href="/member/phd_candidate" className="block px-4 py-2 hover:bg-gray-100 font-medium">
                      Ph.D Candidate
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
            <li className="relative group">
              <button
                className="flex items-center py-2 px-3 w-full md:w-auto transition duration-300 hover:text-blue-700 font-medium"
                onClick={() => setOpenTest(!openTest)}
              >
                Test
                <svg
                  className={`w-4 h-4 ml-1 transition-transform duration-300 ${openTest ? 'rotate-180' : ''}`}
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
                className={`absolute left-0 ${openTest ? 'block' : 'hidden'} w-48 mt-2 rounded-md shadow-lg bg-white text-gray-900`}
              >
                <ul className="py-2">
                  <li>
                    <Link href="/test/option1" className="block px-4 py-2 hover:bg-gray-100 font-medium">
                      Option 1
                    </Link>
                  </li>
                  <li>
                    <Link href="/test/option2" className="block px-4 py-2 hover:bg-gray-100 font-medium">
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
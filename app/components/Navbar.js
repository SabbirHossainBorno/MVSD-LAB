'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

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
        <Image 
          src="/images/logo.png" 
          alt="MVSD LAB Logo" 
          width={40} // Corresponds to h-10 (10 * 4 = 40px)
          height={40} // Assuming a square aspect ratio
          className="transition-transform duration-300 hover:scale-110" 
        />
          <span className="self-center text-2xl font-bold tracking-wide text-[#012970] font-poppins">
            MVSD LAB
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex md:order-2">
        <Link
          href="/login"
          className="relative inline-flex items-center justify-center p-2 px-3 py-1 overflow-hidden font-medium text-[#012970] transition duration-300 ease-out border-2 border-[#012970] rounded shadow-md group"
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
            className="inline-flex items-center p-2 ml-3 w-10 h-10 text-[#012970] md:hidden hover:bg-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-white"
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
          <ul className="flex flex-col p-4 mt-4 bg-white text-gray-900 rounded md:flex-row md:space-x-1 md:mt-0 md:bg-transparent md:text-[#012970] md:p-0">
          
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

          {/* Member Dropdown */}
          <li className="relative group">
            <button
              className={`flex items-center justify-between py-2 px-3 w-full hover:text-blue-700 font-medium rounded ${
                pathname.includes('/home/member') ? 'text-blue-500' : ''
              }`}
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
              } md:absolute md:w-48 bg-gray-100 md:shadow-lg md:rounded md:mt-2 md:left-0 w-full rounded transition-all duration-300`}
            >
              <ul className="rounded">
              <li>
                  <Link
                    href="/home/member"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/home/member' ? 'text-blue-500' : ''
                    }`}
                  >
                    All
                  </Link>
                </li>

                <li>
                  <Link
                    href="/home/member/director"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/home/member/director' ? 'text-blue-500' : ''
                    }`}
                  >
                    Director
                  </Link>
                </li>

                <li>
                  <Link
                    href="/home/member/professor"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/home/member/professor' ? 'text-blue-500' : ''
                    }`}
                  >
                    Professor
                  </Link>
                </li>

                <li>
                  <Link
                    href="/home/member/phd_candidate"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/home/member/phd_candidate' ? 'text-blue-500' : ''
                    }`}
                  >
                    PhD
                  </Link>
                </li>
                
                <li>
                  <Link
                    href="/home/member/masters_candidate"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/home/member/masc_candidate' ? 'text-blue-500' : ''
                    }`}
                  >
                    Master&#39;s
                  </Link>
                </li>

                <li>
                  <Link
                    href="/home/member/postdoc_candidate"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/home/member/postdoc_candidate' ? 'text-blue-500' : ''
                    }`}
                  >
                    Post Doc
                  </Link>
                </li>

                <li>
                  <Link
                    href="/home/member/staff"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/home/member/staff' ? 'text-blue-500' : ''
                    }`}
                  >
                    Staff
                  </Link>
                </li>
                <li>
                  <Link
                    href="/home/member/alumni"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/home/member/alumni' ? 'text-blue-500' : ''
                    }`}
                  >
                    Alumni
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Publication Dropdown */}
          <li className="relative group">
            <button
              className={`flex items-center justify-between py-2 px-3 w-full hover:text-blue-700 font-medium rounded ${
                pathname.includes('/publication') ? 'text-blue-500' : ''
              }`}
              onClick={() => handleDropdown('publication')}
            >
              Publication/Research
              <svg
                className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                  openDropdown === 'publication' ? 'rotate-180' : ''
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
                openDropdown === 'publication' ? 'block' : 'hidden'
              } md:absolute md:w-48 bg-gray-100 md:shadow-lg md:rounded md:mt-2 md:left-0 w-full rounded transition-all duration-300`}
            >
              <ul className="rounded">
              <li>
                  <Link
                    href="/publication"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/publication' ? 'text-blue-500' : ''
                    }`}
                  >
                    Summary
                  </Link>
                </li>

                <li>
                  <Link
                    href="/publication/international_journals"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/publication/international_journals' ? 'text-blue-500' : ''
                    }`}
                  >
                    International Journal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/publication/domestic_journals"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/publication/domestic_journals' ? 'text-blue-500' : ''
                    }`}
                  >
                    Domestic Journal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/publication/international_conferences"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/publication/international_conferences' ? 'text-blue-500' : ''
                    }`}
                  >
                    International Conference
                  </Link>
                </li>
                <li>
                  <Link
                    href="/publication/domestic_conferences"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/publication/domestic_conferences' ? 'text-blue-500' : ''
                    }`}
                  >
                    Domestic Conference
                  </Link>
                </li>

              </ul>
            </div>
          </li>


          {/* Patent Dropdown */}
          <li className="relative group">
            <button
              className={`flex items-center justify-between py-2 px-3 w-full hover:text-blue-700 font-medium rounded ${
                pathname.includes('/patent') ? 'text-blue-500' : ''
              }`}
              onClick={() => handleDropdown('patent')}
            >
              Patent
              <svg
                className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                  openDropdown === 'patent' ? 'rotate-180' : ''
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
                openDropdown === 'patent' ? 'block' : 'hidden'
              } md:absolute md:w-48 bg-gray-100 md:shadow-lg md:rounded md:mt-2 md:left-0 w-full rounded transition-all duration-300`}
            >
              <ul className="rounded">
              <li>
                  <Link
                    href="/patent"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/patent' ? 'text-blue-500' : ''
                    }`}
                  >
                    Summary
                  </Link>
                </li>

                <li>
                  <Link
                    href="/patent/registered_patent"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/patent/registered_patent' ? 'text-blue-500' : ''
                    }`}
                  >
                    Registered
                  </Link>
                </li>
              </ul>
            </div>
          </li>


          {/* Project Dropdown */}
          <li className="relative group">
            <button
              className={`flex items-center justify-between py-2 px-3 w-full hover:text-blue-700 font-medium rounded ${
                pathname.includes('/project') ? 'text-blue-500' : ''
              }`}
              onClick={() => handleDropdown('project')}
            >
              Project
              <svg
                className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                  openDropdown === 'project' ? 'rotate-180' : ''
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
                openDropdown === 'project' ? 'block' : 'hidden'
              } md:absolute md:w-48 bg-gray-100 md:shadow-lg md:rounded md:mt-2 md:left-0 w-full rounded transition-all duration-300`}
            >
              <ul className="rounded">
              <li>
                  <Link
                    href="/project"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/project' ? 'text-blue-500' : ''
                    }`}
                  >
                    All
                  </Link>
                </li>

                <li>
                  <Link
                    href="/project/ongoing_project"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/project/ongoing_project' ? 'text-blue-500' : ''
                    }`}
                  >
                    Ongoing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/project/completed_project"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/project/completed_project' ? 'text-blue-500' : ''
                    }`}
                  >
                    Completed
                  </Link>
                </li>
              </ul>
            </div>
          </li>


          {/* Course Dropdown */}
          <li className="relative group">
            <button
              className={`flex items-center justify-between py-2 px-3 w-full hover:text-blue-700 font-medium rounded ${
                pathname.includes('/course') ? 'text-blue-500' : ''
              }`}
              onClick={() => handleDropdown('course')}
            >
              Course
              <svg
                className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                  openDropdown === 'course' ? 'rotate-180' : ''
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
                openDropdown === 'course' ? 'block' : 'hidden'
              } md:absolute md:w-48 bg-gray-100 md:shadow-lg md:rounded md:mt-2 md:left-0 w-full rounded transition-all duration-300`}
            >
              <ul className="rounded">
              <li>
                  <Link
                    href="/course"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/course' ? 'text-blue-500' : ''
                    }`}
                  >
                    All
                  </Link>
                </li>

                <li>
                  <Link
                    href="/course/undergraduate_course"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/course/undergraduate_course' ? 'text-blue-500' : ''
                    }`}
                  >
                    Undergraduate
                  </Link>
                </li>
                <li>
                  <Link
                    href="/course/graduate_course"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/course/graduate_course' ? 'text-blue-500' : ''
                    }`}
                  >
                    Graduate
                  </Link>
                </li>
              </ul>
            </div>
          </li>


          {/* Video */}
          <li>
            <Link
              href="/video"
              className={`py-2 px-3 block hover:text-blue-700 font-medium ${
                pathname === '/video' ? 'text-blue-500 font-medium' : ''
              }`}
            >
              Video
            </Link>
          </li>


          {/* Gallery */}
          <li>
            <Link
              href="/gallery"
              className={`py-2 px-3 block hover:text-blue-700 font-medium ${
                pathname === '/gallery' ? 'text-blue-500 font-medium' : ''
              }`}
            >
              Gallery
            </Link>
          </li>


          {/* Software Dropdown */}
          <li className="relative group">
            <button
              className={`flex items-center justify-between py-2 px-3 w-full hover:text-blue-700 font-medium rounded ${
                pathname.includes('/software') ? 'text-blue-500' : ''
              }`}
              onClick={() => handleDropdown('software')}
            >
              Software
              <svg
                className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                  openDropdown === 'software' ? 'rotate-180' : ''
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
                openDropdown === 'software' ? 'block' : 'hidden'
              } md:absolute md:w-48 bg-gray-100 md:shadow-lg md:rounded md:mt-2 md:left-0 w-full rounded transition-all duration-300`}
            >
              <ul className="rounded">
              <li>
                  <Link
                    href="/software"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/software' ? 'text-blue-500' : ''
                    }`}
                  >
                    All
                  </Link>
                </li>

                <li>
                  <Link
                    href="/software/software_noma_simulator"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/software/software_noma_simulator' ? 'text-blue-500' : ''
                    }`}
                  >
                    Noma Simulator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/software/software_massive_mimo_noma_simulator"
                    className={`block px-4 py-2 hover:bg-gray-200 font-medium rounded ${
                      pathname === '/software/software_massive_mimo_noma_simulator' ? 'text-blue-500' : ''
                    }`}
                  >
                    Massive Mimo-Noma Simulator
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
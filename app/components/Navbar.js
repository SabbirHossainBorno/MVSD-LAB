'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Dropdown Menu Component
const DropdownMenu = ({ label, items, isOpen, setIsOpen }) => {
  return (
    <li className="relative group">
      <button
        className="flex items-center py-2 px-3 transition duration-300 hover:text-blue-700 font-medium"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {label}
        <svg
          className={`w-4 h-4 ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
        className={`absolute left-0 ${isOpen ? 'block' : 'hidden'} w-48 mt-2 rounded-md shadow-lg bg-white text-gray-900`}
      >
        <ul className="py-2">
          {items.map((item, index) => (
            <li key={index}>
              <Link href={item.href} className="block px-4 py-2 hover:bg-gray-100 font-medium">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

export default function Navbar() {
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMember, setOpenMember] = useState(false);
  const [openTest, setOpenTest] = useState(false);
  const pathname = usePathname();

  // Scroll Handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reusable Menu Items
  const memberMenuItems = [
    { label: 'Professor', href: '/member/professor' },
    { label: 'Staff', href: '/member/staff' },
    { label: 'Ph.D Candidate', href: '/member/phd_candidate' },
  ];

  const testMenuItems = [
    { label: 'Option 1', href: '/test/option1' },
    { label: 'Option 2', href: '/test/option2' },
  ];

  // Function to handle link highlighting
  const getNavLinkClass = (path) =>
    `flex items-center py-2 px-3 transition duration-300 hover:text-blue-700 font-medium ${
      pathname === path ? 'text-blue-500' : ''
    }`;

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

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center p-2 ml-3 w-10 h-10 text-[#012970] md:hidden hover:bg-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
          onClick={() => setIsMobileNavActive(!isMobileNavActive)}
          aria-controls="mobile-menu"
          aria-expanded={isMobileNavActive}
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

        {/* Navigation Links */}
        <div
          id="mobile-menu"
          className={`${
            isMobileNavActive ? 'block' : 'hidden'
          } w-full md:flex md:w-auto`}
        >
          <ul className="flex flex-col p-4 mt-4 bg-white text-gray-900 rounded-lg md:flex-row md:space-x-1 md:mt-0 md:bg-transparent md:text-[#012970] md:p-0">
            <li>
              <Link href="/home" className={getNavLinkClass('/home')}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/services" className={getNavLinkClass('/services')}>
                Services
              </Link>
            </li>
            <li>
              <Link href="/contact" className={getNavLinkClass('/contact')}>
                Contact
              </Link>
            </li>
            <DropdownMenu
              label="Member"
              items={memberMenuItems}
              isOpen={openMember}
              setIsOpen={setOpenMember}
            />
            <DropdownMenu
              label="Test"
              items={testMenuItems}
              isOpen={openTest}
              setIsOpen={setOpenTest}
            />
          </ul>
        </div>

        {/* Login Button */}
        <div className="hidden md:flex">
          <Link
            href="/login"
            className="relative inline-flex items-center justify-center px-4 py-2 font-medium text-indigo-600 transition duration-300 ease-out border-2 border-purple-500 rounded shadow-md group"
          >
            <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-purple-500 group-hover:translate-x-0 ease">
              Login
            </span>
            <span className="absolute flex items-center justify-center w-full h-full text-purple-500 transition-all duration-300 transform group-hover:translate-x-full ease">
              Login
            </span>
            <span className="relative invisible">Login</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

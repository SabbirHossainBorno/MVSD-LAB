'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <img src="/images/logo.png" alt="Logo" className="h-10 cursor-pointer" />
          </Link>
        </div>
        <div className="hidden md:flex space-x-6">
          <Link href="/home" className="hover:bg-gray-700 p-2 rounded">Home</Link>
          <div className="relative group">
            <button className="hover:bg-gray-700 p-2 rounded">Member</button>
            <div className="absolute hidden group-hover:block bg-gray-800 text-white mt-2 rounded shadow-lg">
              <Link href="/member/professor" className="block px-4 py-2 hover:bg-gray-700">Professor</Link>
              <Link href="/member/staff" className="block px-4 py-2 hover:bg-gray-700">Staff</Link>
              <Link href="/member/post_doc_researcher" className="block px-4 py-2 hover:bg-gray-700">Post Doc Researcher</Link>
              <Link href="/member/phd_candidate" className="block px-4 py-2 hover:bg-gray-700">PhD Candidate</Link>
              <Link href="/member/masc_candidate" className="block px-4 py-2 hover:bg-gray-700">MASC Candidate</Link>
            </div>
          </div>
          <Link href="/services" className="hover:bg-gray-700 p-2 rounded">Services</Link>
          <Link href="/contact" className="hover:bg-gray-700 p-2 rounded">Contact</Link>
        </div>
        <div className="hidden md:block">
          <Link href="/login">
            <button
              type="button"
              className="flex items-center text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-4 py-2 text-center dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-800"
            >
              <img src="/images/login.png" alt="Login Icon" className="w-5 h-5 me-2" />
              Login
            </button>
          </Link>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <Link href="/home" className="block px-4 py-2 hover:bg-gray-700">Home</Link>
          <div className="relative">
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">Member</button>
            <div className="bg-gray-800 text-white mt-2 rounded shadow-lg">
              <Link href="/member/professor" className="block px-4 py-2 hover:bg-gray-700">Professor</Link>
              <Link href="/member/staff" className="block px-4 py-2 hover:bg-gray-700">Staff</Link>
              <Link href="/member/post_doc_researcher" className="block px-4 py-2 hover:bg-gray-700">Post Doc Researcher</Link>
              <Link href="/member/phd_candidate" className="block px-4 py-2 hover:bg-gray-700">PhD Candidate</Link>
              <Link href="/member/masc_candidate" className="block px-4 py-2 hover:bg-gray-700">MASC Candidate</Link>
            </div>
          </div>
          <Link href="/services" className="block px-4 py-2 hover:bg-gray-700">Services</Link>
          <Link href="/contact" className="block px-4 py-2 hover:bg-gray-700">Contact</Link>
          <Link href="/login">
            <button
              type="button"
              className="flex items-center text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-4 py-2 text-center dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-800"
            >
              <img src="/images/login.png" alt="Login Icon" className="w-5 h-5 me-2" />
              Login
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}

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

  // Highlight parent dropdown if any child is active
  const isActive = (path) => pathname === path;
  const isDropdownActive = (paths) => paths.some((path) => pathname.includes(path));

  return (
    <aside className={`fixed top-0 left-0 w-64 bg-gray-900 text-white h-full p-4 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:w-64 md:flex md:flex-col z-50 shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent`}>
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-3 sticky top-0 bg-gray-900 p-2 z-40">
        <Image src="/images/dashboardSidebar_logo.svg" alt="Logo" width={340} height={240} className="object-contain"/>
        <hr className="w-full border-t-4 border-indigo-600 mt-2 rounded"/>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 space-x-3 overflow-y-auto pr-2">
        <NavItem href="/dashboard" icon="/icons/dashboard.png" label="Dashboard" active={isActive('/dashboard')} />
        <NavItem href="/home" icon="/icons/home.png" label="Home" active={isActive('/home')} />
        <NavItem href="/dashboard/subscribers_list" icon="/icons/subscriber_list.png" label="Subscriber List" active={isActive('/dashboard/subscribers_list')} />
        <NavItem href="/dashboard/professor_add" icon="/icons/add_professor.png" label="Add Professor" active={isActive('/dashboard/professor_add')} />
        <NavItem href="/dashboard/professor_list" icon="/icons/professor_list.png" label="Professor List" active={isActive('/dashboard/professor_list')} />

        {/* Add Member Dropdown */}
        <DropdownMenu 
          title="Add Member" 
          icon="/icons/add_member.png" 
          activeDropdown={activeDropdown} 
          dropdownName="addMember" 
          handleDropdownClick={handleDropdownClick}
          isActive={isDropdownActive(['/dashboard/member_add'])} // Stays active if any child is selected
        >
          <DropdownItem href="/dashboard/member_add/phd_candidate_add" label="PhD Candidate" handleClick={handleLinkClick} />
          <DropdownItem href="/dashboard/add_member/staff" label="Staff" handleClick={handleLinkClick} />
          <DropdownItem href="/dashboard/add_member/post_doc_candidate" label="Post Doc Candidate" handleClick={handleLinkClick} />
          <DropdownItem href="/dashboard/add_member/masc_candidate" label="MASc Candidate" handleClick={handleLinkClick} />
        </DropdownMenu>

        {/* Member List Dropdown */}
        <DropdownMenu 
          title="Member List" 
          icon="/icons/member_list.svg" 
          activeDropdown={activeDropdown} 
          dropdownName="memberList" 
          handleDropdownClick={handleDropdownClick}
          isActive={isDropdownActive(['/dashboard/member_list'])} // Stays active if any child is selected
        >
          <DropdownItem href="/dashboard/member_list/phd_candidate_list" label="PhD Candidate" handleClick={handleLinkClick} />
        </DropdownMenu>

        {/* System Monitor & Message */}
        <NavItem href="/dashboard/system_monitor" icon="/icons/SystemMonitor.png" label="System Monitor" active={isActive('/dashboard/system_monitor')} />
        <NavItem href="/dashboard/message" icon="/icons/message.png" label="Message" active={isActive('/dashboard/message')} />
      </nav>
    </aside>
  );
}

/* ======= Subcomponents ======= */

// **Navigation Item Component**
function NavItem({ href, icon, label, active }) {
  return (
    <Link href={href}>
      <div className={`flex items-center space-x-3 p-3 rounded-md transition-colors hover:bg-indigo-700 group cursor-pointer ${active ? 'bg-indigo-700' : ''}`}>
        <Image src={icon} alt={label} width={24} height={24} className="text-gray-300 group-hover:text-white"/>
        <span className="text-md font-medium">{label}</span>
      </div>
    </Link>
  );
}

// **Dropdown Menu Component**
function DropdownMenu({ title, icon, activeDropdown, dropdownName, handleDropdownClick, children, isActive }) {
  return (
    <div className="relative">
      <button
        onClick={() => handleDropdownClick(dropdownName)}
        className={`flex items-center w-full space-x-3 p-3 rounded-md transition-colors hover:bg-indigo-700 cursor-pointer ${isActive ? 'bg-indigo-700' : ''}`}
      >
        <Image src={icon} alt={title} width={24} height={24} className="text-gray-300"/>
        <span className="text-md font-medium">{title}</span>
        <svg className={`w-4 h-4 ml-auto transition-transform transform ${activeDropdown === dropdownName ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {activeDropdown === dropdownName && (
        <div className="relative w-full mt-1 bg-gray-800 rounded-md shadow-lg z-20">
          {children}
        </div>
      )}
    </div>
  );
}

// **Dropdown Item Component**
function DropdownItem({ href, label, handleClick }) {
  return (
    <Link href={href} onClick={handleClick}>
      <div className="block px-5 py-2 rounded-md transition-colors hover:bg-indigo-600 flex items-center cursor-pointer">
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>
    </Link>
  );
}

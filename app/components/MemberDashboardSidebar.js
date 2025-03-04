// app/components/MemberDashboardSidebar.js
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiFileText, FiChevronDown, FiChevronUp, FiX 
} from 'react-icons/fi';
import { LiaProjectDiagramSolid } from "react-icons/lia";
import Image from 'next/image';

const menuItems = [
  { 
    name: 'Dashboard', 
    icon: <FiHome className="w-5 h-5" />,
    link: 'dashboard',
    subItems: []
  },
  { 
    name: 'Research', 
    icon: <FiFileText className="w-5 h-5" />,
    subItems: [
      { name: 'Add Research', link: 'add_research' },
      { name: 'Research List', link: 'list_research' }
    ]
  },
  { 
    name: 'Publications', 
    icon: <LiaProjectDiagramSolid className="w-5 h-5" />,
    subItems: [
      { name: 'Add Publication', link: 'add_publication' },
      { name: 'Publication List', link: 'list_publication' }
    ]
  }
];

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: '-100%' },
};

const MemberDashboardSidebar = ({ 
  darkMode,
  isDesktop,
  sidebarOpen,
  setSidebarOpen,
  activeMenu,
  setActiveMenu,
  openSubMenu,
  toggleSubMenu
}) => {
  return (
    <motion.aside
      initial={isDesktop ? "open" : "closed"}
      animate={isDesktop ? "open" : sidebarOpen ? "open" : "closed"}
      variants={sidebarVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed inset-y-0 left-0 w-64 z-40 flex flex-col justify-between ${
        darkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'
      }`}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="relative p-2 flex flex-col items-center">
          {!isDesktop && (
            <FiX 
              onClick={() => setSidebarOpen(false)}
              className={`absolute top-3 right-3 cursor-pointer ${
                darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'
              } transition-colors`}
            />
          )}

          <div className="w-full flex justify-center mb-2">
            <img 
              src={darkMode ? "/images/memberDashboardSidebar_logo_dark.svg" : "/images/memberDashboardSidebar_logo_light.svg"} 
              alt="Dashboard Logo"
              className="h-16 w-auto"
            />
          </div>

          <div className={`w-full h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.name}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`flex items-center p-3 rounded cursor-pointer ${
                  activeMenu === item.link 
                    ? `${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}` 
                    : `${darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-100/50 text-gray-700'}`
                }`}
                onClick={() => {
                  item.link && setActiveMenu(item.link);
                  item.subItems.length === 0 && setSidebarOpen(false);
                  toggleSubMenu(item.name);
                }}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium flex-1">{item.name}</span>
                {item.subItems.length > 0 && (
                  <motion.span
                    animate={{ rotate: openSubMenu === item.name ? 180 : 0 }}
                    className="text-lg"
                  >
                    {openSubMenu === item.name ? <FiChevronUp /> : <FiChevronDown />}
                  </motion.span>
                )}
              </motion.div>
              
              {item.subItems.length > 0 && openSubMenu === item.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`ml-6 mt-2 pl-4 border-l-2 ${
                    darkMode ? 'border-gray-600/50' : 'border-gray-300/50'
                  }`}
                >
                  {item.subItems.map((subItem) => (
                    <div
                      key={subItem.name}
                      className={`p-2.5 text-sm rounded mb-1 ${
                        darkMode 
                          ? 'hover:bg-gray-700/30 text-gray-300' 
                          : 'hover:bg-gray-100/70 text-gray-700'
                      }`}
                      onClick={() => {
                        setActiveMenu(subItem.link);
                        setSidebarOpen(false);
                      }}
                    >
                      {subItem.name}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className={`p-4 text-center border-t ${
        darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
      }`}>
        <p className="text-xs">
          ©{" "}
          <a 
            href="https://www.mvsdlab.com" 
            className={`hover:underline ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            MVSD LAB
          </a>, {new Date().getFullYear()}
        </p>
      </div>
    </motion.aside>
  );
};

export default MemberDashboardSidebar;
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clipboard, X, BarChart2, Settings, BookOpen, Users, Bell, LogOut } from 'react-feather';
import { motion } from 'framer-motion';

export default function DirectorDashboardSidebar({ isOpen, onClose, isDarkMode }) {
  const pathname = usePathname();
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/director_dashboard',
      icon: <Home size={20} />,
      delay: 0.1
    },
    { 
      name: 'Approval Panel', 
      path: '/director_dashboard/approval',
      icon: <Clipboard size={20} />,
      delay: 0.2
    },
    { 
      name: 'Analytics', 
      path: '/director_dashboard/analytics',
      icon: <BarChart2 size={20} />,
      delay: 0.3
    },
    { 
      name: 'Publications', 
      path: '/director_dashboard/publications',
      icon: <BookOpen size={20} />,
      delay: 0.4
    },
    { 
      name: 'Team', 
      path: '/director_dashboard/team',
      icon: <Users size={20} />,
      delay: 0.5
    },
    { 
      name: 'Settings', 
      path: '/director_dashboard/settings',
      icon: <Settings size={20} />,
      delay: 0.6
    }
  ];

  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    closed: { 
      x: "-100%",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    closed: { opacity: 0, y: 20 }
  };

  return (
    <motion.div 
      className="sidebar h-full bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200 w-64 border-r border-gray-200 dark:border-gray-700 shadow-xl"
      initial="closed"
      animate={isOpen || window.innerWidth >= 768 ? "open" : "closed"}
      variants={sidebarVariants}
    >
      {/* Top Section with Centered Logo and Title */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {/* Centered Logo and Title */}
        <div className="flex flex-col items-center justify-center w-full relative">
          {/* Logo with animation */}
          <motion.div 
            className="mb-1" // minimal bottom spacing
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            {isDarkMode ? (
              <img 
                src="/images/memberDashboardSidebar_logo_dark.svg" 
                alt="MVSD Lab Logo Dark" 
                className="w-48 h-auto mx-auto" // larger width + centered
              />
            ) : (
              <img 
                src="/images/memberDashboardSidebar_logo_light.svg" 
                alt="MVSD Lab Logo Light" 
                className="w-48 h-auto mx-auto" // larger width + centered
              />
            )}
          </motion.div>

          {/* Title with animation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-s md:text-m font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 text-center">
              Director Portal
            </h2>
          </motion.div>
        </div>

        {/* Close Button (visible only on small screens) */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-3 md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      
      {/* Navigation Menu */}
      <nav className="mt-6 px-2">
        {menuItems.map((item) => (
          <motion.div
            key={item.path}
            variants={itemVariants}
            initial="closed"
            animate={isOpen || window.innerWidth >= 768 ? "open" : "closed"}
            transition={{ delay: item.delay }}
          >
            <Link
              href={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-1 transition-all duration-300 transform hover:scale-[1.02] ${
                pathname === item.path
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => window.innerWidth < 768 && onClose()}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
              {item.path === '/director_dashboard/approval' && (
                <span className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  12
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </nav>
      
      {/* Bottom Section */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">  
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          MVSD LAB © {new Date().getFullYear()}
        </div>
      </div>
    </motion.div>
  );
}
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
      {/* Top Section with Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-white dark:bg-gray-700 rounded-xl p-2 shadow">
            {isDarkMode ? (
              <img 
                src="/images/memberDashboardSidebar_logo_dark.svg" 
                alt="MVSD Lab Logo Dark" 
                className="w-10 h-10"
              />
            ) : (
              <img 
                src="/images/memberDashboardSidebar_logo_light.svg" 
                alt="MVSD Lab Logo Light" 
                className="w-10 h-10"
              />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              Director Portal
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">MVSD Research Lab</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-400 to-indigo-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
              D
            </div>
            <div>
              <p className="text-sm font-medium">Dr. Director</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">director@mvsdlab.edu</p>
            </div>
          </div>
          <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
            <LogOut size={18} />
          </button>
        </div>
        
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          MVSD LAB © {new Date().getFullYear()}
        </div>
      </div>
    </motion.div>
  );
}
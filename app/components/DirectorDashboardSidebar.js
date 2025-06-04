'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clipboard, X, BarChart2, Settings, BookOpen, Users } from 'react-feather';
import { motion } from 'framer-motion';

export default function DirectorDashboardSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/director_dashboard',
      icon: <Home size={20} className="text-sky-300" />,
      delay: 0.1
    },
    { 
      name: 'Approval Panel', 
      path: '/director_dashboard/approval',
      icon: <Clipboard size={20} className="text-sky-300" />,
      delay: 0.2
    },
    { 
      name: 'Analytics', 
      path: '/director_dashboard/analytics',
      icon: <BarChart2 size={20} className="text-sky-300" />,
      delay: 0.3
    },
    { 
      name: 'Publications', 
      path: '/director_dashboard/publications',
      icon: <BookOpen size={20} className="text-sky-300" />,
      delay: 0.4
    },
    { 
      name: 'Team', 
      path: '/director_dashboard/team',
      icon: <Users size={20} className="text-sky-300" />,
      delay: 0.5
    },
    { 
      name: 'Settings', 
      path: '/director_dashboard/settings',
      icon: <Settings size={20} className="text-sky-300" />,
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
      className="sidebar h-full bg-[rgba(5,10,20,0.92)] backdrop-blur-xl text-gray-200 w-64 border-r border-sky-900/40 shadow-2xl flex flex-col"
      initial="closed"
      animate={isOpen || window.innerWidth >= 768 ? "open" : "closed"}
      variants={sidebarVariants}
    >
      {/* Top Section with Centered Logo and Title */}
      <div className="pt-3 pb-2 border-b border-sky-900/40 flex items-center justify-center relative shrink-0">
        {/* Centered Logo and Title */}
        <div className="flex flex-col items-center justify-center w-full">
          {/* Responsive Logo */}
          <motion.div 
            className="w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <img 
              src="/images/memberDashboardSidebar_logo_dark.svg" 
              alt="MVSD Lab Logo" 
              className="w-full max-w-[180px] mx-auto" 
            />
          </motion.div>
        </div>

        {/* Close Button (visible only on small screens) */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 md:hidden text-sky-300 hover:text-white p-1 rounded-full hover:bg-sky-900/40 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Menu - Scrollable Area */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
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
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-all duration-300 ${
                pathname === item.path
                  ? 'bg-gradient-to-r from-sky-500/80 to-indigo-600/80 text-white shadow-lg'
                  : 'text-sky-200 hover:bg-sky-900/40'
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
      <div className="p-4 border-t border-sky-900/40 shrink-0">  
        <div className="text-center text-xs text-sky-400/80">
          MVSD LAB © {new Date().getFullYear()}
        </div>
      </div>
    </motion.div>
  );
}
// app/components/MemberDashboardNavbar.js
import React from 'react';
import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import Image from 'next/image';

const MemberDashboardNavbar = ({ darkMode, setDarkMode, memberData, handleLogout, profileOpen, setProfileOpen, isDesktop, isMobile }) => {
  return (
    <nav className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between">
        {/* Dark Mode Toggle (Desktop only) */}
        <div className="hidden md:flex items-center space-x-4">
          <motion.div 
            className={`relative w-14 h-8 rounded-full p-1 cursor-pointer ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            <motion.div
              className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center shadow ${darkMode ? 'bg-gray-600 text-yellow-400' : 'bg-white text-blue-600'}`}
              animate={{ x: darkMode ? 26 : 0, transition: { type: 'spring', stiffness: 300 } }}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </motion.div>
          </motion.div>
        </div>
        {/* Dashboard Title */}
        <div className="flex justify-center items-center h-full w-full">
          <h1 className={`text-xl font-bold ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600'}`}>
            MEMBER DASHBOARD
          </h1>
        </div>
        {/* Modern Profile Section */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center space-x-4 cursor-pointer group"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            {/* Profile Image with Status Indicator */}
            <div className="relative w-12 h-12">
              <Image
                src={memberData?.photo || '/default-avatar.jpg'}
                alt="Profile"
                width={48}
                height={48}
                className="w-full h-full rounded-full border-2 object-cover"
              />
              {memberData?.status === 'Active' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${darkMode ? 'border-gray-800' : 'border-white'} bg-green-400`}
                />
              )}
            </div>
            {isDesktop && (
              <div className="transition-all flex flex-col leading-tight">
                <span className="font-mono font-bold text-md bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                  {memberData?.id}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                  {memberData?.type}
                </span>
              </div>
            )}
          </motion.div>
          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              className={`absolute right-0 mt-3 max-w-[90vw] min-w-[16rem] rounded shadow-2xl backdrop-blur-lg ${darkMode ? 'bg-gray-800/95 border border-gray-700/60' : 'bg-white/95 border border-gray-200/60'}`}
            >
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700/60' : 'border-gray-200/60'}`}>
                <div className="flex items-center space-x-3">
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {memberData?.first_name} {memberData?.last_name}
                    </p>
                    <p className={`text-sm break-words overflow-wrap-anywhere ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {memberData?.email}
                    </p>
                    {isMobile && (
                      <div className="mt-1">
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          {memberData?.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:hidden p-4 border-b">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Theme
                  </span>
                  <motion.div 
                    className={`relative w-14 h-8 rounded-full p-1 cursor-pointer ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    <motion.div
                      className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center shadow ${darkMode ? 'bg-gray-600 text-yellow-400' : 'bg-white text-blue-600'}`}
                      animate={{ x: darkMode ? 26 : 0, transition: { type: 'spring', stiffness: 300 } }}
                    >
                      {darkMode ? <FaSun /> : <FaMoon />}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <motion.button
                  whileHover={{ x: 5 }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-colors ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'}`}
                >
                  <FiSettings className={`text-lg ${darkMode ? 'text-purple-400' : 'text-blue-500'}`}/>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                    Account Settings
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={handleLogout}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-colors ${darkMode ? 'hover:bg-red-500/20' : 'hover:bg-red-100/50'}`}
                >
                  <FiLogOut className={`text-lg ${darkMode ? 'text-red-400' : 'text-red-500'}`}/>
                  <span className={darkMode ? 'text-red-400' : 'text-red-500'}>
                    Sign Out
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MemberDashboardNavbar;
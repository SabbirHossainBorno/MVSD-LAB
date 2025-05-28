// app/member_dashboard/page.js
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiDatabase } from 'react-icons/fi';
import { LiaProjectDiagramSolid } from "react-icons/lia";

export default function MemberDashboard() {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Research Papers', value: 12, icon: <FiFileText /> },
          { title: 'Publications', value: 3, icon: <LiaProjectDiagramSolid /> },
          { title: 'Ongoing Projects', value: 8, icon: <FiDatabase /> }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded shadow-sm ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700/80' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {React.cloneElement(card.icon, {
                  className: `w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`
                })}
              </div>
              <span className={`text-3xl font-bold ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {card.value}
              </span>
            </div>
            <h3 className={`mt-4 text-sm font-medium ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {card.title}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`mt-8 p-6 rounded ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-semibold ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Recent Activity
          </h2>
          <FiClock className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 rounded flex items-center space-x-4 ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                darkMode ? 'bg-green-400' : 'bg-green-500'
              }`} />
              <div className="flex-1">
                <div className={`h-3 rounded-full mb-2 w-3/4 ${
                  darkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`} />
                <div className={`h-2 rounded-full w-1/2 ${
                  darkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`} />
              </div>
              <div className={`h-2 rounded-full w-1/4 ${
                darkMode ? 'bg-gray-600' : 'bg-gray-300'
              }`} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
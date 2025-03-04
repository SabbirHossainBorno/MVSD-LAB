// app/member_dashboard/add_publication/page.js
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import withAuth from '../../components/withAuth';

const AddPublication = ({ darkMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full space-y-6"
    >
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h1 className={`text-2xl font-bold mb-6 ${
          darkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Add New Publication
        </h1>
        
        <form className="space-y-6">
          {/* Title Field */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Publication Title
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
              } focus:outline-none focus:ring-2`}
              placeholder="Enter publication title"
            />
          </div>

          {/* Authors Field */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Authors
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
              } focus:outline-none focus:ring-2`}
              placeholder="List authors separated by commas"
            />
          </div>

          {/* Publication Date */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Publication Date
            </label>
            <input
              type="date"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
              } focus:outline-none focus:ring-2`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Abstract/Description
            </label>
            <textarea
              rows="5"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
              } focus:outline-none focus:ring-2`}
              placeholder="Enter publication abstract"
            ></textarea>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            type="submit"
          >
            Submit Publication
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default withAuth(AddPublication);
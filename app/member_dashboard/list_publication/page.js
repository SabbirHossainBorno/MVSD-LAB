// app/member_dashboard/member_publication_list/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiFileText, FiCheckCircle, FiClock, FiXCircle, FiExternalLink } from 'react-icons/fi';

const statusConfig = {
  Pending: {
    color: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-800 dark:text-yellow-300',
    icon: <FiClock className="w-4 h-4" />
  },
  Approved: {
    color: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-300',
    icon: <FiCheckCircle className="w-4 h-4" />
  },
  Rejected: {
    color: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-300',
    icon: <FiXCircle className="w-4 h-4" />
  }
};

const PublicationList = ({ darkMode }) => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch('/api/member_publication_list');
        if (!response.ok) throw new Error('Failed to fetch publications');
        const data = await response.json();
        setPublications(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full space-y-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          My Publications
        </h1>

        <div className="grid grid-cols-1 gap-4">
          {publications.map((pub) => {
            const statusInfo = statusConfig[pub.approvalStatus] || {
              color: 'bg-gray-200 dark:bg-gray-700',
              text: 'text-gray-800 dark:text-gray-300',
              icon: null
            };

            return (
              <div
                key={pub.id}
                className={`p-4 rounded-lg border ${
                  darkMode ? 'border-gray-700 bg-gray-700/20' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FiFileText className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        {pub.title}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                      <div>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type: </span>
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {pub.type}
                        </span>
                      </div>
                      <div>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Year: </span>
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {pub.year}
                        </span>
                      </div>
                      <div>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Published: </span>
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {new Date(pub.publishedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {pub.journalName && (
                        <div>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Journal: </span>
                          <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {pub.journalName}
                          </span>
                        </div>
                      )}
                      {pub.conferenceName && (
                        <div>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conference: </span>
                          <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {pub.conferenceName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${statusInfo.color} ${statusInfo.text}`}
                    >
                      {statusInfo.icon}
                      {pub.approvalStatus || 'Unknown'}
                    </div>
                    <button
                      onClick={() => window.open(pub.documentPath, '_blank')}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    >
                      <FiExternalLink className="w-4 h-4" />
                      See Document
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {pub.authors.map((author, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-sm ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {author}
                    </span>
                  ))}
                </div>

                {/* Future Action Buttons (Placeholder) */}
                <div className="flex gap-2 mt-4">
                  <button className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    View
                  </button>
                  <button className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">
                    Edit
                  </button>
                  <button className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {publications.length === 0 && (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No publications found. Start by submitting your first research work!
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default withAuth(PublicationList, 'member');

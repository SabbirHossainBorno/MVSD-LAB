// app/member_dashboard/list_publication/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import withAuth from '../../../components/withAuth';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { FiFileText, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const statusConfig = {
  Pending: { color: 'bg-yellow-100 text-yellow-800', icon: <FiClock className="w-4 h-4" /> },
  Approved: { color: 'bg-green-100 text-green-800', icon: <FiCheckCircle className="w-4 h-4" /> },
  Rejected: { color: 'bg-red-100 text-red-800', icon: <FiXCircle className="w-4 h-4" /> }
};

const PublicationList = ({ darkMode }) => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch('/api/member_publications');
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
          {publications.map((pub) => (
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type: </span>
                      <span className="font-medium">{pub.type}</span>
                    </div>
                    <div>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Year: </span>
                      <span className="font-medium">{pub.year}</span>
                    </div>
                    {pub.journal_name && (
                      <div>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Journal: </span>
                        <span className="font-medium">{pub.journal_name}</span>
                      </div>
                    )}
                    {pub.conference_name && (
                      <div>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conference: </span>
                        <span className="font-medium">{pub.conference_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                      statusConfig[pub.approval_status].color
                    }`}
                  >
                    {statusConfig[pub.approval_status].icon}
                    {pub.approval_status}
                  </span>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Submitted: {new Date(pub.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {pub.impact_factor && (
                <div className="mt-2">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Impact Factor: </span>
                  <span className="font-medium">{pub.impact_factor}</span>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {JSON.parse(pub.authors).map((author, index) => (
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
            </div>
          ))}
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
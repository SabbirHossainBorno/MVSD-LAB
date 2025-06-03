'use client';

import { useState, useEffect, useRef } from 'react';
import FeedbackModal from '../components/FeedbackModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';

export default function DirectorDashboard() {
  const [publications, setPublications] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePublication, setActivePublication] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/director_dashboard');
        const data = await response.json();
        
        if (data.success) {
          setPublications({
            list: data.pendingPublications,
            total: data.totalPendingCount
          });
        } else {
          throw new Error(data.message || 'Failed to fetch publications');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  const handleActionClick = (publication, action) => {
    setActivePublication(publication);
    setActionType(action);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (feedback) => {
    try {
      const response = await fetch('/api/update-publication-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pub_res_id: activePublication.pub_res_id,
          status: actionType === 'approve' ? 'Approved' : 'Rejected',
          feedback
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setPublications(prev => ({
          total: prev.total - 1,
          list: prev.list.filter(pub => pub.pub_res_id !== activePublication.pub_res_id)
        }));
        
        setSuccessMessage(`Publication "${activePublication.title.substring(0, 30)}..." has been ${actionType === 'approve' ? 'approved' : 'rejected'}!`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error('Error updating publication status:', err);
      setError('Failed to update publication status. Please try again.');
    } finally {
      setShowFeedbackModal(false);
    }
  };

  const formatAuthors = (authors) => {
    try {
      const parsed = JSON.parse(authors);
      if (Array.isArray(parsed)) {
        return (
          <div className="flex flex-wrap items-baseline gap-1.5">
            {parsed.map((author, idx) => (
              <span 
                key={idx} 
                className="text-xs bg-gray-100 rounded-full px-2.5 py-1 border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                {author}
              </span>
            ))}
          </div>
        );
      }
      return <span>{authors}</span>;
    } catch {
      return <span>{authors}</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6"
    >
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        actionType={actionType}
        publicationTitle={activePublication?.title || ''}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Director Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and review pending publications
            </p>
          </div>
          <div className="text-sm text-gray-500 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm border border-gray-100">
            Last login: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </motion.div>
        
        {/* Success Message */}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-xl shadow-sm"
          >
            {successMessage}
          </motion.div>
        )}
        
        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Pending Publications
              </h2>
              <p className="text-gray-600 mt-1">
                Review and approve submissions from researchers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                {publications.total} pending
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center font-medium">
                <span>View all</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="space-y-5">
            {publications.list.length > 0 ? publications.list.map((pub, index) => (
              <motion.div 
                key={pub.pub_res_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {pub.type}
                      </span>
                      <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded">
                        ID: {pub.pub_res_id}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {pub.title}
                    </h4>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500 mb-1">
                      Submitted on
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatDate(pub.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                  <div>
                    <p className="font-medium text-gray-700 text-sm mb-1">
                      Authors
                    </p>
                    <div className="text-gray-600">
                      {formatAuthors(pub.authors)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-gray-700 text-sm mb-1">
                        Published Date
                      </p>
                      <p className="text-gray-600 text-sm">
                        {formatDate(pub.published_date)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 text-sm mb-1">
                        Publishing Year
                      </p>
                      <p className="text-gray-600 text-sm">
                        {pub.publishing_year}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-3">
                    <a 
                      href={pub.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Online
                    </a>
                    <a 
                      href={pub.document_path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      Download PDF
                    </a>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleActionClick(pub, 'reject')}
                      className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center shadow-sm hover:shadow"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                    <button 
                      onClick={() => handleActionClick(pub, 'approve')}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 px-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mb-1">
                  No pending publications
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  All publications have been reviewed. Check back later for new submissions.
                </p>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Performance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-gradient-to-r from-white/90 to-indigo-50/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white"
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1 mb-6 md:mb-0 md:pr-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Lab Performance Report
              </h3>
              <p className="text-gray-600 mb-4">
                Quarterly research performance analysis is ready for your review
              </p>
              <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center shadow-md hover:shadow-lg">
                <span>View Full Report</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="w-full md:w-auto flex justify-center">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-dashed border-blue-200 rounded-xl w-full max-w-xs h-48 md:w-64 flex items-center justify-center">
                <span className="text-blue-500 font-medium">Performance Chart</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
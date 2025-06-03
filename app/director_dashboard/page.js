'use client';

import { useState, useEffect } from 'react';
import FeedbackModal from '../components/FeedbackModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';

export default function DirectorDashboard() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePublication, setActivePublication] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/director_dashboard');
        const data = await response.json();
        
        if (data.success) {
          setPublications(data.pendingPublications);
          setDashboardStats(data.stats);
        } else {
          throw new Error(data.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        // Update publications list
        setPublications(prev => prev.filter(
          pub => pub.pub_res_id !== activePublication.pub_res_id
        ));
        
        // Update stats
        setDashboardStats(prev => ({
          pending: prev.pending - 1,
          approved: actionType === 'approve' ? prev.approved + 1 : prev.approved,
          rejected: actionType === 'reject' ? prev.rejected + 1 : prev.rejected
        }));
        
        setSuccessMessage(`Publication has been ${actionType === 'approve' ? 'approved' : 'rejected'}!`);
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
        return parsed;
      }
      if (typeof parsed === 'string') {
        return parsed.split(',').map(a => a.trim());
      }
      return [authors];
    } catch {
      if (typeof authors === 'string') {
        return authors.split(',').map(a => a.trim());
      }
      return [authors];
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        actionType={actionType}
        publicationTitle={activePublication?.title || ''}
      />
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Director Dashboard</h1>
          <p className="text-gray-600 mt-1">Review and manage research publications</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100">
          Last login: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-5 shadow-lg"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium opacity-80">Pending</h3>
              <p className="text-2xl font-bold mt-1">{dashboardStats.pending}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5 shadow-lg"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium opacity-80">Approved</h3>
              <p className="text-2xl font-bold mt-1">{dashboardStats.approved}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl p-5 shadow-lg"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium opacity-80">Rejected</h3>
              <p className="text-2xl font-bold mt-1">{dashboardStats.rejected}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
      
      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-xl"
        >
          {successMessage}
        </motion.div>
      )}
      
      {/* Publications Section */}
      <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Pending Publications</h2>
            <p className="text-gray-600 mt-1">Review and approve submissions from researchers</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full">
              {publications.length} pending
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          {publications.length > 0 ? publications.map((pub, index) => {
            const authors = formatAuthors(pub.authors);
            
            return (
              <motion.div 
                key={pub.pub_res_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {pub.type}
                      </span>
                      <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded">
                        ID: {pub.pub_res_id}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-base">
                      {pub.title}
                    </h4>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs text-gray-500">
                      Submitted on
                    </span>
                    <span className="text-sm font-medium text-gray-700 block">
                      {formatDate(pub.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Authors
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {authors.map((author, idx) => (
                      <div 
                        key={idx} 
                        className="relative inline-flex items-center px-3 py-1.5 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {author}
                        <sup className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[0.5rem] font-bold">
                          {idx + 1}
                        </sup>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">
                      Published Date
                    </h4>
                    <p className="text-sm text-gray-800">
                      {formatDate(pub.published_date)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">
                      Publishing Year
                    </h4>
                    <p className="text-sm text-gray-800">
                      {pub.publishing_year}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3">
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
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleActionClick(pub, 'reject')}
                      className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center shadow-sm text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                    <button 
                      onClick={() => handleActionClick(pub, 'approve')}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center shadow-md text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          }) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 px-4 bg-gray-50 rounded-xl border border-gray-200"
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
    </div>
  );
}
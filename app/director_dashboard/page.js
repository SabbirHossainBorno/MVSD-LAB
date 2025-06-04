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
  const [lastLogin, setLastLogin] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/director_dashboard');
        const data = await response.json();
        
        if (data.success) {
          setPublications(data.pendingPublications);
          setDashboardStats(data.stats);

          // Set last login time from API response
          if (data.director.lastLogin) {
            setLastLogin(new Date(data.director.lastLogin));
          }
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

  const renderAuthors = (authors) => {
    // If authors is already an array, use it directly
    if (Array.isArray(authors)) {
      return authors;
    }
    
    // Try to parse if it's a string
    try {
      return JSON.parse(authors);
    } catch {
      return [authors];
    }
  };
  const formatLastLogin = (date) => {
    if (!date) return "First login";
    
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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
      publicationId={activePublication?.pub_res_id || ''}
      candidateId={activePublication?.phd_candidate_id || ''}
      submittedDate={activePublication?.created_at ? formatDate(activePublication.created_at) : ''}
    />
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Left Section */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Review and manage research publications</p>
        </div>
        
        {/* Last Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="relative w-full sm:w-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-400 -translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-blue-300 translate-x-1/4 translate-y-1/4"></div>
          </div>
          
          <div className="relative z-10 flex items-center p-3 sm:px-4 sm:py-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1.5 sm:p-2 rounded-lg shadow-sm flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div className="ml-3 min-w-0">
              <p className="text-xs font-medium text-gray-500 truncate">Last login</p>
              <p className="text-sm font-medium text-gray-800 truncate">
                {lastLogin ? formatLastLogin(lastLogin) : "Loading..."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Stats Overview - Compact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Pending Card - Yellow Theme */}
        <motion.div 
          whileHover={{ scale: 1.03, y: -5 }}
          className="bg-white rounded-2xl p-5 border border-amber-100 shadow-lg relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-50 opacity-80"></div>
          <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-amber-100 opacity-40"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h3 className="text-sm font-medium text-amber-700">Pending</h3>
              <p className="text-3xl font-bold mt-1 text-amber-600">{dashboardStats.pending}</p>
              <div className="flex items-center mt-2">
                <div className="w-8 h-1 bg-amber-300 rounded-full mr-1"></div>
                <div className="w-6 h-1 bg-amber-200 rounded-full mr-1"></div>
                <div className="w-4 h-1 bg-amber-100 rounded-full"></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-3 rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
        
        {/* Approved Card - Green Theme */}
        <motion.div 
          whileHover={{ scale: 1.03, y: -5 }}
          className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-lg relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 opacity-60 transform rotate-45 translate-x-4 -translate-y-4"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h3 className="text-sm font-medium text-emerald-700">Approved</h3>
              <p className="text-3xl font-bold mt-1 text-emerald-600">{dashboardStats.approved}</p>
              <div className="mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-emerald-500 font-medium">All time</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
        
        {/* Rejected Card - Red Theme */}
        <motion.div 
          whileHover={{ scale: 1.03, y: -5 }}
          className="bg-white rounded-2xl p-5 border border-rose-100 shadow-lg relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-50 rounded-full opacity-50 -translate-x-6 translate-y-6"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h3 className="text-sm font-medium text-rose-700">Rejected</h3>
              <p className="text-3xl font-bold mt-1 text-rose-600">{dashboardStats.rejected}</p>
              <div className="mt-2 flex items-center">
                <div className="w-4 h-4 rounded-full bg-rose-200 mr-2 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                </div>
                <span className="text-xs text-rose-500 font-medium">Requires review</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-400 to-rose-600 p-3 rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          className="mb-6 p-3 bg-green-100 border border-green-200 text-green-700 rounded-xl text-sm"
        >
          {successMessage}
        </motion.div>
      )}
      
      {/* Publications Section - Compact Design */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Pending Publication/Research</h2>
            <p className="text-gray-600 text-sm mt-1">Review submissions from researchers</p>
          </div>
          <div className="relative inline-flex items-center group">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-800 text-xs font-medium px-4 py-1.5 rounded border border-indigo-100 shadow-inner flex items-center transition-all duration-300 group-hover:shadow-md group-hover:border-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>
                Recent <span className="font-semibold">{publications.length}</span> Pending
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {publications.length > 0 ? publications.map((pub, index) => {
            const authors = renderAuthors(pub.authors);
            
            return (
              <motion.div 
  key={pub.pub_res_id}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, delay: index * 0.03 }}
  className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-all duration-200"
>
  <div className="flex flex-col gap-3">
    {/* Top Line */}
    <div className="flex flex-wrap justify-between items-start gap-2">
      {/* Left Section */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
          {pub.pub_res_id}
        </span>
        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
          {pub.type}
        </span>
        <h4 className="font-semibold text-gray-900 text-sm truncate" title={pub.title}>
          {pub.title}
        </h4>
      </div>
      
      <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded pl-2 pr-3 py-0.5 border border-blue-100 shadow-sm text-xs">
        <div className="flex items-center pr-2 border-r border-blue-100 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span className="font-medium text-blue-700 mr-1">On :</span>
          <span className="font-semibold text-gray-800">{formatDate(pub.created_at)}</span>
        </div>
        
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-indigo-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span className="font-medium text-indigo-700 mr-1">By :</span>
          <span className="font-semibold text-gray-800 truncate max-w-[80px]">{pub.phd_candidate_id}</span>
        </div>
      </div>
    </div>
    
    {/* Bottom Line */}
    <div className="flex flex-wrap justify-between items-center gap-2">
      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {authors.length} authors
        </div>
        
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {pub.publishing_year}
        </div>
        
        <div className="flex items-center gap-1">
          <a 
            href={pub.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center p-1 rounded hover:bg-blue-50 transition-colors"
            title="View Online"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          
          <a 
            href={pub.document_path} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center p-1 rounded hover:bg-blue-50 transition-colors"
            title="Download PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex gap-1">
        <button 
          onClick={() => handleActionClick(pub, 'reject')}
          className="text-xs px-2 py-1 bg-gradient-to-r from-red-100 to-red-50 border border-red-200 text-red-700 rounded hover:bg-red-200 transition-all duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reject
        </button>
        
        <button 
          onClick={() => handleActionClick(pub, 'approve')}
          className="text-xs px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded hover:opacity-90 transition-all duration-200 flex items-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Approve
        </button>
      </div>
    </div>
  </div>
</motion.div>
            );
          }) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                No pending publications
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                All publications have been reviewed. Check back later for new submissions.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
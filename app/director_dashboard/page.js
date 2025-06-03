'use client';

import { useState, useEffect } from 'react';
import FeedbackModal from '../components/FeedbackModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DirectorDashboard() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePublication, setActivePublication] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/director_dashboard');
        const data = await response.json();
        
        if (data.success) {
          setPublications(data.pendingPublications);
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
      // Send decision to API
      const response = await fetch('/api/update-publication-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pub_res_id: activePublication.pub_res_id,
          status: actionType === 'approve' ? 'Approved' : 'Rejected',
          feedback
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update UI by removing the publication from the list
        setPublications(prev => prev.filter(
          pub => pub.pub_res_id !== activePublication.pub_res_id
        ));
        
        setSuccessMessage(`Publication "${activePublication.title.substring(0, 30)}..." has been ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
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
        return parsed.join(', ');
      }
      return authors;
    } catch {
      return authors;
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
    <div className="p-4 md:p-6">
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        actionType={actionType}
        publicationTitle={activePublication?.title || ''}
      />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Director Dashboard
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last login: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Pending Publications
          </h2>
          <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            {publications.length} pending
          </span>
        </div>
        
        <div className="space-y-4">
          {publications.length > 0 ? publications.map(pub => (
            <div 
              key={pub.pub_res_id}
              className="bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 p-4 transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {pub.title}
                </h4>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  {pub.type}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Authors:</span> {formatAuthors(pub.authors)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Published:</span> {formatDate(pub.published_date)}
                </p>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex space-x-3">
                  <a 
                    href={pub.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Online
                  </a>
                  <a 
                    href={pub.document_path} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Download PDF
                  </a>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleActionClick(pub, 'reject')}
                    className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                  <button 
                    onClick={() => handleActionClick(pub, 'approve')}
                    className="px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">No pending publications</p>
              <p className="mt-1">All publications have been reviewed</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center justify-center">
            <span>View all pending publications</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1 mb-6 md:mb-0 md:pr-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Lab Performance Report
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Quarterly research performance analysis is ready for your review
            </p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center">
              <span>View Full Report</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="w-full md:w-auto">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl w-full h-48 md:w-64" />
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  actionType, 
  publicationTitle,
  candidateId,
  publicationId,
  submittedDate 
}) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = () => {
    if (actionType === 'reject' && !feedback.trim()) {
      alert('Feedback is required for rejections');
      return;
    }
    
    setSubmitting(true);
    onSubmit(feedback);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Modal Header */}
            <div className={`p-6 ${
              actionType === 'approve' 
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                : 'bg-gradient-to-r from-rose-400 to-rose-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    actionType === 'approve' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    {actionType === 'approve' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {actionType === 'approve' ? 'Approve Publication/Research' : 'Reject Publication/Research'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white rounded-full p-1 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-5">
                <div className="text-sm font-medium text-gray-500 mb-1">Publication</div>
                <div className="text-lg font-semibold text-gray-800 bg-gray-50 rounded-lg px-4 py-3 mb-4">
                  {publicationTitle}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-blue-600 font-medium">PUBLICATION/RESEARCH ID</div>
                        <div className="text-sm font-semibold text-gray-800">{publicationId}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-purple-600 font-medium">SUBMITTED BY</div>
                        <div className="text-sm font-semibold text-gray-800">{candidateId}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-xl p-4 col-span-1 md:col-span-2">
                    <div className="flex items-center">
                      <div className="bg-amber-100 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-amber-600 font-medium">SUBMITTED ON</div>
                        <div className="text-sm font-semibold text-gray-800">{submittedDate}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="feedback" className="text-sm font-medium text-gray-700">
                    Feedback {actionType === 'reject' && <span className="text-rose-500">*</span>}
                  </label>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    actionType === 'approve' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {actionType === 'reject' ? 'Required' : 'Optional'}
                  </span>
                </div>
                <motion.div
                  whileFocus={{ borderColor: actionType === 'approve' ? '#10b981' : '#f43f5e' }}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:shadow-lg transition-all"
                >
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full h-40 p-4 bg-white text-gray-800 placeholder-gray-400 focus:outline-none resize-none"
                    placeholder={`Enter your feedback for this publication/research...`}
                    required={actionType === 'reject'}
                  />
                </motion.div>
                <div className="text-xs text-gray-500 mt-1">
                  {actionType === 'reject' 
                    ? 'Please provide clear reasons for rejection' 
                    : 'Any suggestions for the author?'}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={onClose}
                  disabled={submitting}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={submitting}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-5 py-2.5 text-white rounded-xl font-medium transition disabled:opacity-50 ${
                    actionType === 'approve' 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' 
                      : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    actionType === 'approve' ? 'Approve' : 'Reject'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
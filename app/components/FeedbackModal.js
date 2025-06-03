'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function FeedbackModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  actionType, 
  publicationTitle 
}) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSubmit = () => {
    if (actionType === 'reject' && !feedback.trim()) {
      alert('Feedback is required for rejections');
      return;
    }
    
    setSubmitting(true);
    onSubmit(feedback);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          {actionType === 'approve' ? 'Approve Publication' : 'Reject Publication'}
        </h2>
        
        <p className="mb-2 text-gray-700 dark:text-gray-300">
          Publication: <span className="font-medium">{publicationTitle}</span>
        </p>
        
        <div className="mb-4">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Feedback {actionType === 'reject' ? '(required)' : '(optional)'}
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Enter your feedback for this publication...`}
            required={actionType === 'reject'}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-4 py-2 text-white rounded-md transition disabled:opacity-50 ${
              actionType === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
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
              'Submit'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
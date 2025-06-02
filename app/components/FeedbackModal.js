'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function FeedbackModal({ isOpen, onClose, onSubmit, actionType, publicationTitle }) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSubmit = () => {
    if (!feedback.trim()) {
      alert('Please provide feedback');
      return;
    }
    
    setSubmitting(true);
    onSubmit(feedback);
    setSubmitting(false);
    setFeedback('');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          {actionType === 'approve' ? 'Approve Publication' : 'Reject Publication'}
        </h2>
        
        <p className="mb-2 text-gray-700 dark:text-gray-300">
          Publication: <span className="font-medium">{publicationTitle.substring(0, 40)}...</span>
        </p>
        
        <div className="mb-4">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Feedback {actionType === 'reject' ? '(required)' : ''}
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full h-32 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={`Enter your feedback for this publication...`}
            required={actionType === 'reject'}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-4 py-2 text-white rounded-md transition ${
              actionType === 'approve' 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
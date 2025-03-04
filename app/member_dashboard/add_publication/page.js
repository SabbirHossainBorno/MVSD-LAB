// app/member_dashboard/add_publication/page.js
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import withAuth from '../../components/withAuth';

const AddPublication = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    title: '',
    authors: [],
    date: '',
    abstract: '',
    pdf: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');

  // Add author to list
  const addAuthor = () => {
    if (newAuthor.trim()) {
      setFormData(prev => ({
        ...prev,
        authors: [...prev.authors, newAuthor.trim()]
      }));
      setNewAuthor('');
    }
  };

  // Remove author from list
  const removeAuthor = (index) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, pdf: file }));
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.authors.length === 0) newErrors.authors = 'At least one author required';
    if (!formData.date) newErrors.date = 'Publication date required';
    if (!formData.abstract.trim()) newErrors.abstract = 'Abstract is required';
    if (!formData.pdf) newErrors.pdf = 'PDF upload required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formData.authors.forEach(author => formPayload.append('authors[]', author));
      formPayload.append('date', formData.date);
      formPayload.append('abstract', formData.abstract);
      formPayload.append('pdf', formData.pdf);

      const response = await fetch('/api/publications', {
        method: 'POST',
        body: formPayload
      });

      if (!response.ok) throw new Error('Submission failed');
      
      toast.success('Publication submitted successfully!');
      setFormData({
        title: '',
        authors: [],
        date: '',
        abstract: '',
        pdf: null
      });
    } catch (error) {
      toast.error(error.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full space-y-6"
    >
      <div className={`p-6 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Add New Publication
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Publication Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2.5 rounded border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
              } focus:outline-none focus:ring-2`}
              placeholder="Enter publication title"
              aria-label="Publication title"
              required
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Authors Field */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Authors *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.authors.map((author, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {author}
                  <button
                    type="button"
                    onClick={() => removeAuthor(index)}
                    className="hover:text-red-500 focus:outline-none"
                    aria-label="Remove author"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className={`flex-1 px-4 py-2.5 rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                    : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
                } focus:outline-none focus:ring-2`}
                placeholder="Add author"
                aria-label="Add author"
              />
              <button
                type="button"
                onClick={addAuthor}
                className={`px-4 py-2.5 rounded ${
                  darkMode 
                    ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Add
              </button>
            </div>
            {errors.authors && <p className="text-red-500 text-sm mt-1">{errors.authors}</p>}
          </div>

          {/* Publication Date */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Publication Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-4 py-2.5 rounded border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
              } focus:outline-none focus:ring-2`}
              aria-label="Publication date"
              required
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Abstract/Description *
            </label>
            <textarea
              rows="5"
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              className={`w-full px-4 py-2.5 rounded border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
              } focus:outline-none focus:ring-2`}
              placeholder="Enter publication abstract"
              aria-label="Publication abstract"
              required
            ></textarea>
            {errors.abstract && <p className="text-red-500 text-sm mt-1">{errors.abstract}</p>}
          </div>

          {/* PDF Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Upload PDF *
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className={`w-full p-2 rounded border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100' 
                  : 'bg-white border-gray-300 text-gray-800'
              } file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 ${
                darkMode 
                  ? 'file:bg-gray-600 file:text-gray-100' 
                  : 'file:bg-gray-200 file:text-gray-700'
              }`}
              aria-label="Upload PDF"
              required
            />
            {errors.pdf && <p className="text-red-500 text-sm mt-1">{errors.pdf}</p>}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-purple-600 hover:bg-purple-500 text-gray-100' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            } ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            type="submit"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Publication'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default withAuth(AddPublication);
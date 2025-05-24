// app/member_dashboard/add_publication/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';

const typeCodes = {
  'Conference Paper': 'CONF_PAPER',
  'Journal Paper': 'JOURNAL_PAPER',
  'Book/Chapter': 'BOOK_CHAPTER',
  'Patent': 'PATENT',
  'Project': 'PROJECT'
};

const publicationTypes = Object.keys(typeCodes);

const AddPublication = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    year: '',
    authors: [],
    publishedDate: '',
    link: '',
    document: null
  });

  const [newAuthor, setNewAuthor] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!Cookies.get('id') || !Cookies.get('type')) {
      toast.error('Authentication required. Please login again.');
    }
  }, []);

  const addAuthor = () => {
    if (newAuthor.trim()) {
      setFormData(prev => ({
        ...prev,
        authors: [...prev.authors, newAuthor.trim()]
      }));
      setNewAuthor('');
    }
  };

  const removeAuthor = (index) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, document: file }));
    } else {
      toast.error('Only PDF files are allowed');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = 'Publication type is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear()) newErrors.year = 'Invalid year';
    if (formData.authors.length === 0) newErrors.authors = 'At least one author required';
    if (!formData.link) newErrors.link = 'Link is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      const memberId = Cookies.get('id');
      const memberType = Cookies.get('type');

      // Manually append fields with backend-expected keys
      formPayload.append('type', formData.type);
      formPayload.append('title', formData.title);
      formPayload.append('publishing_year', formData.year); // Correct backend key
      formPayload.append('authors', JSON.stringify(formData.authors));
      formPayload.append('published_date', formData.publishedDate); // Correct backend key
      formPayload.append('link', formData.link);
      if (formData.document) {
        formPayload.append('document', formData.document);
      }

      // Add member metadata
      formPayload.append('memberId', memberId);
      formPayload.append('memberType', memberType);

      const response = await fetch('/api/member_publication_add', {
        method: 'POST',
        body: formPayload
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Submission failed');
      }
      
      toast.success('Publication submitted successfully!');
      
      // Reset form
      setFormData({
        type: '',
        title: '',
        year: '',
        authors: [],
        publishedDate: '',
        link: '',
        document: null
      });
      
      // Reset file input
      document.querySelector('input[type="file"]').value = '';

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
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}

      <div className={`p-6 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Add New Publication/Research
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Publication/Research Type */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Publication/Research Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={`w-full px-4 py-2.5 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
              required
            >
              <option value="">Select Publication/Research Type</option>
              {publicationTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2.5 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                placeholder="Enter Publication/Research Title"
                required
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Publishing Year *
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className={`w-full px-4 py-2.5 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                placeholder="Enter Publication/Research Year"
                min="1900"
                max={new Date().getFullYear()}
                required
              />
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
            </div>
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
                  className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
                >
                  {author}
                  <button
                    type="button"
                    onClick={() => removeAuthor(index)}
                    className="hover:text-red-500 focus:outline-none"
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
                className={`flex-1 px-4 py-2.5 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                placeholder="Add Author"
              />
              <button
                type="button"
                onClick={addAuthor}
                className={`px-4 py-2.5 rounded ${darkMode ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
              >
                Add
              </button>
            </div>
            {errors.authors && <p className="text-red-500 text-sm mt-1">{errors.authors}</p>}
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Published Date (Optional)
              </label>
              <input
                type="date"
                value={formData.publishedDate}
                onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                className={`w-full px-4 py-2.5 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Link *
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className={`w-full px-4 py-2.5 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                placeholder="Enter Publication/Research URL"
                required
              />
              {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Upload Document (PDF - Optional)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className={`w-full p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800'} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 ${darkMode ? 'file:bg-gray-600 file:text-gray-100' : 'file:bg-gray-200 file:text-gray-700'}`}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`w-full py-3 rounded font-medium transition-colors ${darkMode ? 'bg-purple-600 hover:bg-purple-500 text-gray-100' : 'bg-purple-600 hover:bg-purple-700 text-white'} ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            type="submit"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default withAuth(AddPublication, 'member');
// app/member_dashboard/add_publication/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import withAuth from '../../components/withAuth';

const typeCodes = {
  'International Journal': 'INT_JOURNAL',
  'Domestic Journal': 'DOM_JOURNAL',
  'International Conference': 'INT_CONF',
  'Domestic Conference': 'DOM_CONF'
};

const publicationTypes = Object.keys(typeCodes); // Define publicationTypes array

const AddPublication = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    year: '',
    journalName: '',
    conferenceName: '',
    authors: [],
    volume: '',
    issue: '',
    pageCount: '',
    publishedDate: '',
    impactFactor: '',
    link: ''
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [newAuthor, setNewAuthor] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve type and id from cookies
  useEffect(() => {
    const memberId = Cookies.get('id');
    const memberType = Cookies.get('type');
    console.log('Member ID:', memberId); // Debugging log
    console.log('Member Type:', memberType); // Debugging log

    if (!memberId || !memberType) {
      toast.error('Authentication required. Please login again.');
    }
  }, []);

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
    if (file && (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFormData(prev => ({ ...prev, document: file }));
    } else {
      toast.error('Only PDF and DOC files are allowed');
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = 'Publication type is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (formData.authors.length === 0) newErrors.authors = 'At least one author required';

    if (formData.type.includes('Journal')) {
      if (!formData.journalName) newErrors.journalName = 'Journal name is required';
      if (!formData.volume) newErrors.volume = 'Volume is required';
      if (!formData.issue) newErrors.issue = 'Issue is required';
    }

    if (formData.type.includes('Conference')) {
      if (!formData.conferenceName) newErrors.conferenceName = 'Conference name is required';
    }

    if (!formData.pageCount) newErrors.pageCount = 'Page count is required';
    if (!formData.document) newErrors.document = 'Document upload required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const memberId = Cookies.get('id');
    const memberType = Cookies.get('type');

    console.log('Member ID:', memberId); // Debugging log
    console.log('Member Type:', memberType); // Debugging log

    if (!memberId || !memberType) {
      toast.error('Authentication required. Please login again.');
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formPayload = new FormData();

      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'authors') {
          formPayload.append(key, JSON.stringify(value));
        } else {
          formPayload.append(key, value);
        }
      });

      // Append the document file
      formPayload.append('document', documentFile);

      // Add member ID and type
      formPayload.append('memberId', memberId);
      formPayload.append('memberType', memberType);

      const response = await fetch('/api/member_publication_add', {
        method: 'POST',
        body: formPayload
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Publication submission failed');
      }

      toast.success('Publication submitted successfully!');

      // Reset form
      setFormData({
        type: '',
        title: '',
        year: '',
        journalName: '',
        conferenceName: '',
        authors: [],
        volume: '',
        issue: '',
        pageCount: '',
        publishedDate: '',
        impactFactor: '',
        link: ''
      });

      // Reset file input
      setDocumentFile(null);
      document.querySelector('input[type="file"]').value = '';

    } catch (error) {
      toast.error(error.message || 'Failed to submit publication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isJournal = formData.type.includes('Journal');
  const isConference = formData.type.includes('Conference');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full space-y-6"
    >
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Add New Publication
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Publication Type */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Publication Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
              required
            >
              <option value="">Select Publication Type</option>
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
                Publication Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                placeholder="Enter publication title"
                required
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Year *
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                placeholder="Enter publication year"
                min="1900"
                max={new Date().getFullYear()}
                required
              />
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
            </div>
          </div>
          {/* Journal/Conference Specific Fields */}
          {isJournal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Journal Name *
                </label>
                <input
                  type="text"
                  value={formData.journalName}
                  onChange={(e) => setFormData({ ...formData, journalName: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                  placeholder="Enter journal name"
                  required
                />
                {errors.journalName && <p className="text-red-500 text-sm mt-1">{errors.journalName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Volume *
                  </label>
                  <input
                    type="text"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                    placeholder="Volume"
                    required
                  />
                  {errors.volume && <p className="text-red-500 text-sm mt-1">{errors.volume}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Issue *
                  </label>
                  <input
                    type="text"
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                    placeholder="Issue"
                    required
                  />
                  {errors.issue && <p className="text-red-500 text-sm mt-1">{errors.issue}</p>}
                </div>
              </div>
            </div>
          )}
          {isConference && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Conference Name *
              </label>
              <input
                type="text"
                value={formData.conferenceName}
                onChange={(e) => setFormData({ ...formData, conferenceName: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                placeholder="Enter conference name"
                required
              />
              {errors.conferenceName && <p className="text-red-500 text-sm mt-1">{errors.conferenceName}</p>}
            </div>
          )}
          {/* Authors Field */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Authors *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.authors.map((author, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
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
                className={`flex-1 px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                placeholder="Add author"
                aria-label="Add author"
              />
              <button
                type="button"
                onClick={addAuthor}
                className={`px-4 py-2.5 rounded-lg ${darkMode ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
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
                Page Count (e.g., 1-67) *
              </label>
              <input
                type="text"
                value={formData.pageCount}
                onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                placeholder="Enter page range"
                required
              />
              {errors.pageCount && <p className="text-red-500 text-sm mt-1">{errors.pageCount}</p>}
            </div>
            {isJournal && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Impact Factor (IF)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.impactFactor}
                  onChange={(e) => setFormData({ ...formData, impactFactor: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                  placeholder="Enter impact factor"
                />
              </div>
            )}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Published Date (Optional)
              </label>
              <input
                type="date"
                value={formData.publishedDate}
                onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Link (Optional)
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'} focus:outline-none focus:ring-2`}
                placeholder="Enter publication URL"
              />
            </div>
          </div>
          {/* Document Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Upload Document (PDF/DOC) *
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800'} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 ${darkMode ? 'file:bg-gray-600 file:text-gray-100' : 'file:bg-gray-200 file:text-gray-700'}`}
              required
            />
            {errors.document && <p className="text-red-500 text-sm mt-1">{errors.document}</p>}
          </div>
          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-purple-600 hover:bg-purple-500 text-gray-100' : 'bg-purple-600 hover:bg-purple-700 text-white'} ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
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
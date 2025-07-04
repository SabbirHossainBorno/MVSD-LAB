// app/member_dashboard/edit_publication/[id]/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import withAuth from '../../../components/withAuth';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { FiEdit, FiFileText, FiCheckCircle, FiClock, FiXCircle, FiExternalLink, FiSearch, FiFilter, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';

const typeCodes = {
  'Conference Paper': 'CONF_PAPER',
  'Journal Paper': 'JOURNAL_PAPER',
  'Book/Chapter': 'BOOK_CHAPTER',
  'Patent': 'PATENT',
  'Project': 'PROJECT'
};

const publicationTypes = Object.keys(typeCodes);

const EditPublication = ({ params, darkMode }) => {
  const { id } = params;
  const router = useRouter();
  const [formData, setFormData] = useState(null);
  const [newAuthor, setNewAuthor] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDocument, setExistingDocument] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [hasPublishedDate, setHasPublishedDate] = useState(false);

  // Add back button handler
  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const response = await fetch(`/api/member_publication_edit/${id}`);
        if (!response.ok) throw new Error('Failed to fetch publication');
        const data = await response.json();

        console.log('API Response:', data); // Debug log
        
        if (data.publication.approvalStatus === 'Approved') {
          setIsApproved(true);
          toast.warning('Approved publications cannot be edited');
          return;
        }

        const hasPubDate = !!data.publication.publishedDate;
        setHasPublishedDate(hasPubDate);

        setFormData({
          type: data.publication.type,
          title: data.publication.title,
          year: data.publication.year,
          authors: Array.isArray(data.publication.authors) ? data.publication.authors : [],
          publishedDate: data.publication.publishedDate || '',
          link: data.publication.link,
          document: null
        });
        setExistingDocument(data.publication.documentPath);
      } catch (error) {
        toast.error(error.message);
        router.push('/member_dashboard/member_publication_list');
      }
    };
    
    if (!Cookies.get('id')) {
      toast.error('Authentication required');
      router.push('/login');
    } else {
      fetchPublication();
    }
  }, [id, router]);

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
      formPayload.append('type', formData.type);
      formPayload.append('title', formData.title);
      formPayload.append('publishing_year', formData.year);
      formPayload.append('authors', JSON.stringify(formData.authors));
      formPayload.append('published_date', formData.publishedDate);
      formPayload.append('link', formData.link);
      // Handle document removal
    if (formData.document === 'REMOVE') {
      formPayload.append('removeDocument', 'true');
    } else if (formData.document) {
      formPayload.append('document', formData.document);
    }

      // Add this to clear existing document if removed
    if (!existingDocument) {
      formPayload.append('existingDocument', '');
    }

      const response = await fetch(`/api/member_publication_edit/${id}`, {
        method: 'PUT',
        body: formPayload
      });

      const responseData = await response.json();
      
      if (!response.ok) throw new Error(responseData.message || 'Update failed');
      
      toast.success('Publication updated successfully!');
      router.push('/member_dashboard');
    } catch (error) {
      toast.error(error.message || 'Update failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) return <LoadingSpinner />;

  if (isApproved) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className={`text-center p-8 rounded-3xl ${
          darkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-white/70 text-gray-500'
        } shadow-2xl backdrop-blur-sm`}>
          Approved publications cannot be edited
        </div>
      </div>
    );
  }

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
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={handleBack}
            className={`p-2 rounded-full ${
              darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Edit Publication/Research
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Publication/Research Type - DISABLED */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Publication/Research Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={`w-full px-4 py-2.5 rounded border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
              } focus:outline-none focus:ring-2 disabled:opacity-70 disabled:cursor-not-allowed`}
              disabled
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
                className={`w-full px-4 py-2.5 rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                    : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
                } focus:outline-none focus:ring-2`}
                placeholder="Enter Publication/Research Title"
                required
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Publishing Year - DISABLED */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Publishing Year *
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className={`w-full px-4 py-2.5 rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                    : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
                } focus:outline-none focus:ring-2 disabled:opacity-70 disabled:cursor-not-allowed`}
                placeholder="Enter Publication/Research Year"
                min="1900"
                max={new Date().getFullYear()}
                required
                disabled
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
              {formData.authors?.length > 0 ? (
                formData.authors.map((author, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
                      darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <span>{author}</span>
                      <sup className="ml-1 text-[0.6rem] font-bold">{index + 1}</sup>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="hover:text-red-500 focus:outline-none"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No authors listed
                </p>
              )}
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
                placeholder="Add Author"
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

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Published Date - Conditionally disabled */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Published Date (Optional)
              </label>
              <input
                type="date"
                value={formData.publishedDate?.split('T')[0] || ''}
                onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                className={`w-full px-4 py-2.5 rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                    : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
                } focus:outline-none focus:ring-2 ${
                  hasPublishedDate ? 'disabled:opacity-70 disabled:cursor-not-allowed' : ''
                }`}
                disabled={hasPublishedDate}
              />
              {hasPublishedDate && (
                <p className={`mt-1 text-xs ${
                  darkMode ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  Published date cannot be changed once set
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Link *
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className={`w-full px-4 py-2.5 rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500' 
                    : 'bg-white border-gray-300 text-gray-800 focus:ring-purple-600'
                } focus:outline-none focus:ring-2`}
                placeholder="Enter Publication/Research URL"
                required
              />
              {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
            </div>
          </div>

          {/* Document Section */}
          <div className="space-y-4">
            {existingDocument && (
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <span className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Existing Document
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <FiFileText className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {existingDocument.split('/').pop()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={existingDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1.5 rounded flex items-center gap-2 ${
                      darkMode ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
                    }`}
                  >
                    <FiExternalLink className="w-4 h-4" />
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setExistingDocument(null);
                      setFormData(prev => ({ ...prev, document: 'REMOVE' }));
                    }}
                    className={`px-3 py-1.5 rounded flex items-center gap-2 ${
                      darkMode ? 'bg-gray-700 text-red-400 hover:bg-gray-600' : 'bg-gray-100 text-red-600 hover:bg-gray-200'
                    }`}
                  >
                    <FiXCircle className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Document Upload Field */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {existingDocument ? 'Upload New Document' : 'Upload Document (PDF - Optional)'}
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={!!existingDocument}
                  className={`w-full p-2 rounded border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800'
                  } file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 ${
                    darkMode ? 'file:bg-gray-600 file:text-gray-100' : 'file:bg-gray-200 file:text-gray-700'
                  } ${existingDocument ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {existingDocument && (
                  <p className={`mt-2 text-sm ${
                    darkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    To upload a new document, please remove the existing one first.
                  </p>
                )}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`w-full py-3 rounded font-medium transition-colors ${
              darkMode 
                ? 'bg-purple-600 hover:bg-purple-500 text-gray-100' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            } ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            type="submit"
          >
            {isSubmitting ? 'Re-Submitting...' : 'Re-Submit'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default withAuth(EditPublication, 'member');
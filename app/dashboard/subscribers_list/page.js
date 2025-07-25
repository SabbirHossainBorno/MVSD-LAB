// app/dashboard/subscribe_list/page.js
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';


const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { backgroundColor: 'rgba(55, 65, 81, 0.4)' }
};

const debounce = (func, delay) => {
  let timeoutId;
  const debouncedFunc = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
  
  debouncedFunc.cancel = () => {
    clearTimeout(timeoutId);
  };
  
  return debouncedFunc;
};

function SubscribersList() {
  const [subscribers, setSubscribers] = useState([]);
  const [totalCount, setTotalCount] = useState(0); // NEW: Total count
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'date', order: 'DESC' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // NEW: Email modal state with file attachments
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailCC, setEmailCC] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  // Detect mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        sortField: sortConfig.field,
        sortOrder: sortConfig.order,
        dateRange
      });

      const response = await fetch(`/api/subscribers_list?${params}`);
      const result = await response.json();

      if (response.ok) {
        setSubscribers(result.subscribers);
        setTotalCount(result.totalCount); // NEW: Set total count
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortConfig, dateRange]);

  useEffect(() => {
    const debouncedFetch = debounce(fetchSubscribers, 300);
    debouncedFetch();
    
    return () => debouncedFetch.cancel();
  }, [fetchSubscribers]);

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'DESC' ? 'ASC' : 'DESC'
    }));
  };

  const handleDateFilter = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateRange(`${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange('');
    setSortConfig({ field: 'date', order: 'DESC' });
  };

  // Calculate pagination
  const totalPages = Math.ceil(subscribers.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, subscribers.length);

  // Format date based on screen size
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isMobile
      ? format(date, 'MM/dd hh:mm a') // Show both date and time on mobile
      : format(date, 'MMM dd, yyyy - hh:mm a');
  };

  // NEW: Handle file attachments
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.size <= 5 * 1024 * 1024 // 5MB limit
    );
    
    if (validFiles.length !== files.length) {
      toast.error('Some files exceed the 5MB limit');
    }
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // NEW: Send bulk email with attachments
  const sendBulkEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Subject and body are required');
      return;
    }

    setIsSending(true);
    
    try {
      const formData = new FormData();
      formData.append('subject', emailSubject);
      formData.append('cc', emailCC);
      formData.append('body', emailBody);
      
      // Add attachments
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch('/api/send_bulk_email', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        setIsEmailModalOpen(false);
        // Reset form
        setEmailSubject('');
        setEmailCC('');
        setEmailBody('');
        setAttachments([]);
      } else {
        toast.error(result.message || 'Failed to send email');
      }
    } catch (error) {
      toast.error('Error sending email');
    } finally {
      setIsSending(false);
    }
  };

  // Render table on desktop, cards on mobile
  const renderSubscribers = () => {
    if (isMobile) {
      return (
        <div className="space-y-3">
          <AnimatePresence>
            {subscribers.length > 0 ? (
              subscribers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((subscriber, index) => (
                <motion.div
                  key={subscriber.email}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ delay: index * 0.03 }}
                  whileHover="hover"
                  className="bg-gray-700/30 border border-gray-600/30 rounded p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-blue-400 text-sm">ID: {subscriber.id}</div>
                      <div className="text-gray-200 text-sm mt-1 truncate">{subscriber.email}</div>
                    </div>
                    <div className="text-gray-400 text-xs">{formatDate(subscriber.date)}</div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-gray-700/50 rounded p-8 text-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-300">
                  {loading ? 'Loading subscribers...' : 'No subscribers found'}
                </h3>
                <p className="mt-2 text-gray-500 text-xs">
                  {!loading && 'Try adjusting your search or filter criteria'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Desktop table view
    return (
      <div className="overflow-x-auto rounded">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500/20 to-purple-500/20">
              <th 
                className="p-3 text-left text-blue-300 font-semibold cursor-pointer text-sm"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-1">
                  ID 
                  {sortConfig.field === 'id' && (
                    sortConfig.order === 'ASC' ? 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg> : 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                className="p-3 text-left text-blue-300 font-semibold cursor-pointer text-sm"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-1">
                  Email 
                  {sortConfig.field === 'email' && (
                    sortConfig.order === 'ASC' ? 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg> : 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                className="p-3 text-left text-blue-300 font-semibold cursor-pointer text-sm"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  Join Date 
                  {sortConfig.field === 'date' && (
                    sortConfig.order === 'ASC' ? 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg> : 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {subscribers.length > 0 ? (
                subscribers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((subscriber, index) => (
                  <motion.tr
                    key={subscriber.email}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ delay: index * 0.03 }}
                    whileHover="hover"
                    className="border-b border-gray-700/50"
                  >
                    <td className="p-3 font-mono text-blue-400 text-sm">{subscriber.id}</td>
                    <td className="p-3 text-gray-200 text-sm truncate max-w-[200px] sm:max-w-none">{subscriber.email}</td>
                    <td className="p-3 text-gray-400 text-sm">{formatDate(subscriber.date)}</td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-700/50"
                >
                  <td colSpan="3" className="p-8 text-center">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-300">
                        {loading ? 'Loading subscribers...' : 'No subscribers found'}
                      </h3>
                      <p className="mt-2 text-gray-500 text-sm">
                        {!loading && 'Try adjusting your search or filter criteria'}
                      </p>
                    </div>
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            Subscriber Analytics
          </motion.h1>
          
          <Link 
            href="/dashboard" 
            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 rounded text-blue-300 border border-gray-600/30 transition-colors text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </Link>
        </div>

        <motion.div 
          className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded shadow-2xl p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Filter Controls */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Search Field */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search ID, email..."
                className="w-full p-3 pl-10 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100 placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
              {/* Sort Controls */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    className="w-full p-3 pl-10 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100 text-sm cursor-pointer appearance-none"
                    value={sortConfig.field}
                    onChange={(e) => handleSort(e.target.value)}
                  >
                    <option value="date">Date</option>
                    <option value="id">ID</option>
                    <option value="email">Email</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                </div>
                
                <div className="relative">
                  <select
                    className="w-full p-3 pl-10 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100 text-sm cursor-pointer appearance-none"
                    value={sortConfig.order}
                    onChange={(e) => setSortConfig(prev => ({ ...prev, order: e.target.value }))}
                  >
                    <option value="DESC">Descending</option>
                    <option value="ASC">Ascending</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                </div>
              </div>

              {/* Date Filters */}
              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleDateFilter(7)}
                  className="p-2 bg-blue-600/30 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/30 text-xs sm:text-sm transition-colors flex items-center justify-center"
                >
                  {isMobile ? '7D' : '7 Days'}
                </button>
                <button
                  onClick={() => handleDateFilter(30)}
                  className="p-2 bg-purple-600/30 text-purple-300 rounded border border-purple-500/30 hover:bg-purple-500/30 text-xs sm:text-sm transition-colors flex items-center justify-center"
                >
                  {isMobile ? '30D' : '30 Days'}
                </button>
                <button
                  onClick={clearFilters}
                  className="p-2 bg-gray-600/30 text-gray-300 rounded border border-gray-500/30 hover:bg-gray-500/30 text-xs sm:text-sm transition-colors flex items-center justify-center"
                >
                  {isMobile ? '×' : 'Clear'}
                </button>
              </div>

              {/* Send Email Button */}
              <button
                className="md:col-span-2 p-3 bg-green-600/30 text-green-300 rounded border border-green-500/30 hover:bg-green-500/30 text-sm flex items-center justify-center gap-2 transition-colors"
                onClick={() => setIsEmailModalOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {isMobile ? 'Email' : 'Send Email'}
              </button>
            </div>
          </div>

          {/* Responsive Subscribers List */}
          {renderSubscribers()}

          {/* Pagination */}
          {subscribers.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative">
                  <select
                    className="p-2 pl-10 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100 text-sm appearance-none"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    {[10, 20, 50, 100].map(size => (
                      <option key={size} value={size}>{size} per page</option>
                    ))}
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <span className="text-gray-400 text-sm">
                  Showing {startItem} - {endItem} of {subscribers.length}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={`px-4 py-2 rounded border text-sm flex items-center gap-1 ${
                    currentPage === 1 
                      ? 'bg-gray-700/30 text-gray-500 border-gray-500/30' 
                      : 'bg-blue-600/30 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'
                  }`}
                  disabled={currentPage === 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {!isMobile && 'Previous'}
                </button>
                <div className="bg-gray-700/30 rounded border border-gray-600/30 px-3 py-2 text-sm text-gray-300">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className={`px-4 py-2 rounded border text-sm flex items-center gap-1 ${
                    currentPage === totalPages 
                      ? 'bg-gray-700/30 text-gray-500 border-gray-500/30' 
                      : 'bg-blue-600/30 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'
                  }`}
                  disabled={currentPage === totalPages}
                >
                  {!isMobile && 'Next'}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* NEW: Beautiful Responsive Email Modal */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
            onClick={() => !isSending && setIsEmailModalOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-cyan-500/30 rounded shadow-2xl w-full max-w-3xl mx-2 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: '95vh' }}
            >
              <div className="p-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
              
              <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 50px)' }}>
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Send Email to Subscribers
                  </h2>
                  <button 
                    onClick={() => setIsEmailModalOpen(false)}
                    disabled={isSending}
                    className="text-gray-400 hover:text-cyan-300 transition-colors flex-shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 sm:mb-6 p-3 sm:p-5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded border border-cyan-500/20 backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-center sm:text-left mb-3 sm:mb-0">
                      <div className="text-3xl sm:text-4xl font-bold text-cyan-300">{totalCount}</div>
                      <div className="text-gray-300 mt-1 text-sm sm:text-base">Total Subscribers</div>
                    </div>
                    <div className="bg-cyan-500/10 px-3 py-1 sm:px-4 sm:py-2 rounded border border-cyan-500/20">
                      <div className="text-cyan-300 font-medium text-xs sm:text-sm text-center">New emails sent to all subscribers</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-cyan-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 sm:py-3 text-sm sm:text-base bg-gray-700/50 border border-gray-600/30 rounded text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="Email subject *"
                      disabled={isSending}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={emailCC}
                      onChange={(e) => setEmailCC(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 sm:py-3 text-sm sm:text-base bg-gray-700/50 border border-gray-600/30 rounded text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="CC (comma separated emails)"
                      disabled={isSending}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-cyan-300 text-sm sm:text-base font-medium">Body *</label>
                      <span className="text-xs text-gray-500">New lines preserved</span>
                    </div>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full h-32 sm:h-48 p-3 text-sm sm:text-base bg-gray-700/50 border border-gray-600/30 rounded text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="Your email content (new lines will be preserved)"
                      disabled={isSending}
                    />
                  </div>

                  {/* File Attachments */}
                  <div className="border border-cyan-500/20 rounded p-3 sm:p-4 bg-gray-800/50">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h3 className="text-cyan-300 font-medium text-sm sm:text-base">Attachments</h3>
                      <span className="text-xs text-gray-500">Max 5MB per file</span>
                    </div>
                    
                    <div 
                      className="border-2 border-dashed border-cyan-500/30 rounded p-4 text-center cursor-pointer hover:border-cyan-500/50 transition-colors"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-2 text-cyan-400 text-sm sm:text-base">Click to upload files</p>
                      <p className="text-xs text-gray-500 mt-1">Supports images, documents, etc.</p>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                        disabled={isSending}
                      />
                    </div>
                    
                    {/* Attachments list */}
                    {attachments.length > 0 && (
                      <div className="mt-3 sm:mt-4 space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                        {attachments.map((file, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-2 bg-gray-700/30 rounded border border-gray-600/30"
                          >
                            <div className="flex items-center truncate">
                              <div className="bg-cyan-500/10 p-1 sm:p-2 rounded mr-2 sm:mr-3 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="truncate">
                                <p className="text-gray-200 text-xs sm:text-sm truncate">{file.name}</p>
                                <p className="text-gray-500 text-2xs sm:text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeAttachment(index)}
                              className="text-gray-500 hover:text-red-400 flex-shrink-0 ml-2"
                              disabled={isSending}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => setIsEmailModalOpen(false)}
                    disabled={isSending}
                    className="px-4 py-2 sm:px-5 sm:py-3 bg-gray-700/50 hover:bg-gray-700/70 rounded sm:rounded text-gray-300 border border-gray-600/30 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendBulkEmail}
                    disabled={isSending}
                    className="px-4 py-2 sm:px-5 sm:py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded sm:rounded text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 text-sm sm:text-base"
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Send Email Now
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-2 sm:p-4 bg-gray-900/50 border-t border-gray-700/30 text-center text-2xs sm:text-xs text-gray-500">
                MVSD LAB Email Service • All emails are encrypted in transit
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}

export default withAuth(SubscribersList, 'admin');
// app/dashboard/subscribe_list/page.js
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useCallback } from 'react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'date', order: 'DESC' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
                  className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-4"
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
                className="border border-gray-700/50 rounded-xl p-8 text-center"
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
      <div className="overflow-x-auto rounded-lg">
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
            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg text-blue-300 border border-gray-600/30 transition-colors text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </Link>
        </div>

        <motion.div 
          className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded-xl shadow-2xl p-4 sm:p-6"
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
                className="w-full p-3 pl-10 bg-gray-700/50 border border-gray-600/30 rounded-lg text-gray-100 placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    className="w-full p-3 pl-10 bg-gray-700/50 border border-gray-600/30 rounded-lg text-gray-100 text-sm cursor-pointer appearance-none"
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
                    className="w-full p-3 pl-10 bg-gray-700/50 border border-gray-600/30 rounded-lg text-gray-100 text-sm cursor-pointer appearance-none"
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
                  className="p-2 bg-blue-600/30 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 text-xs sm:text-sm transition-colors flex items-center justify-center"
                >
                  {isMobile ? '7D' : '7 Days'}
                </button>
                <button
                  onClick={() => handleDateFilter(30)}
                  className="p-2 bg-purple-600/30 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 text-xs sm:text-sm transition-colors flex items-center justify-center"
                >
                  {isMobile ? '30D' : '30 Days'}
                </button>
                <button
                  onClick={clearFilters}
                  className="p-2 bg-gray-600/30 text-gray-300 rounded-lg border border-gray-500/30 hover:bg-gray-500/30 text-xs sm:text-sm transition-colors flex items-center justify-center"
                >
                  {isMobile ? '×' : 'Clear'}
                </button>
              </div>

              {/* Send Email Button */}
              <button
                className="md:col-span-2 p-3 bg-green-600/30 text-green-300 rounded-lg border border-green-500/30 hover:bg-green-500/30 text-sm flex items-center justify-center gap-2 transition-colors"
                onClick={() => toast.info("Send email functionality will be implemented")}
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
                    className="p-2 pl-10 bg-gray-700/50 border border-gray-600/30 rounded-lg text-gray-100 text-sm appearance-none"
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
                  className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-1 ${
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
                <div className="bg-gray-700/30 rounded-lg border border-gray-600/30 px-3 py-2 text-sm text-gray-300">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-1 ${
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

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}

export default withAuth(SubscribersList, 'admin');
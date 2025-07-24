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
  hover: { backgroundColor: 'rgba(55, 65, 81, 0.4)' } // Subtle background change only
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

  // Calculate pagination
  const totalPages = Math.ceil(subscribers.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, subscribers.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <motion.h1 
          className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          Subscriber Analytics
        </motion.h1>

        <motion.div 
          className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded shadow-2xl p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Filter Controls - Responsive Design */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Search Field */}
            <div className="w-full">
              <motion.input
                type="text"
                placeholder="Search ID, email..."
                className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100 placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-9 gap-3">
              {/* Sort Controls */}
              <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  className="p-3 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100 text-sm cursor-pointer"
                  value={sortConfig.field}
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="id">Sort by ID</option>
                  <option value="email">Sort by Email</option>
                </select>

                <select
                  className="p-3 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100 text-sm cursor-pointer"
                  value={sortConfig.order}
                  onChange={(e) => setSortConfig(prev => ({ ...prev, order: e.target.value }))}
                >
                  <option value="DESC">Descending</option>
                  <option value="ASC">Ascending</option>
                </select>
              </div>

              {/* Date Filters */}
              <div className="md:col-span-3 grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleDateFilter(7)}
                  className="p-2 bg-blue-600/30 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-500/30 text-xs sm:text-sm transition-colors"
                >
                  7 Days
                </button>
                <button
                  onClick={() => handleDateFilter(30)}
                  className="p-2 bg-purple-600/30 text-purple-300 rounded border border-purple-500/30 hover:bg-purple-500/30 text-xs sm:text-sm transition-colors"
                >
                  30 Days
                </button>
                <button
                  onClick={() => setDateRange('')}
                  className="p-2 bg-gray-600/30 text-gray-300 rounded border border-gray-500/30 hover:bg-gray-500/30 text-xs sm:text-sm transition-colors"
                >
                  Clear
                </button>
              </div>

              {/* Send Email Button */}
              <button
                className="md:col-span-2 p-3 bg-green-600/30 text-green-300 rounded border border-green-500/30 hover:bg-green-500/30 text-sm flex items-center justify-center gap-2 transition-colors"
                onClick={() => toast.info("Send email functionality will be implemented")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Send Email
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                  <th 
                    className="p-3 text-left text-blue-300 font-semibold cursor-pointer text-sm align-middle"
                    onClick={() => handleSort('id')}
                  >
                    ID {sortConfig.field === 'id' && (sortConfig.order === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="p-3 text-left text-blue-300 font-semibold cursor-pointer text-sm align-middle"
                    onClick={() => handleSort('email')}
                  >
                    Email {sortConfig.field === 'email' && (sortConfig.order === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="p-3 text-left text-blue-300 font-semibold cursor-pointer text-sm align-middle"
                    onClick={() => handleSort('date')}
                  >
                    Join Date {sortConfig.field === 'date' && (sortConfig.order === 'ASC' ? '↑' : '↓')}
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
                        <td className="p-3 font-mono text-blue-400 text-sm align-middle">{subscriber.id}</td>
                        <td className="p-3 text-gray-200 text-sm truncate max-w-[200px] align-middle">{subscriber.email}</td>
                        <td className="p-3 text-gray-400 text-sm align-middle">
                          {format(new Date(subscriber.date), 'MMM dd, yyyy - hh:mm a')}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-700/50"
                    >
                      <td colSpan="3" className="p-4 text-center text-gray-400 align-middle">
                        {loading ? 'Loading subscribers...' : 'No subscribers found'}
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <select
                className="p-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-gray-100 text-sm"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size} per page</option>
                ))}
              </select>
              <span className="text-gray-400 text-sm">
                Showing {startItem} - {endItem} of {subscribers.length}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  currentPage === 1 
                    ? 'bg-gray-700/30 text-gray-500 border-gray-500/30' 
                    : 'bg-blue-600/30 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'
                }`}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  currentPage === totalPages 
                    ? 'bg-gray-700/30 text-gray-500 border-gray-500/30' 
                    : 'bg-blue-600/30 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'
                }`}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/dashboard" 
              className="inline-block px-5 py-2 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg text-blue-300 border border-gray-600/30 transition-colors text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
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
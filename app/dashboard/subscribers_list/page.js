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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.02 }
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

function SubscribersList() {
  const [subscribers, setSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'date', order: 'DESC' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = debounce(async () => {
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
  }, 300);

  useEffect(() => {
    fetchSubscribers();
  }, [searchTerm, dateRange, sortConfig]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <motion.h1 
          className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          Subscriber Analytics
        </motion.h1>

        <motion.div 
          className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded shadow-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <motion.input
              type="text"
              placeholder="Search ID, email..."
              className="p-3 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />

            <motion.select
              className="p-3 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100"
              value={sortConfig.field}
              onChange={(e) => handleSort(e.target.value)}
              whileHover={{ scale: 1.03 }}
            >
              <option value="date">Sort by Date</option>
              <option value="id">Sort by ID</option>
              <option value="email">Sort by Email</option>
            </motion.select>

            <motion.select
              className="p-3 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100"
              value={sortConfig.order}
              onChange={(e) => setSortConfig(prev => ({ ...prev, order: e.target.value }))}
              whileHover={{ scale: 1.03 }}
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </motion.select>

            <motion.div className="flex gap-2">
              <button
                onClick={() => handleDateFilter(7)}
                className="px-4 py-2 bg-blue-600/30 text-blue-400 rounded border border-blue-400/20 hover:bg-blue-500/20"
              >
                7 Days
              </button>
              <button
                onClick={() => handleDateFilter(30)}
                className="px-4 py-2 bg-purple-600/30 text-purple-400 rounded border border-purple-400/20 hover:bg-purple-500/20"
              >
                30 Days
              </button>
              <button
                onClick={() => setDateRange('')}
                className="px-4 py-2 bg-gray-600/30 text-gray-400 rounded border border-gray-400/20 hover:bg-gray-500/20"
              >
                Clear Dates
              </button>
            </motion.div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto rounded">
            <table className="w-full">
              <thead>
                <motion.tr 
                  className="bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <th className="p-4 text-left text-blue-300 font-semibold cursor-pointer" onClick={() => handleSort('id')}>
                    ID {sortConfig.field === 'id' && (sortConfig.order === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th className="p-4 text-left text-blue-300 font-semibold cursor-pointer" onClick={() => handleSort('email')}>
                    Email {sortConfig.field === 'email' && (sortConfig.order === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th className="p-4 text-left text-blue-300 font-semibold cursor-pointer" onClick={() => handleSort('date')}>
                    Join Date {sortConfig.field === 'date' && (sortConfig.order === 'ASC' ? '↑' : '↓')}
                  </th>
                </motion.tr>
              </thead>

              <tbody>
                <AnimatePresence>
                  {subscribers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((subscriber, index) => (
                    <motion.tr
                      key={subscriber.email}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ delay: index * 0.05 }}
                      whileHover="hover"
                      className="border-b border-gray-700/50 hover:bg-gray-700/30"
                    >
                      <td className="p-4 font-mono text-blue-400">{subscriber.id}</td>
                      <td className="p-4 text-gray-200">{subscriber.email}</td>
                      <td className="p-4 text-gray-400">
                        {format(new Date(subscriber.date), 'MMM dd, yyyy - hh:mm a')}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4"
            layout
          >
            <div className="flex items-center gap-4">
              <select
                className="p-2 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size} per page</option>
                ))}
              </select>
              <span className="text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, subscribers.length)} of {subscribers.length}
              </span>
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-blue-600/30 text-blue-400 rounded border border-blue-400/20 hover:bg-blue-500/20"
                whileHover={{ scale: 1.05 }}
                disabled={currentPage === 1}
              >
                Previous
              </motion.button>
              <motion.button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-4 py-2 bg-blue-600/30 text-blue-400 rounded border border-blue-400/20 hover:bg-blue-500/20"
                whileHover={{ scale: 1.05 }}
                disabled={currentPage * itemsPerPage >= subscribers.length}
              >
                Next
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            className="mt-8 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <Link 
              href="/dashboard" 
              className="inline-block px-6 py-2 bg-gray-700/50 hover:bg-gray-700/70 rounded text-blue-400 border border-gray-600/30 transition-all"
            >
              ← Back to Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}

export default withAuth(SubscribersList, 'admin'); // Pass 'admin' as the required role
// /app/dashboard/message/page.js
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
  hover: { scale: 1.02, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }
};

function Message() {
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch(`/api/message?sortOrder=${sortOrder}`);
        const result = await response.json();
        if (response.ok) {
          setMessages(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, [sortOrder]);

  const filteredMessages = messages.filter(message =>
    [message.email, message.id.toString(), message.name, message.subject]
      .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <motion.h1 
          className="text-5xl font-extrabold mb-12 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-center"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          Message Inbox
        </motion.h1>

        <motion.div 
          className="bg-gray-800/40 backdrop-blur-xl rounded border border-gray-700/50 shadow-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
            <motion.div 
              className="relative w-full md:w-96"
              whileHover={{ scale: 1.01 }}
            >
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-3.5 h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.div>

            <div className="flex gap-4 items-center w-full md:w-auto">
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.03 }}
              >
                <select
                  className="py-3 px-4 bg-gray-800/60 border border-gray-700/50 rounded text-gray-200 appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="asc">Newest First</option>
                  <option value="desc">Oldest First</option>
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </motion.div>

              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.03 }}
              >
                <select
                  className="py-3 px-4 bg-gray-800/60 border border-gray-700/50 rounded text-gray-200 appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {paginatedMessages.length > 0 ? (
              paginatedMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ delay: index * 0.05 }}
                  whileHover="hover"
                  className="mb-6 bg-gradient-to-r from-gray-800/40 to-gray-800/20 backdrop-blur-sm rounded border border-gray-700/50 shadow-xl"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center text-white font-bold">
                          {message.name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-100 truncate">
                            {message.subject}
                          </h2>
                          <p className="text-sm text-cyan-400">{message.name}</p>
                        </div>
                      </div>
                      <span className="text-sm bg-gray-900/50 px-4 py-2 rounded text-cyan-300 border border-gray-700/50">
                        {format(new Date(message.date), 'MMM dd, yyyy - HH:mm')}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <p className="text-gray-300 break-all">
                          <span className="text-gray-400">From : </span>
                          {message.email}
                        </p>
                        <span className="font-mono text-blue-400 bg-gray-900/50 px-3 py-1 rounded">ID: {message.id}</span>
                      </div>

                      <motion.div
                        className="p-4 bg-gray-900/30 rounded border border-gray-700/50"
                        whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                      >
                        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {message.message}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                className="text-center p-8 bg-gray-900/30 rounded border border-gray-700/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-3xl mb-4">📭</div>
                <h3 className="text-xl text-gray-300">No messages found</h3>
                <p className="text-gray-400 mt-2">Try adjusting your search filters</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4"
            layout
          >
            <div className="flex items-center gap-4 text-gray-400">
              <span>
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredMessages.length)} of {filteredMessages.length}
              </span>
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-6 py-2.5 bg-gray-800/60 hover:bg-cyan-500/20 rounded text-gray-200 border border-gray-700/50 flex items-center gap-2 transition-all"
                whileHover={{ scale: 1.05 }}
                disabled={currentPage === 1}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </motion.button>
              <motion.button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-6 py-2.5 bg-gray-800/60 hover:bg-cyan-500/20 rounded text-gray-200 border border-gray-700/50 flex items-center gap-2 transition-all"
                whileHover={{ scale: 1.05 }}
                disabled={currentPage * itemsPerPage >= filteredMessages.length}
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            className="mt-8 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-800/60 hover:bg-gray-800/80 rounded text-cyan-400 border border-gray-700/50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Dashboard
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

export default withAuth(Message);
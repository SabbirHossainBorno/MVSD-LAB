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
  hover: { scale: 1.02 }
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
          Message Center
        </motion.h1>

        <motion.div 
          className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/30 rounded shadow-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.input
              type="text"
              placeholder="Search messages..."
              className="p-3 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />

            <motion.select
              className="p-3 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              whileHover={{ scale: 1.03 }}
            >
              <option value="asc">Newest First</option>
              <option value="desc">Oldest First</option>
            </motion.select>

            <motion.select
              className="p-3 bg-gray-700/50 border border-gray-600/30 rounded text-gray-100"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              whileHover={{ scale: 1.03 }}
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </motion.select>
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
                  className="mb-4 bg-gray-700/30 backdrop-blur-sm rounded border border-gray-600/50"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <motion.h2 
                        className="text-xl font-bold text-blue-400 truncate"
                        whileHover={{ x: 5 }}
                      >
                        {message.subject}
                      </motion.h2>
                      <span className="text-sm bg-gray-800/50 px-3 py-1 rounded text-yellow-300 border border-gray-600">
                        {format(new Date(message.date), 'MMM dd, yyyy - hh:mm a')}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <p className="flex-1">
                          <span className="text-gray-400">From: </span>
                          <span className="text-gray-200">{message.name}</span>
                          <span className="text-gray-400 ml-2">{message.email}</span>
                        </p>
                        <span className="font-mono text-blue-400">ID: {message.id}</span>
                      </div>

                      <motion.div
                        className="p-4 bg-gray-800/50 rounded border border-gray-600/30"
                        whileHover={{ boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
                      >
                        <p className="text-gray-200 whitespace-pre-wrap">{message.message}</p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                className="text-center p-6 text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No messages found
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4"
            layout
          >
            <div className="flex items-center gap-4">
              <span className="text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredMessages.length)} of {filteredMessages.length}
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
                disabled={currentPage * itemsPerPage >= filteredMessages.length}
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

export default withAuth(Message);
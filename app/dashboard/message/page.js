// /app/dashboard/message/page.js
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import withAuth from '../../components/withAuth'; 
import LoadingSpinner from '../../components/LoadingSpinner'; 

function Message() {
  const [message, setMessage] = useState([]);
  const [filteredMessage, setFilteredMessage] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessage() {
      try {
        const response = await fetch(`/api/message?sortOrder=${sortOrder}`);
        const result = await response.json();
        if (response.ok) {
          setMessage(result.message);
          setFilteredMessage(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    }

    fetchMessage();
  }, [sortOrder]);

  useEffect(() => {
    let filtered = message.filter(message =>
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.id.toString().includes(searchTerm)
    );

    if (domainFilter) {
      filtered = filtered.filter(message =>
        message.email.endsWith(`@${domainFilter}`)
      );
    }

    setFilteredMessage(filtered);
  }, [searchTerm, domainFilter, message]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd h:mm a');
    } catch {
      return dateString;
    }
  };

  const paginate = (array, pageSize, pageNumber) => {
    const start = (pageNumber - 1) * pageSize;
    return array.slice(start, start + pageSize);
  };

  const paginatedMessage = paginate(filteredMessage, itemsPerPage, currentPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8 lg:p-10">
      <h1 className="text-4xl font-bold mb-6 text-gray-300">All Messages</h1>
      <div className="bg-gray-800 p-6 rounded shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Search by email or ID..."
            className="w-full sm:w-1/3 p-3 rounded border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="w-full sm:w-1/3 p-3 rounded border border-gray-600 bg-gray-700 text-gray-100"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
          >
            <option value="">Filter by domain</option>
            <option value="gmail.com">Gmail</option>
            <option value="yahoo.com">Yahoo</option>
            <option value="outlook.com">Outlook</option>
          </select>
          <select
            className="w-full sm:w-1/3 p-3 rounded border border-gray-600 bg-gray-700 text-gray-100"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
          <select
            className="w-full sm:w-1/3 p-3 rounded border border-gray-600 bg-gray-700 text-gray-100"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div className="space-y-4">
        {paginatedMessage.length > 0 ? (
            paginatedMessage.map((message) => (
            <div
                key={message.id}
                className="bg-white/10 backdrop-blur-md p-6 rounded shadow-lg border border-white/20"
            >
                <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-400">
            {message.subject}
          </h2>
          <span className="text-sm bg-gray-800/50 px-3 py-1 rounded text-yellow-300 border border-gray-600 shadow">
            {formatDate(message.date)}
          </span>
        </div>
                <div className="text-sm text-gray-200 space-y-2">
                <p>
                    <strong className="text-gray-100">ID :</strong> {message.id}
                </p>
                <p>
                    <strong className="text-gray-100">Name :</strong> {message.name}
                </p>
                <p>
                    <strong className="text-gray-100">Email :</strong> {message.email}
                </p>
                <p className="bg-gray-800/50 p-4 rounded border border-gray-600 shadow-inner">
                    <strong className="text-purple-400">Message :</strong> <span className="text-gray-100">{message.message}</span>
                </p>
                </div>
            </div>
            ))
        ) : (
            <div className="text-center text-gray-400">
            No Messages Found
            </div>
        )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredMessage.length / itemsPerPage)))}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Next
            </button>
          </div>
          <span className="text-gray-300 mt-4 sm:mt-0">Page {currentPage}</span>
        </div>
        <Link href="/dashboard" className="block mt-6 text-center text-blue-400 hover:text-blue-500 text-sm sm:text-base">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default withAuth(Message);
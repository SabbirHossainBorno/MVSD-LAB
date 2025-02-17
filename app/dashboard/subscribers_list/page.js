// app/dashboard/subscribe_list/page.js
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import withAuth from '../../components/withAuth'; 
import LoadingSpinner from '../../components/LoadingSpinner'; 

function SubscribersList() {
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    async function fetchSubscribers() {
      try {
        const response = await fetch('/api/subscribers_list');
        const result = await response.json();
        if (response.ok) {
          setSubscribers(result.subscribers);
          setFilteredSubscribers(result.subscribers);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Failed to fetch subscriber data');
      } finally {
        setLoading(false); // Stop loading spinner
      }
    }

    fetchSubscribers();
  }, []);

  useEffect(() => {
    let filtered = subscribers.filter(subscriber =>
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.id.toString().includes(searchTerm)
    );

    if (domainFilter) {
      filtered = filtered.filter(subscriber =>
        subscriber.email.endsWith(`@${domainFilter}`)
      );
    }

    setFilteredSubscribers(filtered);
  }, [searchTerm, domainFilter, subscribers]);

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

  const paginatedSubscribers = paginate(filteredSubscribers, itemsPerPage, currentPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8 lg:p-10">
      <h1 className="text-4xl font-bold mb-6 text-gray-300">Subscriber List</h1>
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
        </div>
        <table className="min-w-full bg-gray-700 rounded">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-4 text-left text-gray-300 font-medium">ID</th>
              <th className="p-4 text-left text-gray-300 font-medium">Email</th>
              <th className="p-4 text-left text-gray-300 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSubscribers.length > 0 ? (
              paginatedSubscribers.map((subscriber) => (
                <tr key={subscriber.email} className="hover:bg-gray-600 transition-colors duration-200">
                  <td className="p-4 text-gray-200">{subscriber.id}</td>
                  <td className="p-4 text-gray-200">{subscriber.email}</td>
                  <td className="p-4 text-gray-200">{formatDate(subscriber.date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-400">No subscribers found</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredSubscribers.length / itemsPerPage)))}
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

export default withAuth(SubscribersList);

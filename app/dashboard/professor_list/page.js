// app/dashboard/professor_list/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../components/withAuth'; 
import LoadingSpinner from '../../components/LoadingSpinner'; 

const ProfessorsList = () => {
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortKey, setSortKey] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfessors() {
      try {
        const response = await fetch('/api/professor_list');
        const result = await response.json();
        if (response.ok) {
          setProfessors(result.professors);
          setFilteredProfessors(result.professors);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Failed to fetch professor data');
      }
    }

    fetchProfessors();
  }, []);

  useEffect(() => {
    let filtered = professors;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(professor =>
        Object.values(professor).some(value =>
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(professor => professor.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Paginate results
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProfessors = filtered.slice(startIndex, startIndex + itemsPerPage);

    setFilteredProfessors(paginatedProfessors);
  }, [searchQuery, filterStatus, sortKey, sortOrder, professors, currentPage, itemsPerPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'inactive':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const totalPages = Math.ceil(professors.length / itemsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8 lg:p-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-300">Professors List</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 w-full">
        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-1/4"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 w-full sm:w-1/4"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 w-full sm:w-1/4"
          >
            <option value="id">Sort by ID</option>
            <option value="first_name">Sort by First Name</option>
            <option value="last_name">Sort by Last Name</option>
            <option value="email">Sort by Email</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 w-full sm:w-1/4"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            className="p-2 rounded bg-gray-700 text-gray-100 border border-gray-600 w-full sm:w-1/4"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={30}>30 per page</option>
          </select>
        </div>

        {/* Professors Cards */}
        <div className="flex flex-col gap-6">
          {filteredProfessors.map(professor => (
            <div
              key={professor.id}
              className="bg-gray-700 p-6 rounded-lg shadow-md flex flex-col gap-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="text-lg font-bold mb-1 text-blue-400">ID: {professor.id}</p>
                  <p className="text-xl font-semibold text-white">{professor.first_name} {professor.last_name}</p>
                  <div className="mt-2 text-sm text-gray-400">
                    <p>Email: {professor.email}</p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:text-right flex flex-col gap-2">
                  <span className={`px-4 py-2 rounded text-sm ${getStatusColor(professor.status)}`}>
                    {professor.status}
                  </span>
                  <button
                    onClick={() => handleEdit(professor.id)}
                    className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded hover:from-blue-600 hover:to-indigo-700 transition text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
            className={`px-4 py-2 rounded-l-lg ${currentPage === 1 ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-gray-700 text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
            className={`px-4 py-2 rounded-r-lg ${currentPage === totalPages ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="block mt-6 text-center text-blue-400 hover:text-blue-500 text-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default withAuth(ProfessorsList);

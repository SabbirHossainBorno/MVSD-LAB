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
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const resultsPerPage = 10;

  useEffect(() => {
    const fetchProfessors = async () => {
      setLoading(true); 
      try {
        const res = await fetch(`/api/professor_list?page=${currentPage}&search=${searchTerm}&filter=${filter}&sortOrder=${sortOrder}`);
        const data = await res.json();
        if (res.ok) {
          setProfessors(data.professors);
          setTotalPages(data.totalPages);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error('Failed to fetch professors');
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchProfessors, 300); // Debounce for 300ms

    return () => clearTimeout(debounceFetch);
  }, [currentPage, searchTerm, filter, sortOrder]);

  const handleEdit = (id) => {
    router.push(`/professors/${id}/edit`);
  };

  const handleView = (id) => {
    router.push(`/professors/${id}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-400">Professors List</h1>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 md:mb-0 bg-gray-800 text-white"
        />
        <select
          value={filter}
          onChange={handleFilterChange}
          className="w-full md:w-1/4 px-4 py-2 rounded-lg border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 md:mb-0 bg-gray-800 text-white"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="id">ID</option>
        </select>
        <select
          value={sortOrder}
          onChange={handleSortOrderChange}
          className="w-full md:w-1/4 px-4 py-2 rounded-lg border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Professors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professors.length > 0 ? (
          professors.map((professor) => (
            <div
              key={professor.id}
              className="bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col transition-transform transform hover:scale-105"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <img
                    src={`/Storage/Images/Professor/${professor.photo.split('/').pop()}`}
                    alt={`${professor.first_name} ${professor.last_name}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  />
                  <div className="ml-4">
                    <div className="flex items-center text-sm">
                      <span className="font-bold text-blue-500 mr-2">{professor.id}</span>
                      <span className="ml-2  text-gray-400">{professor.status}</span>
                      <span className={`w-4 h-4 rounded-full ${professor.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </div>
                    <p className="font-semibold text-lg text-white">{professor.first_name} {professor.last_name}</p>
                    <p className="text-gray-400">{professor.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => handleView(professor.id)}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg text-sm transition-all hover:bg-green-700"
                >
                  View
                </button>
                <button
                  onClick={() => handleEdit(professor.id)}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm transition-all hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No Professors Found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`mx-1 px-4 py-2 rounded-lg transition-all ${
                currentPage === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-blue-500 hover:text-white'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default withAuth(ProfessorsList);

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

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-8 text-center">Professors List</h1>
  
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or ID"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full md:w-1/3 px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 md:mb-0"
        />
        <button 
          onClick={clearSearch}
          className="bg-red-600 text-white py-2 px-4 rounded-lg transition-all hover:bg-red-500 md:ml-4"
        >
          Clear
        </button>
        <select
          value={filter}
          onChange={handleFilterChange}
          className="w-full md:w-1/4 px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 md:mb-0"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={sortOrder}
          onChange={handleSortOrderChange}
          className="w-full md:w-1/4 px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
  
      {/* Professors List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {professors.length > 0 ? (
          professors.map((professor) => (
            <div
              key={professor.id}
              className="bg-gray-800 shadow-md rounded-lg p-4 transition-all hover:shadow-lg hover:bg-gray-700 transform hover:scale-105"
            >
              <img
                src={`/Storage/Images/Professor/${professor.photo.split('/').pop()}`}
                alt={`${professor.first_name} ${professor.last_name}`}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500"
              />
              <p className="font-semibold text-lg mb-2 text-center">{professor.first_name} {professor.last_name}</p>
              <p className="text-gray-300 mb-2 text-center">{professor.email}</p>
              <p className="text-gray-400 mb-4 text-center"><strong>ID: {professor.id}</strong></p>
              <div className="flex justify-center">
                <button
                  onClick={() => handleEdit(professor.id)}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg transition-all hover:bg-blue-500"
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
              className={`mx-1 px-4 py-2 rounded-lg ${
                currentPage === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              } transition-all`}
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

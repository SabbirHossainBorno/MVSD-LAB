// app/dashboard/member_list/phd_candidate_list/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../../components/withAuth'; 
import LoadingSpinner from '../../../components/LoadingSpinner'; 
import Image from 'next/image';

const PhdCandidatesList = () => {
  const [phd_candidates, setPhdCandidates] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const resultsPerPage = 10;

  useEffect(() => {
    const fetchPhdCandidates = async () => {
      setLoading(true); 
      try {
        const res = await fetch(`/api/member_list/phd_candidate_list?page=${currentPage}&search=${searchTerm}&filter=${filter}&sortOrder=${sortOrder}`);
        const data = await res.json();
        if (res.ok) {
          setPhdCandidates(data.phd_candidates);
          setTotalPages(data.totalPages);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error('Failed to fetch PhD candidates');
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchPhdCandidates, 300); // Debounce for 300ms

    return () => clearTimeout(debounceFetch);
  }, [currentPage, searchTerm, filter, sortOrder]);

  const handleEdit = (id) => {
    router.push(`/dashboard/member_edit/phd_candidate_edit/${id}`);
  };

  const handleView = (id) => {
    router.push(`/dashboard/member_details/phd_candidate_details/${id}`);
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
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">PhD Candidates List</h1>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <select
          value={filter}
          onChange={handleFilterChange}
          className="w-full md:w-1/4 px-4 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 md:mb-0 bg-gray-800 text-white"
          aria-label="Filter PhD candidates"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full md:w-1/3 px-4 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 md:mb-0 bg-gray-800 text-white"
          aria-label="Search PhD candidates"
        />
        <select
          value={sortOrder}
          onChange={handleSortOrderChange}
          className="w-full md:w-1/4 px-4 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
          aria-label="Sort order"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* PhD Candidates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {phd_candidates.length > 0 ? (
          phd_candidates.map((phd_candidate) => (
            <div
              key={phd_candidate.id}
              className="bg-gray-800 shadow-lg rounded p-4 flex flex-col transition-transform transform hover:scale-105"
            >
              <div className="flex items-center mb-2">
                <div className="w-24 h-24 relative overflow-hidden border-2 border-blue-500 rounded">
                  <Image 
                    src={`/Storage/Images/PhD_Candidate/${phd_candidate.photo.split('/').pop()}`} // Dynamic image source
                    alt={`${phd_candidate.first_name} ${phd_candidate.last_name}`} // Dynamic alt text
                    width={500} // You should specify the width (use an appropriate value based on your design)
                    height={500} // Specify the height for the image (matching aspect ratio as needed)
                    className="object-cover w-full h-full transition-transform duration-200 ease-in-out transform hover:scale-105" // Tailwind classes for styling
                  />
                </div>
                <div className="ml-4">
                  <div className="flex items-center text-sm">
                    <span className="font-bold text-blue-500 mr-2">{phd_candidate.id}</span>
                    <span className={`w-4 h-4 rounded-full ${phd_candidate.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </div>
                  <p className="font-semibold text-lg text-white">{phd_candidate.first_name} {phd_candidate.last_name}</p>
                  <p className="text-gray-400">{phd_candidate.email}</p>
                </div>
              </div>

              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => handleView(phd_candidate.id)}
                  className="bg-green-600 text-white py-1 px-2 rounded text-sm transition-all hover:bg-green-700"
                >
                  View
                </button>
                <button
                  onClick={() => handleEdit(phd_candidate.id)}
                  className="bg-blue-600 text-white py-1 px-2 rounded text-sm transition-all hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No PhD Candidates Found
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
              className={`mx-1 px-4 py-2 rounded transition-all ${
                currentPage === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-blue-500 hover:text-white'
              }`}
              aria-label={`Go to page ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default withAuth(PhdCandidatesList);
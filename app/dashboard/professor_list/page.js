//app/dashboard/professor_list/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import Image from 'next/image';
import { 
  FiSearch, FiFilter, FiArrowUp, FiArrowDown, FiEdit, FiEye, 
  FiUser, FiPlus, FiChevronRight, FiSliders, FiBookOpen 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

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
    router.push(`/dashboard/professor_edit/${id}`);
  };

  const handleView = (id) => {
    router.push(`/dashboard/professor_details/${id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl p-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-300 text-center mb-4">
              Academic Professor Directory
            </h1>
            <div className="flex justify-center space-x-4">
              <div className="bg-blue-600/20 px-4 py-2 rounded-full flex items-center">
                <FiBookOpen className="mr-2 text-blue-400" />
                <span className="font-medium">{professors.length} Professors</span>
              </div>
              <div className="bg-green-600/20 px-4 py-2 rounded-full flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span className="font-medium">{professors.filter(p => p.status === 'Active').length} Active</span>
              </div>
              <div className="bg-red-600/20 px-4 py-2 rounded-full flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span className="font-medium">{professors.filter(p => p.status === 'Inactive').length} Inactive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl p-6 space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative col-span-2">
              <input
                type="text"
                placeholder="Search Professor members..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-14 pr-4 py-4 bg-gray-800 rounded-xl border-2 border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              />
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl blur-md opacity-30"></div>
              <select
                value={filter}
                onChange={handleFilterChange}
                className="w-full pl-14 pr-4 py-4 bg-gray-800 rounded-xl border-2 border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 relative z-10"
              >
                <option value="all">All Professor</option>
                <option value="active">Active Scholars</option>
                <option value="inactive">Inactive Professor</option>
              </select>
              <FiFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-20" />
            </div>

            <div className="relative">
              <button className="w-full pl-14 pr-4 py-4 bg-gray-800 rounded-xl border-2 border-gray-700 hover:border-blue-500 transition-all flex items-center justify-between">
                <div className="flex items-center">
                  <FiSliders className="text-gray-400 mr-4 text-xl" />
                  <span className="text-gray-300">Advanced Filters</span>
                </div>
                <FiChevronRight className="text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Professor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {professors.length > 0 ? (
            professors.map((professor) => (
              <motion.div 
                key={professor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 transition-all hover:shadow-3xl hover:-translate-y-1 relative group"
              >
                <div className="absolute inset-0 border-2 border-gray-700 rounded-2xl group-hover:border-blue-500 transition-colors pointer-events-none"></div>
                
                <div className="flex items-start space-x-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {professor.photo ? (
                      <Image
                        src={`/Storage/Images/Professor/${professor.photo.split('/').pop()}`}
                        alt={professor.first_name}
                        width={64}
                        height={64}
                        className="rounded-xl border-2 border-blue-500/50 object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gray-700 flex items-center justify-center">
                        <FiUser className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${professor.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold truncate">
                      {professor.first_name} {professor.last_name}
                    </h2>
                    <p className="text-gray-400 text-sm truncate mb-2">{professor.email}</p>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-lg">ID : {professor.id}</span>
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-lg">{professor.department}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => handleView(professor.id)}
                    className="flex items-center space-x-2 bg-gray-700/50 hover:bg-blue-600/30 px-4 py-2 rounded-lg transition-all border border-gray-600 hover:border-blue-500"
                  >
                    <FiEye className="w-5 h-5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEdit(professor.id)}
                    className="flex items-center space-x-2 bg-blue-600/50 hover:bg-blue-600 px-4 py-2 rounded-lg transition-all"
                  >
                    <FiEdit className="w-5 h-5" />
                    <span>Edit</span>
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-gray-800/50 rounded-2xl">
              <p className="text-2xl text-gray-400 mb-4">No Professor members found</p>
            </div>
          )}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl p-4">
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-2 rounded-lg hover:bg-blue-600/30 transition-all disabled:opacity-50"
                >
                  <FiChevronRight className="transform rotate-180" />
                </button>
                
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all font-medium ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white shadow-inner'
                        : 'bg-gray-700 hover:bg-blue-500/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-2 rounded-lg hover:bg-blue-600/30 transition-all disabled:opacity-50"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(ProfessorsList);
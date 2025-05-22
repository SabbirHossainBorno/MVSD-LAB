// app/dashboard/alumni_list/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import Image from 'next/image';
import { format } from 'date-fns';
import { FiSearch, FiArrowUp, FiArrowDown, FiEye, FiUser, FiChevronRight, FiBriefcase, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';
import AlumniDetailsModal from '../../components/AlumniDetailsModal';

const AlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/alumni_list?page=${currentPage}&search=${searchTerm}&sortOrder=${sortOrder}`
        );
        const data = await res.json();
        if (res.ok) {
          setAlumni(data.alumni || []);
          setTotalPages(data.totalPages || 1);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error('Failed to fetch alumni');
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchAlumni, 300);
    return () => clearTimeout(debounceFetch);
  }, [currentPage, searchTerm, sortOrder]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openModal = (alumni) => {
    setSelectedAlumni(alumni);
    setModalOpen(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="relative group w-full">
          <div className="absolute left-0 right-0 inset-y-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-lg rounded shadow-2xl p-6 md:p-8 w-full mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 text-center mb-4 md:mb-6">
              Alumni Directory
            </h1>
            <div className="flex items-center justify-center">
              <div className="bg-purple-600/20 px-4 py-2 rounded flex items-center">
                <FiAward className="mr-2 text-purple-400" />
                <span className="font-medium">Total Alumni : {alumni.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded shadow-2xl p-6 space-y-6"
        >
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="relative flex-[3] min-w-[240px]">
              <input
                type="text"
                placeholder="Search alumni..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-14 pr-4 py-3 bg-gray-800 rounded border-2 border-gray-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all text-sm"
              />
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </div>
            <button
              onClick={toggleSortOrder}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 rounded border-2 border-gray-700 hover:border-purple-500 transition-colors flex-[0.5] min-w-[140px] text-sm"
            >
              {sortOrder === 'asc' ? (
                <>
                  <FiArrowUp className="text-purple-400" />
                  <span>Ascending</span>
                </>
              ) : (
                <>
                  <FiArrowDown className="text-purple-400" />
                  <span>Descending</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {alumni.length > 0 ? (
            alumni.map((alum) => (
              <motion.div
                key={alum.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded shadow-2xl p-6 transition-all hover:shadow-3xl hover:-translate-y-1 cursor-pointer relative group"
                onClick={() => openModal(alum)}
              >
                <div className="absolute inset-0 border-2 border-gray-700 rounded group-hover:border-purple-500 transition-colors pointer-events-none"></div>
                
                <div className="flex items-start space-x-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    {alum.photo ? (
                      <Image
                        src={`/Storage/Images/PhD_Candidate/${alum.photo.split('/').pop()}`}
                        alt={alum.first_name}
                        width={80}
                        height={80}
                        className="rounded border-2 border-purple-500/50 object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded bg-gray-700 flex items-center justify-center">
                        <FiUser className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold truncate">
                      {alum.first_name} {alum.last_name}
                    </h2>
                    <p className="text-gray-400 text-sm truncate mb-2">{alum.email}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded">
                        {alum.type}
                      </span>
                      <span className="px-2 py-1 bg-indigo-600/20 text-indigo-300 text-xs rounded">
                        {alum.id}
                      </span>
                      <span className="px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded">
                        {format(new Date(alum.completion_date), "d MMM yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-gray-800/50 rounded">
              <p className="text-2xl text-gray-400 mb-4">No alumni found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded shadow-2xl p-4">
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-2 rounded-lg hover:bg-purple-600/30 transition-all disabled:opacity-50"
                >
                  <FiChevronRight className="transform rotate-180" />
                </button>
                
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`w-12 h-12 flex items-center justify-center rounded transition-all font-medium ${
                      currentPage === index + 1
                        ? 'bg-purple-600 text-white shadow-inner'
                        : 'bg-gray-700 hover:bg-purple-500/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-2 rounded hover:bg-purple-600/30 transition-all disabled:opacity-50"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alumni Details Modal */}
        <AlumniDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          alumniId={selectedAlumni?.id}
        />
      </div>
    </div>
  );
};

export default withAuth(AlumniList, 'admin');
// app/dashboard/member_list/masters_candidate_list/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../../components/withAuth'; 
import LoadingSpinner from '../../../components/LoadingSpinner'; 
import Image from 'next/image';
import { format } from 'date-fns';
import { FiSearch, FiFilter, FiArrowUp, FiArrowDown, FiEdit, FiEye, FiUser, FiChevronRight, FiBookOpen } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MastersCandidatesList = () => {
  const [mastersCandidates, setMastersCandidates] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMastersCandidates, setTotalMastersCandidates] = useState(0);
  const [activeMastersCandidates, setActiveMastersCandidates] = useState(0);
  const [inactiveMastersCandidates, setInactiveMastersCandidates] = useState(0);
  const [graduateMastersCandidates, setGraduateMastersCandidates] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchMastersCandidates = async () => {
      setLoading(true); 
      try {
        const res = await fetch(`/api/member_list/masters_candidate_list?page=${currentPage}&search=${searchTerm}&filter=${filter}&sortOrder=${sortOrder}`);
        const data = await res.json();
        if (res.ok) {
          setMastersCandidates(data.masters_candidates || []);
          setTotalPages(data.totalPages || 1);
          setTotalMastersCandidates(data.totalMastersCandidates ?? 0);
          setActiveMastersCandidates(data.activeMastersCandidates ?? 0);
          setInactiveMastersCandidates(data.inactiveMastersCandidates ?? 0);
          setGraduateMastersCandidates(data.graduateMastersCandidates ?? 0);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Failed to fetch Master's candidates");
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchMastersCandidates, 300); // Debounce for 300ms

    return () => clearTimeout(debounceFetch);
  }, [currentPage, searchTerm, filter, sortOrder]);

  const handleEdit = (id) => {
    router.push(`/dashboard/member_edit/masters_candidate_edit/${id}`);
  };

  const handleView = (id) => {
    router.push(`/dashboard/member_details/masters_candidate_details/${id}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
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
        <div className="relative group w-full">
          <div className="absolute left-0 right-0 inset-y-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-lg rounded shadow-2xl p-6 md:p-8 w-full mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-300 text-center mb-4 md:mb-6">
              Master&apos;s Candidates Directory
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 md:gap-4 max-w-2xl mx-auto">
              <div className="bg-blue-600/20 px-3 py-2 md:px-4 md:py-2 rounded flex items-center justify-center sm:justify-start w-full">
                <FiBookOpen className="mr-2 text-blue-400 text-sm md:text-base" />
                <span className="font-medium text-sm md:text-base whitespace-nowrap">
                  Total {totalMastersCandidates}
                </span>
              </div>
              <div className="bg-yellow-600/20 px-3 py-2 md:px-4 md:py-2 rounded flex items-center justify-center sm:justify-start w-full">
                <span className="w-2 h-2 bg-yellow-400 rounded mr-2"></span>
                <span className="font-medium text-sm md:text-base whitespace-nowrap">
                  Graduate {graduateMastersCandidates}
                </span>
              </div>
              <div className="bg-green-600/20 px-3 py-2 md:px-4 md:py-2 rounded flex items-center justify-center sm:justify-start w-full">
                <span className="w-2 h-2 bg-green-400 rounded mr-2"></span>
                <span className="font-medium text-sm md:text-base whitespace-nowrap">
                  Active {activeMastersCandidates}
                </span>
              </div>
              <div className="bg-red-600/20 px-3 py-2 md:px-4 md:py-2 rounded flex items-center justify-center sm:justify-start w-full">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                <span className="font-medium text-sm md:text-base whitespace-nowrap">
                  Inactive {inactiveMastersCandidates}
                </span>
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
                placeholder="Search Master's candidates..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-14 pr-4 py-3 bg-gray-800 rounded border-2 border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </div>
            <div className="relative w-full min-w-[150px] sm:min-w-[180px] flex-1">
              <select
                value={filter}
                onChange={handleFilterChange}
                className="w-full pl-10 sm:pl-14 pr-8 py-2.5 sm:py-3 bg-gray-800 rounded border-2 border-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-xs sm:text-sm appearance-none"
              >
                <option value="all" className="text-gray-300 bg-gray-800 hover:bg-blue-600">
                  All Master&apos;s Candidates
                </option>
                <option value="active" className="text-gray-300 bg-gray-800 hover:bg-blue-600">
                  Active
                </option>
                <option value="inactive" className="text-gray-300 bg-gray-800 hover:bg-blue-600">
                  Inactive
                </option>
                <option value="graduate" className="text-gray-300 bg-gray-800 hover:bg-blue-600">
                  Graduate
                </option>
              </select>
              <FiFilter className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl pointer-events-none" />
              {/* Dropdown Arrow Icon */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
            <button
              onClick={toggleSortOrder}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 rounded border-2 border-gray-700 hover:border-blue-500 transition-colors flex-[0.5] min-w-[120px] sm:min-w-[140px] text-xs sm:text-sm"
            >
              {sortOrder === 'asc' ? (
                <>
                  <FiArrowUp className="text-blue-400 shrink-0 text-sm sm:text-base" />
                  <span className="inline whitespace-nowrap">Ascending</span>
                </>
              ) : (
                <>
                  <FiArrowDown className="text-blue-400 shrink-0 text-sm sm:text-base" />
                  <span className="inline whitespace-nowrap">Descending</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Masters Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mastersCandidates.length > 0 ? (
            mastersCandidates.map((mastersCandidate) => (
              <motion.div 
                key={mastersCandidate.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded shadow-2xl p-6 transition-all hover:shadow-3xl hover:-translate-y-1 relative group"
              >
                <div className="absolute inset-0 border-2 border-gray-700 rounded group-hover:border-blue-500 transition-colors pointer-events-none"></div>
                
                <div className="flex items-start space-x-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    {mastersCandidate.photo ? (
                      <Image
                        src={
                          // Handle default photo path differently
                          mastersCandidate.photo.includes('default_DP.png') 
                            ? mastersCandidate.photo
                            : `/Storage/Images/Master's_Candidate/${mastersCandidate.photo.split('/').pop()}`
                        }
                        alt={`${mastersCandidate.first_name} ${mastersCandidate.last_name}`}
                        width={80}
                        height={80}
                        className="rounded border-2 border-blue-500/50 object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded bg-gray-700 flex items-center justify-center">
                        <FiUser className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${
                        mastersCandidate.status === 'Active'
                          ? 'bg-green-500'
                          : mastersCandidate.status === 'Graduate'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold truncate">
                      {mastersCandidate.first_name} {mastersCandidate.last_name}
                    </h2>
                    <p className="text-gray-400 text-sm truncate mb-2">{mastersCandidate.email}</p>
                    <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1.5 bg-blue-600/20 text-blue-300 text-xs rounded inline-flex items-center gap-1 border border-blue-500/10">
                        <FiUser className="text-xs shrink-0" />
                        <span>{mastersCandidate.id}</span>
                      </span>
                      <span className="px-2 py-1.5 bg-green-600/20 text-green-300 text-xs rounded inline-flex items-center gap-1 border border-green-500/10">
                        <FiArrowUp className="text-xs shrink-0" />
                        <span>{format(new Date(mastersCandidate.admission_date), "d MMM yyyy")}</span>
                      </span>
                      {mastersCandidate.completion_date && (
                        <span className="px-2 py-1.5 bg-red-600/20 text-red-300 text-xs rounded inline-flex items-center gap-1 border border-red-500/10">
                          <FiArrowDown className="text-xs shrink-0" />
                          <span>{format(new Date(mastersCandidate.completion_date), "d MMM yyyy")}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => handleView(mastersCandidate.id)}
                    className="flex items-center space-x-2 bg-gray-700/50 hover:bg-blue-600/30 px-4 py-2 rounded transition-all border border-gray-600 hover:border-blue-500"
                  >
                    <FiEye className="w-5 h-5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEdit(mastersCandidate.id)}
                    className="flex items-center space-x-2 bg-blue-600/50 hover:bg-blue-600 px-4 py-2 rounded transition-all"
                  >
                    <FiEdit className="w-5 h-5" />
                    <span>Edit</span>
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-gray-800/50 rounded">
              <p className="text-2xl text-gray-400 mb-4">No Master&apos;s candidates found</p>
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
                  className="p-2 rounded-lg hover:bg-blue-600/30 transition-all disabled:opacity-50"
                >
                  <FiChevronRight className="transform rotate-180" />
                </button>
                
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`w-12 h-12 flex items-center justify-center rounded transition-all font-medium ${
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
                  className="p-2 rounded hover:bg-blue-600/30 transition-all disabled:opacity-50"
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

export default withAuth(MastersCandidatesList, 'admin'); // Pass 'admin' as the required role
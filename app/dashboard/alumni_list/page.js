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
import { FiSearch, FiArrowUp, FiArrowDown, FiX, FiUser, FiBriefcase, FiBook, FiGlobe, FiMail, FiSmartphone, FiCalendar, FiExternalLink } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from 'react-modal';

const AlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlumni, setTotalAlumni] = useState(0);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Fix for modal initialization
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      // Create dedicated modal root element
      const modalRoot = document.createElement('div');
      modalRoot.setAttribute('id', 'modal-root');
      document.body.appendChild(modalRoot);
      
      // Configure react-modal
      Modal.setAppElement('#modal-root');
      Modal.defaultStyles = {
        overlay: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
        },
        content: {
          position: 'relative',
          inset: 'auto',
          margin: '2rem auto',
          background: 'rgb(17 24 39 / 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1rem',
          border: 'none',
          padding: '2rem',
          maxWidth: '42rem',
        }
      };

      return () => {
        // Cleanup modal root on unmount
        document.body.removeChild(modalRoot);
      };
    }
  }, []);

  // Fetch alumni data
  const fetchAlumni = async () => {
  setLoading(true);
  try {
    const res = await fetch(
      `/api/alumni_list?page=${currentPage}&search=${searchTerm}&sortOrder=${sortOrder}`
    );
    const data = await res.json();
    
    if (res.ok) {
      setAlumni(data.alumni || []);
      // Fix the total alumni count access
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalAlumni(data.pagination?.totalAlumni || 0);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error('Failed to fetch alumni');
  } finally {
    setLoading(false);
  }
};

  // Handlers
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

  const handleCardClick = async (id) => {
  try {
    const response = await fetch(`/api/alumni_list/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch details');
    }
    
    if (data.success) {
      setSelectedAlumni(data.alumni);
    } else {
      toast.error(data.message || 'Invalid alumni data');
    }
  } catch (error) {
    toast.error(error.message);
    console.error('Details fetch error:', error);
  }
};

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />
          <div className="relative bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-300 text-center mb-6">
              Distinguished Alumni Network
            </h1>
            <div className="flex justify-center">
              <div className="bg-purple-600/20 px-6 py-3 rounded-full flex items-center">
                <FiUser className="mr-2 text-purple-300" />
                <span className="font-medium text-lg">Total Alumni : {totalAlumni}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 space-y-6"
        >
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search alumni..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-14 pr-4 py-3 bg-gray-800 rounded-xl border-2 border-gray-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all"
              />
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </div>
            <button
              onClick={toggleSortOrder}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 rounded-xl border-2 border-gray-700 hover:border-purple-500 transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {alumni.map((alum) => (
              <motion.div
                key={alum.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 cursor-pointer hover:shadow-3xl transition-all group"
                onClick={() => handleCardClick(alum.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    {alum.photo ? (
                      <Image
                        src={`/Storage/Images/PhD_Candidate/${alum.photo.split('/').pop()}`}
                        alt={alum.first_name}
                        width={80}
                        height={80}
                        className="rounded-xl border-2 border-purple-500/50 object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gray-700 flex items-center justify-center">
                        <FiUser className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold truncate">
                      {alum.first_name} {alum.last_name}
                    </h2>
                    <p className="text-gray-400 text-sm truncate">{alum.id}</p>
                    <div className="mt-2 flex items-center gap-2 text-purple-300">
                      <FiCalendar className="shrink-0" />
                      <span className="text-sm">
                        {format(new Date(alum.completion_date), 'MMM yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-4">
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-2 rounded-lg hover:bg-purple-600/30 transition-all disabled:opacity-50"
                >
                  <FiX className="transform rotate-45" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                      currentPage === i + 1
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 hover:bg-purple-500/30'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-2 rounded-lg hover:bg-purple-600/30 transition-all disabled:opacity-50"
                >
                  <FiX className="transform -rotate-45" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {isMounted && (
          <Modal
            isOpen={!!selectedAlumni}
            onRequestClose={() => setSelectedAlumni(null)}
            className="modal-content"
            overlayClassName="modal-overlay"
          >
            {selectedAlumni && (
              <div className="relative space-y-6">
                <button
                  onClick={() => setSelectedAlumni(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full"
                >
                  <FiX className="w-6 h-6" />
                </button>

                {/* Profile Header */}
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 relative">
                    <Image
                      src={`/Storage/Images/PhD_Candidate/${selectedAlumni.photo.split('/').pop()}`}
                      alt={selectedAlumni.first_name}
                      width={96}
                      height={96}
                      className="rounded-xl border-2 border-purple-500"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedAlumni.first_name} {selectedAlumni.last_name}
                    </h2>
                    <p className="text-purple-300">{selectedAlumni.id}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FiUser className="text-purple-400" /> Personal Information
                    </h3>
                    <DetailItem icon={<FiMail />} label="Email" value={selectedAlumni.email} />
                    <DetailItem icon={<FiSmartphone />} label="Phone" value={selectedAlumni.phone} />
                    <DetailItem icon={<FiCalendar />} label="Graduation Date" 
                      value={format(new Date(selectedAlumni.completion_date), 'd MMM yyyy')} />
                  </div>

                  {/* Professional Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FiBriefcase className="text-purple-400" /> Career
                    </h3>
                    {selectedAlumni.career?.map((job, i) => (
                      <div key={i} className="space-y-1">
                        <p className="font-medium">{job.position}</p>
                        <p className="text-gray-400 text-sm">{job.organization_name}</p>
                        <p className="text-gray-400 text-xs">
                          {job.joining_year} - {job.leaving_year || 'Present'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FiBook className="text-purple-400" /> Education
                    </h3>
                    {selectedAlumni.education?.map((edu, i) => (
                      <div key={i} className="space-y-1">
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-gray-400 text-sm">{edu.institution}</p>
                        <p className="text-gray-400 text-xs">Graduated {edu.passing_year}</p>
                      </div>
                    ))}
                  </div>

                  {/* Social Media */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FiGlobe className="text-purple-400" /> Social Profiles
                    </h3>
                    {selectedAlumni.socialMedia?.map((sm, i) => (
                      <a
                        key={i}
                        href={sm.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
                      >
                        <FiExternalLink />
                        {sm.socialmedia_name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Modal>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="text-purple-300 mt-1">{icon}</span>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="font-medium">{value || '-'}</p>
    </div>
  </div>
);

export default withAuth(AlumniList, 'admin');
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clipboard, X, Search, Filter, ChevronDown, ChevronUp } from 'react-feather';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ApprovalPanel() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    limit: 10,
    page: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/director_dashboard/approval_panel?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPublications(data.publications);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const renderAuthors = (authors) => {
    if (Array.isArray(authors)) {
      return authors.join(', ');
    }
    try {
      const parsed = JSON.parse(authors);
      return Array.isArray(parsed) ? parsed.join(', ') : authors;
    } catch {
      return authors;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, filters.page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg ${
            filters.page === i
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => handlePageChange(filters.page - 1)}
          disabled={filters.page === 1}
          className={`px-4 py-2 rounded-lg flex items-center ${
            filters.page === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>
        
        <div className="flex items-center space-x-2">
          {pages}
          {endPage < totalPages && (
            <span className="px-2 text-gray-500">...</span>
          )}
          {endPage < totalPages && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`px-3 py-1 rounded-lg ${
                filters.page === totalPages
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {totalPages}
            </button>
          )}
        </div>
        
        <button
          onClick={() => handlePageChange(filters.page + 1)}
          disabled={filters.page === totalPages}
          className={`px-4 py-2 rounded-lg flex items-center ${
            filters.page === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Approval Panel</h1>
        <p className="text-gray-600 mt-1">Manage and review all publications and research</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total</h3>
              <p className="text-2xl font-bold mt-1 text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clipboard size={20} className="text-blue-600" />
            </div>
          </div>
        </motion.div>
        
        {/* Pending Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="text-2xl font-bold mt-1 text-amber-600">{stats.pending}</p>
            </div>
            <div className="bg-amber-100 p-2 rounded-lg">
              <Clipboard size={20} className="text-amber-600" />
            </div>
          </div>
        </motion.div>
        
        {/* Approved Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Approved</h3>
              <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.approved}</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Clipboard size={20} className="text-emerald-600" />
            </div>
          </div>
        </motion.div>
        
        {/* Rejected Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 border border-rose-100 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
              <p className="text-2xl font-bold mt-1 text-rose-600">{stats.rejected}</p>
            </div>
            <div className="bg-rose-100 p-2 rounded-lg">
              <Clipboard size={20} className="text-rose-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by title, ID, or member..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          {/* Toggle Filters Button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={18} className="text-gray-600 mr-2" />
            <span>Filters</span>
            {showFilters ? <ChevronUp size={18} className="ml-2" /> : <ChevronDown size={18} className="ml-2" />}
          </button>
        </div>
        
        {/* Filters Dropdown */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="Journal Paper">Journal Paper</option>
                <option value="Conference Paper">Conference Paper</option>
                <option value="Book/Chapter">Book/Chapter</option>
                <option value="Patent">Patent</option>
              </select>
            </div>
            
            {/* Limit per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
              <select
                name="limit"
                value={filters.limit}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Publications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {publications.length > 0 ? (
          <>
            {publications.map((pub) => (
              <motion.div
                key={pub.pub_res_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        {pub.pub_res_id}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        pub.approval_status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : pub.approval_status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pub.approval_status}
                      </span>
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {pub.type}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-gray-800 mb-1">{pub.title}</h3>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Authors:</span> {renderAuthors(pub.authors)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Published:</span>
                        {pub.publishing_year}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Submitted:</span>
                        {formatDate(pub.created_at)}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">By:</span>
                        {pub.phd_candidate_id}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-end">
                    <a 
                      href={pub.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center justify-center px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 text-sm transition-colors"
                    >
                      View Online
                    </a>
                    <a 
                      href={pub.document_path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center justify-center px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 text-sm transition-colors"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
                
                {pub.feedback && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                      {pub.feedback}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
            
            {renderPagination()}
          </>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <X size={24} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              No publications found
            </h3>
            <p className="text-gray-500 text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
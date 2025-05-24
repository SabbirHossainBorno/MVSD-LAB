// app/member_dashboard/member_publication_list/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiFileText, FiCheckCircle, FiClock, FiXCircle, FiExternalLink, FiSearch, FiFilter, FiBarChart2 } from 'react-icons/fi';

const statusConfig = {
  Pending: {
    color: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-800 dark:text-yellow-300',
    icon: <FiClock className="w-5 h-5" />
  },
  Approved: {
    color: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-300',
    icon: <FiCheckCircle className="w-5 h-5" />
  },
  Rejected: {
    color: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-300',
    icon: <FiXCircle className="w-5 h-5" />
  }
};

const PublicationList = ({ darkMode }) => {
  const [publications, setPublications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/member_publication_list');
        if (!response.ok) throw new Error('Failed to fetch data');
        const { publications, stats } = await response.json();
        setPublications(publications);
        setStats(stats);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPublications = publications
  .filter(pub => 
    (statusFilter === 'All' || pub.approvalStatus === statusFilter) &&
    (
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.authors.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    )
  )
  .sort((a, b) => sortOrder === 'asc' 
    ? new Date(a.createdAt) - new Date(b.createdAt) 
    : new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full space-y-6 p-4"
    >
      {/* Stat Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
        <StatCard 
          darkMode={darkMode}
          icon={<FiBarChart2 className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
          title="Total Publications"
          value={stats.total || 0}
        />
        <StatCard 
          darkMode={darkMode}
          icon={<FiCheckCircle className="w-6 h-6 text-green-500" />}
          title="Approved"
          value={stats.approved || 0}
        />
        <StatCard 
          darkMode={darkMode}
          icon={<FiClock className="w-6 h-6 text-yellow-500" />}
          title="Pending"
          value={stats.pending || 0}
        />
        <StatCard 
          darkMode={darkMode}
          icon={<FiXCircle className="w-6 h-6 text-red-500" />}
          title="Rejected"
          value={stats.rejected || 0}
        />
      </div>

      {/* Filter Bar */}
      <div className={`flex flex-col md:flex-row gap-4 p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
        <div className="relative flex-1">
          <FiSearch className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search publications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'}`}
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <FiFilter className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'}`}
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'}`}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Publications List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPublications.map((pub) => (
          <PublicationCard 
            key={pub.id}
            pub={pub}
            darkMode={darkMode}
            statusConfig={statusConfig}
          />
        ))}
      </div>

      {filteredPublications.length === 0 && (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No matching publications found
        </div>
      )}
    </motion.div>
  );
};

const StatCard = ({ darkMode, icon, title, value }) => (
  <div className={`flex items-center gap-4 p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
      {icon}
    </div>
    <div>
      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</div>
      <div className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{value}</div>
    </div>
  </div>
);

const PublicationCard = ({ pub, darkMode, statusConfig }) => {
  const statusInfo = statusConfig[pub.approvalStatus] || {
    color: 'bg-gray-200 dark:bg-gray-700',
    text: 'text-gray-800 dark:text-gray-300',
    icon: null
  };

  return (
    <div className={`p-6 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <FiFileText className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {pub.title}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoItem darkMode={darkMode} label="Type" value={pub.type} />
            <InfoItem darkMode={darkMode} label="Year" value={pub.year} />
            <InfoItem darkMode={darkMode} label="Submitted" value={new Date(pub.createdAt).toLocaleDateString()} />
            {pub.publishedDate && (
              <InfoItem darkMode={darkMode} label="Published" value={new Date(pub.publishedDate).toLocaleDateString()} />
            )}
          </div>

          <div className="mt-4">
            <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Authors:
            </h4>
            <div className="flex flex-wrap gap-2">
              {pub.authors.map((author, index) => (
                <span
                  key={index}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  } transition-colors flex items-center gap-2`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  {author}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:w-48">
          <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-full ${
            statusInfo.color} ${statusInfo.text} transition-colors`}
          >
            <span className="shrink-0">{statusInfo.icon}</span>
            <span className="font-medium text-sm">{pub.approvalStatus}</span>
          </div>
          
          {pub.documentPath && (
            <button
              onClick={() => window.open(pub.documentPath, '_blank')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
              } transition-colors`}
            >
              <FiExternalLink className="w-5 h-5" />
              View Document
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ darkMode, label, value }) => (
  <div className="space-y-1">
    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</div>
    <div className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{value || 'N/A'}</div>
  </div>
);

export default withAuth(PublicationList, 'member');
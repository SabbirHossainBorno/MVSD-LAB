// app/member_dashboard/member_publication_list/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';
import { FiEdit, FiFileText, FiCheckCircle, FiClock, FiXCircle, FiExternalLink, FiSearch, FiFilter, FiMessageSquare } from 'react-icons/fi';

const statusConfig = {
  Pending: {
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/30',
    icon: <FiClock className="w-4 h-4" />,
    pillClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  },
  Approved: {
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30',
    icon: <FiCheckCircle className="w-4 h-4" />,
    pillClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  Rejected: {
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-500/30',
    icon: <FiXCircle className="w-4 h-4" />,
    pillClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
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
      (pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.authors.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    ))
    .sort((a, b) => sortOrder === 'asc' 
      ? new Date(a.createdAt) - new Date(b.createdAt) 
      : new Date(b.createdAt) - new Date(a.createdAt)
    );

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full space-y-8 p-4"
    >
      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-3xl shadow-2xl backdrop-blur-sm`}>
        <StatCard 
          darkMode={darkMode}
          icon={<FiFileText className="w-6 h-6 text-blue-500" />}
          title="Total Publications"
          value={stats.total || 0}
        />
        <StatCard 
          darkMode={darkMode}
          icon={<FiCheckCircle className="w-6 h-6 text-emerald-500" />}
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
          icon={<FiXCircle className="w-6 h-6 text-rose-500" />}
          title="Rejected"
          value={stats.rejected || 0}
        />
      </div>

      {/* Filter Section */}
      <div className={`flex flex-col md:flex-row gap-4 p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl backdrop-blur-sm`}>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <input
            type="text"
            placeholder="Search publications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border-0 ring-1 ${
              darkMode 
                ? 'bg-gray-700/50 text-gray-100 ring-gray-600 focus:ring-2 focus:ring-blue-500' 
                : 'bg-gray-50/70 text-gray-800 ring-gray-200 focus:ring-2 focus:ring-blue-500'
            } transition-all placeholder-gray-400`}
          />
        </div>
        
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border-0 ring-1 ${
                darkMode 
                  ? 'bg-gray-700/50 text-gray-100 ring-gray-600 focus:ring-2 focus:ring-blue-500' 
                  : 'bg-gray-50/70 text-gray-800 ring-gray-200 focus:ring-2 focus:ring-blue-500'
              } appearance-none transition-all`}
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
            className={`px-4 py-3 rounded-xl border-0 ring-1 ${
              darkMode 
                ? 'bg-gray-700/50 text-gray-100 ring-gray-600 focus:ring-2 focus:ring-blue-500' 
                : 'bg-gray-50/70 text-gray-800 ring-gray-200 focus:ring-2 focus:ring-blue-500'
            } transition-all`}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Publications List */}
      <AnimatePresence>
        {filteredPublications.map((pub) => (
          <motion.div
            key={pub.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PublicationCard 
              pub={pub}
              darkMode={darkMode}
              statusConfig={statusConfig}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredPublications.length === 0 && (
        <div className={`text-center p-8 rounded-3xl ${
          darkMode 
            ? 'bg-gray-800/50 text-gray-400' 
            : 'bg-white/70 text-gray-500'
        } shadow-2xl backdrop-blur-sm`}>
          No publications found matching your criteria
        </div>
      )}
    </motion.div>
  );
};

const StatCard = ({ darkMode, icon, title, value }) => (
  <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
    darkMode 
      ? 'bg-gray-700/30 hover:bg-gray-700/50' 
      : 'bg-gray-50/70 hover:bg-gray-100/70'
  } backdrop-blur-sm border ${
    darkMode ? 'border-gray-600/30' : 'border-gray-200/50'
  }`}>
    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-600/30' : 'bg-white/50'} shadow-sm`}>
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
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    textColor: 'text-gray-800 dark:text-gray-300',
    borderColor: 'border-gray-200 dark:border-gray-600',
    pillClass: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
  };

  return (
    <div className={`group p-6 rounded-2xl border ${
      darkMode 
        ? 'border-gray-600/30 bg-gray-800/30 hover:border-gray-500/50' 
        : 'border-gray-200/50 bg-white/70 hover:border-gray-300'
    } shadow-lg hover:shadow-xl transition-all mb-4 backdrop-blur-sm`}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FiFileText className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {pub.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {['Pending', 'Rejected'].includes(pub.approvalStatus) && (
                <Link href={`/member_dashboard/edit_publication/${pub.id}`}>
                  <button className={`p-2 rounded-lg ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700/30' 
                      : 'text-gray-600 hover:bg-gray-100'
                  } transition-colors`}>
                    <FiEdit className="w-5 h-5" />
                  </button>
                </Link>
              )}
              <a 
                href={pub.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-2 rounded-lg ${
                  darkMode 
                    ? 'text-blue-400 hover:bg-gray-700/30' 
                    : 'text-blue-600 hover:bg-gray-100'
                } transition-colors`}
              >
                <FiExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoItem darkMode={darkMode} label="Type" value={pub.type} />
            <InfoItem darkMode={darkMode} label="Publishing Year" value={pub.year} />
            {pub.publishedDate && (
              <InfoItem darkMode={darkMode} label="Published Date" value={new Date(pub.publishedDate).toLocaleDateString()} />
            )}
          </div>

          <div className="mt-4">
            <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Authors
            </h4>
            <div className="flex flex-wrap gap-2">
              {pub.authors.map((author, index) => (
                <div 
                  key={index} 
                  className={`relative inline-flex items-center px-3 py-1.5 rounded-lg text-sm ${
                    darkMode 
                      ? 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  {author}
                  <sup className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[0.5rem] font-bold">
                    {index + 1}
                  </sup>
                </div>
              ))}
            </div>
          </div>

          {pub.feedback && (
            <div className={`w-full rounded-lg p-4 ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <FiMessageSquare className={`w-5 h-5 ${statusInfo.textColor}`} />
                <span className={`text-sm font-medium ${statusInfo.textColor}`}>
                  Director&apos;s Feedback
                </span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {pub.feedback}
              </p>
            </div>
          )}

        </div>

        <div className="flex flex-col gap-4 md:w-48">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${statusInfo.pillClass} border`}>
            {statusInfo.icon}
            {pub.approvalStatus}
          </div>
          
          {pub.documentPath && (
            <button
              onClick={() => window.open(pub.documentPath, '_blank')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700/30 hover:bg-gray-700/50 text-blue-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
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
    <div className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
      {value || <span className="opacity-50">—</span>}
    </div>
  </div>
);

export default withAuth(PublicationList, 'member');
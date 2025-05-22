// app/components/AlumniDetailsModal.js
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiBriefcase, FiAward, FiGlobe, FiInfo, FiUser, FiCalendar } from 'react-icons/fi';
import Image from 'next/image';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';

const AlumniDetailsModal = ({ isOpen, onClose, alumniId }) => {
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const fetchAlumniDetails = async () => {
      if (!alumniId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/alumni_list/${alumniId}`);
        const data = await res.json();
        if (res.ok) setAlumni(data);
      } catch (error) {
        console.error('Error fetching alumni details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) fetchAlumniDetails();
  }, [isOpen, alumniId]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="relative bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700/50 transition-colors z-10"
        >
          <FiX className="w-6 h-6 text-gray-300" />
        </button>

        <AnimatePresence mode='wait'>
          {loading ? (
              <LoadingSpinner/>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8"
            >
              {/* Header Section */}
              <div className="flex items-start gap-6 mb-8">
                <div className="relative w-32 h-32 rounded-full border-2 border-purple-500/50 overflow-hidden">
                  {alumni.photo ? (
                    <Image
                      src={`/Storage/Images/PhD_Candidate/${alumni.photo.split('/').pop()}`}
                      alt={alumni.first_name}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <FiUser className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">
                    {alumni.first_name} {alumni.last_name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                      {alumni.type}
                    </span>
                    <span className="px-3 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-sm">
                      {alumni.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-gray-700 mb-6">
                {['basic', 'education', 'career', 'social'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 flex items-center gap-2 capitalize transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-purple-500 text-purple-400'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {tab === 'basic' && <FiInfo className="shrink-0" />}
                    {tab === 'education' && <FiAward className="shrink-0" />}
                    {tab === 'career' && <FiBriefcase className="shrink-0" />}
                    {tab === 'social' && <FiGlobe className="shrink-0" />}
                    <span className="whitespace-nowrap">{tab}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <DetailItem label="Email" value={alumni.email} />
                      <DetailItem label="Phone" value={alumni.phone} />
                      <DetailItem label="Country" value={alumni.country} />
                    </div>
                    <div className="space-y-2">
                      <GraduationDate date={alumni.completion_date} />
                      <DetailItem label="Passport Number" value={alumni.passport_number} />
                      <DetailItem label="Banner ID" value={alumni.id_number} />
                    </div>
                  </div>
                )}

                {activeTab === 'education' && <EducationList education={alumni.education} />}
                {activeTab === 'career' && <CareerList career={alumni.career} />}
                {activeTab === 'social' && <SocialList social={alumni.social_media} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Custom Components
const GraduationDate = ({ date }) => (
  <motion.div
    initial={{ scale: 0.95 }}
    animate={{ scale: 1 }}
    className="p-4 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-xl border border-purple-500/30"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-purple-500/20 rounded-lg">
        <FiCalendar className="w-6 h-6 text-purple-400" />
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-1">Graduation Date</p>
        <p className="text-xl font-semibold text-purple-300">
          {format(new Date(date), 'd MMM yyyy')}
        </p>
        <p className="text-xs text-purple-400/80 mt-1">
          {format(new Date(date), 'EEEE, do MMMM yyyy')}
        </p>
      </div>
    </div>
  </motion.div>
);

const EducationList = ({ education }) => (
  <div className="space-y-4">
    {education?.filter(e => e.degree).map((edu, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-gray-700/30 rounded-lg"
      >
        <h4 className="font-semibold mb-2">{edu.degree}</h4>
        <p className="text-sm text-gray-400">{edu.institution}</p>
        {edu.passing_year && (
          <p className="text-xs text-purple-400 mt-1">Graduated: {edu.passing_year}</p>
        )}
      </motion.div>
    ))}
  </div>
);

const CareerList = ({ career }) => (
  <div className="space-y-4">
    {career?.filter(c => c.position).map((job, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-gray-700/30 rounded-lg"
      >
        <h4 className="font-semibold mb-1">{job.position}</h4>
        <p className="text-sm text-gray-400">{job.organization_name}</p>
        <div className="flex gap-4 mt-2 text-xs text-purple-400">
          {job.joining_year && <span>Joined: {job.joining_year}</span>}
          {job.leaving_year && <span>Left: {job.leaving_year}</span>}
        </div>
      </motion.div>
    ))}
  </div>
);

const SocialList = ({ social }) => (
  <div className="space-y-3">
    {social?.filter(s => s.link).map((social, index) => (
      <motion.a
        key={index}
        href={social.link}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <FiGlobe className="flex-shrink-0" />
        <span className="truncate">{social.link}</span>
      </motion.a>
    ))}
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
    <span className="text-gray-400">{label}:</span>
    <span className="text-gray-200">{value || 'N/A'}</span>
  </div>
);

export default AlumniDetailsModal;
// app/dashboard/director_details/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import withAuth from '../../../components/withAuth';
import Image from 'next/image';
import { FiMail, FiPhone, FiCalendar, FiBook, FiBriefcase, FiFile, FiX } from 'react-icons/fi';
import { FaRegIdBadge } from "react-icons/fa";
import { GiPassport } from "react-icons/gi";

const DirectorDetails = () => {
  const [directorDetails, setDirectorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { id } = useParams();
  const router = useRouter();
  const [selectedAwardDetails, setSelectedAwardDetails] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchDirectorDetails = async () => {
      try {
        const response = await fetch(`/api/director_details/${id}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        setDirectorDetails(data);
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Failed to fetch director details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectorDetails();
    return () => controller.abort();
  }, [id]);

  const handleImageClick = (imageUrl, details) => {
    setSelectedImage(imageUrl);
    setSelectedAwardDetails(details);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner />;
  if (!directorDetails || !directorDetails.basicInfo) return <div>Director Details Not Found</div>;

  const formatImageUrl = (url) => {
    if (!url) return '/images/default-avatar.png';
    if (url.startsWith('//')) return `https:${url}`;
    return url.startsWith('/') ? url : `/${url}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-300 hover:text-blue-100 transition-colors group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
          Back to Director List
        </button>

        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center space-y-6 group">
              {/* Image Container with Floating Effect */}
              <div className="relative w-48 h-48 shrink-0 transition-transform duration-500 hover:scale-[1.02] hover:rotate-[1deg]">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/30 to-purple-400/30 rounded transform rotate-[6deg] scale-105 -z-10" />
                
                <div className="relative overflow-hidden rounded w-full h-full shadow-2xl shadow-blue-300/30 hover:shadow-purple-400/40 transition-all duration-500">
                  <Image
                src={formatImageUrl(directorDetails.basicInfo.photo)}
                alt={`${directorDetails.basicInfo.first_name} ${directorDetails.basicInfo.last_name}`}
                width={192}
                height={192}
                className="w-full h-full rounded object-cover transform group-hover:scale-105 transition-transform duration-300"
                onClick={() => handleImageClick(formatImageUrl(directorDetails.basicInfo.photo))}
                />
                </div>

                {/* Decorative Border Elements */}
                <div className="absolute inset-0 border-2 border-white/20 rounded pointer-events-none" />
                <div className="absolute inset-0 border-2 border-blue-400/10 rounded pointer-events-none" />
              </div>

              {/* ID Badge with Dynamic Gradient */}
              <div className="relative inline-block">
                <div className="relative px-6 py-2 bg-white/5 backdrop-blur-sm border-2 border-blue-400/20 rounded shadow-lg hover:border-purple-400/40 transition-colors duration-300">
                  <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent 
                                  tracking-tighter transition-all duration-300">
                    {directorDetails.basicInfo.id}
                  </h3>
                </div>
                {/* Status Indicator */}
                <div className={`absolute -top-2.5 -right-2.5 flex items-center gap-1.5 px-3 py-0.5 rounded text-xs font-semibold backdrop-blur-lg border ${
                  directorDetails.basicInfo.status === 'Active'
                    ? 'bg-green-500/20 border-green-400/30 text-green-400'
                    : directorDetails.basicInfo.status === 'Inactive'
                      ? 'bg-red-500/20 border-red-400/30 text-red-400'
                      : 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    directorDetails.basicInfo.status === 'Active'
                      ? 'bg-green-400'
                      : directorDetails.basicInfo.status === 'Inactive'
                        ? 'bg-red-400'
                        : 'bg-yellow-400'
                  }`} />
                  {directorDetails.basicInfo.status}
                </div>
              </div>
            </div>

            <div className="text-center md:text-left space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {`${directorDetails.basicInfo.first_name} ${directorDetails.basicInfo.last_name}`}
              </h1>
              <p className="text-xl text-gray-300 font-light max-w-2xl text-justify">
                {directorDetails.basicInfo.short_bio || 'Distinguished Director at MVSD Lab'}
              </p>

              <div className="flex justify-center md:justify-start space-x-4">
                {directorDetails.socialMedia.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded bg-gray-700 hover:bg-white hover:text-gray-900 transition-colors duration-300"
                  >
                    <Image
                      src={`/icons/${social.socialmedia_name.toLowerCase()}.png`}
                      alt={social.socialmedia_name}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Details Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <section className="bg-gray-800/50 backdrop-blur-lg p-8 rounded shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center gap-2">
              <FiBook className="inline-block" /> Basic Information
            </h2>
            <div className="space-y-4">
              <InfoItem icon={<FiMail />} label="Email" value={directorDetails.basicInfo.email} />
              <InfoItem
                icon={<FiMail />}
                label="Other Email"
                value={
                  Array.isArray(directorDetails.basicInfo.other_emails) && 
                  directorDetails.basicInfo.other_emails.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-x-2">
                      {directorDetails.basicInfo.other_emails.map((email, index) => (
                        <span key={index} className="flex items-center">
                          <span className="break-words">{email}</span>
                          {index !== directorDetails.basicInfo.other_emails.length - 1 && (
                            <span className="mx-2">|</span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span>N/A</span>
                  )
                }
              />
              <InfoItem icon={<FiPhone />} label="Phone" value={directorDetails.basicInfo.phone} />
              <InfoItem icon={<FiCalendar />} label="Date of Birth" value={formatDate(directorDetails.basicInfo.dob)} />
              <InfoItem icon={<FiCalendar />} label="Joining Status Date" value={formatDate(directorDetails.basicInfo.joining_date)} />
              <InfoItem icon={<FiCalendar />} label="Emeritus Status Date" value={formatDate(directorDetails.basicInfo.leaving_date)} />
              <InfoItem icon={<FaRegIdBadge />} label="Banner ID" value={directorDetails.basicInfo.banner_id} />
              <InfoItem icon={<GiPassport />} label="Passport Number" value={directorDetails.basicInfo.passport_number} />
            </div>
          </section>

          {/* Education Timeline */}
          {directorDetails.education?.length > 0 && (
            <section className="bg-gray-800/50 backdrop-blur-lg p-8 rounded shadow-xl">
              <h2 className="text-2xl font-semibold mb-6 text-purple-300 flex items-center gap-2">
                <FiBriefcase className="inline-block" /> Education
              </h2>
              <div className="space-y-6 relative before:absolute before:left-8 before:h-full before:w-0.5 before:bg-gray-600">
                {directorDetails.education.map((edu, index) => (
                  <TimelineItem
                    key={index}
                    title={edu.degree}
                    subtitle={edu.institution}
                    year={edu.passing_year}
                    isLast={index === directorDetails.education.length - 1}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Career Timeline */}
        {directorDetails.career?.length > 0 && (
          <section className="bg-gray-800/50 backdrop-blur-lg p-8 rounded shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-green-300 flex items-center gap-2">
              <FiBriefcase className="inline-block" /> Professional Experience
            </h2>
            <div className="space-y-6 relative before:absolute before:left-8 before:h-full before:w-0.5 before:bg-gray-600">
              {directorDetails.career.map((job, index) => (
                <TimelineItem
                  key={index}
                  title={job.position}
                  subtitle={job.organization_name}
                  year={`${job.joining_year} - ${job.leaving_year || 'Present'}`}
                  isLast={index === directorDetails.career.length - 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* Research Paper Section */}
        {directorDetails.researches?.length > 0 && (
          <section className="bg-gray-800/50 backdrop-blur-lg p-8 rounded shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-yellow-300 flex items-center gap-2">
              <FiFile className="inline-block" /> Research Paper
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
              {directorDetails.researches.map((research, index) => (
                <div
                  key={index}
                  className="group relative bg-gray-800/50 hover:bg-gray-700/40 p-6 rounded-xl border border-gray-700 hover:border-blue-400/20 transition-all duration-300 ease-out shadow-lg hover:shadow-xl"
                >
                  {/* Content Wrapper */}
                  <div className="flex flex-col h-full">
                    {/* Research Type Badge */}
                    <span className="inline-block mb-4 px-3 py-1 text-sm font-semibold text-blue-400 bg-blue-900/30 rounded-full w-fit">
                      {research.research_type}
                    </span>

                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-bold text-gray-100 mb-3 line-clamp-3">
                      {research.title}
                    </h3>

                    {/* Link with Hover Animation */}
                    <div className="mt-auto pt-4">
                      <a
                        href={research.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center font-medium text-blue-400 hover:text-blue-300 transition-colors group/link"
                      >
                        <span className="mr-2">View Research Paper</span>
                        <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-1">
                          →
                        </span>
                      </a>
                    </div>
                  </div>

                  {/* Hover Effect Element */}
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-400/10 transition-all duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Awards Gallery */}
        {directorDetails.awards?.length > 0 && (
          <section className="bg-gray-800/50 backdrop-blur-lg p-8 rounded shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-yellow-300 flex items-center gap-2">
              <FiFile className="inline-block" /> Awards
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {directorDetails.awards.map((award, index) => (
                <DocumentCard
                  key={index}
                  title={award.title}
                  type={award.year}
                  details={award.details} // Add details here
                  imageUrl={formatImageUrl(award.award_photo)}
                  onClick={() => handleImageClick(formatImageUrl(award.award_photo), award.details)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Image Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={handleCloseModal}
                className="absolute -top-2 -right-2 text-white hover:text-blue-300 z-50 transition-colors"
              >
                <FiX className="w-8 h-8" />
              </button>
              <div className="bg-gray-900 rounded overflow-hidden shadow-2xl p-2">
                <Image
                  src={selectedImage}
                  alt="Document preview"
                  width={1200}
                  height={800}
                  className="object-contain w-full h-full max-h-[80vh]"
                />
                {selectedAwardDetails && (
                  <div className="p-4 text-white">
                    <h4 className="text-lg font-semibold">Details</h4>
                    <p>{selectedAwardDetails}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Components
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start space-x-4">
    <div className="text-blue-400 mt-1">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <p className="text-gray-200">{value || 'N/A'}</p>
    </div>
  </div>
);

const TimelineItem = ({ title, subtitle, year, isLast }) => (
  <div className="relative pl-14">
    <div className="absolute left-8 top-4 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 z-10" />
    {!isLast && <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-gray-600" />}
    <div className="space-y-1">
      <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
      <p className="text-gray-400">{subtitle}</p>
      <p className="text-sm text-blue-400">{year}</p>
    </div>
  </div>
);

const DocumentCard = ({ title, type, details, imageUrl, onClick }) => (
  <div 
    className="group relative bg-gray-700 rounded overflow-hidden cursor-pointer transform transition-all hover:-translate-y-2 shadow-lg"
    onClick={onClick}
  >
    <div className="aspect-square bg-gray-600 relative">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:opacity-80 transition-opacity"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <FiFile className="w-12 h-12" />
        </div>
      )}
    </div>
    <div className="p-4 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent">
      <h4 className="font-medium text-white truncate">{title}</h4>
      <p className="text-sm text-white truncate">{type}</p>
      {details && <p className="text-sm text-gray-300 mt-1">{details}</p>} {/* Display details */}
    </div>
  </div>
);

export default withAuth(DirectorDetails, 'admin'); // Pass 'admin' as the required role
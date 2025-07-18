// app/dashboard/member_details/staff_member_details/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import withAuth from '../../../../components/withAuth';
import Head from 'next/head';
import Image from 'next/image';
import { FiMail, FiPhone, FiCalendar, FiBook, FiBriefcase, FiFile, FiX } from 'react-icons/fi';
import { MdOutlineBloodtype } from "react-icons/md";
import { FaRegIdBadge } from "react-icons/fa";
import { GiPassport } from "react-icons/gi";


const StaffMemberDetails = () => {
  const [staffMemberDetails, setStaffMemberDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const controller = new AbortController();
    const fetchStaffMemberDetails = async () => {
      try {
        const response = await fetch(`/api/member_details/staff_member_details/${id}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        setStaffMemberDetails(data);
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Failed to fetch Staff Member candidate details:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchStaffMemberDetails();
    return () => controller.abort(); // Cleanup on unmount
  }, [id]);
  

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner />;

  if (!staffMemberDetails || !staffMemberDetails.basicInfo) return <div>Staff Member Candidate Details Not Found</div>;

  const formatImageUrl = (url) => {
    if (!url) return '/images/default-avatar.png'; // Fallback image
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
          Back to Member List
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
                    src={formatImageUrl(staffMemberDetails.basicInfo.photo)}
                    alt={`${staffMemberDetails.basicInfo.first_name} ${staffMemberDetails.basicInfo.last_name}`}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-105"
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
                    {staffMemberDetails.basicInfo.id}
                  </h3>
                </div>
                {/* Status Indicator */}
                <div className={`absolute -top-2.5 -right-2.5 flex items-center gap-1.5 px-3 py-0.5 rounded text-xs font-semibold backdrop-blur-lg border ${
                  staffMemberDetails.basicInfo.status === 'Active' 
                    ? 'bg-green-500/20 border-green-400/30 text-green-400'
                    : 'bg-red-500/20 border-red-400/30 text-red-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    staffMemberDetails.basicInfo.status === 'Active' 
                      ? 'bg-green-400' 
                      : 'bg-red-400'
                  }`} />
                  {staffMemberDetails.basicInfo.status}
                  </div>
              </div>
            </div>
            <div className="text-center md:text-left space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {`${staffMemberDetails.basicInfo.first_name} ${staffMemberDetails.basicInfo.last_name}`}
              </h1>
              <p className="text-xl text-gray-300 font-light max-w-2xl text-justify">
                {staffMemberDetails.basicInfo.short_bio || 'Dedicated Staff Member Candidate at MVSD Lab'}
              </p>

              <div className="flex justify-center md:justify-start space-x-4">
                {staffMemberDetails.socialMedia.map((social, index) => (
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
              <InfoItem icon={<FiMail />} label="Email" value={staffMemberDetails.basicInfo.email} />
              <InfoItem
                icon={<FiMail />}
                label="Other Email"
                value={
                  Array.isArray(staffMemberDetails.basicInfo.other_emails) && 
                  staffMemberDetails.basicInfo.other_emails.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-x-2">
                      {staffMemberDetails.basicInfo.other_emails.map((email, index) => (
                        <span key={index} className="flex items-center">
                          <span className="break-words">{email}</span>
                          {index !== staffMemberDetails.basicInfo.other_emails.length - 1 && (
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
              <InfoItem icon={<FiPhone />} label="Phone" value={staffMemberDetails.basicInfo.phone} />
              <InfoItem icon={<FiCalendar />} label="Date of Birth" value={formatDate(staffMemberDetails.basicInfo.dob)} />
              <InfoItem icon={<FiCalendar />} label="Enrollment Date" value={formatDate(staffMemberDetails.basicInfo.admission_date)} />
              <InfoItem icon={<FiCalendar />} label="Graduation Date" value={formatDate(staffMemberDetails.basicInfo.completion_date)} />
              <InfoItem icon={<MdOutlineBloodtype />} label="Blood Group" value={staffMemberDetails.basicInfo.blood_group} />
              <InfoItem icon={<FaRegIdBadge />} label="Banner ID" value={staffMemberDetails.basicInfo.id_number} />
              <InfoItem icon={<GiPassport />} label="Passport Number" value={staffMemberDetails.basicInfo.passport_number} />
            </div>
          </section>

          {/* Education Timeline */}
          {staffMemberDetails.education?.length > 0 && (
            <section className="bg-gray-800/50 backdrop-blur-lg p-8 rounded shadow-xl">
              <h2 className="text-2xl font-semibold mb-6 text-purple-300 flex items-center gap-2">
                <FiBriefcase className="inline-block" /> Education
              </h2>
              <div className="space-y-6 relative before:absolute before:left-8 before:h-full before:w-0.5 before:bg-gray-600">
                {staffMemberDetails.education.map((edu, index) => (
                  <TimelineItem
                    key={index}
                    title={edu.degree}
                    subtitle={edu.institution}
                    year={edu.passing_year}
                    isLast={index === staffMemberDetails.education.length - 1}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Career Timeline */}
        {staffMemberDetails.career?.length > 0 && (
          <section className="bg-gray-800/50 backdrop-blur-lg p-8 rounded shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-green-300 flex items-center gap-2">
              <FiBriefcase className="inline-block" /> Professional Experience
            </h2>
            <div className="space-y-6 relative before:absolute before:left-8 before:h-full before:w-0.5 before:bg-gray-600">
              {staffMemberDetails.career.map((job, index) => (
                <TimelineItem
                  key={index}
                  title={job.position}
                  subtitle={job.organization_name}
                  year={`${job.joining_year} - ${job.leaving_year || 'Present'}`}
                  isLast={index === staffMemberDetails.career.length - 1}
                />
              ))}
            </div>
          </section>
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

export default withAuth(StaffMemberDetails, 'admin'); // Pass 'admin' as the required role
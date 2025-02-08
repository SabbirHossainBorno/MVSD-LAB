// app/dashboard/member_details/phd_candidate_details/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import LoadingSpinner from '../../../../components/LoadingSpinner';
import withAuth from '../../../../components/withAuth';
import Head from 'next/head'; // Import Head for setting the document title
import Image from 'next/image';

const PhdCandidateDetails = () => {
  const [phdCandidateDetails, setPhdCandidateDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { id } = useParams();
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const fetchPhdCandidateDetails = async () => {
      try {
        const response = await fetch(`/api/member_details/phd_candidate_details/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPhdCandidateDetails(data);
      } catch (error) {
        console.error('Failed to fetch PhD candidate details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhdCandidateDetails();
  }, [id]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  if (loading) return <LoadingSpinner />;

  if (!phdCandidateDetails || !phdCandidateDetails.basicInfo) return <div>PhD Candidate Details Not Found</div>;

  const formatImageUrl = (url) => {
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    return url.startsWith('/') ? url : `/${url}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <Head>
        <title>MVSD LAB - PhD Candidate Details - {phdCandidateDetails.basicInfo.id}</title>
      </Head>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-6xl mx-auto">

        {/* Back Button */}
        <div className="mb-4">
          <button 
            onClick={() => router.back()} 
            className="text-blue-500 hover:text-blue-300 font-semibold"
          >
            &lt; Back
          </button>
        </div>

        {/* PhD Candidate Photo and Basic Info */}
        <div className="text-center mb-10">
          <Image 
            src={formatImageUrl(phdCandidateDetails.basicInfo.photo)} // Ensure valid URL
            alt={`${phdCandidateDetails.basicInfo.first_name} ${phdCandidateDetails.basicInfo.last_name}`} // Dynamic alt text
            width={160} // 40 * 4 = 160px width
            height={160} // 40 * 4 = 160px height
            className="w-40 h-40 rounded-full mx-auto shadow-lg mb-4" // Tailwind classes for styling
          />
          <h2 className="text-4xl font-extrabold text-blue-500">{`${phdCandidateDetails.basicInfo.first_name} ${phdCandidateDetails.basicInfo.last_name}`}</h2>
          <p className="text-gray-400 text-lg mt-4">{phdCandidateDetails.basicInfo.short_bio || 'No bio available'}</p>
        </div>

        {/* Social Media Section */}
        <div className="flex justify-center space-x-6 mb-10">
          {phdCandidateDetails.socialMedia.map((social, index) => (
            <a key={index} href={social.link} target="_blank" rel="noopener noreferrer">
              <Image 
                src={`/icons/${social.socialmedia_name.toLowerCase()}.png`} // Dynamic image source based on social media name
                alt={social.socialmedia_name} // Alt text for accessibility
                width={32} // 8 * 4 = 32px width
                height={32} // 8 * 4 = 32px height
                className="w-8 h-8" // Tailwind classes for sizing
              />
            </a>
          ))}
        </div>

        {/* Basic Info Section */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {['phone', 'email', 'dob', 'admission_date', 'completion_date'].map((field) => (
            <div key={field} className="bg-gray-700 p-4 rounded-lg shadow-lg">
              <h4 className="text-lg font-semibold text-indigo-400 capitalize">{field.replace('_', ' ')}</h4>
              <p className="text-gray-300 mt-2">{phdCandidateDetails.basicInfo[field] || 'N/A'}</p>
            </div>
          ))}
        </div>

        {/* Education Section */}
        {phdCandidateDetails.education && phdCandidateDetails.education.length > 0 && (
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-indigo-400 mb-5">Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {phdCandidateDetails.education.map((edu, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-lg">
                  <h4 className="text-lg font-semibold text-blue-500">{edu.degree}</h4>
                  <p className="text-gray-300 mt-2">{edu.institution}</p>
                  <p className="text-gray-400">{edu.passing_year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Career Section */}
        {phdCandidateDetails.career && phdCandidateDetails.career.length > 0 && (
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-indigo-400 mb-5">Career</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {phdCandidateDetails.career.map((job, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-lg">
                  <h4 className="text-lg font-semibold text-blue-500">{job.position}</h4>
                  <p className="text-gray-300 mt-2">{job.organization_name}</p>
                  <p className="text-gray-400">{job.joining_year} - {job.leaving_year || 'Present'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Section */}
        {phdCandidateDetails.documents && phdCandidateDetails.documents.length > 0 && (
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-indigo-400 mb-5">Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {phdCandidateDetails.documents.map((document, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-lg">
                  <h4 className="text-lg font-semibold text-blue-500">{document.title}</h4>
                  <p className="text-gray-400">{document.document_type}</p>
                  {document.document_photo ? (
                    <Image 
                      src={formatImageUrl(document.document_photo)} // Ensure valid URL
                      alt={document.title} // Dynamic alt text
                      width={80} // 20 * 4 = 80px width
                      height={80} // 20 * 4 = 80px height
                      className="w-20 h-20 mt-4 rounded-lg object-cover cursor-pointer" // Tailwind classes for styling
                      onClick={() => handleImageClick(formatImageUrl(document.document_photo))} // Open modal on click
                      onError={(e) => { e.target.onerror = null; e.target.src = '/fallback-image.png'; }} // Fallback image handler
                    />
                  ) : (
                    <div className="w-20 h-20 mt-4 rounded-lg bg-gray-500 flex items-center justify-center">
                      <span className="text-gray-300">No Image</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={handleCloseModal}
          >
            <div className="relative bg-white p-4 rounded-lg shadow-lg">
            <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                &times;
              </button>
              <Image
                src={selectedImage}
                alt="Document Image"
                width={800}
                height={800}
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(PhdCandidateDetails);
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import withAuth from '../../../components/withAuth';

// Import local icons
import facebookIcon from '/home/mvsd-lab/public/icons/facebook.png';
import githubIcon from '/home/mvsd-lab/public/icons/github.png';
import instagramIcon from '/home/mvsd-lab/public/icons/instagram.png';
import linkedinIcon from '/home/mvsd-lab/public/icons/linkedin.png';
import websiteIcon from '/home/mvsd-lab/public/icons/website.png';
import xIcon from '/home/mvsd-lab/public/icons/x.png';

const ProfessorDetails = () => {
  const [professorDetails, setProfessorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchProfessorDetails = async () => {
      try {
        const response = await fetch(`/api/professor_details/${id}`);
        const data = await response.json();
        setProfessorDetails(data);
      } catch (error) {
        console.error('Failed to fetch professor details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessorDetails();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (!professorDetails || !professorDetails.basicInfo) return <div>Professor not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-6xl mx-auto">

        {/* Professor Photo and Basic Info */}
        <div className="text-center mb-10">
          <img
            src={professorDetails.basicInfo.photo}
            alt={`${professorDetails.basicInfo.first_name} ${professorDetails.basicInfo.last_name}`}
            className="w-40 h-40 rounded-full mx-auto shadow-lg mb-4"
          />
          <h2 className="text-4xl font-extrabold text-blue-500">{`${professorDetails.basicInfo.first_name} ${professorDetails.basicInfo.last_name}`}</h2>
          <p className="text-gray-400 text-lg mt-4">{professorDetails.basicInfo.short_bio || 'No bio available'}</p>
        </div>

        {/* Social Media Section */}
        <div className="flex justify-center space-x-6 mb-10">
          {professorDetails.basicInfo.linkedin && (
            <a href={professorDetails.basicInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400">
              <img src={linkedinIcon} alt="LinkedIn" className="w-8 h-8" />
            </a>
          )}
          {professorDetails.basicInfo.x && (
            <a href={professorDetails.basicInfo.x} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              <img src={xIcon} alt="X" className="w-8 h-8" />
            </a>
          )}
          {professorDetails.basicInfo.facebook && (
            <a href={professorDetails.basicInfo.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
              <img src={facebookIcon} alt="Facebook" className="w-8 h-8" />
            </a>
          )}
          {professorDetails.basicInfo.instagram && (
            <a href={professorDetails.basicInfo.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
              <img src={instagramIcon} alt="Instagram" className="w-8 h-8" />
            </a>
          )}
          {professorDetails.basicInfo.github && (
            <a href={professorDetails.basicInfo.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-400">
              <img src={githubIcon} alt="GitHub" className="w-8 h-8" />
            </a>
          )}
          {professorDetails.basicInfo.website && (
            <a href={professorDetails.basicInfo.website} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-400">
              <img src={websiteIcon} alt="Website" className="w-8 h-8" />
            </a>
          )}
        </div>

        {/* Basic Info Section */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {['phone', 'email', 'dob', 'joining_date', 'leaving_date'].map((field) => (
            <div key={field} className="bg-gray-700 p-4 rounded-lg shadow-lg">
              <h4 className="text-lg font-semibold text-indigo-400 capitalize">{field.replace('_', ' ')}</h4>
              <p className="text-gray-300 mt-2">{professorDetails.basicInfo[field] || 'N/A'}</p>
            </div>
          ))}
        </div>

        {/* Education Section */}
        {professorDetails.education && professorDetails.education.length > 0 && (
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-indigo-400 mb-5">Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professorDetails.education.map((edu, index) => (
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
        {professorDetails.career && professorDetails.career.length > 0 && (
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-indigo-400 mb-5">Career</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professorDetails.career.map((job, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-lg">
                  <h4 className="text-lg font-semibold text-blue-500">{job.position}</h4>
                  <p className="text-gray-300 mt-2">{job.organization_name}</p>
                  <p className="text-gray-400">{job.joining_year} - {job.leaving_year || 'Present'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Citations Section */}
        {professorDetails.citations && professorDetails.citations.length > 0 && (
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-indigo-400 mb-5">Citations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professorDetails.citations.map((citation, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-lg">
                  <h4 className="text-lg font-semibold text-blue-500">{citation.title}</h4>
                  <p className="text-gray-300 mt-2">{citation.organization_name}</p>
                  <a href={citation.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    View Citation
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards Section */}
        {professorDetails.awards && professorDetails.awards.length > 0 && (
  <div className="mb-10">
    <h3 className="text-2xl font-semibold text-indigo-400 mb-5">Awards</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {professorDetails.awards.map((award, index) => (
        <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-lg">
          <h4 className="text-lg font-semibold text-blue-500">{award.title}</h4>
          <p className="text-gray-300 mt-2">{award.details}</p>
          <p className="text-gray-400">{award.year}</p>
          {award.award_photo ? (
            <img 
              src={award.award_photo} 
              alt={award.title} 
              className="w-20 h-20 mt-4 rounded-lg object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = '/fallback-image.png'; }} // Fallback image
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


      </div>
    </div>
  );
};

export default withAuth(ProfessorDetails);

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import withAuth from '../../../components/withAuth';

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
              <i className="fab fa-linkedin fa-2x"></i>
            </a>
          )}
          {professorDetails.basicInfo.twitter && (
            <a href={professorDetails.basicInfo.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              <i className="fab fa-twitter fa-2x"></i>
            </a>
          )}
          {professorDetails.basicInfo.facebook && (
            <a href={professorDetails.basicInfo.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
              <i className="fab fa-facebook fa-2x"></i>
            </a>
          )}
          {professorDetails.basicInfo.github && (
            <a href={professorDetails.basicInfo.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-400">
              <i className="fab fa-github fa-2x"></i>
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
                  <img src={award.photo} alt={award.title} className="w-20 h-20 mt-4 rounded-lg" />
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

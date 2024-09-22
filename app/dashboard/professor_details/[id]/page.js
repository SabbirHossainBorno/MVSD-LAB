// app/dashboard/professor_details/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../../components/LoadingSpinner';
import withAuth from '../../components/withAuth';

const ProfessorDetails = ({ params }) => {
  const [professorDetails, setProfessorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = params;

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

  if (!professorDetails) return <div>Professor not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Professor Details</h2>

        {/* Basic Info Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">First Name</label>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{professorDetails.basicInfo.first_name}</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Last Name</label>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{professorDetails.basicInfo.last_name}</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Phone No</label>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{professorDetails.basicInfo.phone}</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Email</label>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{professorDetails.basicInfo.email}</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Date of Birth</label>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{professorDetails.basicInfo.dob}</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Joining Date</label>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{professorDetails.basicInfo.joining_date}</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Leaving Date</label>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{professorDetails.basicInfo.leaving_date}</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Short Bio</label>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{professorDetails.basicInfo.short_bio}</div>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Social Media</h3>
          {professorDetails.socialMedia.map((sm, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{sm.socialMedia_name}</div>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{sm.link}</div>
            </div>
          ))}
        </div>

        {/* Education Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Education</h3>
          {professorDetails.education.map((edu, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{edu.degree}</div>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{edu.institution}</div>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{edu.passing_year}</div>
            </div>
          ))}
        </div>

        {/* Career Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Career</h3>
          {professorDetails.career.map((job, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{job.position}</div>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{job.organization_name}</div>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{job.joining_year}</div>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{job.leaving_year}</div>
            </div>
          ))}
        </div>

        {/* Citations Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Citations</h3>
          {professorDetails.citations.map((citation, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{citation.title}</div>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{citation.link}</div>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{citation.organization_name}</div>
            </div>
          ))}
        </div>

        {/* Awards Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Awards</h3>
          {professorDetails.awards.map((award, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{award.title}</div>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{award.year}</div>
              <div className="w-full p-3 rounded bg-gray-700 text-gray-300">{award.details}</div>
              {award.award_photo && (
                <div className="w-full p-3 rounded bg-gray-700 text-gray-300">
                  <img src={award.award_photo} alt={award.title} className="w-full h-auto" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default withAuth(ProfessorDetails);

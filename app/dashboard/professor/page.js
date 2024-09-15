"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the styles

export default function AddProfessor() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    dob: '',
    email: '',
    password: '',
    confirm_password: '',
    short_bio: '',
    joining_date: '',
    leaving_date: '',
    photo: '',
    type: 'Professor',
    status: 'Active',
  });

  const [education, setEducation] = useState([{ degree: '', institution: '', passing_year: '' }]);
  const [career, setCareer] = useState([{ position: '', organization: '', joining_year: '', leaving_year: '' }]);
  const [citations, setCitations] = useState([{ title: '', link: '', organization: '' }]);
  const [awards, setAwards] = useState([{ title: '', year: '', details: '', awardPhoto: '' }]);

  const router = useRouter();

  // Use useCallback for memoizing handlers
  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;

    if (name === 'photo' && files.length > 0) {
      const file = files[0];

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5 MB.');
        return;
      }

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Invalid file type. Only JPG, JPEG, and PNG are allowed.');
        return;
      }

      setFormData((prevData) => ({ ...prevData, [name]: file }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  }, []);

  const handleArrayChange = useCallback((setter, index, field, value) => {
    setter((prevState) => {
      const newState = [...prevState];
      newState[index][field] = value;
      return newState;
    });
  }, []);
  
  const addNewField = useCallback((setter, newItem) => {
    setter((prevState) => [...prevState, newItem]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    const data = new FormData();
    
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    const formattedEducation = education.map(edu => ({
      ...edu,
      passing_year: edu.passing_year ? parseInt(edu.passing_year, 10) : null
    }));

    const formattedCareer = career.map(job => ({
      ...job,
      joining_year: job.joining_year ? parseInt(job.joining_year, 10) : null,
      leaving_year: job.leaving_year ? parseInt(job.leaving_year, 10) : null
    }));

    data.append('education', JSON.stringify(formattedEducation));
    data.append('career', JSON.stringify(formattedCareer));
    data.append('citations', JSON.stringify(citations));
    
    awards.forEach((award, index) => {
      data.append(`awards[${index}][title]`, award.title || '');
      data.append(`awards[${index}][year]`, award.year || '');
      data.append(`awards[${index}][details]`, award.details || '');
      if (award.awardPhoto) {
        data.append(`award_photo_${index}`, award.awardPhoto);
        
      }
    });

    try {
      const response = await fetch('/api/professor', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        toast.success('Professor added successfully!');
        router.push('/dashboard');
      } else {
        const result = await response.json();
        toast.error(result.message || 'An error occurred while adding the professor.');
      }
    } catch (error) {
      toast.error('Failed to add professor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Add Professor</h2>

        {/* Basic Info Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="first_name" className="block text-gray-300 mb-2">
              First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="last_name" className="block text-gray-300 mb-2">
              Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-gray-300 mb-2">
              Phone No
              </label>
              <input
                type="number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-300 mb-2">
              Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="dob" className="block text-gray-300 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="joining_date" className="block text-gray-300 mb-2">
              Joining Date
              </label>
              <input
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="photo" className="block text-gray-300 mb-2">
                Photo
              </label>
              <input
                type="file"
                id="photo"
                name="photo"
                accept=".jpg, .jpeg, .png"
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="leaving_date" className="block text-gray-300 mb-2">
              Leaving Date
              </label>
              <input
                type="date"
                name="leaving_date"
                value={formData.leaving_date}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                readOnly
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-300 mb-2">
              Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirm_password" className="block text-gray-300 mb-2">
              Confirm Password
              </label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
            <input
              type="text"
              name="type"
              value={formData.type}
              className="w-full p-3 rounded bg-gray-700 mb-4"
              readOnly
            />
            <input
              type="text"
              name="status"
              value={formData.status}
              className="w-full p-3 rounded bg-gray-700 mb-4"
              readOnly
            />
            <div className="mb-4">
              <label htmlFor="short_bio" className="block text-gray-300 mb-2">
              Short Bio
              </label>
              <textarea
                type="details"
                name="short_bio"
                value={formData.short_bio}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
          </div>
        </div>
  
        {/* Education Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Education</h3>
          {education.map((edu, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                name="degree"
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => handleArrayChange(setEducation, index, 'degree', e.target.value)}
                className="w-full p-3 rounded bg-gray-700"
                required
              />
              <input
                type="text"
                name="institution"
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) => handleArrayChange(setEducation, index, 'institution', e.target.value)}
                className="w-full p-3 rounded bg-gray-700"
                required
              />
              <input
                type="number"
                name="passing_year"
                placeholder="Passing Year"
                value={edu.passing_year}
                onChange={(e) => handleArrayChange(setEducation, index, 'passing_year', parseInt(e.target.value, 10))}
                className="w-full p-3 rounded bg-gray-700"
                min="1900"
                max={new Date().getFullYear()}
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addNewField(setEducation, { degree: '', institution: '', passing_year: '' })}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Add Another Education
          </button>
        </div>
  
        {/* Career Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Career</h3>
          {career.map((job, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                name="position"
                placeholder="Position"
                value={job.position}
                onChange={(e) => handleArrayChange(setCareer, index, 'position', e.target.value)}
                className="w-full p-3 rounded bg-gray-700"
                required
              />
              <input
                type="text"
                name="organization"
                placeholder="Organization"
                value={job.organization}
                onChange={(e) => handleArrayChange(setCareer, index, 'organization', e.target.value)}
                className="w-full p-3 rounded bg-gray-700"
                required
              />
              <input
                type="number"
                name="joining_year"
                placeholder="Joining Year"
                value={job.joining_year}
                onChange={(e) => handleArrayChange(setCareer, index, 'joining_year', parseInt(e.target.value, 10))}
                className="w-full p-3 rounded bg-gray-700"
                min="1900"
                max={new Date().getFullYear()}
                required
              />
              <input
                type="number"
                name="leaving_year"
                placeholder="Leaving Year"
                value={job.leaving_year}
                onChange={(e) => handleArrayChange(setCareer, index, 'leaving_year', parseInt(e.target.value, 10))}
                className="w-full p-3 rounded bg-gray-700"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addNewField(setCareer, { position: '', organization: '', joining_year: '', leaving_year: '' })}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Add Another Job
          </button>
        </div>

        {/* Citations Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Citations</h3>
          {citations.map((citation, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={citation.title}
                onChange={(e) => handleArrayChange(setCitations, index, 'title', e.target.value)}
                className="w-full p-3 rounded bg-gray-700"
                required
              />
              <input
                type="text"
                name="link"
                placeholder="Link"
                value={citation.link}
                onChange={(e) => handleArrayChange(setCitations, index, 'link', e.target.value)}
                className="w-full p-3 rounded bg-gray-700"
                required
              />
              <input
                type="text"
                name="organization"
                placeholder="Organization"
                value={citation.organization}
                onChange={(e) => handleArrayChange(setCitations, index, 'organization', e.target.value)}
                className="w-full p-3 rounded bg-gray-700"
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addNewField(setCitations, { title: '', link: '', organization: '' })}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Add Another Citation
          </button>
        </div>
  
        {/* Awards Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Awards</h3>
          {awards.map((award, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                name="title"
                placeholder="Award Title"
                value={award.title}
                onChange={(e) => handleArrayChange(setAwards, index, 'title', e.target.value)}
                className="w-full p-3 rounded bg-gray-700"
                required
              />
              <input
                type="number"
                name="year"
                placeholder="Year"
                value={award.year}
                onChange={(e) => handleArrayChange(setAwards, index, 'year', parseInt(e.target.value, 10))}
                className="w-full p-3 rounded bg-gray-700"
                min="1900"
                max={new Date().getFullYear()}
                required
              />
              <input
                type="text"
                name="details"
                placeholder="Details"
                value={award.details}
                onChange={(e) => handleArrayChange(setAwards, index, 'details', e.target.value)}
                className="w-full p-3 rounded bg-gray-700"
                required
              />
              <input
                type="file"
                name="awardPhoto"
                onChange={(e) => handleArrayChange(setAwards, index, 'awardPhoto', e.target.files[0])}
                className="w-full p-3 rounded bg-gray-700"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addNewField(setAwards, { title: '', year: '', details: '', awardPhoto: '' })}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Add Another Award
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Add Professor
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

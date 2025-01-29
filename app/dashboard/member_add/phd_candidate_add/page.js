//app/dashboard/member_add/phd_candidate_add/page.js
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../../components/withAuth';
import LoadingSpinner from '../../../components/LoadingSpinner';
import countryList from 'react-select-country-list';

const AddPhdCandidate = () => {
  const countries = countryList().getLabels(); // Get country names

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    gender: '',
    bloodGroup: '',
    country: '',
    idNumber: '',
    passport_number: '',
    dob: '',
    email: '',
    password: '',
    confirm_password: '',
    short_bio: '',
    admission_date: '',
    completion_date: '',
    photo: '',
    type: 'PhD Candidate',
    status: 'Active',
  });

  const [socialMedia, setSocialMedia] = useState([{ socialMedia_name: '', link: '' }]);
  const [education, setEducation] = useState([{ degree: '', institution: '', passing_year: '' }]);
  const [career, setCareer] = useState([{ position: '', organization: '', joining_year: '', leaving_year: '' }]);
  const [documents, setDocuments] = useState([{ title: '', documentType: '', documentsPhoto: '' }]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;

    if (name === 'photo' && files.length > 0) {
      const file = files[0];

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5 MB.');
        e.target.value = ''; // Reset file input
        return;
      }

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Invalid file type. Only JPG, JPEG, and PNG are allowed.');
        e.target.value = ''; // Reset file input
        return;
      }

      setFormData((prevData) => ({ ...prevData, [name]: file }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  }, []);

  const handleArrayChange = useCallback((setter, index, field, value) => {
    if (field === 'documentsPhoto' && value) {
      const file = value;
  
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5 MB.');
        e.target.value = ''; // Reset file input
        return;
      }
  
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        toast.error('Invalid file type. Only JPG, JPEG, PNG, and PDF are allowed.');
        e.target.value = ''; // Reset file input
        return;
      }
    }
  
    setter((prevState) => {
      const newState = [...prevState];
      newState[index][field] = value;
      return newState;
    });
  }, []);

  const addNewField = useCallback((setter, newItem) => {
    setter((prevState) => [...prevState, newItem]);
  }, []);

  const removeField = useCallback((setter, index) => {
    setter((prevState) => {
      if (prevState.length > 1) {
        return prevState.filter((_, i) => i !== index);
      }
      return prevState;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      setLoading(false);
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

    data.append('socialMedia', JSON.stringify(socialMedia));
    data.append('education', JSON.stringify(formattedEducation));
    data.append('career', JSON.stringify(formattedCareer));

    documents.forEach((document, index) => {
      data.append(`documents[${index}][title]`, document.title || '');
      data.append(`documents[${index}][documentType]`, document.documentType || '');
      if (document.documentsPhoto) {
        data.append(`documents[${index}][documentsPhoto]`, document.documentsPhoto);
      }
    });

    try {
      const response = await fetch('/api/member_add/phd_candidate_add', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        toast.success('PhD Candidate Added Successfully!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000); // 2-second delay
      } else {
        const result = await response.json();
        toast.error(result.message || 'An error occurred while adding the PhD Candidate.');
      }
    } catch (error) {
      toast.error('Failed To Add PhD Candidate');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Add PhD Candidate</h2>

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
              <label htmlFor="gender" className="block text-gray-300 mb-2">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="" disabled className="text-gray-400">
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="bloodGroup" className="block text-gray-300 mb-2">
                Blood Group
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="" disabled className="text-gray-400">
                  Select Blood Group
                </option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="country" className="block text-gray-300 mb-2">
                Country
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="" disabled className="text-gray-400">Select Country</option>
                {countries.map((country, index) => (
                  <option key={index} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="idNumber" className="block text-gray-300 mb-2">
              Identification Number
              </label>
              <input
                type="number"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="passport_number" className="block text-gray-300 mb-2">
              Passport Number
              </label>
              <input
                type="text"
                name="passport_number"
                value={formData.passport_number}
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
              <label htmlFor="admission_date" className="block text-gray-300 mb-2">
              Admission Date
              </label>
              <input
                type="date"
                name="admission_date"
                value={formData.admission_date}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
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
            <div className="mb-4">
              <label htmlFor="type" className="block text-gray-300 mb-2">
                Type
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                className="w-full p-3 rounded bg-gray-700 mb-4"
                readOnly
              />
            </div>
            <div className="mb-4">
              <label htmlFor="status" className="block text-gray-300 mb-2">
                Status
              </label>
              <input
                type="text"
                name="status"
                value={formData.status}
                className="w-full p-3 rounded bg-gray-700 mb-4"
                readOnly
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
              <label htmlFor="completion_date" className="block text-gray-300 mb-2">
              Completion Date
              </label>
              <input
                type="date"
                name="completion_date"
                value={formData.completion_date}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300 cursor-not-allowed"
                readOnly
              />
            </div>
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

        {/* Social Media Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Social Media</h3>
        {socialMedia.map((sm, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative">
            <select
              name="socialMedia_name"
              value={sm.socialMedia_name}
              onChange={(e) => handleArrayChange(setSocialMedia, index, 'socialMedia_name', e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-gray-300"
              required
            >
              <option value="">Select Social Media</option>
              <option value="Facebook">Facebook</option>
              <option value="X">X</option>
              <option value="Instagram">Instagram</option>
              <option value="Linkedin">Linkedin</option>
              <option value="GitHub">GitHub</option>
              <option value="Website">Website</option>
            </select>
            <input
              type="url"
              name="link"
              placeholder="Link"
              value={sm.link}
              onChange={(e) => handleArrayChange(setSocialMedia, index, 'link', e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-gray-300"
              required
            />
            {socialMedia.length > 1 && (
              <button
                type="button"
                onClick={() => removeField(setSocialMedia, index)}
                className="absolute top-0 right-0 mt-2 mr-2 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addNewField(setSocialMedia, { socialMedia_name: '', link: '' })}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Add Another Social Media
        </button>
      </div>
  
        {/* Education Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Education</h3>
          {education.map((edu, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 relative">
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
              {/* Remove Button */}
              {education.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField(setEducation, index)}
                  className="absolute top-0 right-0 mt-2 mr-2 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
                >
                  Remove
                </button>
              )}
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
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 relative">
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
            {career.length > 1 && (
              <button
                type="button"
                onClick={() => removeField(setCareer, index)}
                className="absolute top-0 right-0 mt-2 mr-2 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
              >
                Remove
              </button>
            )}
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

      {/* documents Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Documents</h3>
        {documents.map((document, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 relative">
            <input
              type="text"
              name="title"
              placeholder="Document Title"
              value={document.title}
              onChange={(e) => handleArrayChange(setDocuments, index, 'title', e.target.value)}
              className="w-full p-3 rounded bg-gray-700"
              required
            />
            <div className="mb-4">
            <select
            name="documentType"
            value={document.documentType}
            onChange={(e) => handleArrayChange(setDocuments, index, 'documentType', e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
            required
            >
            <option value="" disabled className="text-gray-400">Select Document Type</option>
            <option value="1" className="bg-gray-700 text-white">Education</option>
            <option value="2" className="bg-gray-700 text-white">Medical</option>
            <option value="3" className="bg-gray-700 text-white">Career</option>
            <option value="4" className="bg-gray-700 text-white">Personal</option>
            <option value="5" className="bg-gray-700 text-white">Official</option>
            <option value="6" className="bg-gray-700 text-white">Other</option>
            </select>
            </div>


            <input
              type="file"
              name="documentsPhoto"
              onChange={(e) => handleArrayChange(setDocuments, index, 'documentsPhoto', e.target.files[0])}
              className="w-full p-3 rounded bg-gray-700"
            />
            {documents.length > 1 && (
              <button
                type="button"
                onClick={() => removeField(setDocuments, index)}
                className="absolute top-0 right-0 mt-2 mr-2 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addNewField(setDocuments, { title: '', documentType: '', documentsPhoto: '' })}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Add Another Document
        </button>
      </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Add PhD Candidate
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}
export default withAuth(AddPhdCandidate);
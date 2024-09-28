//app/dashboard/professor_edit/[id]/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../../components/withAuth';
import LoadingSpinner from '../../../components/LoadingSpinner';

const EditProfessor = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    short_bio: '',
    status: 'Active',
    leaving_date: '',
  });
  const [photo, setPhoto] = useState(null);
  const [socialMedia, setSocialMedia] = useState([]);
  const [education, setEducation] = useState([]);
  const [career, setCareer] = useState([]);
  const [citations, setCitations] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchProfessorData = async () => {
      try {
        const response = await fetch(`/api/professor_edit/${id}`);
        const data = await response.json();
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          short_bio: data.short_bio,
          status: data.status,
          leaving_date: data.leaving_date,
        });
        setPhoto(data.photo);
        setSocialMedia(data.socialMedia);
        setEducation(data.education);
        setCareer(data.career);
        setCitations(data.citations);
        setAwards(data.awards);
      } catch (error) {
        toast.error('Failed to fetch professor data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfessorData();
  }, [id]);

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
      setPhoto(file);
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

  const removeField = useCallback((setter, index) => {
    setter((prevState) => {
      if (prevState.length > 1) {
        return prevState.filter((_, i) => i !== index);
      }
      return prevState;
    });
  }, []);

  const handleSubmit = async (section) => {
    setLoading(true);
    const data = new FormData();
  
    if (section === 'basicInfo') {
      for (const key in formData) {
        data.append(key, formData[key]);
      }
    } else if (section === 'photo') {
      data.append('photo', photo);
    } else if (section === 'socialMedia') {
      data.append('socialMedia', JSON.stringify(socialMedia));
    } else if (section === 'education') {
      data.append('education', JSON.stringify(education));
    } else if (section === 'career') {
      data.append('career', JSON.stringify(career));
    } else if (section === 'citations') {
      data.append('citations', JSON.stringify(citations));
    } else if (section === 'awards') {
      awards.forEach((award, index) => {
        data.append(`awards[${index}][title]`, award.title);
        data.append(`awards[${index}][year]`, award.year);
        data.append(`awards[${index}][details]`, award.details);
        if (award.awardPhoto) {
          data.append(`awards[${index}][awardPhoto]`, award.awardPhoto);
        }
        data.append(`awards[${index}][existing]`, award.existing ? 'true' : 'false');
      });
    } else if (section === 'password') {
      data.append('password', formData.password);
    }
  
    try {
      const response = await fetch(`/api/professor_edit/${id}`, {
        method: 'POST',
        body: data,
      });
  
      if (response.ok) {
        toast.success('Professor updated successfully!');
        router.push('/dashboard');
      } else {
        const result = await response.json();
        toast.error(result.message || 'An error occurred while updating the professor.');
      }
    } catch (error) {
      toast.error('Failed to update professor');
    } finally {
      setLoading(false);
    }
  };
  
  
  

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <form className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Edit Professor</h2>

        {/* Basic Info Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Professor Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="first_name" className="block text-gray-300 mb-2">First Name</label>
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
              <label htmlFor="last_name" className="block text-gray-300 mb-2">Last Name</label>
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
              <label htmlFor="phone" className="block text-gray-300 mb-2">Phone No</label>
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
              <label htmlFor="short_bio" className="block text-gray-300 mb-2">Short Bio</label>
              <textarea
                name="short_bio"
                value={formData.short_bio}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="status" className="block text-gray-300 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="leaving_date" className="block text-gray-300 mb-2">Leaving Date</label>
              <input
                type="date"
                name="leaving_date"
                value={formData.leaving_date}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSubmit('basicInfo')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
          >
            Update Basic Info
          </button>
        </div>

        {/* Profile Photo Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Edit Profile Photo</h3>
          <div className="mb-4">
            <img src={photo} alt="Profile Photo" className="w-32 h-32 rounded-full mx-auto" />
          </div>
          <div className="mb-4">
            <input
              type="file"
              id="photo"
              name="photo"
              accept=".jpg, .jpeg, .png"
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 text-gray-300"
            />
          </div>
          <button
            type="button"
            onClick={() => handleSubmit('photo')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Change Profile Photo
          </button>
        </div>

        {/* Social Media Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Social Media</h3>
          {socialMedia.map((sm, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative">
              <select
                name="socialmedia_name"
                value={sm.socialmedia_name}
                onChange={(e) => handleArrayChange(setSocialMedia, index, 'socialmedia_name', e.target.value)}
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
            onClick={() => addNewField(setSocialMedia, { socialmedia_name: '', link: '' })}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
          >
            Add Another Social Media
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('socialMedia')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Update Social Media
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
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
          >
            Add Another Education
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('education')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Update Education
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
                name="organization_name"
                placeholder="Organization"
                value={job.organization_name}
                onChange={(e) => handleArrayChange(setCareer, index, 'organization_name', e.target.value)}
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
            onClick={() => addNewField(setCareer, { position: '', organization_name: '', joining_year: '', leaving_year: '' })}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
          >
            Add Another Job
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('career')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Update Career
          </button>
        </div>

        {/* Citations Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Citations</h3>
          {citations.map((citation, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 relative">
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
                name="organization_name"
                placeholder="Organization"
                value={citation.organization_name}
                onChange={(e) => handleArrayChange(setCitations, index, 'organization_name', e.target.value)}
                className="w-full p-3 rounded bg-gray-700"
                required
              />
              {citations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField(setCitations, index)}
                  className="absolute top-0 right-0 mt-2 mr-2 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addNewField(setCitations, { title: '', link: '', organization_name: '' })}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
          >
            Add Another Citation
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('citations')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Update Citations
          </button>
        </div>

       {/* Awards Section */}
<div className="mb-8">
  <h3 className="text-xl font-bold mb-4">Awards</h3>
  {awards.map((award, index) => (
    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 relative">
      {/* Existing Awards */}
      {award.existing ? (
        <>
          <input
            type="text"
            name="title"
            placeholder="Award Title"
            value={award.title}
            className="w-full p-3 rounded bg-gray-700"
            readOnly
          />
          <input
            type="number"
            name="year"
            placeholder="Year"
            value={award.year}
            className="w-full p-3 rounded bg-gray-700"
            readOnly
          />
          <input
            type="text"
            name="details"
            placeholder="Details"
            value={award.details}
            className="w-full p-3 rounded bg-gray-700"
            readOnly
          />
          {award.awardPhoto && (
            <div className="w-full md:col-span-3">
              <p className="text-gray-400 mb-2">Current Award Photo:</p>
              <img
                src={award.awardPhoto}
                alt="Award Photo"
                className="w-32 h-32 object-cover mb-4"
              />
            </div>
          )}
        </>
      ) : (
        <>
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
          <button
            type="button"
            onClick={() => removeField(setAwards, index)}
            className="absolute top-0 right-0 mt-2 mr-2 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
          >
            Remove
          </button>
        </>
      )}
    </div>
  ))}
  <button
  type="button"
  onClick={() => addNewField(setAwards, { title: '', year: '', details: '', awardPhoto: null, existing: false })}
  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
>
  Add Another Award
</button>

  <button
    type="button"
    onClick={() => handleSubmit('awards')}
    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
  >
    Update Awards
  </button>
</div>





        {/* Password Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-300 mb-2">New Password</label>
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
              <label htmlFor="confirm_password" className="block text-gray-300 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSubmit('password')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Update Password
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default withAuth(EditProfessor);

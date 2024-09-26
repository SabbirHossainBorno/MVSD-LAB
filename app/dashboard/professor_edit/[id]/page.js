//app/dashboard/professor_edit/[id]/page.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../../components/withAuth';
import LoadingSpinner from '../../../components/LoadingSpinner';

const EditProfessor = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    short_bio: '',
    leaving_date: '',
    photo: '',
    type: 'Professor',
    status: 'Active',
  });
  const [socialMedia, setSocialMedia] = useState([{ socialmedia_name: '', link: '' }]);
  const [education, setEducation] = useState([{ degree: '', institution: '', passing_year: '' }]);
  const [career, setCareer] = useState([{ position: '', organization_name: '', joining_year: '', leaving_year: '' }]);
  const [citations, setCitations] = useState([{ title: '', link: '', organization_name: '' }]);
  const [awards, setAwards] = useState([{ title: '', year: '', details: '', awardPhoto: '' }]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchProfessor = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/professor_edit/${id}`);
        const data = await res.json();
        if (res.ok) {
          setFormData(data.professor);
          setSocialMedia(data.socialMedia);
          setEducation(data.education);
          setCareer(data.career);
          setCitations(data.citations);
          setAwards(data.awards);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error('Failed to fetch professor details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfessor();
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
    data.append('citations', JSON.stringify(citations));

    awards.forEach((award, index) => {
      data.append(`awards[${index}][title]`, award.title || '');
      data.append(`awards[${index}][year]`, award.year || '');
      data.append(`awards[${index}][details]`, award.details || '');
      if (award.awardPhoto) {
        data.append(`awards[${index}][awardPhoto]`, award.awardPhoto);
      }
    });

    try {
      const response = await fetch(`/api/professor_edit/${id}`, {
        method: 'PUT',
        body: data,
      });

      if (response.ok) {
        toast.success('Professor updated successfully!');
        router.push('/dashboard/professor_list');
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/professor_edit/${id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        toast.success('Password updated successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        const result = await response.json();
        toast.error(result.message || 'An error occurred while updating the password.');
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Edit Professor</h2>

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
              <label htmlFor="short_bio" className="block text-gray-300 mb-2">
                Short Bio
              </label>
              <textarea
                name="short_bio"
                value={formData.short_bio}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="status" className="block text-gray-300 mb-2">
                Status
              </label>
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
              <label htmlFor="leaving_date" className="block text-gray-300 mb-2">
                Leaving Date
              </label>
              <input
                type="date"
                name="leaving_date"
                value={formData.leaving_date}
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Profile Photo Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Profile Photo</h3>
            <div className="flex items-center mb-4">
                {formData.photo && (
                <img
                    src={`/Storage/Images/Professor/${formData.photo.split('/').pop()}`}
                    alt="Profile Photo"
                    className="w-24 h-24 rounded-full mr-4"
                />
                )}
                <input
                type="file"
                id="photo"
                name="photo"
                accept=".jpg, .jpeg, .png"
                onChange={handleChange}
                className="w-full p-3 rounded bg-gray-700 text-gray-300"
                />
            </div>
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
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Add Another Job
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
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Add Another Citation
          </button>
        </div>

        {/* Awards Section */}
<div className="mb-8">
  <h3 className="text-xl font-bold mb-4">Awards</h3>
  
  {/* Display existing awards */}
  {awards.length > 0 ? (
    awards.map((award, index) => (
      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 relative">
        {/* Displaying the award details */}
        <input
          type="text"
          name="title"
          placeholder="Award Title"
          value={award.title}
          readOnly
          className="w-full p-3 rounded bg-gray-700"
        />
        <input
          type="number"
          name="year"
          placeholder="Year"
          value={award.year}
          readOnly
          className="w-full p-3 rounded bg-gray-700"
        />
        <input
          type="text"
          name="details"
          placeholder="Details"
          value={award.details}
          readOnly
          className="w-full p-3 rounded bg-gray-700"
        />
        {/* Displaying the award photo */}
        {award.award_photo && (
          <div className="flex items-center">
            <img
              src={`/Storage/Images/Professor/${award.award_photo.split('/').pop()}`} // Ensure the path is correct
              alt="Award Photo"
              className="w-24 h-24 rounded-full mr-4"
            />
          </div>
        )}
      </div>
    ))
  ) : (
    <p>No awards found for this professor.</p> // Message if no awards are present
  )}

  {/* Button to add another award */}
  <button
    type="button"
    onClick={() => addNewField(setAwards, { title: '', year: '', details: '', awardPhoto: '' })}
    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mt-4"
  >
    Add Another Award
  </button>

  {/* Section for new awards input */}
  {awards.length > 0 && awards.map((award, index) => (
    <div key={`new-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <input
        type="text"
        name="title"
        placeholder="New Award Title"
        className="w-full p-3 rounded bg-gray-700"
        onChange={(e) => handleArrayChange(setAwards, awards.length, 'title', e.target.value)}
      />
      <input
        type="number"
        name="year"
        placeholder="New Award Year"
        className="w-full p-3 rounded bg-gray-700"
        onChange={(e) => handleArrayChange(setAwards, awards.length, 'year', parseInt(e.target.value, 10))}
        min="1900"
        max={new Date().getFullYear()}
      />
      <input
        type="text"
        name="details"
        placeholder="New Award Details"
        className="w-full p-3 rounded bg-gray-700"
        onChange={(e) => handleArrayChange(setAwards, awards.length, 'details', e.target.value)}
      />
      <input
        type="file"
        name="newAwardPhoto"
        className="w-full p-3 rounded bg-gray-700"
        onChange={(e) => handleArrayChange(setAwards, awards.length, 'awardPhoto', e.target.files[0])}
      />
      {awards.length > 1 && (
        <button
          type="button"
          onClick={() => removeField(setAwards, index)} // Adjust remove logic as needed
          className="absolute top-0 right-0 mt-2 mr-2 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
        >
          Remove
        </button>
      )}
    </div>
  ))}
</div>


        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Update Professor
          </button>
        </div>
      </form>

      {/* Password Update Section */}
      <form onSubmit={handlePasswordChange} className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-6xl mx-auto mt-8">
        <h3 className="text-xl font-bold mb-4">Update Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-gray-300"
              required
            />
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
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

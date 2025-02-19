// app/dashboard/professor_edit/[id]/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../../../components/withAuth';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import Image from 'next/image';
import CustomPopup from '../../../../components/CustomPopup'; // Import the custom popup component
import {
  FiUser, FiPhone, FiCalendar, FiBook, FiBriefcase, FiFileText,
  FiAward, FiLink, FiX, FiPlus, FiTrash2, FiGlobe, FiLinkedin, FiGithub,
  FiChevronDown, FiLoader, FiUpload, FiAlertCircle, FiActivity, FiInfo, FiRefreshCcw,
} from 'react-icons/fi';

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
  const [documents, setDocuments] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  useEffect(() => {
    const fetchProfessorData = async () => {
      try {
        const response = await fetch(`/api/professor_edit/${id}`);
        const data = await response.json();
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          short_bio: data.short_bio || '',
          status: data.status, // Directly use the status from the database
          leaving_date: data.leaving_date || '', // Only leaving_date can be null
        });
        setPhoto(data.photo || null);
        setSocialMedia(data.socialMedia || []);
        setEducation(data.education || []);
        setCareer(data.career || []);
        setCitations(data.citations || []);
        setDocuments(data.documents || []);
        setAwards(data.awards || []);
      } catch (error) {
        toast.error('Failed to fetch professor data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfessorData();
  }, [id]);

  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setShowDeletePopup(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/professor_edit/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: documentToDelete.serial,
          documentType: documentToDelete.document_type,
          documentTitle: documentToDelete.title,
          documentPhoto: documentToDelete.documentsPhoto,
        }),
      });
  
      if (response.ok) {
        toast.success('Document Deleted Successfully!');
        // Refresh the page or update the state to remove the deleted document
        setDocuments((prevDocuments) => prevDocuments.filter(doc => doc.serial !== documentToDelete.serial));
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setLoading(false);
      setShowDeletePopup(false);
      setDocumentToDelete(null);
    }
  };

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
    if (field === 'documentsPhoto' && value) {
      const file = value;
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5 MB.');
        return;
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        toast.error('Invalid file type. Only JPG, JPEG, PNG, and PDF are allowed.');
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

  const handleSubmit = async (section) => {
    setLoading(true);
    const data = new FormData();
  
    switch (section) {
      case 'basicInfo':
        for (const key in formData) {
          data.append(key, formData[key]);
        }
        break;
      case 'photo':
        data.append('photo', photo);
        break;
      case 'socialMedia':
        data.append('socialMedia', JSON.stringify(socialMedia));
        break;
      case 'education':
        data.append('education', JSON.stringify(education));
        break;
      case 'career':
        data.append('career', JSON.stringify(career));
        break;
      case 'citations':
        data.append('citations', JSON.stringify(citations));
        break;
        case 'documents':
      documents.forEach((document, index) => {
        if (!document.existing && !document.documentsPhoto) {
          toast.error(`Document photo is required for new document: ${document.title}`);
          setLoading(false);
          return;
        }
        data.append(`documents[${index}][title]`, document.title);
        data.append(`documents[${index}][document_type]`, document.document_type); // Ensure document_type is appended
        if (document.documentsPhoto) {
          data.append(`documents[${index}][documentsPhoto]`, document.documentsPhoto);
        }
        data.append(`documents[${index}][existing]`, document.existing ? 'true' : 'false');
      });
      break;
      case 'awards':
        awards.forEach((award, index) => {
          data.append(`awards[${index}][title]`, award.title);
          data.append(`awards[${index}][year]`, award.year);
          data.append(`awards[${index}][details]`, award.details);
          if (award.awardPhoto) {
            data.append(`awards[${index}][awardPhoto]`, award.awardPhoto);
          }
          data.append(`awards[${index}][existing]`, award.existing ? 'true' : 'false');
        });
        break;
      case 'password':
        data.append('password', formData.password);
        break;
      default:
        break;
    }
  
    try {
      const response = await fetch(`/api/professor_edit/${id}`, {
        method: 'POST',
        body: data,
      });
  
      if (response.ok) {
        toast.success('Professor Updated successfully!');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-300 hover:text-blue-100 transition-colors group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Edit Professor
          </h1>
        </div>
        {/* Main Form */}
        <form className="bg-gray-800/50 backdrop-blur-lg rounded shadow-2xl p-6 space-y-8">
          {/* Personal Information Section */}
          <section className="bg-gray-700/30 rounded p-6 shadow-inner">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-blue-300">
              <FiUser className="w-6 h-6" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">First Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    required
                  />
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Last Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    required
                  />
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Phone</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    required
                  />
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              {/* Short Bio */}
              <div className="space-y-2 col-span-full">
                <label className="block text-sm font-medium text-gray-300">Short Bio</label>
                <div className="relative">
                  <textarea
                    name="short_bio"
                    value={formData.short_bio}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none min-h-[120px]"
                    required
                  />
                  <FiFileText className="absolute left-3 top-4 text-gray-400" />
                </div>
              </div>
              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Status</label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <FiInfo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {/* Leaving Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Leaving Date</label>
                <div className="relative">
                <input
                  type="date"
                  name="leaving_date" // ✅ Must match `handleChange`
                  value={formData.leaving_date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
                />

                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => handleSubmit('basicInfo')}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiRefreshCcw className="w-4 h-4" />
              <span>Update Basic Info</span>
            </button>
            </div>
          </section>
          {/* Profile Photo Section */}
          <section className="bg-gray-700/30 rounded p-6 shadow-inner">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-blue-300">
              <FiUpload className="w-6 h-6" /> Edit Profile Photo
            </h2>
            <div className="mb-4">
              {photo && (
                <Image
                  src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                  alt="Profile Photo"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full mx-auto"
                />
              )}
            </div>
            <div className="relative">
              <input
                type="file"
                name="photo"
                accept=".jpg, .jpeg, .png"
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              <FiUpload className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="mt-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => handleSubmit('photo')}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiRefreshCcw className="w-4 h-4" />
              <span>Change Profile Photo</span>            
            </button>
            </div>
          </section>

          {/* Social Media Section */}
          <section className="bg-gray-700/30 rounded p-6 shadow-inner">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-purple-300">
              <FiLinkedin className="w-6 h-6" /> Social Profiles
            </h2>
            {socialMedia.map((sm, index) => (
              <div key={index} className="group relative grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <select
                    name="socialmedia_name"
                    value={sm.socialmedia_name}
                    onChange={(e) => handleArrayChange(setSocialMedia, index, 'socialmedia_name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                    required
                  >
                    <option value="">Select Platform</option>
                    <option value="Linkedin">LinkedIn</option>
                    <option value="GitHub">GitHub</option>
                    <option value="Facebook">Facebook</option>
                    <option value="X">X (Twitter)</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Website">Personal Website</option>
                  </select>
                  <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="Profile URL"
                    value={sm.link}
                    onChange={(e) => handleArrayChange(setSocialMedia, index, 'link', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                    required
                  />
                  {sm.socialmedia_name === 'GitHub' ? (
                    <FiGithub className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  ) : (
                    <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  )}
                </div>
                {socialMedia.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField(setSocialMedia, index)}
                    className="absolute right-0 -top-3 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-opacity"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <div className="mt-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => addNewField(setSocialMedia, { socialmedia_name: '', link: '' })}
              className="flex items-center justify-center w-full md:w-auto space-x-2 bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Social Profile</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('socialMedia')}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiRefreshCcw className="w-4 h-4" />
              <span>Update Social Media</span>
            </button>
            </div>
          </section>
          
          {/* Education Section */}
          <section className="bg-gray-700/30 rounded p-6 shadow-inner">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-green-300">
              <FiBook className="w-6 h-6" /> Education History
            </h2>
            <div className="space-y-6 relative before:absolute before:left-8 before:h-full before:w-0.5 before:bg-gray-600">
              {education.map((edu, index) => (
                <div key={index} className="relative pl-14">
                  <div className="absolute left-8 top-4 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 z-10" />
                  {index !== education.length - 1 && (
                    <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-gray-600" />
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-800/50 p-4 rounded hover:bg-gray-800/70 transition-colors">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) => handleArrayChange(setEducation, index, 'degree', e.target.value)}
                        className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                        required
                      />
                      <FiBook className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => handleArrayChange(setEducation, index, 'institution', e.target.value)}
                        className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                        required
                      />
                      <FiBriefcase className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Passing Year"
                        value={edu.passing_year}
                        onChange={(e) => handleArrayChange(setEducation, index, 'passing_year', parseInt(e.target.value, 10))}
                        className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                        min="1900"
                        max={new Date().getFullYear()}
                        required
                      />
                      <FiCalendar className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  {education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(setEducation, index)}
                      className="absolute right-0 top-0 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <button
                type="button"
                onClick={() => addNewField(setEducation, { degree: '', institution: '', passing_year: '' })}
                className="flex items-center justify-center space-x-2 bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add Education</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit('education')}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
              >
                <FiRefreshCcw className="w-4 h-4" />
                <span>Update Education</span>
              </button>
            </div>

          </section>

          {/* Career Section */}
          <section className="bg-gray-700/30 rounded p-6 shadow-inner">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-yellow-300">
              <FiBriefcase className="w-6 h-6" /> Professional Experience
            </h2>
            {career.map((job, index) => (
              <div key={index} className="group relative grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-800/50 p-4 rounded hover:bg-gray-800/70 transition-colors">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Position"
                    value={job.position}
                    onChange={(e) => handleArrayChange(setCareer, index, 'position', e.target.value)}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                    required
                  />
                  <FiUser className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Organization"
                    value={job.organization_name}
                    onChange={(e) => handleArrayChange(setCareer, index, 'organization_name', e.target.value)}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                    required
                  />
                  <FiBriefcase className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Start Year"
                    value={job.joining_year}
                    onChange={(e) => handleArrayChange(setCareer, index, 'joining_year', parseInt(e.target.value, 10))}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                  />
                  <FiCalendar className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="End Year"
                    value={job.leaving_year}
                    onChange={(e) => handleArrayChange(setCareer, index, 'leaving_year', parseInt(e.target.value, 10))}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  <FiCalendar className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {career.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField(setCareer, index)}
                    className="absolute right-0 -top-3 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-opacity"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <div className="mt-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => addNewField(setCareer, { position: '', organization_name: '', joining_year: '', leaving_year: '' })}
              className="flex items-center justify-center w-full md:w-auto space-x-2 bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Experience</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('career')}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiRefreshCcw className="w-4 h-4" />
              <span>Update Career</span>
            </button>
            </div>
          </section>

          {/* Citations Section */}
          <section className="bg-gray-700/30 rounded p-6 shadow-inner">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-purple-300">
              <FiFileText className="w-6 h-6" /> Academic Citations
            </h2>
            {citations.map((citation, index) => (
              <div key={index} className="group relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-800/50 p-4 rounded hover:bg-gray-800/70 transition-colors">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Citation Title"
                    value={citation.title}
                    onChange={(e) => handleArrayChange(setCitations, index, 'title', e.target.value)}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                    required
                  />
                  <FiBook className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="Citation URL"
                    value={citation.link}
                    onChange={(e) => handleArrayChange(setCitations, index, 'link', e.target.value)}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                    required
                  />
                  <FiLink className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Issuing Organization"
                    value={citation.organization_name}
                    onChange={(e) => handleArrayChange(setCitations, index, 'organization_name', e.target.value)}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                    required
                  />
                  <FiBriefcase className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {citations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField(setCitations, index)}
                    className="absolute right-0 -top-3 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-opacity"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <div className="mt-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => addNewField(setCitations, { title: '', link: '', organization_name: '' })}
              className="flex items-center justify-center w-full md:w-auto space-x-2 bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Citation</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('citations')}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiRefreshCcw className="w-4 h-4" />
              <span>Update Citations</span>
            </button>
            </div>
          </section>

          {/* Document Section */}
<section className="bg-gray-700/30 rounded p-6 shadow-inner relative">
  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-cyan-300">
    <FiFileText className="w-6 h-6" /> Documents
  </h2>
  {documents.map((document, index) => (
    <div key={index} className="group relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-800/50 p-4 rounded hover:bg-gray-800/70 transition-colors">
      {/* Document Title Input */}
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Document Title"
          value={document.title}
          onChange={(e) => handleArrayChange(setDocuments, index, 'title', e.target.value)}
          className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
          required
          readOnly={document.existing} // Make read-only if existing
        />
        <FiFileText className="absolute right-3 text-gray-400 pointer-events-none" />
      </div>
      {/* Document Type */}
      <div className="relative flex items-center">
        <FiInfo className="absolute left-3 text-gray-400 pointer-events-none" />
        <select
          name="document_type"
          value={document.document_type}
          onChange={(e) => handleArrayChange(setDocuments, index, 'document_type', e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
          required
          disabled={document.existing} // Disable if existing
        >
          <option value="" disabled className="text-gray-400">Select Type</option>
          <option value="Education">Education</option>
          <option value="Medical">Medical</option>
          <option value="Career">Career</option>
          <option value="Personal">Personal</option>
          <option value="Official">Official</option>
          <option value="Other">Other</option>
        </select>
        <FiChevronDown className="absolute right-3 text-gray-400 pointer-events-none" />
      </div>
      {/* Document Upload */}
      <div className="relative space-y-2">
        {document.existing ? (
          <div className="relative">
            <p className="text-gray-400 mb-2">Current Document Photo:</p>
            <Image
              src={document.documentsPhoto}
              alt="Document Photo"
              width={64}
              height={64}
              className="w-16 h-16 object-cover mb-4"
            />
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              onChange={(e) => handleArrayChange(setDocuments, index, 'documentsPhoto', e.target.files[0])}
              className="w-full pl-10 pr-12 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              accept="image/*,application/pdf"
            />
            <FiUpload className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {document.documentsPhoto && (
              <button
                type="button"
                onClick={() => handleArrayChange(setDocuments, index, 'documentsPhoto', null)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-300"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
      {/* Remove Button */}
      {document.existing && (
        <button
          type="button"
          onClick={() => handleDeleteClick(document)}
          className="absolute right-0 -top-3 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-opacity"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  ))}
  <div className="mt-4 flex items-center space-x-4">
    {/* Add Document Button */}
    <button
      type="button"
      onClick={() => addNewField(setDocuments, { title: '', document_type: '', documentsPhoto: null, existing: false })}
      className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
    >
      <FiPlus className="w-5 h-5" />
      <span>Add Document</span>
    </button>
    <button
      type="button"
      onClick={() => handleSubmit('documents')}
      className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
    >
      <FiRefreshCcw className="w-4 h-4" />
      <span>Update Documents</span>
    </button>
  </div>
  {/* Custom Popup */}
{showDeletePopup && documentToDelete && (
  <div className="absolute inset-0 flex items-center justify-center">
    <CustomPopup
      isOpen={showDeletePopup}
      onClose={() => setShowDeletePopup(false)}
      onConfirm={handleDeleteConfirm}
      title="Are You Sure?"
      warning={`You Won't Be Able To Revert This!`}
      message={`Document INFO : ${documentToDelete.title} - [${documentToDelete.document_type}]`}
    />
  </div>
)}
</section>

      

          {/* Awards Section */}
          <section className="bg-gray-700/30 rounded p-6 shadow-inner">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-yellow-300">
              <FiAward className="w-6 h-6" /> Honors & Awards
            </h2>
            
            {awards.map((award, index) => (
              <div key={index} className="group relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-800/50 p-4 rounded hover:bg-gray-800/70 transition-colors">
                
                {/* Existing Awards */}
                {award.existing ? (
                  <>
                    <input
                      type="text"
                      name="title"
                      placeholder="Award Title"
                      value={award.title}
                      className="w-full p-3 rounded bg-gray-700 mb-3"
                      readOnly
                    />
                    <input
                      type="number"
                      name="year"
                      placeholder="Year"
                      value={award.year}
                      className="w-full p-3 rounded bg-gray-700 mb-3"
                      readOnly
                    />
                    <input
                      type="text"
                      name="details"
                      placeholder="Details"
                      value={award.details}
                      className="w-full p-3 rounded bg-gray-700 mb-3"
                      readOnly
                    />
                    {award.awardPhoto && (
                      <div className="w-full md:col-span-3 mb-4">
                        <p className="text-gray-400 mb-2">Current Award Photo:</p>
                        <Image
                          src={award.awardPhoto}
                          alt="Award Photo"
                          width={128}
                          height={128}
                          className="w-32 h-32 object-cover mb-4"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Award Title */}
                    <div className="relative mb-3">
                      <input
                        type="text"
                        name="title"
                        placeholder="Award Title"
                        value={award.title}
                        onChange={(e) => handleArrayChange(setAwards, index, 'title', e.target.value)}
                        className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                        required
                      />
                      <FiAward className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Award Year */}
                    <div className="relative mb-3">
                      <input
                        type="number"
                        name="year"
                        placeholder="Year"
                        value={award.year}
                        onChange={(e) => handleArrayChange(setAwards, index, 'year', parseInt(e.target.value, 10))}
                        className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                        min="1900"
                        max={new Date().getFullYear()}
                        required
                      />
                      <FiCalendar className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Award Details */}
                    <div className="relative mb-3">
                      <input
                        type="text"
                        name="details"
                        placeholder="Details"
                        value={award.details}
                        onChange={(e) => handleArrayChange(setAwards, index, 'details', e.target.value)}
                        className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                        required
                      />
                      <FiInfo className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Award Photo */}
                    <div className="relative mb-3">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Award Photo</label>
                      <div className="relative">
                        <input
                          type="file"
                          name="awardPhoto"
                          onChange={(e) => handleArrayChange(setAwards, index, 'awardPhoto', e.target.files[0])}
                          className="w-full pl-10 pr-12 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                        <FiUpload className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeField(setAwards, index)}
                      className="absolute right-0 -top-3 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-opacity"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}

            <div className="mt-4 flex items-center space-x-4">
              <button
                type="button"
                onClick={() => addNewField(setAwards, { title: '', year: '', details: '', awardPhoto: null, existing: false })}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add Award</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit('awards')}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
              >
                <FiRefreshCcw className="w-4 h-4" />
                <span>Update Awards</span>
              </button>
            </div>
          </section>


          {/* Password Section */}
          <section className="bg-gray-700/30 rounded p-6 shadow-inner">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-red-300">
              <FiAlertCircle className="w-6 h-6" /> Password
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    required
                  />
                  <FiAlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    required
                  />
                  <FiAlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => handleSubmit('password')}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiRefreshCcw className="w-4 h-4" />
              <span>Update Password</span>
            </button>
            </div>
          </section>
        </form>
      </div>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
};

export default withAuth(EditProfessor);
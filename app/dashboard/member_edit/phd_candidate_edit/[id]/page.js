// app/dashboard/member_edit/phd_candidate_edit/[id]/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../../../components/withAuth';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import Image from 'next/image';
import {
  FiUser, FiPhone, FiCalendar, FiBook, FiBriefcase, FiFileText,
  FiAward, FiLink, FiX, FiPlus, FiTrash2, FiGlobe, FiLinkedin, FiGithub,
  FiChevronDown, FiLoader, FiUpload, FiAlertCircle, FiActivity, FiInfo, FiRefreshCcw, FiMail, FiXCircle, FiCheckCircle,
} from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const EditPhdCandidate = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    short_bio: '',
    status: 'Active',
    leaving_date: '',
    other_emails: [],
    // NEW: Add passport and blood group fields
    passport_number: '',
    bloodGroup: '',
  });
  const [passportExists, setPassportExists] = useState(false);
  const [bloodGroupExists, setBloodGroupExists] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [socialMedia, setSocialMedia] = useState([]);
  const [education, setEducation] = useState([]);
  const [career, setCareer] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchPhdCandidateData = async () => {
      try {
        const response = await fetch(`/api/member_edit/phd_candidate_edit/${id}`);
        const data = await response.json();
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          short_bio: data.short_bio || '',
          status: data.status, // Directly use the status from the database
          other_emails: data.other_emails || [],
          leaving_date: data.completion_date || '', // Only leaving_date can be null
          // NEW: Only set if not exists
          passport_number: data.passport_exists ? '' : data.passport_number || '',
          bloodGroup: data.blood_group_exists ? '' : data.blood_group || '',
        });
        // NEW: Set existence flags
        setPassportExists(data.passport_exists);
        setBloodGroupExists(data.blood_group_exists);

        setPhoto(data.photo || null);
        setSocialMedia(data.socialMedia || []);
        setEducation(data.education || []);
        setCareer(data.career || []);
      } catch (error) {
        toast.error('Failed to fetch PhD Candidate data');
      } finally {
        setLoading(false);
      }
    };
    fetchPhdCandidateData();
  }, [id]);


const handleChange = useCallback((e) => {
  const { name, value, files } = e.target;
  
  if (name === 'photo' && files.length > 0) {
    setPhoto(files[0]);
  } else {
    setFormData(prev => {
      const newState = { ...prev };
      
      // Handle status changes
      if (name === 'status') {
        newState.status = value;
        // Automatically set alumni status based on status
        newState.alumni_status = value === 'Graduate' ? 'Valid' : 'Invalid';
        
        // Clear leaving date when switching to Active
        if (value === 'Active') {
          newState.leaving_date = '';
        }
      }
      // Handle leaving date changes
      else if (name === 'leaving_date') {
        newState.leaving_date = value;
        
        if (value) {
          // Auto-update status to Graduate and set valid alumni status
          newState.status = 'Graduate';
          newState.alumni_status = 'Valid';
        } else if (prev.status === 'Graduate') {
          // Revert to Inactive and invalid alumni status
          newState.status = 'Inactive';
          newState.alumni_status = 'Invalid';
        }
      }
      // Handle all other fields
      else {
        newState[name] = value;
      }
      
      return newState;
    });
  }
}, []);

  const handleArrayChange = useCallback((setter, index, field, value) => {
    setter((prevState) => {
      const newState = [...prevState];
      newState[index][field] = value;
      return newState;
    });
  }, []);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const checkPasswordStrength = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    };
  };

  const strength = checkPasswordStrength(password);
  const strengthLevel = Object.values(strength).filter(Boolean).length;
  

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
        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name);
        data.append('phone', formData.phone);
        data.append('short_bio', formData.short_bio);
        data.append('status', formData.status);
        data.append('leaving_date', formData.leaving_date);
        data.append('other_emails', JSON.stringify(formData.other_emails));
        // ADD THESE LINES: Include passport and blood group in basicInfo submission
        if (!passportExists) {
          data.append('passport_number', formData.passport_number);
        }
        if (!bloodGroupExists) {
          data.append('bloodGroup', formData.bloodGroup);
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
      case 'password':
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }

        const strength = checkPasswordStrength(password);
        const strengthLevel = Object.values(strength).filter(Boolean).length;

        if (strengthLevel < 3) {
          toast.error("Password must contain at least 3 of: uppercase, lowercase, number, special character");
          setLoading(false);
          return;
        }

        data.append('password', password);
        break;
      default:
        break;
    }
  
    try {
      const response = await fetch(`/api/member_edit/phd_candidate_edit/${id}`, {
        method: 'POST',
        body: data,
      });
  
      const result = await response.json();

      // Determine actual status from DB data
      const dbStatus = data.status;
      const dbLeavingDate = data.completion_date;

      // Convert database null to empty string for input field
      const formattedLeavingDate = dbLeavingDate 
        ? new Date(dbLeavingDate).toISOString().split('T')[0]
        : '';

      // Determine actual status from DB data
      const actualStatus = dbLeavingDate && dbStatus === 'Inactive'
        ? 'Graduate'
        : dbStatus;

      setFormData({
        ...data,
        status: actualStatus,
        leaving_date: data.completion_date || '',
      });

      if (!response.ok) {
        throw new Error(result.message || `Server responded with ${response.status}`);
      }

      toast.success('Professor updated successfully!', {
        autoClose: 3000,
        hideProgressBar: false,
      });
      
      // Only redirect if it's a password change or basic info update
      if (['password', 'basicInfo'].includes(section)) {
        router.push('/dashboard');
      }

    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update professor details', {
        autoClose: 5000,
        hideProgressBar: false,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-300 hover:text-blue-100 transition-colors group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Back to Member List
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Edit PhD Candidate
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
              {/* Other Emails Section */}
              <div className="space-y-2 col-span-full">
                <label className="block text-sm font-medium text-gray-300">Other Emails</label>
                {formData.other_emails?.map((email, index) => (
                  <div key={index} className="flex gap-2 mb-2 group">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...formData.other_emails];
                          newEmails[index] = e.target.value;
                          setFormData(prev => ({ ...prev, other_emails: newEmails }));
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                        required
                      />
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newEmails = formData.other_emails.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, other_emails: newEmails }));
                      }}
                      className="px-3 py-2 text-red-500 hover:text-red-400 transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    other_emails: [...(prev.other_emails || []), '']
                  }))}
                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                >
                  <FiPlus className="mr-1" /> Add Email
                </button>
              </div>
              {/* NEW: Passport Number - Only show if doesn't exist */}
              {!passportExists && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Passport Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="passport_number"
                      value={formData.passport_number}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                    <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}
              
              {/* NEW: Blood Group - Only show if doesn't exist */}
              {!bloodGroupExists && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Blood Group</label>
                  <div className="relative">
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                    <FiActivity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
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
              {/* Status Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Status</label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}  // Use the central handleChange
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduate">Graduate</option>
                </select>
                <FiInfo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
              {/* Graduation Date Date */}
              <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Graduation Date
                {formData.status === 'Graduate' && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="leaving_date"
                  value={formData.leaving_date || ''}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none ${
                    formData.status === 'Active' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  required={formData.status === 'Graduate'}
                  disabled={formData.status !== 'Graduate'}

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
                    <option value="Other">Other</option>
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
                  {/* CORRECTED: Changed socialMedia_name to socialmedia_name */}
                  {sm.socialmedia_name === 'GitHub' ? (
                    <FiGithub className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  ) : sm.socialmedia_name === 'Linkedin' ? (
                    <FiLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  ) : sm.socialmedia_name === 'Facebook' ? (
                    <FaFacebookF className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  ) : sm.socialmedia_name === 'X' ? (
                    <FaTwitter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  ) : sm.socialmedia_name === 'Instagram' ? (
                    <FaInstagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  ) : sm.socialmedia_name === 'Website' ? (
                    <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                    onChange={(e) => {
                      // Convert empty string to null
                      const value = e.target.value === '' ? null : e.target.value;
                      handleArrayChange(setCareer, index, 'leaving_year', value);
                    }}
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

          {/* Password Section */}
          <section className="bg-gray-700/30 rounded p-6 shadow-inner">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-red-300">
              <FiAlertCircle className="w-6 h-6" /> Password
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded p-6 shadow-md mt-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Change Password</h2>

              <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />

            <input
              type="password"
              name="confirm_password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${strengthLevel >= 4 ? 'bg-green-500' : strengthLevel >= 2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(strengthLevel / 5) * 100}%` }}
                ></div>
              </div>

              {/* Checklist */}
              <ul className="text-sm space-y-1 mt-2 text-gray-700 dark:text-gray-300">
                <li className={`flex items-center gap-2 ${strength.length ? 'text-green-600' : 'text-red-600'}`}>
                  {strength.length ? <FiCheckCircle /> : <FiXCircle />} At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${strength.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                  {strength.uppercase ? <FiCheckCircle /> : <FiXCircle />} At least one uppercase letter
                </li>
                <li className={`flex items-center gap-2 ${strength.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                  {strength.lowercase ? <FiCheckCircle /> : <FiXCircle />} At least one lowercase letter
                </li>
                <li className={`flex items-center gap-2 ${strength.number ? 'text-green-600' : 'text-red-600'}`}>
                  {strength.number ? <FiCheckCircle /> : <FiXCircle />} At least one number
                </li>
                <li className={`flex items-center gap-2 ${strength.specialChar ? 'text-green-600' : 'text-red-600'}`}>
                  {strength.specialChar ? <FiCheckCircle /> : <FiXCircle />} At least one special character
                </li>
              </ul>

              <button
                onClick={() => handleSubmit('password')}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
                disabled={strengthLevel < 5}
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

export default withAuth(EditPhdCandidate, 'admin'); // Pass 'admin' as the required role
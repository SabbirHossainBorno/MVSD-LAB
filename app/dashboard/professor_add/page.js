// app/dashboard/professor_add/page.js
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import countryList from 'react-select-country-list';
import { 
  FiUser, FiMail, FiPhone, FiCalendar, FiBook, FiBriefcase, FiFileText, 
  FiAward, FiLink, FiX, FiPlus, FiTrash2, FiGlobe, FiLinkedin, FiGithub,
  FiChevronDown, FiLoader, FiUpload, FiAlertCircle, FiActivity, FiInfo,
} from 'react-icons/fi';


const AddProfessor = () => {
  const countries = countryList().getLabels(); // Get country names
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    gender: '',
    bloodGroup: "",
    country: '',
    idNumber: '',
    passport_number: '',
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

  const [socialMedia, setSocialMedia] = useState([{ socialMedia_name: '', link: '' }]);
  const [education, setEducation] = useState([{ degree: '', institution: '', passing_year: '' }]);
  const [career, setCareer] = useState([{ position: '', organization: '', joining_year: '', leaving_year: '' }]);
  const [research, setResearch] = useState([{ title: '', researchType: '', link: '' }]);
  const [awards, setAwards] = useState([{ title: '', year: '', details: '', awardPhoto: '' }]);
  const [loading, setLoading] = useState(false);
  const [otherEmails, setOtherEmails] = useState([]);

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
  
  const addOtherEmail = useCallback(() => {
    setOtherEmails(prev => [...prev, { id: Date.now(), value: '' }]);
  }, []);

  const removeOtherEmail = useCallback((id) => {
    setOtherEmails(prev => prev.filter(email => email.id !== id));
  }, []);

  const handleOtherEmailChange = useCallback((id, value) => {
    setOtherEmails(prev => prev.map(email => 
      email.id === id ? { ...email, value } : email
    ));
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
  
    try {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Invalid primary email format');
        return;
      }
  
      // Date of Birth validation
      const dobDate = new Date(formData.dob);
      const ageDiff = Date.now() - dobDate.getTime();
      const ageDate = new Date(ageDiff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age < 18) {
        toast.error('Professor must be at least 18 years old');
        return;
      }

  
      // ID validation 
      if (/^0/.test(formData.idNumber)) {
        toast.error('ID number cannot start with 0');
        return;
      }
  
      // Passport validation
      if (/^0/.test(formData.passport_number)) {
        toast.error('Passport number cannot start with 0');
        return;
      }
  
      // Validate passwords match
      if (formData.password !== formData.confirm_password) {
        toast.error('Passwords do not match');
        return;
      }
  
      // Validate password complexity
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~-]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        toast.error('Password must contain uppercase, lowercase, number, and special character');
        return;
      }
  
      const data = new FormData();
  
      // Process dates and handle empty values
      const processDate = (date) => date || null;
      const cleanedFormData = {
        ...formData,
        dob: processDate(formData.dob),
        joining_date: processDate(formData.joining_date),
        leaving_date: processDate(formData.leaving_date),
      };
  
      // Append cleaned form data
      Object.entries(cleanedFormData).forEach(([key, value]) => {
        if (value !== null) data.append(key, value);
      });
  
      // Process other emails
      const formattedOtherEmails = otherEmails
        .map(email => email.value.trim())
        .filter(email => email !== '');
      data.append('otherEmails', JSON.stringify(formattedOtherEmails));
  
      // Process education and career data
      const formattedEducation = education.map(edu => ({
        ...edu,
        passing_year: edu.passing_year ? parseInt(edu.passing_year, 10) : null
      }));
  
      const formattedCareer = career.map(job => ({
        ...job,
        joining_year: job.joining_year ? parseInt(job.joining_year, 10) : null,
        leaving_year: job.leaving_year ? parseInt(job.leaving_year, 10) : null
      }));
  
      // Append structured data
      data.append('socialMedia', JSON.stringify(socialMedia));
      data.append('education', JSON.stringify(formattedEducation));
      data.append('career', JSON.stringify(formattedCareer));
      data.append('researches', JSON.stringify(research));
  
      // Validate and process awards
      awards.forEach((award, index) => {
        if (award.awardPhoto) {
          if (award.awardPhoto.size > 5 * 1024 * 1024) {
            toast.error(`Award ${index + 1} photo exceeds 5MB limit`);
            throw new Error('File size error');
          }
          if (!['image/jpeg', 'image/png', 'application/pdf'].includes(award.awardPhoto.type)) {
            toast.error(`Award ${index + 1} must be JPG, PNG, or PDF`);
            throw new Error('Invalid file type');
          }
        }
        
        data.append(`awards[${index}][title]`, award.title || '');
        data.append(`awards[${index}][year]`, award.year || '');
        data.append(`awards[${index}][details]`, award.details || '');
        if (award.awardPhoto) {
          data.append(`awards[${index}][awardPhoto]`, award.awardPhoto);
        }
      });
  
      const response = await fetch('/api/professor_add', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });
  
      const result = await response.json();
  
      if (response.ok) {
        toast.success(`Professor Added Successfully! ID: ${result.professorId}`);
        setTimeout(() => router.push('/dashboard'), 3000);
      } else {
        // Handle specific error types
        const errorMessage = result.message || 'Registration failed. Please check your inputs.';
        
        // Custom messages based on errorType
        const errorMap = {
          'PRIMARY_EMAIL_CONFLICT': 'Primary email already exists in system',
          'SECONDARY_EMAIL_CONFLICT': 'One of the secondary emails is already registered',
          'PHONE_CONFLICT': 'Phone number already registered',
          'ID_CONFLICT': 'Banner ID already exists',
          'PASSPORT_CONFLICT': 'Passport number already registered',
          // Add other error types as needed
        };
  
        toast.error(errorMap[result.errorType] || errorMessage);
      }
    } catch (error) {
      console.error('Submission Error:', error);
      toast.error(error.message || 'Network error. Please try again.');
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
            Add New Professor
          </h1>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-lg rounded shadow-2xl p-6 space-y-8">
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

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Primary Email"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    required
                  />
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Other Emails - New Fields */}
              <div className="space-y-2 col-span-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="block text-sm font-medium text-gray-300">Other Emails</span>
                  <button
                    type="button"
                    onClick={addOtherEmail}
                    className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <FiPlus className="w-4 h-4 mr-1" />
                    Add Email
                  </button>
                </div>
                
                {otherEmails.map((email) => (
                  <div key={email.id} className="relative group mb-2">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email.value}
                        onChange={(e) => handleOtherEmailChange(email.id, e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                        placeholder="Additional Email"
                      />
                      <button
                        type="button"
                        onClick={() => removeOtherEmail(email.id)}
                        className="px-3 bg-red-600/80 hover:bg-red-700 rounded transition-colors text-white flex items-center justify-center"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                ))}
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

              {/* Country */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Country</label>
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
                    required
                  />
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              {/* Gender */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Gender</label>
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Blood Group */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Blood Group</label>
                <div className="relative">
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                    required
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

              {/* ID Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Banner ID</label>
                <div className="relative">
                  <input
                    type="number"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                    required
                  />
                  <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Passport Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Passport Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="passport_number"
                    value={formData.passport_number}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                    required
                  />
                  <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Joining Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Joining Status Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                    required
                  />
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Leaving Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Emeritus Status Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="leaving_date"
                    value={formData.leaving_date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded border border-gray-600 cursor-not-allowed"
                    readOnly
                  />
                  <FiAlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                    required
                  />
                  <FiAlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                    required
                  />
                  <FiAlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Type</label>
                <div className="relative">
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded border border-gray-600 cursor-not-allowed"
                  />
                  <FiInfo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Status</label>
                <div className="relative">
                  <input
                    type="text"
                    name="status"
                    value={formData.status}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded border border-gray-600 cursor-not-allowed"
                  />
                  <FiInfo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Profile Photo</label>
                <div className="relative">
                  <input
                    type="file"
                    name="photo"
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    accept="image/*"
                  />
                  <FiUpload className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                    name="socialMedia_name"
                    value={sm.socialMedia_name}
                    onChange={(e) => handleArrayChange(setSocialMedia, index, 'socialMedia_name', e.target.value)}
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
                  {sm.socialMedia_name === 'GitHub' ? (
                    <FiGithub className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  ) : (
                    <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  )}
                </div>

                {socialMedia.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField(setSocialMedia, index)}
                    className="absolute -right-4 -top-4 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addNewField(setSocialMedia, { socialMedia_name: '', link: '' })}
              className="flex items-center justify-center w-full md:w-auto space-x-2 bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Social Profile</span>
            </button>
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

            <button
              type="button"
              onClick={() => addNewField(setEducation, { degree: '', institution: '', passing_year: '' })}
              className="mt-4 flex items-center justify-center w-full md:w-auto space-x-2 bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Education</span>
            </button>
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
                    value={job.organization}
                    onChange={(e) => handleArrayChange(setCareer, index, 'organization', e.target.value)}
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
                    className="absolute -right-4 -top-4 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addNewField(setCareer, { position: '', organization: '', joining_year: '', leaving_year: '' })}
              className="flex items-center justify-center w-full md:w-auto space-x-2 bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Experience</span>
            </button>
          </section>

          {/* Research Paper Section */}
          <section className="bg-gray-700/30 rounded p-6 shadow-inner">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-purple-300">
              <FiFileText className="w-6 h-6" /> Research Paper
            </h2>

            {research.map((researchItem, index) => (
              <div key={index} className="group relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-800/50 p-4 rounded hover:bg-gray-800/70 transition-colors">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Research Paper Title"
                    value={researchItem.title}
                    onChange={(e) => handleArrayChange(setResearch, index, 'title', e.target.value)}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                    required
                  />
                  <FiBook className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Research Paper Type */}
                <div className="relative flex items-center">
                {/* Left Icon */}
                <FiInfo className="absolute left-3 text-gray-400 pointer-events-none" />

                {/* Select Dropdown */}
                <select
                  name="researchType"
                  value={researchItem.researchType}
                  onChange={(e) => handleArrayChange(setResearch, index, 'researchType', e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                  required
                >
                  <option value="" disabled className="text-gray-400">Select Type</option>
                  <option value="Conference Paper">Conference Paper</option>
                  <option value="Journal Paper">Journal Paper</option>
                  <option value="Book/Chapter">Book/Chapter</option>
                  <option value="Patent">Patent</option>
                  <option value="Project">Project</option>
                  <option value="Other">Other</option>
                </select>

                {/* Right Icon */}
                <FiChevronDown className="absolute right-3 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <input
                    type="url"
                    placeholder="Research Paper URL"
                    value={researchItem.link}
                    onChange={(e) => handleArrayChange(setResearch, index, 'link', e.target.value)}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                    required
                  />
                  <FiLink className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {research.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField(setResearch, index)}
                    className="absolute -right-4 -top-4 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addNewField(setResearch, { title: '', researchType: '', link: '' })}
              className="flex items-center justify-center w-full md:w-auto space-x-2 bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Research Paper</span>
            </button>
          </section>

          {/* Awards Section */}
          <section className="bg-gray-700/30 rounded p-6 shadow-inner">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-yellow-300">
            <FiAward className="w-6 h-6" /> Honors & Awards
          </h2>

          {awards.map((award, index) => (
            <div key={index} className="group relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-800/50 p-4 rounded hover:bg-gray-800/70 transition-colors">
              {/* Award Title */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Award Title"
                  value={award.title}
                  onChange={(e) => handleArrayChange(setAwards, index, 'title', e.target.value)}
                  className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                  required
                />
                <FiAward className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {/* Year Received */}
              <div className="relative">
                <input
                  type="number"
                  placeholder="Year Received"
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
              <div className="relative">
                <input
                  type="text"
                  placeholder="Award Details"
                  value={award.details}
                  onChange={(e) => handleArrayChange(setAwards, index, 'details', e.target.value)}
                  className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none py-2 pl-3 pr-10"
                  required
                />
                <FiInfo className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />                
              </div>

              {/* Award Photo Upload */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Award Photo</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => handleArrayChange(setAwards, index, 'awardPhoto', e.target.files[0])}
                    className="w-full pl-10 pr-12 py-3 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    accept="image/*,application/pdf"
                  />
                  <FiUpload className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  {award.awardPhoto && (
                    <button
                      type="button"
                      onClick={() => handleArrayChange(setAwards, index, 'awardPhoto', null)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-300 p-1.5"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              {awards.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField(setAwards, index)}
                  className="absolute right-0 -top-3 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-opacity"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
                  </div>
                ))}

              {/* Add Award Button */}
              <button
                type="button"
                onClick={() => addNewField(setAwards, { title: '', year: '', details: '', awardPhoto: null })}
                className="w-full md:w-auto flex items-center justify-center space-x-2 bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add Award</span>
              </button>
          </section>

          {/* Submit Button */}
          <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded font-semibold shadow-lg transition-all duration-200 ${
              !loading && 'hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
            } ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FiLoader className="animate-spin w-5 h-5 mr-2" />
                <span className="pt-[2px]">Adding Professor....</span>
              </span>
            ) : (
              'Add Professor'
            )}
          </button>
          </div>
        </form>
        <ToastContainer 
        position="bottom-right"
        theme="dark"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}  // Add this line
      />
      </div>
    </div>
  );
};

export default withAuth(AddProfessor, 'admin'); // Pass 'admin' as the required role
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SignUpPage() {
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!termsAccepted) {
      setErrors({ terms: 'You must accept the terms and conditions.' });
      return;
    }
  
    if (password !== confirmPassword) {
      setErrors({ ...errors, confirmPassword: 'Passwords do not match.' });
      return;
    }
  
    const formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
  
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        setErrors(errorData.errors || {});
        if (!errorData.errors) {
          toast.error('HTTP error!');
        }
        return;
      }
  
      const result = await res.json();
      if (result.success) {
        toast.success('MVSD LAB Account Successfully Created. Waiting for approval.');
        
  
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        toast.error('Account Creation Failed. Please Try Again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    }
  }

  return (
    <div className="bg-cover bg-center min-h-screen flex items-center justify-center text-white" style={{ backgroundImage: "url('/images/background_img_login.jpg')" }}>
      <div className="flex flex-col md:flex-row bg-white/10 backdrop-blur-lg rounded-lg shadow-lg max-w-4xl w-full p-6 md:p-0">
        {/* Left Side Image */}
        <div className="hidden md:block md:w-1/2">
          <img src="/images/signup_img.jpg" alt="Sign Up Visual" className="h-full w-full object-cover rounded-l-lg" />
        </div>

        {/* Right Side Form */}
        <div className="flex flex-col items-center justify-center md:w-1/2 p-6">
          {/* Logo Section */}
          <div className="mb-8 text-center">
            <img src="/images/logo.png" alt="Logo" className="h-32 w-auto mx-auto" />
            <h2 className="text-xl font-bold leading-6 mt-2" style={{ color: '#012970' }}>AUTOMOTIVE MEETS AI</h2>
          </div>

          <div className="relative w-full max-w-sm">
            <div className="bg-white-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold leading-6 tracking-tighter text-center" style={{ color: '#012970' }}>Sign Up</h3>
              <p className="mt-1.5 text-sm font-medium text-gray-400 text-center">Create your MVSD LAB account.</p>

              <form onSubmit={handleSubmit} className="mt-6">
                <div>
                  <div className="group relative rounded-lg border px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring" style={{ borderColor: '#012970', boxShadow: '0 0 0 1px rgba(1, 41, 112, 0.3)' }}>
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400">First Name</label>
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Enter Your First Name"
                      className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400/60 focus:outline-none focus:ring-0 sm:leading-7 text-gray-800 ${errors.firstName ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="group relative rounded-lg border px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring" style={{ borderColor: '#012970', boxShadow: '0 0 0 1px rgba(1, 41, 112, 0.3)' }}>
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400">Last Name</label>
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Enter Your Last Name"
                      className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400/60 focus:outline-none focus:ring-0 sm:leading-7 text-gray-800 ${errors.lastName ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="group relative rounded-lg border px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring" style={{ borderColor: '#012970', boxShadow: '0 0 0 1px rgba(1, 41, 112, 0.3)' }}>
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400">Phone</label>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter Your Phone Number"
                      className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400/60 focus:outline-none focus:ring-0 sm:leading-7 text-gray-800 ${errors.phone ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="group relative rounded-lg border px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring" style={{ borderColor: '#012970', boxShadow: '0 0 0 1px rgba(1, 41, 112, 0.3)' }}>
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400">Date of Birth</label>
                    </div>
                    <input
                      type="date"
                      name="dob"
                      placeholder="Select Your Date of Birth"
                      className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400/60 focus:outline-none focus:ring-0 sm:leading-7 text-gray-800 ${errors.dob ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="group relative rounded-lg border px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring" style={{ borderColor: '#012970', boxShadow: '0 0 0 1px rgba(1, 41, 112, 0.3)' }}>
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400">Email</label>
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter Your Email"
                      className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400/60 focus:outline-none focus:ring-0 sm:leading-7 text-gray-800 ${errors.email ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="group relative rounded-lg border px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring" style={{ borderColor: '#012970', boxShadow: '0 0 0 1px rgba(1, 41, 112, 0.3)' }}>
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400">Password</label>
                    </div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter Your Password"
                      className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400/60 focus:outline-none focus:ring-0 sm:leading-7 text-gray-800 ${errors.password ? 'border-red-500' : ''}`}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="group relative rounded-lg border px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring" style={{ borderColor: '#012970', boxShadow: '0 0 0 1px rgba(1, 41, 112, 0.3)' }}>
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400">Confirm Password</label>
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Your Password"
                      className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400/60 focus:outline-none focus:ring-0 sm:leading-7 text-gray-800 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mr-2"
                    required
                  />
                  <label className="text-xs font-medium text-gray-400">
                    By creating an account, you agree to the{' '}
                    <a href="#0" className="text-primary hover:underline" style={{ color: '#012970' }}>Terms and Conditions</a> and our{' '}
                    <a href="#0" className="text-primary hover:underline" style={{ color: '#012970' }}>Privacy Policy</a>
                  </label>
                  {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
                </div>
                <div className="mt-6">
                  <button type="submit" className="w-full bg-[#012970] text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-[#003469] transition duration-300">
                    Sign Up
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-gray-300" style={{ color: '#012970' }}>Already have an account?</p>
                  <a href="/login" className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium bg-transparent border-2 border-[#012970] text-[#012970] hover:bg-[#012970] hover:text-white px-4 py-2 transition-all">
                    Login
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

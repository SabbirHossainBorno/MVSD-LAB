//app/login/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/LoadingSpinner';
import withAuth from '../components/withAuth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    setLoading(false);
    if (result.success) {
      if (result.type === 'admin') {
        toast.success('Welcome! BOSS');
        router.push('/dashboard');
      } else {
        toast.success('Welcome! MVSD LAB MEMBER');
        router.push('/upload');
      }
    } else {
      toast.error('Invalid Access! Email/Password Is Wrong');
    }
  };

  useEffect(() => {
    if (router.query && router.query.sessionExpired) {
      toast.error('Session Expired. Please Login Again!');
    }
  }, [router.query]);

  return (
    <div className="bg-cover bg-center min-h-screen flex items-center justify-center text-white" style={{ backgroundImage: "url('/images/background_img_login.jpg')" }}>
      <div className="flex flex-col md:flex-row bg-white/10 backdrop-blur-lg rounded shadow-lg max-w-4xl w-full p-6 md:p-0">
        {/* Left Side Image */}
        <div className="hidden md:block md:w-1/2 relative">
          <Image src="/images/login_img.jpg" alt="Login Visual" fill style={{ objectFit: 'cover' }} className="rounded" />
        </div>

        {/* Right Side Form */}
        <div className="flex flex-col items-center justify-center md:w-1/2 p-6">
          {/* Logo Section */}
          <div className="mb-8 text-center">
            <Image src="/images/logo.png" alt="Logo" width={128} height={128} className="mx-auto" priority />
            <h2 className="text-xl font-bold leading-6 mt-2 text-[#012970]">AUTOMOTIVE MEETS AI</h2>
          </div>

          <div className="relative w-full max-w-sm">
            <div className="bg-white-800 p-6 rounded shadow-md">
              <h3 className="text-xl font-semibold leading-6 tracking-tighter text-center text-[#012970]">Login</h3>
              <p className="mt-1.5 text-sm font-medium text-gray-400 text-center">Welcome MVSD LAB, Enter Your Credentials To Continue.</p>

              <form onSubmit={handleLogin} className="mt-6">
                <div>
                  <div className="group relative rounded border px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring border-[#012970] shadow-[0_0_0_1px_rgba(1,41,112,0.3)]">
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400">Email</label>
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter Your Email"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400/60 focus:outline-none focus:ring-0 sm:leading-7 text-gray-900"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="group relative rounded border px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring border-[#012970] shadow-[0_0_0_1px_rgba(1,41,112,0.3)]">
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-gray-400">Password</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Your Password"
                        className="block w-full border-0 bg-transparent p-0 text-sm placeholder:text-gray-400/60 focus:outline-none focus:ring-0 sm:leading-7 text-gray-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2 text-sm text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <a className="text-sm font-medium text-[#012970] underline" href="/forgot-password">Forgot Password?</a>
                </div>
                <div className="mt-4 flex items-center justify-end gap-x-2">
                  <a className="inline-flex items-center justify-center rounded text-sm font-medium bg-transparent border-2 border-[#012970] text-[#012970] hover:bg-[#012970] hover:text-white px-4 py-2 transition-all" href="/signup">
                    Create Account
                  </a>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded bg-[#012970] px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-[#012970] hover:bg-[#01408F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <LoadingSpinner />
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default withAuth(LoginPage);

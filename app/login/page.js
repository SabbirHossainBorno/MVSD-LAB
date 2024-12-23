'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [randomImage, setRandomImage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchRandomImage = async () => {
    try {
      const response = await axios.get('/api/random-image');
      setRandomImage(response.data.imageUrl);
    } catch (error) {
      console.error('Failed to fetch random image:', error);
    }
  };

  useEffect(() => {
    fetchRandomImage();
  }, []);

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
    if (searchParams.get('sessionExpired')) {
      toast.error('Session Expired! Please Login Again.');
    } else if (searchParams.get('authRequired')) {
      toast.error('Authentication Required! Need To Login.');
    }
  }, [searchParams]);

  return (
    <div className="bg-cover bg-center min-h-screen flex items-center justify-center text-white" style={{ backgroundImage: "url('/images/background_img_login.jpg')" }}>
      <div className="flex flex-col md:flex-row bg-white/10 backdrop-blur-lg rounded shadow-lg max-w-4xl w-full p-6 md:p-0">
        {/* Left Side Image */}
        <div className="hidden md:block md:w-1/2 relative">
          {randomImage ? (
            <Image src={randomImage} alt="Login Visual" fill style={{ objectFit: 'cover' }} className="rounded" />
          ) : (
            <div>Loading image...</div>
          )}
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
                <div className="mt-4 flex items-center justify-center gap-x-2">
                  <button
                    type="submit"
                    className="relative rounded px-8 py-3 overflow-hidden group bg-blue-800 hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-600 text-white hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all ease-out duration-300 w-full max-w-[200px]"
                  >
                    <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                    <span className="relative text-lg text-bold md:text-xl transition-transform duration-300 ease-in-out group-hover:scale-110">Login</span>
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

const LoginWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LoginPage />
  </Suspense>
);

export default LoginWrapper;

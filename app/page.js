//app/page.js
'use client';

import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the styles
import LoadingSpinner from './components/LoadingSpinner'; // Add a loading spinner component
import { useState } from 'react';

export default function HomePage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    setLoading(true); // Start loading spinner

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Subscription Successful!');
        event.target.reset(); // Reset the form
      } else {
        toast.error(result.message || 'Something went wrong.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-bl from-gray-800 via-gray-900 to-black text-white p-6 overflow-hidden">
      {/* Background particle animation */}
      <div className="absolute inset-0 z-0">
        <div className="bg-particle-animation w-full h-full opacity-20"></div>
      </div>

      <header className="flex flex-col items-center text-center mb-10 z-10">
        <div className="relative w-48 h-24 md:w-64 md:h-32 mb-6">
          <Image
            src="/images/logo.png"
            alt="MVSD LAB Logo"
            layout="fill"
            objectFit="contain"
          />
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 tracking-wider drop-shadow-lg">
          MVSD LAB
        </h1>
        <h2 className="text-2xl sm:text-3xl font-medium text-gray-300">
          Coming Soon
        </h2>
      </header>

      <main className="flex flex-col items-center text-center space-y-8 mt-6 max-w-lg sm:max-w-xl md:max-w-2xl z-10">
        <p className="text-lg sm:text-xl md:text-2xl text-gray-400">
          We&apos;re working on something amazing in the world of automotive engineering and AI innovation. Stay connected for future updates!
        </p>

        <div className="bg-opacity-50 p-8 rounded-lg shadow-xl backdrop-blur-md w-full max-w-md space-y-6 relative z-10">
          <h3 className="text-2xl sm:text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">
            Stay Updated
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full p-4 rounded-lg bg-gray-900 bg-opacity-80 text-white border-none focus:ring-4 focus:ring-gray-500 placeholder-gray-500 transition-all"
              required
            />
            <button
              type="submit"
              className={`relative inline-flex items-center justify-center px-10 py-4 overflow-hidden font-mono font-medium tracking-tighter text-white bg-gray-800 rounded-lg group ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-green-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
              <span className="relative">{loading ? 'Subscribing...' : 'Notify Me'}</span>
            </button>
          </form>
        </div>
      </main>

      <footer className="mt-10 z-10">
        <p className="text-gray-500 text-sm">
          © 2024 MVSD LAB. All rights reserved.
        </p>
      </footer>

      <ToastContainer /> {/* Add the ToastContainer component */}

      {/* Add loading spinner overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}

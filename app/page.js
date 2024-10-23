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
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-bl from-teal-900 via-purple-900 to-pink-900 text-white p-6 overflow-hidden">
      {/* Background particle animation */}
      <div className="absolute inset-0 z-0">
        <div className="bg-particle-animation w-full h-full opacity-20"></div>
      </div>

      <header className="flex flex-col items-center text-center mb-10 z-10">
        <div className="relative w-36 h-18 md:w-48 md:h-24 mb-6 animate-pulse">
          <Image
            src="/images/logo.png"
            alt="MVSD LAB Logo"
            layout="fill"
            objectFit="contain"
          />
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 tracking-wider drop-shadow-lg animate-bounce">
          MVSD LAB
        </h1>
        <h2 className="text-2xl sm:text-3xl font-medium text-gray-300">
          Coming Soon
        </h2>
      </header>

      <main className="flex flex-col items-center text-center space-y-8 mt-6 max-w-lg sm:max-w-xl md:max-w-2xl z-10">
        <p className="text-lg sm:text-xl md:text-2xl text-gray-400">
          We're working on something amazing in the world of automotive engineering and AI innovation. Stay connected for future updates!
        </p>

        <div className="bg-opacity-50 p-8 rounded-lg shadow-xl backdrop-blur-md w-full max-w-md space-y-6 relative z-10">
          <h3 className="text-2xl sm:text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-pink-600">
            Stay Updated
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full p-4 rounded-lg bg-gray-900 bg-opacity-80 text-white border-none focus:ring-4 focus:ring-teal-500 placeholder-gray-500 transition-all"
              required
            />
            <button
              type="submit"
              className={`w-full py-3 bg-gradient-to-r from-teal-500 to-pink-700 rounded-lg text-white font-semibold transition-all duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-teal-600 hover:to-pink-800'
              }`}
              disabled={loading}
            >
              {loading ? 'Subscribing...' : 'Notify Me'}
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

'use client';

import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the styles
import LoadingSpinner from '../components/LoadingSpinner'; // Add a loading spinner component

export default function HomePage() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Subscription Successful!');
        event.target.reset(); // Reset the form
      } else {
        toast.error(result.message || 'Something went wrong.');
        event.target.reset(); // Reset the form
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      event.target.reset(); // Reset the form
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 to-black text-white p-6">
      <header className="flex flex-col items-center text-center mb-6">
        <div className="relative w-32 h-16 sm:w-36 sm:h-18 md:w-40 md:h-20 mb-4">
          <Image
            src="/images/logo.png"
            alt="MVSD LAB Logo"
            layout="fill"
            objectFit="contain"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2">
          MVSD LAB
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-300 mb-4">
          Coming Soon
        </h2>
      </header>
      <main className="flex flex-col items-center text-center space-y-6 mt-4 max-w-lg sm:max-w-xl md:max-w-2xl">
        <p className="text-base sm:text-lg md:text-xl text-gray-400">
          We are working hard to launch our new website. Stay tuned for exciting developments in automotive and AI innovations.
        </p>
        <div className="bg-black bg-opacity-40 p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4">Stay Updated</h3>
          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg bg-gray-800 text-white border-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300"
            >
              Notify Me
            </button>
          </form>
        </div>
      </main>
      <footer className="mt-8">
        <p className="text-gray-500 text-sm">
          © 2024 MVSD LAB. All rights reserved.
        </p>
      </footer>
      <ToastContainer /> {/* Add the ToastContainer component */}
    </div>
  );
}

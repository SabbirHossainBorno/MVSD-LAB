'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/LoadingSpinner'; // Import the LoadingSpinner component

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const pathname = usePathname();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loading spinner

    try {
      const response = await axios.post('/api/subscribe', { email });
      if (response.data.success) {
        setIsSubscribed(true);
        toast.success('Subscription successful!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  return (
    <footer className="relative bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white py-12 px-6">
      <ToastContainer />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <LoadingSpinner />
        </div>
      )}
      <div className={`container mx-auto flex flex-col lg:flex-row gap-12 ${isLoading ? 'opacity-50' : ''}`}>
        
        {/* Logo and Info */}
        <div className="flex flex-col items-start mb-8 lg:mb-0">
          <Link href="/home" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="/images/logo.png" className="h-12" alt="MVSD LAB Logo" />
            <span className="text-3xl font-extrabold text-white">MVSD LAB</span>
          </Link>
          <p className="text-gray-400 mt-4 max-w-xs">Innovative solutions in automotive and AI technology. Join our journey to the future.</p>
        </div>
        
        {/* Products and Resources */}
        <div className="flex flex-col lg:flex-row lg:gap-12 gap-8 flex-grow">
          
          {/* Products */}
          <div className="flex flex-col mb-8 lg:mb-0">
            <h6 className="text-xl font-semibold text-white mb-4">Products</h6>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="#" className={`text-base font-medium ${pathname === '/products/figma-ui-system' ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 transition-colors duration-300`}>
                  Figma UI System
                </Link>
              </li>
              <li>
                <Link href="#" className={`text-base font-medium ${pathname === '/products/icons-assets' ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 transition-colors duration-300`}>
                  Icons Assets
                </Link>
              </li>
              <li>
                <Link href="#" className={`text-base font-medium ${pathname === '/products/responsive-blocks' ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 transition-colors duration-300`}>
                  Responsive Blocks
                </Link>
              </li>
              <li>
                <Link href="#" className={`text-base font-medium ${pathname === '/products/components-library' ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 transition-colors duration-300`}>
                  Components Library
                </Link>
              </li>
            </ul>
          </div>
          
        </div>
          
          {/* Resources */}
          <div className="flex flex-col">
            <h6 className="text-xl font-semibold text-white mb-4">Resources</h6>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="#" className={`text-base font-medium ${pathname === '/resources/faqs' ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 transition-colors duration-300`}>
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#" className={`text-base font-medium ${pathname === '/resources/quick-start' ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 transition-colors duration-300`}>
                  Quick Start
                </Link>
              </li>
              <li>
                <Link href="#" className={`text-base font-medium ${pathname === '/resources/documentation' ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 transition-colors duration-300`}>
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className={`text-base font-medium ${pathname === '/resources/user-guide' ? 'text-blue-400' : 'text-gray-300'} hover:text-blue-400 transition-colors duration-300`}>
                  User Guide
                </Link>
              </li>
            </ul>
          </div>
          
        
        {/* Newsletter */}
        <div className="flex flex-col items-start lg:max-w-md mx-auto">
          <h6 className="text-xl font-semibold text-white mb-4">Newsletter</h6>
          <form onSubmit={handleSubscribe} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="relative mb-4">
              <label className="flex items-center mb-2 text-gray-400 text-base font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 text-lg font-medium shadow-md text-white bg-gray-900 border border-gray-600 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your-email@example.com"
                required
                disabled={isLoading} // Disable input when loading
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center text-gray-400">
                <input
                  id="privacy-checkbox"
                  type="checkbox"
                  className="w-5 h-5 border border-gray-600 bg-transparent rounded cursor-pointer mr-2 checked:bg-blue-500 checked:border-blue-500"
                  required
                  disabled={isLoading} // Disable checkbox when loading
                />
                <label htmlFor="privacy-checkbox" className="text-sm font-normal cursor-pointer">
                  I agree with
                  <Link href="#" className="text-blue-500"> Privacy Policy</Link> and
                  <Link href="#" className="text-blue-500"> Terms of Condition</Link>
                </label>
              </div>
              <button
                type="submit"
                className="text-white text-base font-semibold py-3 px-6 rounded cursor-pointer bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                disabled={isLoading} // Disable button when loading
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
          </form>
        </div>
        
      </div>
      
      <div className="container mx-auto px-4">
        {/* Footer Bottom */}
        <div className="flex flex-col lg:flex-row items-center justify-between border-t border-gray-700 pt-8 mt-12">
          <span className="text-sm font-normal text-gray-400">
            <Link href="https://mvsdlab.com/" className="hover:text-white">©MVSD LAB</Link> {new Date().getFullYear()}, All rights reserved.
          </span>

          {/* Social Media */}
          <div className="flex gap-6 mt-4 lg:mt-0">
            <a href="#" className="w-7 h-7 inline-flex items-center justify-center rounded-full border-none outline-none bg-gray-100 hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="12px" fill="#333" viewBox="0 0 155.139 155.139">
                <path d="M89.584 155.139V84.378h23.742l3.562-27.585H89.584V39.184c0-7.984 2.208-13.425 13.67-13.425l14.595-.006V1.08C115.325.752 106.661 0 96.577 0 75.52 0 61.104 12.853 61.104 36.452v20.341H37.29v27.585h23.814v70.761h28.48z" />
              </svg>
            </a>
            <a href="#" className="w-7 h-7 inline-flex items-center justify-center rounded-full border-none outline-none bg-gray-100 hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="12px" fill="#333" viewBox="0 0 512 512">
                <path d="M512 97.248c-19.04 8.352-39.328 13.888-60.48 16.576 21.76-12.992 38.368-33.408 46.176-58.016-20.288 12.096-42.688 20.64-66.56 25.408C411.872 60.704 384.416 48 354.464 48c-58.112 0-104.896 47.168-104.896 104.992 0 8.32.704 16.32 2.432 23.936-87.264-4.256-164.48-46.08-216.352-109.792-9.056 15.712-14.368 33.696-14.368 53.056 0 36.352 18.72 68.576 46.624 87.232-16.864-.32-33.408-5.216-47.424-12.928v1.152c0 51.008 36.38436.384 93.376 84.096 103.136-8.544 2.336-17.856 3.456-27.52 3.456-6.72 0-13.504-.384-19.872-1.792 13.6 41.568 52.192 72.128 98.08 73.12-35.712 27.936-81.056 44.768-130.144 44.768-8.608 0-16.864-.384-25.12-1.44C46.496 446.88 101.6 464 161.024 464c193.152 0 298.752-160 298.752-298.688 0-4.64-.16-9.12-.384-13.568 20.832-14.784 38.336-33.248 52.608-54.496z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
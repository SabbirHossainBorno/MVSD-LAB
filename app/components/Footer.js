// app/components/Footer.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/LoadingSpinner';
import Image from 'next/image';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubscribed(true);
      toast.success('Subscription Successful!');
      setEmail('');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social media links data
  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 71 72" fill="none">
          <path d="M46.4233 38.6403L47.7279 30.3588H39.6917V24.9759C39.6917 22.7114 40.8137 20.4987 44.4013 20.4987H48.1063V13.4465C45.9486 13.1028 43.7685 12.9168 41.5834 12.8901C34.9692 12.8901 30.651 16.8626 30.651 24.0442V30.3588H23.3193V38.6403H30.651V58.671H39.6917V38.6403H46.4233Z" 
                fill="currentColor" />
        </svg>
      ),
      url: 'https://facebook.com/mvsdlab'
    },
    { 
      name: 'Instagram', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 71 72" fill="none">
          <path d="M27.3762 35.7808C27.3762 31.1786 31.1083 27.4468 35.7132 27.4468C40.3182 27.4468 44.0522 31.1786 44.0522 35.7808C44.0522 40.383 40.3182 44.1148 35.7132 44.1148C31.1083 44.1148 27.3762 40.383 27.3762 35.7808ZM22.8683 35.7808C22.8683 42.8708 28.619 48.618 35.7132 48.618C42.8075 48.618 48.5581 42.8708 48.5581 35.7808C48.5581 28.6908 42.8075 22.9436 35.7132 22.9436C28.619 22.9436 22.8683 28.6908 22.8683 35.7808ZM46.0648 22.4346C46.0646 23.0279 46.2404 23.608 46.5701 24.1015C46.8997 24.595 47.3684 24.9797 47.9168 25.2069C48.4652 25.4342 49.0688 25.4939 49.6511 25.3784C50.2334 25.2628 50.7684 24.9773 51.1884 24.5579C51.6084 24.1385 51.8945 23.6041 52.0105 23.0222C52.1266 22.4403 52.0674 21.8371 51.8404 21.2888C51.6134 20.7406 51.2289 20.2719 50.7354 19.942C50.2418 19.6122 49.6615 19.436 49.0679 19.4358H49.0667C48.2708 19.4361 47.5077 19.7522 46.9449 20.3144C46.3821 20.8767 46.0655 21.6392 46.0648 22.4346ZM25.6072 56.1302C23.1683 56.0192 21.8427 55.6132 20.9618 55.2702C19.7939 54.8158 18.9606 54.2746 18.0845 53.4002C17.2083 52.5258 16.666 51.6938 16.2133 50.5266C15.8699 49.6466 15.4637 48.3214 15.3528 45.884C15.2316 43.2488 15.2073 42.4572 15.2073 35.781C15.2073 29.1048 15.2336 28.3154 15.3528 25.678C15.4639 23.2406 15.8731 21.918 16.2133 21.0354C16.668 19.8682 17.2095 19.0354 18.0845 18.1598C18.9594 17.2842 19.7919 16.7422 20.9618 16.2898C21.8423 15.9466 23.1683 15.5406 25.6072 15.4298C28.244 15.3086 29.036 15.2844 35.7132 15.2844C42.3904 15.2844 43.1833 15.3106 45.8223 15.4298C48.2612 15.5408 49.5846 15.9498 50.4677 16.2898C51.6356 16.7422 52.4689 17.2854 53.345 18.1598C54.2211 19.0342 54.7615 19.8682 55.2161 21.0354C55.5595 21.9154 55.9658 23.2406 56.0767 25.678C56.1979 28.3154 56.2221 29.1048 56.2221 35.781C56.2221 42.4572 56.1979 43.2466 56.0767 45.884C55.9656 48.3214 55.5573 49.6462 55.2161 50.5266C54.7615 51.6938 54.2199 52.5266 53.345 53.4002C52.4701 54.2738 51.6356 54.8158 50.4677 55.2702C49.5872 55.6134 48.2612 56.0194 45.8223 56.1302C43.1855 56.2514 42.3934 56.2756 35.7132 56.2756C29.033 56.2756 28.2432 56.2514 25.6072 56.1302ZM25.4001 10.9322C22.7371 11.0534 20.9174 11.4754 19.3282 12.0934C17.6824 12.7316 16.2892 13.5878 14.897 14.977C13.5047 16.3662 12.6502 17.7608 12.0116 19.4056C11.3933 20.9948 10.971 22.8124 10.8497 25.4738C10.7265 28.1394 10.6982 28.9916 10.6982 35.7808C10.6982 42.57 10.7265 43.4222 10.8497 46.0878C10.971 48.7494 11.3933 50.5668 12.0116 52.156C12.6502 53.7998 13.5049 55.196 14.897 56.5846C16.289 57.9732 17.6824 58.8282 19.3282 59.4682C20.9204 60.0862 22.7371 60.5082 25.4001 60.6294C28.0687 60.7506 28.92 60.7808 35.7132 60.7808C42.5065 60.7808 43.3592 60.7526 46.0264 60.6294C48.6896 60.5082 50.5081 60.0862 52.0983 59.4682C53.7431 58.8282 55.1373 57.9738 56.5295 56.5846C57.9218 55.1954 58.7745 53.7998 59.4149 52.156C60.0332 50.5668 60.4575 48.7492 60.5768 46.0878C60.698 43.4202 60.7262 42.57 60.7262 35.7808C60.7262 28.9916 60.698 28.1394 60.5768 25.4738C60.4555 22.8122 60.0332 20.9938 59.4149 19.4056C58.7745 17.7618 57.9196 16.3684 56.5295 14.977C55.1395 13.5856 53.7431 12.7316 52.1003 12.0934C50.5081 11.4754 48.6894 11.0514 46.0284 10.9322C43.3612 10.811 42.5085 10.7808 35.7152 10.7808C28.922 10.7808 28.0687 10.809 25.4001 10.9322Z" 
                fill="currentColor" />
        </svg>
      ),
      url: 'https://instagram.com/mvsdlab'
    },
    { 
      name: 'Twitter', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 72 72" fill="none">
          <path d="M40.7568 32.1716L59.3704 11H54.9596L38.7974 29.383L25.8887 11H11L30.5205 38.7983L11 61H15.4111L32.4788 41.5869L46.1113 61H61L40.7557 32.1716H40.7568ZM34.7152 39.0433L32.7374 36.2752L17.0005 14.2492H23.7756L36.4755 32.0249L38.4533 34.7929L54.9617 57.8986H48.1865L34.7152 39.0443V39.0433Z" 
                fill="currentColor" />
        </svg>
      ),
      url: 'https://twitter.com/mvsdlab'
    },
    { 
      name: 'LinkedIn', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 72 72" fill="none">
          <path d="M61.5 11H10.5C9.67157 11 9 11.6716 9 12.5V61.5C9 62.3284 9.67157 63 10.5 63H61.5C62.3284 63 63 62.3284 63 61.5V12.5C63 11.6716 62.3284 11 61.5 11ZM25.5 54H17.5V30H25.5V54ZM21.5 26.5C19.2909 26.5 17.5 24.7091 17.5 22.5C17.5 20.2909 19.2909 18.5 21.5 18.5C23.7091 18.5 25.5 20.2909 25.5 22.5C25.5 24.7091 23.7091 26.5 21.5 26.5ZM54.5 54H46.5V41.5C46.5 39.2909 44.7091 37.5 42.5 37.5C40.2909 37.5 38.5 39.2909 38.5 41.5V54H30.5V30H38.5V33.5C40.7091 30.5 44.5 30.5 46.5 33.5C48.5 36.5 54.5 34.5 54.5 41.5V54Z" 
                fill="currentColor" />
        </svg>
      ),
      url: 'https://linkedin.com/company/mvsdlab'
    },
    { 
      name: 'YouTube', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 72 72" fill="none">
          <path d="M63 22.5C63 20.2909 61.2091 18.5 59 18.5H13C10.7909 18.5 9 20.2909 9 22.5V49.5C9 51.7091 10.7909 53.5 13 53.5H59C61.2091 53.5 63 51.7091 63 49.5V22.5ZM42 37L29 30V44L42 37Z" 
                fill="currentColor" />
        </svg>
      ),
      url: 'https://youtube.com/mvsdlab'
    }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-16 pb-8 px-4 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-soft-light opacity-20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500 rounded-full mix-blend-soft-light opacity-20 blur-3xl animate-pulse-slow"></div>
      </div>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <LoadingSpinner />
        </div>
      )}
      
      <div className="container mx-auto relative z-10">
        {/* Main grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 ${isLoading ? 'opacity-50' : ''}`}>
          
          {/* Logo and description */}
          <div className="flex flex-col">
            <div className="flex items-center mb-6">
              {/* Logo with transparent background and increased size */}
              <div className="mr-4">
                <Image 
                  src="/images/logo.png" 
                  alt="MVSD LAB Logo" 
                  width={100} 
                  height={100} 
                  className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 transition-all duration-300"
                />
              </div>
              <span className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                MVSD LAB
              </span>
            </div>
            <p className="text-gray-300 mb-6 text-base">
              Innovative solutions in automotive and AI technology. Join our journey to the future.
            </p>
            
            {/* Social media links */}
            <div className="flex space-x-4 mt-auto">
              {socialLinks.map((social, index) => (
                <Link 
                  key={index}
                  href={social.url}
                  className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Quick links */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-4 text-blue-300 border-b border-blue-500 pb-2">Products</h3>
              <ul className="space-y-3">
                {['Figma UI System', 'Icons Assets', 'Responsive Blocks', 'Components Library'].map((item, index) => (
                  <li key={index}>
                    <Link 
                      href="#" 
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:pl-2 block"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-blue-300 border-b border-blue-500 pb-2">Resources</h3>
              <ul className="space-y-3">
                {['FAQs', 'Quick Start', 'Documentation', 'User Guide'].map((item, index) => (
                  <li key={index}>
                    <Link 
                      href="#" 
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:pl-2 block"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Contact info */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-300 border-b border-blue-500 pb-2">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span className="text-gray-300">contact@mvsdlab.com</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-gray-300">123 Innovation Drive, Tech City</span>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-300 border-b border-blue-500 pb-2">Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for the latest updates and insights.
            </p>
            <form onSubmit={handleSubscribe} className="bg-gray-800 p-5 rounded-xl shadow-lg">
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-base font-medium shadow-md text-white bg-gray-900 border border-gray-700 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your-email@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center mb-4">
                <input
                  id="privacy-checkbox"
                  type="checkbox"
                  className="w-5 h-5 border border-gray-600 bg-gray-800 rounded cursor-pointer mr-2 checked:bg-blue-500 checked:border-blue-500"
                  required
                  disabled={isLoading}
                />
                <label htmlFor="privacy-checkbox" className="text-sm text-gray-400 cursor-pointer">
                  I agree with <Link href="#" className="text-blue-400 hover:underline">Privacy Policy</Link> and <Link href="#" className="text-blue-400 hover:underline">Terms</Link>
                </label>
              </div>
              <button
                type="submit"
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  isSubscribed 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700'
                }`}
                disabled={isLoading || isSubscribed}
              >
                {isSubscribed ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Subscribed
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Footer bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            <Link href="https://mvsdlab.com" className="hover:text-white">
              © MVSD LAB {new Date().getFullYear()}, All rights reserved.
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm">Cookie Policy</Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
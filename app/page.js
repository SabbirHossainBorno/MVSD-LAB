// app/page.js
'use client';

import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from './components/LoadingSpinner';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  // Create floating particles
  useEffect(() => {
    const createParticle = () => {
      const size = Math.random() * 10 + 2;
      return {
        id: Math.random().toString(36).substr(2, 9),
        size,
        x: Math.random() * 100,
        y: -size,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1
      };
    };

    // Initialize particles
    const initialParticles = Array.from({ length: 30 }, createParticle);
    setParticles(initialParticles);

    // Animation loop
    const animate = () => {
      setParticles(prev => {
        return prev.map(p => {
          let newY = p.y + p.speed;
          if (newY > 100) {
            return createParticle();
          }
          return { ...p, y: newY };
        });
      });
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    setLoading(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        event.target.reset();
      } else {
        toast.error(result.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0c0c1d] via-[#121230] to-[#1a1a40] text-white p-4 overflow-hidden">
      {/* Floating particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white/10 backdrop-blur-sm"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity
          }}
        />
      ))}

      {/* Glowing elements */}
      <div className="absolute top-[20%] left-[10%] w-60 h-60 bg-purple-600/20 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[15%] right-[10%] w-80 h-80 bg-blue-600/20 rounded-full blur-[90px]"></div>
      
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center mb-8 sm:mb-12"
        >
          <div className="relative w-52 h-28 sm:w-64 sm:h-32 mb-6">
            <Image
              src="/images/logo.png"
              alt="MVSD LAB Logo"
              layout="fill"
              objectFit="contain"
              className="drop-shadow-xl"
            />
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            MVSD LAB
          </h1>
          <h2 className="text-xl sm:text-2xl font-medium text-gray-300 tracking-wide">
            Revolutionizing Automotive Engineering & AI Research
          </h2>
        </motion.header>

        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center text-center space-y-10 w-full"
        >
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
            We&apos;re building groundbreaking solutions at the intersection of automotive engineering and artificial intelligence. Join our journey to redefine what&apos;s possible.
          </p>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md"
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400">
              Be the First to Know
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  placeholder=" "
                  className="peer w-full px-4 py-3.5 bg-gray-900/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-transparent"
                  required
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-4 -top-2.5 px-1 bg-gray-900/60 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-cyan-400"
                >
                  Enter your email
                </label>
              </div>
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="relative overflow-hidden px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-medium tracking-wide shadow-lg"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subscribing...
                    </>
                  ) : (
                    "Notify Me on Launch"
                  )}
                </span>
              </motion.button>
            </form>
            <p className="text-gray-400 text-xs mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </motion.main>

        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 sm:mt-16 text-center"
        >
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} MVSD LAB. All rights reserved.
          </p>
        </motion.footer>
      </div>

      <ToastContainer 
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
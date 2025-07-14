// app/page.js
'use client';

import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from './components/LoadingSpinner';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const canvasRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Neural network connection animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;
    
    // Connection points (neural network nodes)
    const nodes = Array.from({ length: 15 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 3 + 1,
    }));
    
    let animationFrame;
    
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(10, 10, 30, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw connections
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Draw nodes
      ctx.fillStyle = 'rgba(100, 220, 255, 0.8)';
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Update position with boundaries
        node.x += node.vx;
        node.y += node.vy;
        
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      });
      
      animationFrame = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Create floating particles
  useEffect(() => {
    const createParticle = () => {
      const size = Math.random() * 8 + 1;
      return {
        id: Math.random().toString(36).substr(2, 9),
        size,
        x: Math.random() * 100,
        y: -size,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        color: `rgba(${100 + Math.floor(Math.random() * 155)}, ${200 + Math.floor(Math.random() * 55)}, 255, `
      };
    };

    const initialParticles = Array.from({ length: 50 }, createParticle);
    setParticles(initialParticles);

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
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#050517] via-[#0a0a2a] to-[#101040] text-white p-4 overflow-hidden">
      {/* Neural Network Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full opacity-30"
      />
      
      {/* Holographic Vehicle Silhouette */}
      <motion.div 
        className="fixed inset-0 w-screen h-screen z-0"
        animate={{ 
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <div className="w-full h-full bg-[url('/images/newslatter_bg.jpg')] bg-cover bg-center bg-no-repeat opacity-20" />
      </motion.div>


      {/* AI Circuit Elements */}
      <div className="absolute top-[15%] left-[5%] w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-indigo-600/15 rounded-full blur-[110px]"></div>
      
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <motion.header 
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center mb-10 sm:mb-14"
        >
          <motion.div 
            className="relative w-56 h-28 sm:w-72 sm:h-36 mb-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/images/subscrib_logo.png"
              alt="MVSD Lab Logo"
              layout="fill"
              objectFit="contain"
              className="drop-shadow-[0_0_20px_rgba(100,220,255,0.5)]"
            />
          </motion.div>
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 tracking-tight"
            animate={{
              textShadow: [
                "0 0 5px rgba(100,200,255,0.5)",
                "0 0 20px rgba(100,220,255,0.8)",
                "0 0 5px rgba(100,200,255,0.5)"
              ]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">
              MVSD LAB
            </span>
          </motion.h1>
          <motion.h2 
            className="text-xl sm:text-2xl font-medium text-cyan-300 tracking-wide max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Pioneering Autonomous Intelligence for Next-Gen Mobility
          </motion.h2>
        </motion.header>

        <motion.main 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center text-center space-y-12 w-full"
        >
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-cyan-100 max-w-3xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            We&apos;re at the forefront of <span className="font-semibold text-cyan-300">AI-driven automotive innovation</span>, developing intelligent systems that power the autonomous vehicles of tomorrow.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="relative w-full max-w-xl"
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
          >
            {/* Holographic Effect Container */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              {isHovering && (
                <motion.div 
                  className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%]"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    background: `conic-gradient(
                      transparent,
                      rgba(100, 220, 255, 0.1),
                      transparent 70%
                    )`
                  }}
                />
              )}
            </div>
            
            {/* Glass Card */}
            <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 z-10">
              <motion.h3 
                className="text-2xl sm:text-3xl font-bold mb-6"
                animate={{
                  textShadow: isHovering 
                    ? "0 0 10px rgba(100, 220, 255, 0.8)" 
                    : "0 0 5px rgba(100, 200, 255, 0.5)"
                }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">
                  Join Our Tech Revolution
                </span>
              </motion.h3>
              
              <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    placeholder=" "
                    className="peer w-full px-5 py-4 bg-gray-900/70 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 placeholder-transparent transition-all"
                    required
                  />
                  <label 
                    htmlFor="email" 
                    className="absolute left-4 -top-2.5 px-1 bg-gradient-to-b from-[#050517] to-[#0a0a2a] text-cyan-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-cyan-500 peer-placeholder-shown:top-4 peer-placeholder-shown:left-5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-cyan-300"
                  >
                    Enter your email
                  </label>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 peer-focus:w-full"></div>
                </div>
                
                <motion.button
                  type="submit"
                  whileHover={{ 
                    scale: 1.03,
                    background: "linear-gradient(to right, #38bdf8, #3b82f6, #6366f1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="relative overflow-hidden px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium tracking-wide shadow-lg shadow-cyan-500/20 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting to AI Network...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🚀</span> 
                        Notify Me
                      </>
                    )}
                  </span>
                  {!loading && (
                    <motion.span 
                      className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-400/30 to-blue-500/30"
                      animate={{
                        left: ["0%", "100%"],
                        opacity: [0, 0.5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity
                      }}
                    />
                  )}
                </motion.button>
              </form>
              <p className="text-cyan-500/80 text-xs mt-4">
                Secure connection • Encrypted data • Zero spam
              </p>
            </div>
          </motion.div>

          {/* Tech Badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {['AI', 'Autonomous Driving', 'Computer Vision', 'Neural Networks', 'Edge Computing', 'Sensor Fusion'].map((tech, i) => (
              <motion.div
                key={i}
                className="px-4 py-2 bg-cyan-900/30 backdrop-blur-sm border border-cyan-500/20 rounded-full text-cyan-300 text-sm"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: 'rgba(6, 78, 119, 0.4)',
                  borderColor: 'rgba(103, 232, 249, 0.4)'
                }}
              >
                {tech}
              </motion.div>
            ))}
          </motion.div>
        </motion.main>

        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <div className="flex justify-center space-x-6 mb-4">
            {[
              {icon: '🤖', label: 'AI Research'},
              {icon: '🚗', label: 'Autonomous Systems'},
              {icon: '🌐', label: 'Connected Mobility'},
            ].map((item, i) => (
              <motion.div 
                key={i}
                className="flex flex-col items-center"
                whileHover={{ y: -5 }}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-sm text-cyan-400">{item.label}</span>
              </motion.div>
            ))}
          </div>
          
          <p className="text-cyan-500/70 text-sm">
            © {new Date().getFullYear()} MVSD Lab • Transforming Mobility Through Intelligence
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
        theme="dark"
        toastClassName="bg-gray-900/80 backdrop-blur-md border border-cyan-500/20"
      />

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50 backdrop-blur-sm">
          <div className="text-center">
            <LoadingSpinner />
            <motion.p 
              className="mt-6 text-cyan-300"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Connecting to neural network...
            </motion.p>
          </div>
        </div>
      )}
    </div>
  );
}
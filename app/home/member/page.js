'use client';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ScrollToTop from '../../components/ScrollToTop';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const cardVariants = {
  hover: {
    y: -10,
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)",
    transition: { duration: 0.3 }
  }
};

export default function Member() {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState({
    director: [],
    professor: [],
    phd: [],
    masters: [],
    postdoc: [],
    staff: [],
    alumni: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/member');
        const allMembers = response.data;
        
        // Categorize members
        const categorized = {
          director: allMembers.filter(m => m.type === 'Director'),
          professor: allMembers.filter(m => m.type === 'Professor'),
          phd: allMembers.filter(m => m.type === 'PhD Candidate' && m.alumni_status !== 'Valid'),
          masters: allMembers.filter(m => m.type === 'Master\'s Candidate' && m.alumni_status !== 'Valid'),
          postdoc: allMembers.filter(m => m.type === 'Post Doc Candidate' && m.alumni_status !== 'Valid'),
          staff: allMembers.filter(m => m.type === 'Staff Member'),
          alumni: allMembers.filter(m => m.alumni_status === 'Valid')
        };

        setMembers(categorized);
      } catch (error) {
        console.error('Error fetching member data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const renderSocialMediaIcons = (socialmedia) => {
    const iconMap = {
      Facebook: '/images/social_icon/facebook.png',
      X: '/images/social_icon/x.png',
      Instagram: '/images/social_icon/instagram.png',
      Linkedin: '/images/social_icon/linkedin.png',
      GitHub: '/images/social_icon/github.png',
      Website: '/images/social_icon/website.png',
      Other: '/images/social_icon/other.png',
    };

    return socialmedia.map((media) => (
      <a
        key={`${media.socialmedia_name}-${media.link}`}
        href={media.link}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-all duration-300 hover:opacity-80 hover:scale-110"
        aria-label={media.socialmedia_name}
      >
        <Image 
          src={iconMap[media.socialmedia_name]}
          alt={media.socialmedia_name}
          width={24}
          height={24}
          className="w-6 h-6"
          quality={100}
        />
      </a>
    ));
  };

  const MemberCard = ({ member, type = 'normal' }) => {
    const isDirector = type === 'director';
    const isAlumni = type === 'alumni';
    
    return (
      <motion.div
        variants={itemVariants}
        whileHover="hover"
        className={`bg-white rounded-xl overflow-hidden shadow-lg 
          ${isDirector ? 'border-t-4 border-blue-600' : ''}
          ${isAlumni ? 'border-t-4 border-purple-600' : ''}
          transition-all duration-300 h-full flex flex-col`}
      >
        <div className={`p-6 flex-grow ${isDirector ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''}`}>
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image 
                  src={member.photo || '/images/placeholder-avatar.jpg'}
                  alt={`${member.first_name} ${member.last_name}`}
                  width={isDirector ? 160 : 120}
                  height={isDirector ? 160 : 120}
                  className="object-cover"
                />
              </div>
              {isAlumni && (
                <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                  Alumni
                </div>
              )}
            </div>
            
            <div className="text-center">
              <h3 className={`font-bold ${isDirector ? 'text-2xl' : 'text-xl'} text-gray-900`}>
                {member.first_name} {member.last_name}
              </h3>
              <p className="text-gray-600 mt-1">{member.designation || member.type}</p>
              <p className="text-sm text-gray-500 mt-1">{member.email}</p>
              <p className="text-xs text-blue-600 mt-1 font-mono">ID: {member.id}</p>
              
              {member.short_bio && (
                <p className="mt-3 text-gray-700 text-sm">{member.short_bio}</p>
              )}
              
              <div className="flex justify-center space-x-3 mt-4">
                {member.socialmedia && renderSocialMediaIcons(member.socialmedia)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSection = (title, members, type = 'normal') => {
    if (!members || members.length === 0) return null;
    
    return (
      <section className="py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <div className="relative inline-block">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 relative z-10 px-6">
              {title}
            </h2>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute bottom-1 left-0 h-2 bg-blue-200 opacity-70 z-0"
            ></motion.div>
          </div>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className={`grid gap-8 ${
            type === 'director' ? 'md:grid-cols-1 max-w-2xl mx-auto' : 
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {members.map(member => (
            <motion.div
              key={member.id}
              variants={cardVariants}
            >
              <MemberCard 
                member={member} 
                type={type === 'director' ? 'director' : type === 'alumni' ? 'alumni' : 'normal'} 
              />
            </motion.div>
          ))}
        </motion.div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading our talented team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main>
        <section className="relative flex items-center justify-center h-[35vh] md:h-[45vh] bg-cover bg-center">
          <div
            className="absolute inset-0 bg-[url('/images/hero-bg3.png')] bg-cover bg-center"
            style={{ opacity: 0.5 }}
          ></div>

          <div className="relative z-10 text-center p-6 md:p-8 max-w-2xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 mt-10 leading-tight"
            >
              Members of MVSD LAB
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg lg:text-xl text-gray-800 mb-4"
            >
              Meet our talented team driving innovation in automotive technologies and AI
            </motion.p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 py-4">
          <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <nav className="text-sm font-medium text-gray-800 mb-2 md:mb-0">
              <ol className="list-reset flex items-center space-x-2">
                <li>
                  <Link href="/home" className="text-blue-600 hover:text-blue-700 transition-colors duration-300 ease-in-out">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-600">Member</li>
              </ol>
            </nav>

            <div className="relative flex-grow md:max-w-xs">
              <input
                type="text"
                placeholder="Search by name, ID, email..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white placeholder-gray-400 text-gray-700 border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M16.65 11.65a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Members Section */}
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          {renderSection("Lab Director", members.director, 'director')}
          {renderSection("Professors", members.professor)}
          {renderSection("PhD Candidates", members.phd)}
          {renderSection("Master's Candidates", members.masters)}
          {renderSection("Post Doc Researchers", members.postdoc)}
          {renderSection("Staff Members", members.staff)}
          
          {/* Alumni Section */}
          {members.alumni.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl px-6 my-16 shadow-inner"
            >
              <div className="text-center mb-12">
                <motion.h2 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-3xl font-bold text-gray-900 mb-4"
                >
                  Our Esteemed Alumni
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 max-w-2xl mx-auto"
                >
                  Where they are now: Discover the career paths of our former lab members
                </motion.p>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 100 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="h-1 bg-purple-600 rounded-full mx-auto mt-4"
                ></motion.div>
              </div>
              
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              >
                {members.alumni.map(alumni => (
                  <motion.div
                    key={alumni.id}
                    variants={cardVariants}
                  >
                    <MemberCard member={alumni} type="alumni" />
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}
        </div>
      </main>
      
      <ScrollToTop />
      <Footer />
    </div>
  );
}
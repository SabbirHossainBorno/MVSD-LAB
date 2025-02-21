// app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import withAuth from '../components/withAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardMessageChart from '../components/DashboardMessage_chart';
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [subscribers, setSubscribers] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [professorsCount, setProfessorsCount] = useState(0);
  const [phdCandidatesCount, setPhdCandidatesCount] = useState(0);
  const [messageCount, setMessagesCount] = useState(0);
  const [recentProfessors, setRecentProfessors] = useState([]);
  const [recentSubscribers, setRecentSubscribers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLoginCount, setCurrentLoginCount] = useState(0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 120 },
    },
    hover: { scale: 1.05 },
  };

  // Card colors configuration
  const cardColors = [
    'from-blue-500 via-purple-500 to-pink-500',
    'from-green-500 via-teal-500 to-cyan-500',
    'from-yellow-500 via-orange-500 to-red-500',
    'from-purple-500 via-pink-500 to-red-500',
    'from-cyan-500 via-blue-500 to-indigo-500',
  ];

  const cards = [
    { title: 'Total Members', value: membersCount, icon: '/icons/member.svg' },
    { title: 'Total Subscribers', value: subscribers, icon: '/icons/subscriber.svg' },
    { title: 'Total Professors', value: professorsCount, icon: '/icons/professor.svg' },
    { title: 'Total Messages', value: messageCount, icon: '/icons/message.svg' },
    { title: 'Current Login', value: currentLoginCount, icon: '/icons/current_login.svg' },
  ];

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const response = await axios.get('/api/dashboard');
        const result = response.data;
        if (isMounted) {
          setSubscribers(result.subscribers);
          setMembersCount(result.memberCount);
          setProfessorsCount(result.professorCount);
          setPhdCandidatesCount(result.phdCandidateCount);
          setMessagesCount(result.messageCount);
          setRecentSubscribers(result.recentSubscribers);
          setAdmins(result.admins);
          setRecentProfessors(result.recentProfessors);
          setCurrentLoginCount(result.currentLoginCount);
        }
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <main className="flex-1 p-3 md:p-4 lg:p-6">
    {/* ------------------------Summary Cards------------------------ */}
    <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              whileHover="hover"
              className={`relative bg-gradient-to-br ${cardColors[index]} p-1 rounded-2xl shadow-2xl hover:shadow-xl transition-shadow duration-300 group`}
            >
              <div className="relative bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 h-full">
                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse" />
                </div>

                <div className="flex items-center space-x-4">
                  {/* Icon with gradient background */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className={`p-3 rounded-xl bg-gradient-to-br ${cardColors[index]} shadow-lg`}
                  >
                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 filter brightness-0 invert"
                    />
                  </motion.div>

                  {/* Content */}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-400 mb-1">
                      {card.title}
                    </span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-3xl font-bold bg-gradient-to-br bg-clip-text text-transparent"
                      style={{ backgroundImage: `linear-gradient(to right, ${cardColors[index].split(' ')[0].split('-')[0]}-600, ${cardColors[index].split(' ')[2].split('-')[0]}-600)` }}
                    >
                      {card.value}
                    </motion.span>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute bottom-2 right-2 opacity-10 group-hover:opacity-30 transition-opacity">
                  <svg className="w-16 h-16" fill="currentColor">
                    <circle cx="8" cy="8" r="8" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>



        {/* ------------------------Member Summary Cards------------------------ */}
        <div className="bg-gray-800 p-4 rounded shadow-lg border border-gray-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">

          {/* Total PhD Candidate Card */}
          <div className="bg-white p-2 rounded shadow-md flex items-center justify-between transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-2 border-blue-500">
            {/* Icon Section */}
            <div className="w-8 h-8 flex items-center justify-center md:w-10 md:h-10">
              <Image 
                src="/icons/phd_candidate.svg" 
                alt="Total PhD Candidate Icon"
                width={32} 
                height={32} 
                className="w-8 h-8 md:w-10 md:h-10"
                quality={100} 
                priority 
              />
            </div>

            {/* Content Section */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">PhD Candidate</p>
              <p className="text-2xl font-extrabold text-black">{phdCandidatesCount}</p>
            </div>
          </div>

          {/* Repeat the card structure for other cards */}
          {/* Total PhD Candidate Card */}
          <div className="bg-white p-2 rounded shadow-md flex items-center justify-between transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-2 border-blue-500">
            {/* Icon Section */}
            <div className="w-8 h-8 flex items-center justify-center md:w-10 md:h-10">
              <Image 
                src="/icons/phd_candidate.svg" 
                alt="Total PhD Candidate Icon"
                width={32} 
                height={32} 
                className="w-8 h-8 md:w-10 md:h-10"
                quality={100} 
                priority 
              />
            </div>

            {/* Content Section */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">PhD Candidate</p>
              <p className="text-2xl font-extrabold text-black">{phdCandidatesCount}</p>
            </div>
          </div>
          {/* Total PhD Candidate Card */}
          <div className="bg-white p-2 rounded shadow-md flex items-center justify-between transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-2 border-blue-500">
            {/* Icon Section */}
            <div className="w-8 h-8 flex items-center justify-center md:w-10 md:h-10">
              <Image 
                src="/icons/phd_candidate.svg" 
                alt="Total PhD Candidate Icon"
                width={32} 
                height={32} 
                className="w-8 h-8 md:w-10 md:h-10"
                quality={100} 
                priority 
              />
            </div>

            {/* Content Section */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">PhD Candidate</p>
              <p className="text-2xl font-extrabold text-black">{phdCandidatesCount}</p>
            </div>
          </div>
          {/* Total PhD Candidate Card */}
          <div className="bg-white p-2 rounded shadow-md flex items-center justify-between transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-2 border-blue-500">
            {/* Icon Section */}
            <div className="w-8 h-8 flex items-center justify-center md:w-10 md:h-10">
              <Image 
                src="/icons/phd_candidate.svg" 
                alt="Total PhD Candidate Icon"
                width={32} 
                height={32} 
                className="w-8 h-8 md:w-10 md:h-10"
                quality={100} 
                priority 
              />
            </div>

            {/* Content Section */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">PhD Candidate</p>
              <p className="text-2xl font-extrabold text-black">{phdCandidatesCount}</p>
            </div>
          </div>
          {/* Total PhD Candidate Card */}
          <div className="bg-white p-2 rounded shadow-md flex items-center justify-between transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-2 border-blue-500">
            {/* Icon Section */}
            <div className="w-8 h-8 flex items-center justify-center md:w-10 md:h-10">
              <Image 
                src="/icons/phd_candidate.svg" 
                alt="Total PhD Candidate Icon"
                width={32} 
                height={32} 
                className="w-8 h-8 md:w-10 md:h-10"
                quality={100} 
                priority 
              />
            </div>

            {/* Content Section */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">PhD Candidate</p>
              <p className="text-2xl font-extrabold text-black">{phdCandidatesCount}</p>
            </div>
          </div>
        </div>





        {/* ------------------------Login Information------------------------ */}
        <div className="grid grid-cols-1 gap-4 mb-5">
          {/* Admin Info */}
          <div className="bg-gray-800 p-4 rounded shadow-lg">
          <div className="relative flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-500 text-center">
              Login Information
            </h2>
            <hr className="border-0 h-1 bg-gradient-to-r from-teal-400 to-orange-500 rounded w-full mb-6" />
          </div>

            <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-900 text-white rounded shadow-lg">
            <thead className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <th className="py-3 px-6 text-left text-white">Email</th>
                <th className="py-3 px-6 text-left text-white">Status</th>
                <th className="py-3 px-6 text-left text-white">Last Login</th>
                <th className="py-3 px-6 text-left text-white">Last Logout</th>
                <th className="py-3 px-6 text-left text-white">Login Count</th>
              </tr>
            </thead>
              <tbody className="text-gray-300">
                {admins.map((admin) => (
                  <tr key={admin.email} className="hover:bg-gray-800 transition duration-300 ease-in-out">
                    <td className="py-3 px-6 border-b border-gray-800">{admin.email}</td>
                    <td className="py-3 px-6 border-b border-gray-800">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          admin.status === 'Active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {admin.status === 'Active' ? 'Active' : 'Idle'}
                      </span>
                    </td>
                    <td className="py-3 px-6 border-b border-gray-800">{new Date(admin.last_login_time).toLocaleString()}</td>
                    <td className="py-3 px-6 border-b border-gray-800">{new Date(admin.last_logout_time).toLocaleString()}</td>
                    <td className="py-3 px-6 border-b border-gray-800">{admin.login_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            </div>
          </div>
        </div>




        {/* ------------------------Message Statistics and Recent Professors Side by Side------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {/* Message Statistics */}
          <div className="bg-gray-800 p-4 rounded shadow-lg">
            <div className="relative">
              <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-500">
                Message Statistics
              </h2>
              <hr className="border-0 h-1 bg-gradient-to-r from-red-400 to-yellow-500 rounded-full mb-6" />
            </div>
            <DashboardMessageChart />
          </div>

          {/* Recent Professors */}
          <div className="bg-gray-800 p-4 rounded shadow-lg">
            <div className="relative">
              <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                Recent Professors
              </h2>
              <hr className="border-0 h-1 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full mb-6" />
            </div>
            <ul className="space-y-2">
              {recentProfessors.map(professor => (
                <li
                  key={professor.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded border border-gray-600 shadow-sm hover:bg-gray-600 transition"
                >
                  <div className="flex items-center space-x-3">
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-200 break-words">{professor.email}</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="bg-yellow-600 text-white rounded px-2 py-1 text-xs font-medium">
                      {professor.id}
                    </div>
                    <div className="bg-green-600 text-white rounded px-2 py-1 text-xs font-medium">
                      {professor.status}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/professor_list" className="block mt-3 text-center text-blue-400 hover:text-blue-500 text-sm">View All</Link>
          </div>
        </div>




        {/* ------------------------Recent Subscribers and------ Side by Side------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Recent Subscribers */}
          <div className="bg-gray-800 p-4 rounded shadow-lg">
            <div className="relative">
            <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Recent Subscribers
              </h2>
              <hr className="border-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mb-6" />
            </div>
            <ul className="space-y-2">
              {recentSubscribers.map(subscriber => (
                <li
                  key={subscriber.email}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded border border-gray-600 shadow-sm hover:bg-gray-600 transition"
                >
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-200 break-words">{subscriber.email}</span>
                  <div className="bg-blue-600 text-white rounded px-2 py-1 text-xs font-medium">
                    Subscribed
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/subscribers_list" className="block mt-3 text-center text-blue-400 hover:text-blue-500 text-sm">View All</Link>
          </div>
        </div>



        {/* ------------------------Recent Subscribers and------ Side by Side------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Heading Example */}
          <div className="bg-gray-800 p-4 rounded shadow-lg">

            <div className="relative">
              <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
                Example Heading 1
              </h2>
              <hr className="border-0 h-1 bg-gradient-to-r from-green-400 to-teal-500 rounded-full mb-6" />
            </div>

            <div className="relative">
              <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                Example Heading 2
              </h2>
              <hr className="border-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full mb-6" />
            </div>

            <div className="relative">
              <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">
                Example Heading 3
              </h2>
              <hr className="border-0 h-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mb-6" />
            </div>
            
          </div>
        </div>


      </main>
    </div>
  );
}

export default withAuth(Dashboard);
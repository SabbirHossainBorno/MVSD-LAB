// app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner'; // Add a loading spinner component
import DashboardMessageChart from '../components/DashboardMessage_chart'; // Add a loading spinner component
import DashboardMemberChart from '../components/DashboardMember_chart'; // Add a loading spinner component
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion'

const Dashboard = () => {
  const [subscribers, setSubscribers] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [professorsCount, setProfessorsCount] = useState(0);
  const [directorsCount, setDirectorsCount] = useState(0);
  const [phdCandidatesCount, setPhdCandidatesCount] = useState(0);
  const [mastersCandidatesCount, setMastersCandidatesCount] = useState(0);
  const [postdocCandidatesCount, setPostDocCandidatesCount] = useState(0);
  const [staffMembersCount, setStaffMembersCount] = useState(0);
  const [alumnisCount, setAlumnisCount] = useState(0);
  const [messageCount, setMessagesCount] = useState(0);
  const [recentProfessors, setRecentProfessors] = useState([]);
  const [recentSubscribers, setRecentSubscribers] = useState([]);
  const [admins, setAdmins] = useState([]); // State to manage admin data
  const [loading, setLoading] = useState(true); // State to manage loading
  const [currentLoginCount, setCurrentLoginCount] = useState(0); // State to manage current login count
  const [memberLoginInfoTrackers, setMemberLoginInfoTrackers] = useState([]); // State to manage admin data
  const [directorLoginInfoTrackers, setDirectorLoginInfoTrackers] = useState([]);

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted

    async function fetchData() {
      setLoading(true); // Start loading
      try {
        const response = await axios.get('/api/dashboard');
        const result = response.data;
        if (isMounted) {
          setSubscribers(result.subscribers);
          setMembersCount(result.memberCount);
          setProfessorsCount(result.professorCount);
          setDirectorsCount(result.directorCount);
          setPhdCandidatesCount(result.phdCandidateCount);
          setMastersCandidatesCount(result.mastersCandidateCount);
          setPostDocCandidatesCount(result.postdocCandidateCount);
          setStaffMembersCount(result.postdocCandidateCount);
          setAlumnisCount(result.alumniCount);
          setMessagesCount(result.messageCount);
          setRecentSubscribers(result.recentSubscribers);
          setAdmins(result.admins); // Set admin data
          setRecentProfessors(result.recentProfessors);
          setCurrentLoginCount(result.currentLoginCount); // Set current login count
          setMemberLoginInfoTrackers(result.memberLoginInfoTrackers);
          setDirectorLoginInfoTrackers(result.directorLoginInfoTrackers);

          // ✅ Log current login count to the console
        console.log('✅ Total Current Login Count:', result.currentLoginCount);
        }
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (isMounted) setLoading(false); // End loading
      }
    }

    fetchData();

    return () => {
      isMounted = false; // Cleanup function to set isMounted to false
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <main className="flex-1 p-3 md:p-4 lg:p-6">

        {/* ------------------------Summary Cards------------------------ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">

          {/* Total Members Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-4 border-blue-500">
            {/* Icon Section */}
            <div className="w-16 h-16 mr-3 flex items-center justify-center md:w-20 md:h-20">
            <Image 
              src="/icons/member.svg" // Image path
              alt="Total Members Icon" // Alt text
              width={64} // 16 * 4 = 64px width
              height={64} // 16 * 4 = 64px height
              className="w-16 h-16 md:w-20 md:h-20" // Tailwind classes for sizing
              quality={100} // Ensures maximum quality, by default Next.js optimizes images for performance but this ensures no compression
              priority // Ensures the image is loaded with high priority
            />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Total Members</p>
              <p className="text-3xl font-extrabold text-black mt-1">{membersCount}</p>
            </div>
          </div>

          {/* Total Subscribers Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-4 border-blue-500">
            {/* Icon Section */}
            <div className="w-16 h-16 mr-3 flex items-center justify-center md:w-20 md:h-20">
              <Image 
                src="/icons/subscriber.svg" // Image path
                alt="Total Subscribers Icon" // Alt text for accessibility
                width={64} // 16 * 4 = 64px width
                height={64} // 16 * 4 = 64px height
                className="w-16 h-16 md:w-20 md:h-20" // Tailwind classes for sizing
                quality={100} // Ensures maximum quality, by default Next.js optimizes images for performance but this ensures no compression
              />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Total Subscribers</p>
              <p className="text-3xl font-extrabold text-black mt-1">{subscribers}</p>
            </div>
          </div>

          {/* Total Professors Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-4 border-blue-500">
            {/* Icon Section */}
            <div className="w-16 h-16 mr-3 flex items-center justify-center md:w-20 md:h-20">
              <Image 
                src="/icons/professor.svg" // Image path
                alt="Total Professors Icon" // Alt text for accessibility
                width={64} // 16 * 4 = 64px width
                height={64} // 16 * 4 = 64px height
                className="w-16 h-16 md:w-20 md:h-20" // Tailwind classes for sizing
                quality={100} // Ensures maximum quality, by default Next.js optimizes images for performance but this ensures no compression
              />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Total Professors</p>
              <p className="text-3xl font-extrabold text-black mt-1">{professorsCount}</p>
            </div>
          </div>

          {/* Total Director Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-4 border-blue-500">
            {/* Icon Section */}
            <div className="w-16 h-16 mr-3 flex items-center justify-center md:w-20 md:h-20">
              <Image 
                src="/icons/boss.svg" // Image path
                alt="Total Directors Icon" // Alt text for accessibility
                width={64} // 16 * 4 = 64px width
                height={64} // 16 * 4 = 64px height
                className="w-16 h-16 md:w-20 md:h-20" // Tailwind classes for sizing
                quality={100} // Ensures maximum quality, by default Next.js optimizes images for performance but this ensures no compression
              />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Total Directors</p>
              <p className="text-3xl font-extrabold text-black mt-1">{directorsCount}</p>
            </div>
          </div>

          {/* Total Alumni Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-4 border-blue-500">
            {/* Icon Section */}
            <div className="w-16 h-16 mr-3 flex items-center justify-center md:w-20 md:h-20">
              <Image 
                src="/icons/total_alumni.svg" // Image path
                alt="Total Alumni Icon" // Alt text for accessibility
                width={64} // 16 * 4 = 64px width
                height={64} // 16 * 4 = 64px height
                className="w-16 h-16 md:w-20 md:h-20" // Tailwind classes for sizing
                quality={100} // Ensures maximum quality, by default Next.js optimizes images for performance but this ensures no compression
              />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Total Alumni</p>
              <p className="text-3xl font-extrabold text-black mt-1">{alumnisCount}</p>
            </div>
          </div>

          {/* Total Messages Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-4 border-blue-500">
            {/* Icon Section */}
            <div className="w-16 h-16 mr-3 flex items-center justify-center md:w-20 md:h-20">
              <Image 
                src="/icons/message.svg" // Image path
                alt="Total Messages Icon" // Alt text for accessibility
                width={64} // 16 * 4 = 64px width
                height={64} // 16 * 4 = 64px height
                className="w-16 h-16 md:w-20 md:h-20" // Tailwind classes for sizing
                quality={100} // Ensures maximum quality, by default Next.js optimizes images for performance but this ensures no compression
              />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Total Messages</p>
              <p className="text-3xl font-extrabold text-black mt-1">{messageCount}</p>
            </div>
          </div>
          
          {/* Current Login Count */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-4 border-blue-500">
            {/* Icon Section */}
            <div className="w-16 h-16 mr-3 flex items-center justify-center md:w-20 md:h-20">
              <Image 
                src="/icons/current_login.svg" // Image path
                alt="Current Login" // Alt text for accessibility
                width={64} // 16 * 4 = 64px width
                height={64} // 16 * 4 = 64px height
                className="w-16 h-16 md:w-20 md:h-20" // Tailwind classes for sizing
                quality={100} // Ensures maximum quality, by default Next.js optimizes images for performance but this ensures no compression
              />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Current Login</p>
              <p className="text-3xl font-extrabold text-black mt-1">{currentLoginCount}</p>
            </div>
          </div>
        </div>



        {/* ------------------------Member Summary Cards------------------------ */}
        <div className="bg-gray-800 p-4 rounded shadow-lg border border-gray-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">

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
          {/* Total Master's Candidate Card */}
          <div className="bg-white p-2 rounded shadow-md flex items-center justify-between transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-2 border-blue-500">
            {/* Icon Section */}
            <div className="w-8 h-8 flex items-center justify-center md:w-10 md:h-10">
              <Image 
                src="/icons/phd_candidate.svg" 
                alt="Total Master's Candidate Icon"
                width={32} 
                height={32} 
                className="w-8 h-8 md:w-10 md:h-10"
                quality={100} 
                priority 
              />
            </div>

            {/* Content Section */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Master&apos;s Candidate</p>
              <p className="text-2xl font-extrabold text-black">{mastersCandidatesCount}</p>
            </div>
          </div>
          {/* Total Post Doc Candidate Card */}
          <div className="bg-white p-2 rounded shadow-md flex items-center justify-between transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-2 border-blue-500">
            {/* Icon Section */}
            <div className="w-8 h-8 flex items-center justify-center md:w-10 md:h-10">
              <Image 
                src="/icons/phd_candidate.svg" 
                alt="Total Post Doc Candidate Icon"
                width={32} 
                height={32} 
                className="w-8 h-8 md:w-10 md:h-10"
                quality={100} 
                priority 
              />
            </div>

            {/* Content Section */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Post Doc Candidate</p>
              <p className="text-2xl font-extrabold text-black">{postdocCandidatesCount}</p>
            </div>
          </div>
          {/* Total Staff Member Card */}
          <div className="bg-white p-2 rounded shadow-md flex items-center justify-between transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-2 border-blue-500">
            {/* Icon Section */}
            <div className="w-8 h-8 flex items-center justify-center md:w-10 md:h-10">
              <Image 
                src="/icons/phd_candidate.svg" 
                alt="Total Staff Member Icon"
                width={32} 
                height={32} 
                className="w-8 h-8 md:w-10 md:h-10"
                quality={100} 
                priority 
              />
            </div>

            {/* Content Section */}
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Staff Member</p>
              <p className="text-2xl font-extrabold text-black">{staffMembersCount}</p>
            </div>
          </div>

        </div>



        {/* ------------------------Login Information------------------------ */}
        <div className="grid grid-cols-1 gap-4 mb-5">
          {/* Admin Info */}
          <div className="bg-gray-800 p-4 rounded shadow-lg">
          <div className="relative flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-500 text-center">
              Admin Login Activity
            </h2>
            <hr className="border-0 h-1 bg-gradient-to-r from-teal-400 to-orange-500 rounded w-full mb-6" />
          </div>

            <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-900 text-white rounded shadow-lg">
            <thead className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <th className="py-3 px-6 text-left text-white">Email</th>
                <th className="py-3 px-6 text-left text-white">Last Login</th>
                <th className="py-3 px-6 text-left text-white">Last Logout</th>
                <th className="py-3 px-6 text-left text-white">Login Count</th>
                <th className="py-3 px-6 text-left text-white">Status</th>
              </tr>
            </thead>
              <tbody className="text-gray-300">
                {admins.map((admin) => (
                  <tr key={admin.email} className="hover:bg-gray-800 transition duration-300 ease-in-out">
                    <td className="py-3 px-6 border-b border-gray-800 font-mono text-teal-400">{admin.email}</td>                   
                    <td className="py-3 px-6 border-b border-gray-800">{new Date(admin.last_login_time).toLocaleString()}</td>
                    <td className="py-3 px-6 border-b border-gray-800">{new Date(admin.last_logout_time).toLocaleString()}</td>                   
                    <td className="py-3 px-6 border-b border-gray-800 font-bold">
                      <span className="bg-gray-700/50 px-3 py-1 rounded text-sm">
                        {admin.login_count}
                      </span>
                    </td>
                    <td className="py-3 px-6 border-b border-gray-800">
                          <motion.span
                            className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase ${
                              admin.status === 'Active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {admin.status === 'Active' ? (
                              <>
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-ping" />
                                Active
                              </>
                            ) : (
                              'Idle'
                            )}
                          </motion.span>
                        </td>
                  </tr>
                ))}
              </tbody>
            </table>

            </div>
          </div>
        </div>




        {/* ------------------------Member Login Information------------------------ */}
        <div className="grid grid-cols-1 gap-4 mb-5">
          <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded shadow-2xl border border-gray-700/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-orange-500/10 pointer-events-none" />
            <div className="relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col items-center mb-6">
                <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400 text-center">
                  Member Login Activity
                </h2>
                  <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-orange-400 rounded mt-2" />
                </div>
              </motion.div>

              <div className="overflow-x-auto rounded border border-gray-700/50 shadow-2xl">
                <table className="min-w-full bg-gray-900/50 backdrop-blur-sm">
                <thead className="text-sm font-semibold text-gray-200 uppercase tracking-wider sticky top-0 z-20">
                  <motion.tr 
                    className="bg-gradient-to-r from-blue-600/80 to-indigo-600/80 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {["ID", "Email", "Last Login", "Last Logout", "Login Date", "Count", "Status"].map((header) => (
                      <th 
                        key={header}
                        className="py-4 px-6 text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{header}</span>
                          {["Last Login", "Last Logout", "Login Date", "Count", "Status"].includes(header)}
                        </div>
                      </th>
                    ))}
                  </motion.tr>
                </thead>

                  <tbody className="text-gray-300 divide-y divide-gray-700/50">
                    {memberLoginInfoTrackers.map((tracker, index) => (
                      <motion.tr
                        key={tracker.email}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-800/30 transition-all duration-300 group"
                      >
                        <td className="py-4 px-6 font-mono text-teal-400">{tracker.id}</td>
                        <td className="py-4 px-6 max-w-xs truncate hover:text-clip">{tracker.email}</td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {new Date(tracker.last_login_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          {new Date(tracker.last_logout_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>

                        <td className="py-4 px-6">
                          {new Date(tracker.last_login_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>

                        <td className="py-4 px-6 font-bold">
                          <span className="bg-gray-700/50 px-3 py-1 rounded text-sm">
                            {tracker.total_login_count}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <motion.span
                            className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase ${
                              tracker.login_state === 'Active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {tracker.login_state === 'Active' ? (
                              <>
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-ping" />
                                Active
                              </>
                            ) : (
                              'Idle'
                            )}
                          </motion.span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Floating Elements for Decoration */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
          </div>
        </div>


        {/* ------------------------Director Login Information------------------------ */}
        <div className="grid grid-cols-1 gap-4 mb-5">
          <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded shadow-2xl border border-gray-700/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-orange-500/10 pointer-events-none" />
            <div className="relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col items-center mb-6">
                <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400 text-center">
                  Director Login Activity
                </h2>
                  <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-orange-400 rounded mt-2" />
                </div>
              </motion.div>

              <div className="overflow-x-auto rounded border border-gray-700/50 shadow-2xl">
                <table className="min-w-full bg-gray-900/50 backdrop-blur-sm">
                <thead className="text-sm font-semibold text-gray-200 uppercase tracking-wider sticky top-0 z-20">
                  <motion.tr 
                    className="bg-gradient-to-r from-blue-600/80 to-indigo-600/80 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {["ID", "Email", "Last Login", "Last Logout", "Login Date", "Count", "Status"].map((header) => (
                      <th 
                        key={header}
                        className="py-4 px-6 text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{header}</span>
                          {["Last Login", "Last Logout", "Login Date", "Count", "Status"].includes(header)}
                        </div>
                      </th>
                    ))}
                  </motion.tr>
                </thead>

                  <tbody className="text-gray-300 divide-y divide-gray-700/50">
                    {directorLoginInfoTrackers.map((tracker, index) => (
                      <motion.tr
                        key={tracker.email}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-800/30 transition-all duration-300 group"
                      >
                        <td className="py-4 px-6 font-mono text-teal-400">{tracker.id}</td>
                        <td className="py-4 px-6 max-w-xs truncate hover:text-clip">{tracker.email}</td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {new Date(tracker.last_login_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          {new Date(tracker.last_logout_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>

                        <td className="py-4 px-6">
                          {new Date(tracker.last_login_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>

                        <td className="py-4 px-6 font-bold">
                          <span className="bg-gray-700/50 px-3 py-1 rounded text-sm">
                            {tracker.total_login_count}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <motion.span
                            className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase ${
                              tracker.login_state === 'Active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {tracker.login_state === 'Active' ? (
                              <>
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-ping" />
                                Active
                              </>
                            ) : (
                              'Idle'
                            )}
                          </motion.span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Floating Elements for Decoration */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
          </div>
        </div>




        {/* ------------------------Message Statistics and Member Statistics Side by Side------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {/* Message Statistics */}
          <div className="bg-gray-800 p-4 rounded shadow-lg">
            <DashboardMessageChart />
          </div>

          {/* Member Statistics */}
          <div className="bg-gray-800 px-4 pb-4 rounded shadow-lg">
            <DashboardMemberChart />
          </div>

        </div>




        {/* ------------------------Recent Subscribers and Recent Professors------ Side by Side------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Recent Subscribers */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-lg p-5 rounded border border-gray-700/30 relative overflow-hidden shadow-2xl transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none" />
            <div className="relative z-10">
              <motion.div 
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="mb-5"
              >
                <h2 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center">
                  <motion.span
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mr-2 text-white text-opacity-100"
                  >
                    👥
                  </motion.span>
                  Recent Subscribers
                </h2>
                <div className="h-0.5 bg-gradient-to-r from-blue-400/50 to-indigo-400/50 rounded" />
              </motion.div>

              <ul className="space-y-3">
                {recentSubscribers.map((subscriber, index) => (
                  <motion.li
                    key={subscriber.email}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-700/30 rounded border border-gray-600/50 backdrop-blur-sm hover:border-blue-400/30 transition-all group"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="text-sm font-medium text-gray-200 truncate block">
                        {subscriber.email}
                      </span>
                      {/* Subscribers Date Badge */}
                      <motion.div 
                        className="flex items-center space-x-1.5 mt-1 bg-gray-700/30 px-2 py-1 rounded w-max"
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-xs font-medium text-gray-300">
                        {new Date(subscriber.date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'long', // "February"
                        year: 'numeric' // "2025"
                      })}
                        </span>
                      </motion.div>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="flex-shrink-0"
                    >
                      <div className="bg-blue-500/20 text-blue-400 rounded px-2 md:px-3 py-1 text-xs font-bold flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse" />
                        Subscribed
                      </div>
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
              
              <motion.div whileHover={{ scale: 1.02 }} className="mt-4">
                <Link 
                  href="/dashboard/subscribers_list"
                  className="w-full text-center block bg-gray-700/50 hover:bg-gray-700/70 rounded p-2 text-sm font-medium text-blue-400 transition-all"
                >
                  View All Subscribers →
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Recent Professors */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-lg p-5 rounded border border-gray-700/30 relative overflow-hidden shadow-2xl transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 pointer-events-none" />
            <div className="relative z-10">
              <motion.div 
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="mb-5"
              >
                <h2 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center">
                  <motion.span
                    animate={{ rotate: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mr-2 text-white text-opacity-100"
                  >
                    🎓
                  </motion.span>
                  Recent Professors
                </h2>
                <div className="h-0.5 bg-gradient-to-r from-purple-400/50 to-indigo-400/50 rounded" />
              </motion.div>

              <ul className="space-y-3">
                {recentProfessors.map((professor, index) => (
                  <motion.li
                    key={professor.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-700/30 rounded border border-gray-600/50 backdrop-blur-sm hover:border-purple-400/30 transition-all group overflow-hidden"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="text-sm font-medium text-gray-200 truncate block">
                        {professor.email}
                      </span>
                      {/* Professors Join Date Badge */}
                      <motion.div 
                        className="flex items-center space-x-1.5 mt-1 bg-gray-700/30 px-2 py-1 rounded w-max"
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-xs font-medium text-gray-300">
                        {new Date(professor.joining_date).toLocaleDateString('en-US', {
                        day: '2-digit',       // Ensures two-digit day (e.g., "05")
                        month: 'long',        // Displays full month name (e.g., "February")
                        year: 'numeric'       // Displays full year (e.g., "2025")
                      })}
                        </span>
                      </motion.div>
                    </div>

                    <div className="flex-shrink-0 flex items-center space-x-2 min-w-max">
                      <motion.div 
                        className="bg-yellow-500/20 text-yellow-400 rounded px-2 md:px-3 py-1 text-xs font-bold truncate"
                      >
                        {professor.id}
                      </motion.div>
                      <motion.div 
                        className={`${
                          professor.status === 'Active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        } rounded px-2 md:px-3 py-1 text-xs font-bold flex items-center truncate`}
                      >
                        {professor.status === 'Active' && (
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                        )}
                        {professor.status}
                      </motion.div>
                    </div>
                  </motion.li>
                ))}
              </ul>

              <motion.div whileHover={{ scale: 1.02 }} className="mt-4">
                <Link 
                  href="/dashboard/professor_list"
                  className="w-full text-center block bg-gray-700/50 hover:bg-gray-700/70 rounded p-2 text-sm font-medium text-purple-400 transition-all"
                >
                  View All Professors →
                </Link>
              </motion.div>
            </div>
          </motion.div>
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

export default Dashboard;
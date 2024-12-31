// app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import withAuth from '../components/withAuth'; // Ensure correct path
import LoadingSpinner from '../components/LoadingSpinner'; // Add a loading spinner component
import DashboardMessageChart from '../components/DashboardMessage_chart'; // Add a loading spinner component
import axios from 'axios';
import Image from 'next/image';

const Dashboard = () => {
  const [subscribers, setSubscribers] = useState(0);
  const [users, setUsers] = useState([]);
  const [professorsCount, setProfessorsCount] = useState(0);
  const [messageCount, setMessagesCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProfessors, setRecentProfessors] = useState([]);
  const [recentSubscribers, setRecentSubscribers] = useState([]);
  const [admins, setAdmins] = useState([]); // State to manage admin data
  const [loading, setLoading] = useState(true); // State to manage loading
  const [currentLoginCount, setCurrentLoginCount] = useState(0); // State to manage current login count

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted

    async function fetchData() {
      setLoading(true); // Start loading
      try {
        const response = await axios.get('/api/dashboard');
        const result = response.data;
        if (isMounted) {
          setSubscribers(result.subscribers);
          setUsers(result.users);
          setProfessorsCount(result.professorCount);
          setMessagesCount(result.messageCount);
          setRecentSubscribers(result.recentSubscribers);
          setAdmins(result.admins); // Set admin data
          setRecentUsers(result.recentUsers);
          setRecentProfessors(result.recentProfessors);
          setCurrentLoginCount(result.currentLoginCount); // Set current login count
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

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const response = await axios.post('/api/dashboard', { userId, newStatus });

      if (response.status === 200) {
        const updatedUser = response.data;
        setUsers(users.map(user => (user.id === updatedUser.user.id ? updatedUser.user : user)));
        toast.success('User status updated successfully!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Error updating user status:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <main className="flex-1 p-3 md:p-4 lg:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
          {/* Total Users Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-4 border-blue-500">
            {/* Icon Section */}
            <div className="w-16 h-16 mr-3 flex items-center justify-center md:w-20 md:h-20">
            <Image 
              src="/icons/user.svg" // Image path
              alt="Total Users Icon" // Alt text
              width={64} // 16 * 4 = 64px width
              height={64} // 16 * 4 = 64px height
              className="w-16 h-16 md:w-20 md:h-20" // Tailwind classes for sizing
              quality={100} // Ensures maximum quality, by default Next.js optimizes images for performance but this ensures no compression
              priority // Ensures the image is loaded with high priority
            />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Total Users</p>
              <p className="text-3xl font-extrabold text-black mt-1">{users.length}</p>
            </div>
          </div>

          {/* Total Subscribers Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-4 border-green-500">
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
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-4 border-purple-500">
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

          {/* Total Messages Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-4 border-pink-500">
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
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out w-full border-4 border-indigo-500">
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

        {/* Login Information */}
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

        {/* Recent Users and Recent Subscribers Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Recent Users */}
          <div className="bg-gray-800 p-4 rounded shadow-lg">
            <div className="relative">
              <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
                Recent Approved Users
              </h2>
              <hr className="border-0 h-1 bg-gradient-to-r from-green-400 to-teal-500 rounded-full mb-6" />
            </div>
            <ul className="space-y-3">
              {recentUsers.map(user => (
                <li
                  key={user.email}
                  className="flex items-center justify-between p-3 rounded bg-gray-700 border border-gray-600 shadow-sm hover:bg-gray-600 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm font-semibold font-medium text-gray-200">{user.email}</p>
                      <p className="text-xs text-gray-400">Joined recently</p>
                    </div>
                  </div>
                  <button className="bg-green-600 text-white hover:bg-green-700 rounded px-4 py-1 text-xs font-medium">
                    Active
                  </button>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/users_list" className="block mt-3 text-center text-blue-400 hover:text-blue-500 text-sm">View All</Link>
          </div>

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
                  <button className="bg-blue-600 text-white hover:bg-blue-700 rounded px-2 py-1 text-xs font-medium">
                    Subscribed
                  </button>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/subscribers_list" className="block mt-3 text-center text-blue-400 hover:text-blue-500 text-sm">View All</Link>
          </div>

          
        </div>

        {/* Message Statistics and Recent Professors Side by Side */}
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

        {/* Approved Users and Users Waiting for Approval Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Users Waiting for Approval */}
          <div className="bg-gray-800 p-4 rounded shadow-lg">
            <div className="relative">
              <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                Waiting for Approval
              </h2>
              <hr className="border-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full mb-6" />
            </div>
            <ul className="space-y-2">
              {users.filter(user => user.status === 'pending').map(user => (
                <li key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded border border-gray-600 shadow-sm hover:bg-gray-600 transition">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-200">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateUserStatus(user.id, 'approved')}
                    className="bg-blue-600 text-white hover:bg-blue-700 rounded px-4 py-1 text-xs font-medium"
                  >
                    Approve
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Rejected Users */}
          <div className="bg-gray-800 p-4 rounded shadow-lg">
            <div className="relative">
              <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">
                Rejected Users
              </h2>
              <hr className="border-0 h-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mb-6" />
            </div>
            <ul className="space-y-2">
              {users.filter(user => user.status === 'rejected').map(user => (
                <li key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded border border-gray-600 shadow-sm hover:bg-gray-600 transition">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm font-semibold text-red-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateUserStatus(user.id, 'approved')}
                    className="bg-yellow-600 text-white hover:bg-yellow-700 rounded px-2 py-1 text-xs font-medium"
                  >
                    Force Approve
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(Dashboard);
// app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import withAuth from '../components/withAuth'; // Ensure correct path
import LoadingSpinner from '../components/LoadingSpinner'; // Add a loading spinner component
import axios from 'axios';

const Dashboard = () => {
  const [subscribers, setSubscribers] = useState(0);
  const [users, setUsers] = useState([]);
  const [professorsCount, setProfessorsCount] = useState(0);
  const [messageCount, setMessagesCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProfessors, setRecentProfessors] = useState([]);
  const [recentSubscribers, setRecentSubscribers] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading

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
          setRecentUsers(result.recentUsers);
          setRecentProfessors(result.recentProfessors);
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
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
  {/* Total Users Card */}
  <div className="bg-gradient-to-tl from-blue-500 to-blue-700 p-6 rounded-xl shadow-xl text-center flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
    <div className="w-16 h-16 mb-4 bg-white rounded-full flex items-center justify-center shadow-md">
      <img src="/icons/user_count.png" alt="Total Users Icon" className="w-10 h-10" />
    </div>
    <p className="text-sm font-medium text-gray-200 uppercase tracking-widest">Total Users</p>
    <p className="text-4xl font-extrabold text-white mt-2">{users.length}</p>
  </div>

  {/* Total Subscribers Card */}
  <div className="bg-gradient-to-tl from-green-500 to-green-700 p-6 rounded-xl shadow-xl text-center flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
    <div className="w-16 h-16 mb-4 bg-white rounded-full flex items-center justify-center shadow-md">
      <img src="/icons/subscribe_count.png" alt="Total Subscribers Icon" className="w-10 h-10" />
    </div>
    <p className="text-sm font-medium text-gray-200 uppercase tracking-widest">Total Subscribers</p>
    <p className="text-4xl font-extrabold text-white mt-2">{subscribers}</p>
  </div>

  {/* Total Professors Card */}
  <div className="bg-gradient-to-tl from-purple-500 to-purple-700 p-6 rounded-xl shadow-xl text-center flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
    <div className="w-16 h-16 mb-4 bg-white rounded-full flex items-center justify-center shadow-md">
      <img src="/icons/professor_count.png" alt="Total Professors Icon" className="w-10 h-10" />
    </div>
    <p className="text-sm font-medium text-gray-200 uppercase tracking-widest">Total Professors</p>
    <p className="text-4xl font-extrabold text-white mt-2">{professorsCount}</p>
  </div>

  {/* Total Messages Card */}
  <div className="bg-gradient-to-tl from-pink-500 to-pink-700 p-6 rounded-xl shadow-xl text-center flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
    <div className="w-16 h-16 mb-4 bg-white rounded-full flex items-center justify-center shadow-md">
      <img src="/icons/message_count.png" alt="Total Messages Icon" className="w-10 h-10" />
    </div>
    <p className="text-sm font-medium text-gray-200 uppercase tracking-widest">Total Messages</p>
    <p className="text-4xl font-extrabold text-white mt-2">{messageCount}</p>
  </div>

  {/* Total Messages Card - Variant 1 */}
<div className="bg-cover bg-center p-6 rounded-xl shadow-lg text-center flex flex-col items-center justify-center transform hover:scale-110 hover:shadow-2xl transition-transform duration-300 ease-in-out backdrop-blur-sm bg-white/30" style={{ backgroundImage: "url('/images/bg_1.png')" }}>
  <div className="w-16 h-16 mb-4 bg-white rounded-full flex items-center justify-center shadow-md">
    <img src="/icons/message_count.png" alt="Total Messages Icon" className="w-10 h-10" />
  </div>
  <p className="text-sm font-medium text-gray-100 uppercase tracking-widest">Total Messages</p>
  <p className="text-4xl font-bold text-white mt-2">{messageCount}</p>
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
                  <span className="text-sm font-semibold text-gray-200">{subscriber.email}</span>
                  <button className="bg-blue-600 text-white hover:bg-blue-700 rounded px-4 py-1 text-xs font-medium">
                    Subscribed
                  </button>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/subscribers_list" className="block mt-3 text-center text-blue-400 hover:text-blue-500 text-sm">View All</Link>
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
                    <span className="text-sm font-semibold text-gray-200">{professor.email}</span>
                  </div>
                  {/* Buttons container */}
                  <div className="flex space-x-2">
                    {/* Professor ID div */}
                    <div
                      className="bg-yellow-600 text-white rounded px-2 py-1 text-xs font-medium"
                    >
                      {professor.id}
                    </div>
                    {/* Professor Status div */}
                    <div
                      className="bg-green-600 text-white rounded px-2 py-1 text-xs font-medium"
                    >
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
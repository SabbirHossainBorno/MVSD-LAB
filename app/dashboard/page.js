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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
          {/* Total Users Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out max-w-xs border-4 border-blue-500">
            {/* Icon Section */}
            <div className="w-20 h-20 mr-3 flex items-center justify-center">
              <img src="/icons/user_count.png" alt="Total Users Icon" className="w-16 h-16" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Total Users</p>
              <p className="text-3xl font-extrabold text-black mt-1">{users.length}</p>
            </div>
          </div>

          {/* Total Subscribers Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out max-w-xs border-4 border-green-500">
            {/* Icon Section */}
            <div className="w-20 h-20 mr-3 flex items-center justify-center">
              <img src="/icons/subscribe_count.png" alt="Total Subscribers Icon" className="w-16 h-16" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Total Subscribers</p>
              <p className="text-3xl font-extrabold text-black mt-1">{subscribers}</p>
            </div>
          </div>

          {/* Total Professors Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out max-w-xs border-4 border-purple-500">
            {/* Icon Section */}
            <div className="w-20 h-20 mr-3 flex items-center justify-center">
              <img src="/icons/professor_count.png" alt="Total Professors Icon" className="w-16 h-16" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Total Professors</p>
              <p className="text-3xl font-extrabold text-black mt-1">{professorsCount}</p>
            </div>
          </div>

          {/* Total Messages Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out max-w-xs border-4 border-pink-500">
            {/* Icon Section */}
            <div className="w-20 h-20 mr-3 flex items-center justify-center">
              <img src="/icons/message_count.png" alt="Total Messages Icon" className="w-16 h-16" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Total Messages</p>
              <p className="text-3xl font-extrabold text-black mt-1">{messageCount}</p>
            </div>
          </div>

          {/* Custom Card */}
          <div className="bg-white p-4 rounded shadow-xl text-center flex items-center justify-start transform hover:scale-105 transition-transform duration-300 ease-in-out max-w-xs border-4 border-indigo-500">
            {/* Icon Section */}
            <div className="w-20 h-20 mr-3 flex items-center justify-center">
              <img src="/icons/message_count.png" alt="Custom Icon" className="w-16 h-16" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-left font-medium text-gray-700 uppercase tracking-widest">Custom Label</p>
              <p className="text-3xl font-extrabold text-black mt-1">00</p>
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
              <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-
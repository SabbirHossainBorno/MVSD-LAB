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
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProfessors, setRecentProfessors] = useState([]);
  const [recentSubscribers, setRecentSubscribers] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted

    async function fetchData() {
      setLoading(true); // Start loading
      try {
        console.log('MVSD LAB DASHBOARD\n------------------------------------\nFetching Dashboard Data.\nEmail : admin@mvsdlab.com');
        const response = await axios.get('/api/dashboard');
        const result = response.data;
        if (isMounted) {
          setSubscribers(result.subscribers);
          setUsers(result.users);
          setProfessorsCount(result.professorCount);
          setRecentSubscribers(result.recentSubscribers);
          setRecentUsers(result.recentUsers);
          setRecentProfessors(result.recentProfessors);
          console.log('MVSD LAB DASHBOARD\n------------------------------------\nDashboard Data Fetched Successfully.\nEmail : admin@mvsdlab.com');
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-5">
          {/* Total Users Card */}
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 rounded shadow-lg text-center flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <p className="text-sm font-medium text-gray-100 uppercase">Total Users</p>
            <p className="text-3xl font-bold text-white mt-2">{users.length}</p>
          </div>

          {/* Total Subscribers Card */}
          <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 rounded shadow-lg text-center flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <p className="text-sm font-medium text-gray-100 uppercase">Total Subscribers</p>
            <p className="text-3xl font-bold text-white mt-2">{subscribers}</p>
          </div>

          {/* Total Professors Card */}
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-6 rounded shadow-lg text-center flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <p className="text-sm font-medium text-gray-100 uppercase">Total Professors</p>
            <p className="text-3xl font-bold text-white mt-2">{professorsCount}</p>
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
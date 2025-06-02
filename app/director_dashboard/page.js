'use client';

import { Suspense, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

// Mock data for dashboard stats
const statsData = [
  { title: "Pending Approvals", value: 12, change: "+2", icon: "📝" },
  { title: "Research Proposals", value: 8, change: "+3", icon: "🔬" },
  { title: "Budget Requests", value: "₹1,85,000", change: "-₹15K", icon: "💰" },
  { title: "Active Members", value: 24, change: "+1", icon: "👥" }
];

// Mock data for pending approvals
const approvalsData = [
  { id: 1, name: "John Researcher", type: "Research Proposal", date: "2 hours ago" },
  { id: 2, name: "Sarah Analyst", type: "Budget Request", date: "5 hours ago" },
  { id: 3, name: "Michael Engineer", type: "Publication", date: "1 day ago" },
  { id: 4, name: "Emma Scientist", type: "Equipment Purchase", date: "2 days ago" }
];

// Mock data for recent activity
const activityData = [
  { id: 1, action: "Approved research proposal", user: "Dr. Smith", time: "10:30 AM" },
  { id: 2, action: "Rejected budget request", user: "Dr. Johnson", time: "Yesterday" },
  { id: 3, action: "Added new lab member", user: "Dr. Williams", time: "2 days ago" },
  { id: 4, action: "Updated lab policies", user: "Dr. Brown", time: "3 days ago" }
];

// Dashboard Stats Component
function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <div 
          key={index} 
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600 transition-all hover:shadow-xl"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">{stat.value}</h3>
            </div>
            <span className="text-3xl">{stat.icon}</span>
          </div>
          <p className="text-sm mt-3">
            <span className={`${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'} font-medium`}>
              {stat.change}
            </span> 
            <span className="text-gray-500 dark:text-gray-400 ml-1">since last week</span>
          </p>
        </div>
      ))}
    </div>
  );
}

// Pending Approvals Component
function PendingApprovals() {
  const [selected, setSelected] = useState([]);
  
  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };
  
  const approveSelected = () => {
    // In a real app, this would call an API
    console.log(`Approved items: ${selected.join(', ')}`);
    setSelected([]);
  };
  
  const rejectSelected = () => {
    // In a real app, this would call an API
    console.log(`Rejected items: ${selected.join(', ')}`);
    setSelected([]);
  };
  
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="font-medium text-gray-700 dark:text-gray-300">
          {selected.length} selected
        </h3>
        <div className="space-x-2">
          <button 
            onClick={approveSelected}
            disabled={selected.length === 0}
            className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-md disabled:opacity-50 hover:bg-green-600 transition"
          >
            Approve
          </button>
          <button 
            onClick={rejectSelected}
            disabled={selected.length === 0}
            className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-md disabled:opacity-50 hover:bg-red-600 transition"
          >
            Reject
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {approvalsData.map(item => (
          <div 
            key={item.id} 
            className={`flex items-center p-3 rounded-lg border ${
              selected.includes(item.id) 
                ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700' 
                : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600'
            }`}
          >
            <input 
              type="checkbox" 
              checked={selected.includes(item.id)}
              onChange={() => toggleSelect(item.id)}
              className="h-4 w-4 text-blue-600 rounded mr-3"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">{item.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.type}</p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{item.date}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
          View all pending requests
        </button>
      </div>
    </div>
  );
}

// Recent Activity Component
function RecentActivity() {
  const getActionColor = (action) => {
    if (action.includes("Approved")) return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    if (action.includes("Rejected")) return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
  };
  
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
      
      <div className="space-y-4 pl-8">
        {activityData.map(activity => (
          <div key={activity.id} className="relative">
            <div className="absolute left-[-22px] top-1 w-3 h-3 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900"></div>
            <div className={`text-xs font-medium inline-block px-2 py-1 rounded-full mb-1 ${getActionColor(activity.action)}`}>
              {activity.action}
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">by {activity.user}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <button className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <span>Show full activity log</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function DirectorDashboard() {
  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Director Dashboard
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last login: Today at 09:45 AM
        </div>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardStats />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Pending Approvals
            </h2>
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {approvalsData.length} new
            </span>
          </div>
          <PendingApprovals />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Recent Activity
          </h2>
          <RecentActivity />
        </div>
      </div>
      
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1 mb-6 md:mb-0 md:pr-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Lab Performance Report
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Quarterly research performance analysis is ready for your review
            </p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center">
              <span>View Full Report</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="w-full md:w-auto">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 md:w-64" />
          </div>
        </div>
      </div>
    </div>
  );
}
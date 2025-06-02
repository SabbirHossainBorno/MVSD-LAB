'use client';

import { Suspense, useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import PublicationModal from '@/components/PublicationModal';

// Dashboard Stats Component
function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { 
          title: "Pending Approvals", 
          value: stats.pendingApprovals, 
          icon: "📝",
          bg: "from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30",
          text: "text-yellow-800 dark:text-yellow-200"
        },
        { 
          title: "Research Proposals", 
          value: stats.pendingProposals, 
          icon: "🔬",
          bg: "from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30",
          text: "text-blue-800 dark:text-blue-200"
        },
        { 
          title: "Budget Requests", 
          value: stats.pendingBudgets, 
          icon: "💰",
          bg: "from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30",
          text: "text-green-800 dark:text-green-200"
        },
        { 
          title: "Active Members", 
          value: stats.activeMembers, 
          icon: "👥",
          bg: "from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30",
          text: "text-purple-800 dark:text-purple-200"
        }
      ].map((stat, index) => (
        <div 
          key={index} 
          className={`bg-gradient-to-br ${stat.bg} rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600 transition-all hover:shadow-xl`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{stat.title}</p>
              <h3 className={`text-2xl font-bold mt-1 ${stat.text}`}>{stat.value}</h3>
            </div>
            <span className="text-3xl">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Pending Approvals Component
function PendingApprovals({ approvals }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Pending Approvals
        </h2>
        <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
          {approvals.length} new
        </span>
      </div>
      
      <div className="space-y-4">
        {approvals.map(item => (
          <div 
            key={item.id}
            className="flex items-center p-3 rounded-lg border bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">{item.requester_name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.request_type}</p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(item.submitted_at).toLocaleDateString()}
            </div>
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
function RecentActivity({ activities }) {
  const getActionColor = (action) => {
    if (action.includes("Approved")) return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    if (action.includes("Rejected")) return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Recent Activity
      </h2>
      
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        
        <div className="space-y-4 pl-8">
          {activities.map(activity => (
            <div key={activity.id} className="relative">
              <div className="absolute left-[-22px] top-1 w-3 h-3 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900"></div>
              <div className={`text-xs font-medium inline-block px-2 py-1 rounded-full mb-1 ${getActionColor(activity.activity_type)}`}>
                {activity.activity_type}
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-300">{activity.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
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
    </div>
  );
}

// Publication Stats Component
function PublicationStats({ stats }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Publications & Research
        </h2>
        <a href="/director_dashboard/publications" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
          View All
        </a>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {[
          { status: 'Approved', value: stats.approved, color: 'green' },
          { status: 'Pending', value: stats.pending, color: 'yellow' },
          { status: 'Rejected', value: stats.rejected, color: 'red' }
        ].map((stat, index) => (
          <div 
            key={index} 
            className={`bg-${stat.color}-50 dark:bg-${stat.color}-900/30 p-4 rounded-lg text-center`}
          >
            <div className={`text-2xl font-bold text-${stat.color}-800 dark:text-${stat.color}-200`}>
              {stat.value}
            </div>
            <div className={`text-sm text-${stat.color}-600 dark:text-${stat.color}-400`}>
              {stat.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Latest Publications Component
function LatestPublications({ publications }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Latest Publications
      </h2>
      
      <div className="space-y-4">
        {publications.map(pub => (
          <div key={pub.pub_res_id} className="flex items-start p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white">{pub.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pub.type} • {new Date(pub.published_date).toLocaleDateString()}
              </p>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  pub.approval_status === 'Approved' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : pub.approval_status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {pub.approval_status}
                </span>
              </div>
            </div>
            <a 
              href={`/director_dashboard/publications/${pub.pub_res_id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              View
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Dashboard Component
function DirectorDashboard() {
  const [stats, setStats] = useState({
    pendingProposals: 0,
    pendingBudgets: 0,
    pendingPublications: 0,
    activeMembers: 0,
    pendingApprovals: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [publicationStats, setPublicationStats] = useState({
    approved: 0,
    pending: 0,
    rejected: 0
  });
  
  const [latestPublications, setLatestPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mock data for demonstration
  const mockApprovals = [
    { id: 1, request_type: "Research Proposal", requester_name: "John Researcher", submitted_at: "2025-05-31T10:30:00Z" },
    { id: 2, request_type: "Budget Request", requester_name: "Sarah Analyst", submitted_at: "2025-05-31T08:45:00Z" },
    { id: 3, request_type: "Publication", requester_name: "Michael Engineer", submitted_at: "2025-05-30T14:20:00Z" }
  ];
  
  const mockActivity = [
    { id: 1, activity_type: "Approved research proposal", description: "Project: AI in Automotive", timestamp: "2025-05-31T09:15:00Z" },
    { id: 2, activity_type: "Rejected budget request", description: "Lab Equipment Purchase", timestamp: "2025-05-30T16:30:00Z" },
    { id: 3, activity_type: "Added new lab member", description: "Dr. Jane Smith", timestamp: "2025-05-29T11:20:00Z" }
  ];

  useEffect(() => {
    // Simulate API calls with mock data
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Set mock data
      setStats({
        pendingProposals: 8,
        pendingBudgets: 3,
        pendingPublications: 7,
        activeMembers: 24,
        pendingApprovals: mockApprovals.length
      });
      
      setApprovals(mockApprovals);
      setRecentActivity(mockActivity);
      
      setPublicationStats({
        approved: 12,
        pending: 5,
        rejected: 3
      });
      
      // Mock publication data based on your table structure
      setLatestPublications([
        {
          pub_res_id: "PUB07RESMVSD",
          phd_candidate_id: "PHDC06MVSD",
          type: "Journal Paper",
          title: "Advancements in AI for Automotive Systems",
          publishing_year: 2021,
          authors: ["John Doe", "Jane Smith"],
          published_date: "2025-05-08",
          link: "https://www.nature.com/articles/s41586-019-1666-5",
          document_path: "/Storage/Documents/PhD_Candidate/PUB07RESMVSD.pdf",
          approval_status: "Pending",
          created_at: "2025-05-29 17:23:46.396446",
          updated_at: "2025-05-29 17:23:46.396446",
          feedback: ""
        },
        {
          pub_res_id: "PUB08RESMVSD",
          phd_candidate_id: "PHDC06MVSD",
          type: "Conference Paper",
          title: "Machine Learning in Vehicle Dynamics",
          publishing_year: 2021,
          authors: ["Alice Johnson", "Bob Williams"],
          published_date: "2025-05-01",
          link: "https://www.nature.com/articles/s41586-019-1666-5",
          document_path: "/Storage/Documents/PhD_Candidate/PUB08RESMVSD.pdf",
          approval_status: "Pending",
          created_at: "2025-05-29 17:30:43.802326",
          updated_at: "2025-05-29 17:30:43.802326",
          feedback: ""
        }
      ]);
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

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
        <DashboardStats stats={stats} />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <PendingApprovals approvals={approvals} />
        <RecentActivity activities={recentActivity} />
      </div>
      
      <div className="mt-8">
        <PublicationStats stats={publicationStats} />
        <LatestPublications publications={latestPublications} />
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

// Wrap the dashboard with authentication
export default withAuth(DirectorDashboard, 'director');
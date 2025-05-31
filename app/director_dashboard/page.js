import { Suspense } from 'react';
import DashboardStats from '@/components/DirectorDashboardStats';
import RecentActivity from '@/components/DirectorRecentActivity';
import PendingApprovals from '@/components/PendingApprovals';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DirectorDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Director Dashboard
      </h1>
      
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardStats />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Pending Approvals
          </h2>
          <PendingApprovals />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Recent Activity
          </h2>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';

const SystemMonitoring = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/system_monitoring');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching system monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">System Monitoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1st Row */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">CPU Usage</h3>
          <p>{Array.isArray(data?.cpuUsage) ? data.cpuUsage.join(', ') : 'Loading...'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">RAM Usage</h3>
          <p>Total: {data?.ramUsage ? data.ramUsage.total : 'Loading...'} bytes</p>
          <p>Free: {data?.ramUsage ? data.ramUsage.free : 'Loading...'} bytes</p>
        </div>

        {/* 2nd Row */}
        <div className="col-span-2 bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Log Monitoring</h3>
          <pre>{data?.logMonitoring || 'Loading...'}</pre>
        </div>

        {/* 3rd Row */}
        <div className="col-span-2 bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Top Command</h3>
          <pre>{data?.topCommand || 'Loading...'}</pre>
        </div>

        {/* 4th Row */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Network</h3>
          <pre>{data?.network || 'Loading...'}</pre>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Storage</h3>
          <pre>{data?.storage || 'Loading...'}</pre>
        </div>

        {/* 5th Row */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Current Login Info</h3>
          <pre>{data?.currentLoginInfo || 'Loading...'}</pre>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Uptime</h3>
          <pre>{data?.uptime || 'Loading...'}</pre>
        </div>
      </div>
    </div>
  );
};

export default withAuth(SystemMonitoring);

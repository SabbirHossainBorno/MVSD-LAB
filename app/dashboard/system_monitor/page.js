// app/dashboard/system_monitor/page.js
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
        const response = await fetch('/api/system_monitor');
        const result = await response.json();
        console.log('Fetched data:', result);
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const intervalId = setInterval(fetchData, 1000); // Fetch data every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">System Monitoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">CPU Usage</h3>
          <p>Usage: {data.cpu.usage.toFixed(2)}%</p>
          <p>Load: {data.cpu.load.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">RAM Usage</h3>
          <p>Total: {data.ram.total} GB</p>
          <p>Free: {data.ram.free} GB</p>
        </div>
        <div className="col-span-2 bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Website Live Log</h3>
          <pre>{data.websiteLog.join('\n')}</pre>
        </div>
        <div className="col-span-2 bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">System Process</h3>
          <pre>{data.process}</pre>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Network</h3>
          <p>Download Speed: {data.network.download} kbps</p>
          <p>Upload Speed: {data.network.upload} kbps</p>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Storage</h3>
          <pre>{data.storage}</pre>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Current Login Info</h3>
          <pre>{data.loginInfo}</pre>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Uptime</h3>
          <p>{data.uptime}</p>
        </div>
      </div>
    </div>
  );
};

export default withAuth(SystemMonitoring);

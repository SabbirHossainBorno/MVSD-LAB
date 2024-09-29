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

  // Determine CPU usage color
  const getCpuUsageColor = (usage) => {
    if (usage < 70) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Determine RAM usage color
  const getRamUsageColor = (usage) => {
    if (usage < 70) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const cpuUsageColor = getCpuUsageColor(data.cpu.usage);
  const ramUsage = ((data.ram.total - data.ram.free) / data.ram.total) * 100;
  const ramUsageColor = getRamUsageColor(ramUsage);

  // Format numbers with commas
  const formatNumber = (number) => {
    return number.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">System Monitoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-gray-800 p-6 rounded shadow-md">
        <h3 className="text-xl font-bold mb-4">CPU Usage</h3>
            <div className={`p-6 rounded shadow-md ${cpuUsageColor}`}>
                <p>Current Usage : {data.cpu.usage.toFixed(0)}%</p>
            </div>
        </div>

        <div className="bg-gray-800 p-6 rounded shadow-md">
        <h3 className="text-xl font-bold mb-4">RAM Usage</h3>
            <div className={`p-6 rounded shadow-md ${ramUsageColor}`}>
                <p>Total Memory Usage : {ramUsage.toFixed(2)}%</p>
                <p>Total Server Ram   : {data.ram.total} GB</p>
                <p>Available          : {data.ram.free} GB</p>
            </div>
        </div>
        
        <div className="col-span-2 bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Website Live Log</h3>
          <div className="bg-black p-4 rounded overflow-auto max-h-100">
            <pre className="text-green-400 whitespace-pre-wrap">{data.websiteLog.join('\n')}</pre>
          </div>
        </div>
        <div className="col-span-2 bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">System Process</h3>
          <div className="bg-black p-4 rounded overflow-auto max-h-96">
            <pre className="text-yellow-400 whitespace-pre-wrap font-mono">{data.process}</pre>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Network</h3>
          <p>Download Speed: {formatNumber(data.network.download)} Mb/s</p>
          <p>Upload Speed: {formatNumber(data.network.upload)} Mb/s</p>
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

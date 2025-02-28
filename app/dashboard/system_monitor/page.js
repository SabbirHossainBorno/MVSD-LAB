// app/dashboard/system_monitor/page.js
'use client';

import { useEffect, useState } from 'react';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

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

  const cpuUsage = data && data.cpu ? data.cpu.usage.toFixed(0) : 0;
  const ramUsage = data && data.ram ? ((data.ram.total - data.ram.free) / data.ram.total) * 100 : 0;

  // Format numbers with commas
  const formatNumber = (number) => {
    return number.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">System Monitoring</h2>
      
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">

        {/* CPU Usage Section */}
        <div className="bg-gray-800 p-4 md:p-6 rounded shadow-md flex flex-col items-center">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">CPU Usage</h3>
          <div className="w-full bg-gray-700 rounded-full h-6 relative overflow-hidden">
            <div
              className={`h-6 rounded-full absolute top-0 left-0 ${
                cpuUsage < 70 ? 'bg-green-500' : cpuUsage < 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${cpuUsage}%`, transition: 'width 0.5s ease-in-out' }}
            ></div>
          </div>
          <p className="mt-2 text-gray-200 text-sm md:text-base">
            Current Usage: <span className="font-bold">{cpuUsage}%</span>
          </p>
          <p
            className={`mt-1 text-xs md:text-sm ${
              cpuUsage < 70 ? 'text-green-400' : cpuUsage < 80 ? 'text-yellow-400' : 'text-red-400'
            }`}
          >
            Status : {cpuUsage < 70 ? 'Healthy' : cpuUsage < 80 ? 'Moderate' : 'Critical'}
          </p>
        </div>

        {/* RAM Usage Section */}
        <div className="bg-gray-800 p-4 md:p-6 rounded shadow-md flex flex-col items-center">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">RAM Usage</h3>
          <div className="w-full bg-gray-700 rounded-full h-6 relative overflow-hidden">
            <div
              className={`h-6 rounded-full absolute top-0 left-0 ${
                ramUsage < 70 ? 'bg-green-500' : ramUsage < 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${ramUsage.toFixed(0)}%`, transition: 'width 0.5s ease-in-out' }}
            ></div>
          </div>
          <p className="mt-2 text-gray-200 text-sm md:text-base">
            Current Usage : <span className="font-bold">{ramUsage.toFixed(0)}%</span>
          </p>
          <div className="bg-gray-700 p-4 rounded mt-4 w-full">
            <p className="text-gray-200 text-xs md:text-sm">
              Total Server RAM : <span className="font-bold">{data && data.ram ? data.ram.total : 'N/A'} GB</span>
            </p>
            <p className="text-gray-200 text-xs md:text-sm">
              Available : <span className="font-bold">{data && data.ram ? data.ram.free : 'N/A'} GB</span>
            </p>
          </div>
        </div>


        {/* Live Log */}
        <div className="col-span-1 md:col-span-2 bg-gray-800 p-4 md:p-6 rounded shadow-md">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">Website Live Log</h3>
          <div className="bg-black p-4 rounded overflow-auto max-h-96 md:max-h-128">
            <pre className="text-green-400 whitespace-pre-wrap">{data && data.websiteLog ? data.websiteLog.join('\n') : 'N/A'}</pre>
          </div>
        </div>

        {/* System Process */}
        <div className="col-span-1 md:col-span-2 bg-gray-800 p-4 md:p-6 rounded shadow-md">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">System Process</h3>
          <div className="bg-black p-4 rounded overflow-auto max-h-48 md:max-h-96">
            <pre className="text-yellow-400 whitespace-pre-wrap font-mono">{data && data.process ? data.process : 'N/A'}</pre>
          </div>
        </div>

        {/* Network Info */}
        <div className="bg-gray-800 p-4 md:p-6 rounded shadow-md">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">Network</h3>
          {data && data.network ? (
            <>
              <div className="bg-gray-700 p-4 rounded mb-4">
                <p className="text-gray-200">
                  <span className="font-semibold">Download Speed :</span> {formatNumber(data.network.download)} Mb/s
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <p className="text-gray-200">
                  <span className="font-semibold">Upload Speed :</span> {formatNumber(data.network.upload)} Mb/s
                </p>
              </div>
            </>
          ) : (
            <p className="text-red-400">Network Data Unavailable</p>
          )}
        </div>

        {/* Storage Info */}
        <div className="bg-gray-800 p-4 md:p-6 rounded shadow-md overflow-x-auto">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">Storage</h3>
          <div className="bg-gray-700 p-4 rounded overflow-x-auto">
            <pre className="text-gray-200">{data && data.storage ? data.storage : 'N/A'}</pre>
          </div>
        </div>

        {/* Login Info */}
        <div className="bg-gray-800 p-4 md:p-6 rounded shadow-md overflow-x-auto">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">Current Login Info</h3>
          <div className="bg-gray-700 p-4 rounded overflow-x-auto">
            <pre className="text-gray-200">{data && data.loginInfo ? data.loginInfo : 'N/A'}</pre>
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-gray-800 p-4 md:p-6 rounded shadow-md overflow-x-auto">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-400">Uptime</h3>
          <div className="bg-gray-700 p-4 rounded overflow-x-auto">
            <p className="text-md md:text-lg text-gray-200">{data && data.uptime ? data.uptime : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(SystemMonitoring, 'admin'); // Pass 'admin' as the required role
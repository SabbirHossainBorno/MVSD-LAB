'use client';

import { useEffect, useState } from 'react';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import io from 'socket.io-client';

const SystemMonitoring = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [topCommand, setTopCommand] = useState('');

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
    const interval = setInterval(fetchData, 1000); // Fetch data every 1 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = io();

    socket.on('log', (data) => {
      setLogs((prevLogs) => [...prevLogs, data]);
    });

    socket.on('topCommand', (data) => {
      setTopCommand(data);
    });

    socket.emit('start'); // Start log monitoring

    return () => {
      socket.emit('stop'); // Stop log monitoring
      socket.disconnect();
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  const parseUptime = (uptimeString) => {
    const uptimeMatch = uptimeString.match(/up\s+((\d+)\s+days?,)?\s*(\d+):(\d+)/);
    const days = uptimeMatch?.[2] || 0;
    const hours = uptimeMatch?.[3] || 0;
    const minutes = uptimeMatch?.[4] || 0;
    return `${days} days, ${hours} hours, ${minutes} minutes`;
  };

  const parseNetworkStats = (networkString) => {
    const networkLines = networkString.trim().split('\n');
    const [upload, download] = networkLines[networkLines.length - 1].trim().split(/\s+/);
    return `Upload: ${upload} KB/s, Download: ${download} KB/s`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">System Monitoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1st Row */}
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">CPU Usage</h3>
          <p>{data?.cpuUsage ? `${(data.cpuUsage[0] * 100).toFixed(2)}% Load` : 'Loading...'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">RAM Usage</h3>
          <p>Total: {data?.ramUsage ? data.ramUsage.total : 'Loading...'} bytes</p>
          <p>Free: {data?.ramUsage ? data.ramUsage.free : 'Loading...'} bytes</p>
        </div>

        {/* 2nd Row */}
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Storage</h3>
          <pre>{data?.storage || 'Loading...'}</pre>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Network</h3>
          <pre>{data?.network ? parseNetworkStats(data.network) : 'Loading...'}</pre>
        </div>

        {/* 3rd Row */}
        <div className="col-span-2 bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Log Monitoring</h3>
          <div className="h-64 overflow-y-scroll bg-gray-900 p-4 rounded">
            {logs.map((log, index) => (
              <p key={index} className="text-sm">{log}</p>
            ))}
          </div>
        </div>

        {/* 4th Row */}
        <div className="col-span-2 bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Top Command</h3>
          <div className="h-64 overflow-y-scroll bg-gray-900 p-4 rounded">
            <pre>{topCommand || 'Loading...'}</pre>
          </div>
        </div>

        {/* 5th Row */}
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Current Login Info</h3>
          <pre>{data?.currentLoginInfo || 'Loading...'}</pre>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Uptime</h3>
          <pre>{data?.uptime ? parseUptime(data.uptime) : 'Loading...'}</pre>
        </div>
      </div>
    </div>
  );
};

export default withAuth(SystemMonitoring);

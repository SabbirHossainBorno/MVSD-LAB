'use client';

import { useEffect, useState } from 'react';
import withAuth from '../../components/withAuth';
import LoadingSpinner from '../../components/LoadingSpinner';

const SystemMonitoring = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logData, setLogData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/system_monitoring');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching system monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch initial data
    fetchData();

    // Set up WebSocket for real-time log updates
    const socket = new WebSocket('ws://localhost:3001'); // Adjust the URL as needed

    socket.onmessage = (event) => {
      setLogData((prevLogData) => [...prevLogData, event.data]);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup on component unmount
    return () => {
      socket.close();
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">System Monitoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">CPU Usage</h3>
          <p>{Array.isArray(data?.cpuUsage) ? data.cpuUsage.join(', ') : 'Loading...'}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">RAM Usage</h3>
          <p>Total: {data?.ramUsage.total || 'Loading...'} bytes</p>
          <p>Free: {data?.ramUsage.free || 'Loading...'} bytes</p>
        </div>
        <div className="col-span-2 bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Log Monitoring</h3>
          <pre>{logData.length ? logData.join('\n') : 'No logs available...'}</pre>
        </div>
        <div className="col-span-2 bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Top Command</h3>
          <pre>{data?.topCommand || 'Loading...'}</pre>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Network</h3>
          <pre>{data?.network || 'Loading...'}</pre>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Storage</h3>
          <pre>{data?.storage || 'Loading...'}</pre>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Current Login Info</h3>
          <pre>{data?.currentLoginInfo || 'Loading...'}</pre>
        </div>
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Uptime</h3>
          <pre>{data?.uptime || 'Loading...'}</pre>
        </div>
      </div>
    </div>
  );
};

export default withAuth(SystemMonitoring);

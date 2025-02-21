// app/components/DashboardMemberChart.js
import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function DashboardMemberChart() {
  const [chartData, setChartData] = useState({});
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      try {
        const response = await fetch('/api/chart');
        const data = await response.json();
        if (response.ok) {
          const labels = data.memberCounts.map(item => item.type);
          const counts = data.memberCounts.map(item => item.count);
          setTotalMembers(data.totalMembers);
          
          setChartData({
            labels,
            datasets: [{
              data: counts,
              backgroundColor: [
                '#3B82F6', // Blue
                '#10B981', // Green
                '#F59E0B', // Amber
                '#EF4444'  // Red
              ],
              borderWidth: 0,
              spacing: 2,
            }],
          });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchChartData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const percentage = Math.round(context.parsed / totalMembers * 100);
            return `${context.label}: ${context.parsed} members (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className="w-full mx-auto p-4 bg-gray-900 rounded border border-gray-800 shadow-2xl space-y-6">
      <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
              </div>
              <h2 className="text-2xl font-bold">Member Analytics</h2>
            </div>
            </div>
            <p></p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                <div className="bg-gray-800 px-4 py-2 rounded flex-1">
                    <p className="text-sm text-gray-400">Total Members</p>
                    <p className="text-2xl font-bold">{totalMembers}</p>
                </div>
            </div>

      <div className="relative h-72">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded">
            <div className="w-12 h-12 border-4 border-t-4 rounded-full animate-spin border-gray-200 border-t-blue-500"></div>
          </div>
        ) : (
          <>
            <Pie
              data={chartData}
              options={chartOptions}
              className="!w-full !h-full"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white-900">{totalMembers}</span>
              <span className="text-sm text-white-500">Total Members</span>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {chartData.labels?.map((label, index) => (
          <div 
            key={index}
            className="p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
              />
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </div>
            <div className="mt-2 ml-6">
              <p className="text-lg font-semibold text-gray-900">
                {chartData.datasets[0].data[index]}
                <span className="ml-2 text-sm text-gray-500">
                  ({Math.round(chartData.datasets[0].data[index] / totalMembers * 100)}%)
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardMemberChart;
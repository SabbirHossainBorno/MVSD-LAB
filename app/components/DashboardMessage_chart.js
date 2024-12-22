import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Registering the components required for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function DashboardMessageChart() {
  const [chartData, setChartData] = useState(null);
  const [selectedDays, setSelectedDays] = useState(7); // Default to 7 days
  const [loading, setLoading] = useState(true);
  const [percentageChange, setPercentageChange] = useState(0); // Assuming you have percentage change to display

  useEffect(() => {
    // Fetch chart data from the backend based on selectedDays
    async function fetchChartData() {
      try {
        const response = await fetch(`/api/chart?days=${selectedDays}`);
        const data = await response.json();
        if (response.ok) {
          setChartData(data.data);
          setPercentageChange(data.percentageChange); // Assuming the backend provides percentage change
        } else {
          console.error('Failed to fetch chart data:', data.message);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, [selectedDays]);

  const handleDaysChange = (event) => {
    setSelectedDays(Number(event.target.value));
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Messages Sent Over the Last ${selectedDays} Days`,
        color: '#ffffff', // Title color for dark theme
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw} messages`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#ffffff', // Axis title color for dark theme
        },
        ticks: {
          color: '#ffffff', // Axis tick color for dark theme
        },
      },
      y: {
        title: {
          display: true,
          text: 'Message Count',
          color: '#ffffff', // Axis title color for dark theme
        },
        ticks: {
          color: '#ffffff', // Axis tick color for dark theme
        },
        beginAtZero: true,
      },
    },
  };

  const chartDataFormatted = {
    labels: chartData ? chartData.map((item) => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) : [],
    datasets: [
      {
        label: 'Messages Sent',
        data: chartData ? chartData.map((item) => item.count) : [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="max-w-sm w-full bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <div className="flex justify-between">
        <div>
          <h5 className="leading-none text-3xl font-bold text-white pb-2">
            {chartData ? chartData.reduce((sum, item) => sum + item.count, 0) : 0} messages
          </h5>
          <p className="text-base font-normal text-gray-400">
            Messages in the last {selectedDays} days
          </p>
        </div>
        <div className="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500 text-center">
          {percentageChange}%
          <svg className="w-3 h-3 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13V1m0 0L1 5m4-4 4 4" />
          </svg>
        </div>
      </div>
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <Line data={chartDataFormatted} options={chartOptions} />
      )}
      <div className="mt-4 grid grid-cols-1 items-center border-t border-gray-700">
        <div className="flex justify-between items-center pt-5">
          <button
            onClick={(e) => setSelectedDays(7)}
            className="text-sm font-medium text-gray-400 hover:text-white"
          >
            Last 7 days
          </button>
          <button
            onClick={(e) => setSelectedDays(30)}
            className="text-sm font-medium text-gray-400 hover:text-white"
          >
            Last 30 days
          </button>
          <button
            onClick={(e) => setSelectedDays(90)}
            className="text-sm font-medium text-gray-400 hover:text-white"
          >
            Last 90 days
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardMessageChart;
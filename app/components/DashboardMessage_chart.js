import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

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
  const [chartData, setChartData] = useState([]);
  const [selectedDays, setSelectedDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [percentageChange, setPercentageChange] = useState(0);

  useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/chart?days=${selectedDays}`);
        const data = await response.json();
        if (response.ok) {
          setChartData(data.data);
          setPercentageChange(data.percentageChange);
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

  const handleDaysChange = (days) => {
    setSelectedDays(days);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw} Messages`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#A3A3A3',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#A3A3A3',
        },
        beginAtZero: true,
      },
    },
  };

  const chartDataFormatted = {
    labels: chartData.map((item) =>
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Messages',
        data: chartData.map((item) => item.count),
        borderColor: '#38BDF8',
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const totalMessages = chartData.reduce((sum, item) => sum + parseInt(item.count, 10), 0);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 rounded-lg shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-4xl font-bold mb-1">{totalMessages}</h3>
          <p className="text-sm text-gray-400">Messages in the last {selectedDays} days</p>
        </div>
        <div className="flex space-x-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => handleDaysChange(days)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors 
                ${selectedDays === days ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {loading ? (
          <div className="flex justify-center items-center h-56">
            <div className="w-8 h-8 border-4 border-t-4 border-gray-200 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="h-56">
            <Line data={chartDataFormatted} options={chartOptions} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-3 rounded-md">
          <p className="text-sm text-gray-400">Average Messages</p>
          <p className="text-xl font-bold">{Math.round(totalMessages / selectedDays)}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-md">
          <p className="text-sm text-gray-400">Highest Daily Messages</p>
          <p className="text-xl font-bold">
            {Math.max(...chartData.map((item) => item.count)) || 0}
          </p>
        </div>
        <div className="bg-gray-800 p-3 rounded-md">
          <p className="text-sm text-gray-400">Percentage Change</p>
          <p className={`text-xl font-bold ${percentageChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {percentageChange.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardMessageChart;

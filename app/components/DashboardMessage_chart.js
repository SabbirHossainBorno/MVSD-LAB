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

  useEffect(() => {
    // Fetch chart data from the backend based on selectedDays
    async function fetchChartData() {
      try {
        const response = await fetch(`/api/chart?days=${selectedDays}`);
        const data = await response.json();
        if (response.ok) {
          setChartData(data.data);
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
        },
      },
      y: {
        title: {
          display: true,
          text: 'Message Count',
        },
        beginAtZero: true,
      },
    },
  };

  const chartDataFormatted = {
    labels: chartData ? chartData.map((item) => item.date) : [],
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
    <div className="p-4 bg-white rounded shadow-md">
      <div className="mb-4 flex items-center">
        <label htmlFor="days" className="mr-2 text-gray-700">Select Days:</label>
        <select
          id="days"
          value={selectedDays}
          onChange={handleDaysChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Line data={chartDataFormatted} options={chartOptions} />
      )}
    </div>
  );
}

export default DashboardMessageChart;

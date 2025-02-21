// app/components/DashboardMessage_chart.js
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
  Filler,
} from 'chart.js';
import 'chartjs-plugin-crosshair';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin,
  zoomPlugin
);

function DashboardMessageChart() {
  const [chartData, setChartData] = useState([]);
  const [selectedDays, setSelectedDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [percentageChange, setPercentageChange] = useState(0);
  const [allTimeTotal, setAllTimeTotal] = useState(0);

  useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/chart?days=${selectedDays}`);
        const data = await response.json();
        if (response.ok) {
          setChartData(data.data);
          setPercentageChange(data.percentageChange);
          setAllTimeTotal(data.allTimeTotal);
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
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#E5E7EB',
        bodyColor: '#F9FAFB',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} Messages`,
          title: (items) => new Date(items[0].label).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        }
      },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x',
        },
        pan: { enabled: true, mode: 'x' },
        limits: { x: { min: 'original', max: 'original' } }
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            yMin: 0,
            yMax: 0,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 2,
            borderDash: [4, 4],
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: '#9CA3AF',
          maxRotation: 0,
          autoSkipPadding: 20
        },
      },
      y: {
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: { 
          color: '#9CA3AF',
          padding: 10,
          callback: (value) => value === 0 ? value : `${value}`
        },
        beginAtZero: true
      }
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
        backgroundColor: '#38BDF8',
        borderWidth: 2,
        hoverBorderWidth: 3
      },
      line: {
        borderWidth: 2,
        tension: 0.4
      }
    }
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
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
          gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
          return gradient;
        },
        fill: true,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#38BDF8',
      },
    ],
  };

  const totalMessages = chartData.reduce((sum, item) => sum + parseInt(item.count, 10), 0);

  return (
    <div className="w-full mx-auto p-4 bg-gray-900 rounded border border-gray-800 shadow-2xl space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            Message Analytics
          </h2>
          <p className="text-sm text-gray-400">Messages over selected period</p>
        </div>

        <div className="flex gap-2 bg-gray-800 p-1 rounded">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => handleDaysChange(days)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                selectedDays === days 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>
          {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-800 rounded">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Selected Period</p>
              <p className="text-2xl font-bold text-gray-100">{totalMessages}</p>
            </div>
            <div className="text-blue-400 bg-blue-900/30 p-2 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-800 rounded">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">All Time Total</p>
              <p className="text-2xl font-bold text-gray-100">{allTimeTotal}</p>
            </div>
            <div className="text-purple-400 bg-purple-900/30 p-2 rounded-">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
      </div>
        </div>
      </div>

      <div className="relative h-64 lg:h-80">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded">
            <div className="w-12 h-12 border-4 border-t-4 border-gray-600 rounded-full animate-spin border-t-blue-500"></div>
          </div>
        ) : (
          <Line 
            data={chartDataFormatted} 
            options={chartOptions} 
            className="!w-full !h-full"
          />
        )}
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-2 rounded border border-gray-800">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-500/10 rounded">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Daily Average</p>
            </div>
            <p className="text-xl font-bold mt-2">{Math.round(totalMessages / selectedDays)}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-2 rounded border border-gray-800">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-green-500/10 rounded">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Highest Peak</p>
            </div>
            <p className="text-xl font-bold mt-2">{Math.max(...chartData.map((item) => item.count)) || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-2 rounded border border-gray-800">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-purple-500/10 rounded">
                <svg className={`w-5 h-5 ${percentageChange >= 0 ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={percentageChange >= 0 ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Trend Change</p>
            </div>
            <p className={`text-xl font-bold mt-2 ${percentageChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
            </p>
          </div>
      </div>
    </div>
  );
}

export default DashboardMessageChart;
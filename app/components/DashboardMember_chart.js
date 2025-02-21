// app/components/DashboardMemberChart.js
import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

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
          const total = data.totalMembers;
          setTotalMembers(total);
          
          setChartData({
            labels,
            datasets: [{
              label: 'Members',
              data: counts,
              backgroundColor: [
                'rgba(56, 189, 248, 0.8)',
                'rgba(52, 211, 153, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(244, 63, 94, 0.8)'
              ],
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 2,
              hoverBorderColor: 'rgba(255, 255, 255, 0.7)',
              hoverOffset: 8,
              spacing: 2,
              borderRadius: 6,
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
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#E5E7EB',
          font: { size: 14 },
          padding: 16,
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: `${label}: ${data.datasets[0].data[i]} (${Math.round(data.datasets[0].data[i] / totalMembers * 100)}%)`,
              fillStyle: data.datasets[0].backgroundColor[i],
              strokeStyle: data.datasets[0].borderColor,
              lineWidth: 1,
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#E5E7EB',
        bodyColor: '#F9FAFB',
        bodyFont: { size: 14 },
        titleFont: { size: 16 },
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = Math.round((value / totalMembers) * 100);
            return `${label}: ${value} members (${percentage}%)`;
          }
        }
      },
      datalabels: {
        color: '#E5E7EB',
        font: { size: 14, weight: 'bold' },
        formatter: (value) => Math.round((value / totalMembers) * 100) + '%'
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuint'
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-gray-900 rounded border border-gray-800 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="p-2 bg-gray-800 rounded">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-100">Member Distribution</h2>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
            <div className="bg-gray-800 px-4 py-2 rounded flex-1">
                <p className="text-sm text-gray-400">Total Members</p>
                <p className="text-2xl font-bold">{totalMembers}</p>
            </div>
        </div>

      <div className="relative h-80 w-full">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded">
            <div className="w-12 h-12 border-4 border-t-4 border-gray-600 rounded-full animate-spin border-t-blue-500"></div>
          </div>
        ) : (
          <Pie
            data={chartData}
            options={chartOptions}
            plugins={[{
              id: 'centerText',
              beforeDraw: (chart) => {
                const { ctx, chartArea: { width, height } } = chart;
                ctx.save();
                ctx.font = 'bold 24px sans-serif';
                ctx.fillStyle = '#E5E7EB';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(totalMembers, width / 2, height / 2);
                ctx.restore();
              }
            }]}
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '400px',
              maxHeight: '400px',
              margin: '0 auto',
            }}
          />
        )}
      </div>
    </div>
  );
}

export default DashboardMemberChart;
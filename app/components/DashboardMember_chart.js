// app/components/DashboardMemberChart.js
import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion, useAnimation } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardMemberChart = () => {
  const [chartData, setChartData] = useState({});
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const controls = useAnimation();

  useEffect(() => {
    const fetchChartData = async () => {
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
                'hsl(217, 91%, 60%)',  // Blue
                'hsl(160, 84%, 39%)',  // Green
                'hsl(38, 92%, 50%)',   // Amber
                'hsl(0, 84%, 60%)'     // Red
              ],
              borderWidth: 0,
              spacing: 2,
              hoverOffset: 20,
            }],
          });
          controls.start({
            opacity: 1,
            transition: { duration: 0.5 }
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [controls]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'hsla(220, 13%, 18%, 0.95)',
        bodyColor: 'hsl(0, 0%, 100%)',
        borderColor: 'hsl(215, 14%, 34%)',
        borderWidth: 1,
        padding: 16,
        bodyFont: { size: 14 },
        callbacks: {
          label: (context) => {
            const percentage = Math.round(context.parsed / totalMembers * 100);
            return ` ${context.label}: ${context.parsed} members (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutElastic',
      animateRotate: true,
      animateScale: true
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className="w-full mx-auto p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded border border-gray-700 shadow-2xl space-y-4 overflow-hidden relative"
    >
      {/* Glowing Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-amber-500/20 to-red-500/20 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />
      </div>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Member Analytics
          </h2>
          <p className="text-sm text-gray-400 font-medium">
            Dynamic Membership Distribution Overview
          </p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-gray-800/50 px-6 py-3 rounded border border-gray-700 backdrop-blur-sm shadow-lg"
        >
          <p className="text-sm text-gray-300 font-medium">Total Members</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {totalMembers}
          </p>
        </motion.div>
      </motion.div>

      {/* Chart Container */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="relative h-80 w-full group z-10"
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="w-14 h-14 border-4 border-t-4 rounded-full border-gray-700 border-t-blue-500"
            />
          </div>
        ) : (
          <>
            <Pie
              data={chartData}
              options={chartOptions}
              className="!w-full !h-full transform group-hover:scale-[1.02] transition-transform"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.span 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              >
                {totalMembers}
              </motion.span>
              <motion.span 
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-sm text-gray-400 font-medium mt-1"
              >
                Total Members
              </motion.span>
            </div>
          </>
        )}
      </motion.div>

      {/* Enhanced Animated Legend Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 relative z-10"
      >
        {chartData.labels?.map((label, index) => {
          const percentage = Math.round(chartData.datasets[0].data[index] / totalMembers * 100);
          const color = chartData.datasets[0].backgroundColor[index];
          
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              whileHover={{ 
                y: -5,
                transition: { type: 'spring', stiffness: 300 }
              }}
              className="p-5 bg-gray-800/50 rounded border border-gray-700 backdrop-blur-sm hover:border-blue-400/30 transition-all relative overflow-hidden group"
              style={{
                borderLeft: `4px solid ${color}`,
                boxShadow: `0 4px 30px -15px ${color}33`
              }}
            >
              {/* Color Indicator Bar */}
              <div 
                className="absolute inset-y-0 left-0 w-1 opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ backgroundColor: color }}
              />
              
              <div className="flex items-center justify-between gap-4 relative">
                <div className="flex items-center gap-3">
                  {/* Animated Color Dot */}
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 20, -20, 0],
                      boxShadow: `0 0 12px ${color}`
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 4,
                      delay: index * 0.3
                    }}
                    className="w-3 h-3 rounded-full relative"
                    style={{ backgroundColor: color }}
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-[1px]" />
                  </motion.div>
                  
                  <div>
                    <span className="text-sm font-semibold text-gray-200 block">{label}</span>
                    <span 
                      className="text-xs font-medium text-gray-400 block mt-1"
                      style={{ color: `${color}dd` }}
                    >
                      {chartData.datasets[0].data[index]} Members
                    </span>
                  </div>
                </div>
                
                {/* Percentage Badge */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                  style={{
                    backgroundColor: `${color}15`,
                    color: color
                  }}
                >
                  {percentage}%
                </motion.div>
              </div>

              {/* Animated Progress Bar */}
              <div className="mt-4 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                  className="h-full rounded-full relative"
                  style={{ backgroundColor: color }}
                >
                  <div className="absolute inset-0 bg-white/20 blur-[2px]" />
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  );
};

export default DashboardMemberChart;
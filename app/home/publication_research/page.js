//app/home/publication/page.js
'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ScrollToTop from '../../components/ScrollToTop';
import Link from 'next/link';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Fix for font rendering issues
ChartJS.defaults.font.family = "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif";
ChartJS.defaults.font.size = 13;
ChartJS.defaults.color = '#4b5563';

export default function Publication() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTimeframe, setActiveTimeframe] = useState('overall');

  // Fetch publication summary data
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/home/publication_research/summary');
        
        if (!response.ok) {
          throw new Error('Failed to fetch publication summary data');
        }
        
        const data = await response.json();
        setSummaryData(data);
      } catch (err) {
        console.error('Error fetching publication summary:', err);
        setError('Failed to load publication data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Simulate minimum loading time for better UX
    const timer = setTimeout(() => {
      fetchSummaryData();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-white text-gray-900 min-h-screen">        
        <Navbar />
        <main className="container mx-auto py-12 px-4 max-w-4xl text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded">
            <h2 className="text-2xl font-bold mb-4">Error Loading Publication Data</h2>
            <p className="mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
          }
        }
      },
      title: {
        display: true,
        text: 'Publication Distribution by Type',
        font: {
          size: 18,
          weight: 'bold',
        },
        color: '#111827',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        borderColor: '#e5e7eb',
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label || ''}: ${context.parsed.y || 0}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          precision: 0
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
          }
        }
      },
      title: {
        display: true,
        text: 'Publication Trend Over the Last 5 Years',
        font: {
          size: 18,
          weight: 'bold',
        },
        color: '#111827',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        borderColor: '#e5e7eb',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          precision: 0
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  // Filter chart data based on active timeframe
  const getFilteredChartData = () => {
    if (!summaryData) return null;
    
    // Find the dataset for the active timeframe
    const dataset = summaryData.chartData.datasets.find(d => 
      d.label.toLowerCase().replace(/\s+/g, '') === activeTimeframe
    );
    
    return {
      labels: summaryData.chartData.labels,
      datasets: [dataset || summaryData.chartData.datasets[4]] // Fallback to Overall
    };
  };

  const filteredChartData = getFilteredChartData();

  return (
    <div className="bg-white text-gray-900 min-h-screen">        
      <Navbar />

      {/* Main Content */}
      <main>
        <section className="relative flex items-center justify-center h-[35vh] md:h-[45vh] bg-cover bg-center">
          <div
            className="absolute inset-0 bg-[url('/images/hero-bg3.png')] bg-cover bg-center"
            style={{ opacity: 0.5 }} 
          ></div>
          <div className="relative z-10 text-center p-6 md:p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 mt-10 leading-tight">
              Publication/Research Summary Of MVSD LAB
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-800 mb-4">
              Discover our talented team members and their groundbreaking research in automotive technologies and AI.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 py-4">
          <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <nav className="text-m font-medium text-gray-800 mb-2 md:mb-0">
              <ol className="list-reset flex items-center space-x-2">
                <li>
                  <Link href="/home" className="text-blue-600 hover:text-blue-700 transition-colors duration-300 ease-in-out">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-600">Publication/Research</li>
                <li className="text-gray-600">[ Summary ]</li>
              </ol>
            </nav>
          </div>
        </section>
        
        <section id="publication-summary" className="publication-summary section py-8 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4">
            <article className="article space-y-8 bg-white shadow rounded p-6">
              <h1 className="mb-4 text-xl font-bold text-gray-900 md:text-2xl lg:text-3xl text-center">
                Publication/Research : <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Summary</span>
              </h1>
              
              {summaryData ? (
                <>
                  <div className="overflow-x-auto shadow rounded border border-gray-300">
                    <table className="min-w-full table-auto border-collapse">
                      <thead className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                        <tr>
                          <th rowSpan="5" className="py-4 px-6 text-center border text-m font-bold border-gray-300">Summary</th>
                          <th className="py-4 px-6 text-center border text-m font-bold border-gray-300">Conference Paper</th>
                          <th className="py-4 px-6 text-center border text-m font-bold border-gray-300">Journal Paper</th>
                          <th className="py-4 px-6 text-center border text-m font-bold border-gray-300">Book/Chapter</th>
                          <th className="py-4 px-6 text-center border text-m font-bold border-gray-300">Patent</th>
                          <th className="py-4 px-6 text-center border text-m font-bold border-gray-300">Project</th>
                        </tr>
                      </thead>
                      <tbody className="text-m text-gray-800">
                        <tr>
                          <td className="py-4 px-6 text-center border border-gray-300 font-bold">Last Week</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastWeek['Conference Paper']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastWeek['Journal Paper']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastWeek['Book/Chapter']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastWeek['Patent']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastWeek['Project']}</td>
                        </tr>
                        <tr>
                          <td className="py-4 px-6 text-center border border-gray-300 font-bold">Last Month</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastMonth['Conference Paper']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastMonth['Journal Paper']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastMonth['Book/Chapter']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastMonth['Patent']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastMonth['Project']}</td>
                        </tr>
                        <tr>
                          <td className="py-4 px-6 text-center border border-gray-300 font-bold">Last Year</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastYear['Conference Paper']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastYear['Journal Paper']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastYear['Book/Chapter']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastYear['Patent']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.lastYear['Project']}</td>
                        </tr>
                        <tr>
                          <td className="py-4 px-6 text-center border border-gray-300 font-bold">Last 5 Years</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.last5Years['Conference Paper']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.last5Years['Journal Paper']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.last5Years['Book/Chapter']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.last5Years['Patent']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300">{summaryData.last5Years['Project']}</td>
                        </tr>
                        <tr className="bg-gray-100">
                          <td className="py-4 px-6 text-center border border-gray-300 font-bold">Overall</td>
                          <td className="py-4 px-6 text-center border border-gray-300 font-bold">{summaryData.overall['Conference Paper']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300 font-bold">{summaryData.overall['Journal Paper']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300 font-bold">{summaryData.overall['Book/Chapter']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300 font-bold">{summaryData.overall['Patent']}</td>
                          <td className="py-4 px-6 text-center border border-gray-300 font-bold">{summaryData.overall['Project']}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Chart Visualization Section */}
                  <div className="mt-12">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                        Publication Distribution Visualization
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {['lastweek', 'lastmonth', 'lastyear', 'last5years', 'overall'].map((timeframe) => (
                          <button
                            key={timeframe}
                            onClick={() => setActiveTimeframe(timeframe)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              activeTimeframe === timeframe
                                ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {timeframe === 'lastweek' && 'Last Week'}
                            {timeframe === 'lastmonth' && 'Last Month'}
                            {timeframe === 'lastyear' && 'Last Year'}
                            {timeframe === 'last5years' && 'Last 5 Years'}
                            {timeframe === 'overall' && 'Overall'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                      <div className="h-[400px]">
                        {filteredChartData && (
                          <Bar data={filteredChartData} options={barChartOptions} />
                        )}
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                      {['Conference Paper', 'Journal Paper', 'Book/Chapter', 'Patent', 'Project'].map((type, index) => (
                        <div key={type} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ 
                              backgroundColor: `rgba(${
                                index === 0 ? '54, 162, 235' : 
                                index === 1 ? '75, 192, 192' : 
                                index === 2 ? '153, 102, 255' : 
                                index === 3 ? '255, 159, 64' : 
                                '255, 99, 132'
                              }, 0.8)` 
                            }}
                          ></div>
                          <span className="text-sm text-gray-700">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trend Line Chart */}
                  <div className="mt-12">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                      Publication Trend Over Time
                    </h2>
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                      <div className="h-[400px]">
                        {summaryData.trendData && summaryData.trendData.labels.length > 0 && (
                          <Line 
                            data={{
                              labels: summaryData.trendData.labels,
                              datasets: summaryData.trendData.datasets
                            }} 
                            options={lineChartOptions} 
                          />
                        )}
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                      {summaryData.trendData.datasets.map((dataset, index) => (
                        <div key={index} className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: dataset.borderColor }}
                          ></div>
                          <span className="text-sm text-gray-700">{dataset.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-red-500">No publication data available</p>
                </div>
              )}
            </article>
          </div>
        </section>
      </main>

      <ScrollToTop />
      <Footer />
    </div>
  );
}
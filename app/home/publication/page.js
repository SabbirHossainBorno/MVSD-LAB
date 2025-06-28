//app/home/publication/page.js
'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ScrollToTop from '../../components/ScrollToTop';
import Link from 'next/link';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Publication() {
  const [loading, setLoading] = useState(true);

  // Simulate content loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []); 

  if (loading) {
    return <LoadingSpinner/>;
  }
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
                                    <td className="py-4 px-6 text-center border border-gray-300">53</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">2</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">279.16</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">12</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">156</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-center border border-gray-300 font-bold">Last Month</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">78</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">4</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">355.314</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">27</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">242</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-center border border-gray-300 font-bold">Last Year</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">78</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">4</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">355.314</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">27</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">242</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-center border border-gray-300 font-bold">Last 5 Years</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">78</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">4</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">355.314</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">27</td>
                                    <td className="py-4 px-6 text-center border border-gray-300">242</td>
                                </tr>
                                <tr className="bg-gray-100">
                                    <td className="py-4 px-6 text-center border border-gray-300 font-bold">Overall</td>
                                    <td className="py-4 px-6 text-center border border-gray-300 font-bold">141</td>
                                    <td className="py-4 px-6 text-center border border-gray-300 font-bold">14</td>
                                    <td className="py-4 px-6 text-center border border-gray-300 font-bold">471.932</td>
                                    <td className="py-4 px-6 text-center border border-gray-300 font-bold">72</td>
                                    <td className="py-4 px-6 text-center border border-gray-300 font-bold">445</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </article>
            </div>
        </section>

      </main>

      <ScrollToTop /> {/* ScrollToTop Component */}
      <Footer />
    </div>
  );
}

//app/project/page.js
'use client';
import Navbar from '../components/Navbar'; // Adjust the path as needed
import Footer from '../components/Footer'; // Adjust the path as needed
import ScrollToTop from '../components/ScrollToTop';
import Link from 'next/link';

export default function Publication() {
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
              Project List Of MVSD LAB
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
                <li className="text-gray-600">Project</li>
                <li className="text-gray-600">[ All ]</li>
              </ol>
            </nav>
          </div>
        </section>

        <section id="publication-summary" className="publication-summary section py-8 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4">
            <article className="article space-y-8 bg-white shadow rounded p-6">
              <h1 className="mb-4 text-xl font-bold text-gray-900 md:text-2xl lg:text-3xl text-center">
                Project : <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">All</span>
              </h1>
              <div className="overflow-x-auto shadow rounded border border-gray-300">
                <table className="min-w-full bg-white shadow-md rounded overflow-hidden">
                <thead className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                    <tr>
                      <th className="py-3 px-4 border border-gray-300 text-left">Serial</th>
                      <th className="py-3 px-4 border border-gray-300 text-left">Title</th>
                      <th className="py-3 px-4 border border-gray-300 text-left">End Period</th>
                      <th className="py-3 px-4 border border-gray-300 text-left">Start Period</th>
                      <th className="py-3 px-4 border border-gray-300 text-left">Duration</th>
                      <th className="py-3 px-4 border border-gray-300 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {/* Project Row Example */}
                    <tr className="hover:bg-gray-100 transition-colors">
                      <td className="py-3 px-4 border border-gray-300">01</td>
                      <td className="py-3 px-4 border border-gray-300 hover:text-blue-500">
                        <Link href="/projects_details">
                          Priority Research Centers Program: Civil-Military ICT Convergence Technology for Smart IoT Platform
                        </Link>
                      </td>
                      <td className="py-3 px-4 border border-gray-300">2026-05-31</td>
                      <td className="py-3 px-4 border border-gray-300">2018-06-01</td>
                      <td className="py-3 px-4 border border-gray-300">8 Years, 0 months</td>
                      <td className="py-3 px-4 border border-gray-300 bg-red-100 text-red-600">
                        Ongoing
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-100 transition-colors">
                      <td className="py-3 px-4 border border-gray-300">02</td>
                      <td className="py-3 px-4 border border-gray-300 hover:text-blue-500">
                        <Link href="/projects_details">
                          (ITRC) Professional Human Resource Training Project for Glocal ICT Convergence Technology
                        </Link>
                      </td>
                      <td className="py-3 px-4 border border-gray-300">2019-12-30</td>
                      <td className="py-3 px-4 border border-gray-300">2014-05-31</td>
                      <td className="py-3 px-4 border border-gray-300">5 Years, 6 Months, 29 Days</td>
                      <td className="py-3 px-4 border border-gray-300 bg-green-100 text-green-600">
                        Completed
                      </td>
                    </tr>
                    {/* Add more rows as necessary */}
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

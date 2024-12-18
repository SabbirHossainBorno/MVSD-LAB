//app/publication/page.js
'use client';
import Navbar from '../components/Navbar'; // Adjust the path as needed
import Footer from '../components/Footer'; // Adjust the path as needed
import Link from 'next/link';



export default function Publication() {
  

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main>
        <section className="relative flex items-center justify-center h-[35vh] md:h-[45vh] bg-cover bg-center">
          {/* Background Overlay with Opacity */}
          <div
            className="absolute inset-0 bg-[url('/images/hero-bg3.png')] bg-cover bg-center"
            style={{ opacity: 0.5 }} // Adjust the opacity value (0.0 - 1.0)
          ></div>

          {/* Content Layer */}
          <div className="relative z-10 text-center p-6 md:p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              Publication Summary Of MVSD LAB
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-800 mb-4">
              Discover our talented team members and their groundbreaking research in automotive technologies and AI.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 py-4">
          <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            {/* Breadcrumb Navigation */}
            <nav className="text-sm font-medium text-gray-800 mb-2 md:mb-0">
              <ol className="list-reset flex items-center space-x-2">
                <li>
                  <Link href="/home" className="text-blue-600 hover:text-blue-700 transition-colors duration-300 ease-in-out">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-600">Publication</li>
                <li className="text-gray-600">[ Summary ]</li>
              </ol>
            </nav>
          </div>
        </section>

        {/* Summary Section */}
        <section className="pb-6">
          
          <div className="max-w-screen-xl mx-auto px-4">
            {/* Professor Section with Carousel */}
            <div className="mb-12">
              <div className="flex justify-center items-center py-8">
                <h2 className="flex items-center text-gray-900 dark:text-gray-100">
                  <span className="flex-grow border-t border-gray-300 dark:border-gray-600"></span>
                  <span className="mx-4 px-4 py-2 text-xl font-semibold bg-gray-800 text-white rounded">
                    Meet Our Professor
                  </span>
                  <span className="flex-grow border-t border-gray-300 dark:border-gray-600"></span>
                </h2>
              </div>

              

            </div>

            
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
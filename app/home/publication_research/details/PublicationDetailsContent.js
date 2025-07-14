// app/home/publication_research/details/PublicationDetailsContent.js
'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaFilePdf, FaExternalLinkAlt } from 'react-icons/fa';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function PublicationDetailsContent() {
  const searchParams = useSearchParams();
  const publicationType = searchParams.get('type');
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        if (!publicationType) throw new Error('Publication type is missing');

        const response = await fetch(`/api/home/publication_research/details?type=${publicationType}`);
        if (!response.ok) throw new Error('Failed to fetch publication details');

        const data = await response.json();
        setPublications(data);
      } catch (err) {
        console.error('Error fetching publication details:', err);
        setError('Failed to load publication details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [publicationType]);

  const toSuperscript = (num) => {
    const map = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³',
        '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷',
        '8': '⁸', '9': '⁹'
    };
    return String(num).split('').map(d => map[d] || d).join('');
  };

  const formatPublicationType = (type) =>
    type?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const getStatus = (status) =>
    status?.toLowerCase() === 'approved' ? 'Completed' : 'On-Going';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return 'Invalid Date';
      
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      
      const getOrdinalSuffix = (d) => {
        if (d > 3 && d < 21) return `${d}th`;
        switch (d % 10) {
          case 1: return `${d}st`;
          case 2: return `${d}nd`;
          case 3: return `${d}rd`;
          default: return `${d}th`;
        }
      };
      
      return `${getOrdinalSuffix(day)} ${month} ${year}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  };

  const formatAuthors = (authors) => {
    if (!authors) return 'N/A';

    try {
      let authorList = authors;
      if (typeof authors === 'string') {
        try {
          authorList = JSON.parse(authors);
        } catch (parseError) {
          // Handle string format: "Author1, Author2, Author3"
          return authors.split(',').map((author, index) => (
            <span key={index} className="inline-flex items-baseline mr-1">
              {author.trim()}
              <sup className="text-[0.7rem] font-bold text-blue-600 ml-0.5">
                {toSuperscript(index + 1)}
              </sup>
              {index < authors.split(',').length - 1 && ','}
            </span>
          ));
        }
      }

      if (!Array.isArray(authorList)) return 'Invalid author format';

      return (
        <span className="flex flex-wrap gap-1">
          {authorList.map((author, index) => {
            const name = typeof author === 'object' ? author.name || author : author;
            return (
              <span key={index} className="inline-flex items-baseline">
                {name}
                <sup className="text-[0.7rem] font-bold text-blue-600 ml-0.5">
                  {toSuperscript(index + 1)}
                </sup>
                {index < authorList.length - 1 && ','}
              </span>
            );
          })}
        </span>
      );
    } catch (e) {
      console.error('Error parsing authors:', e);
      return 'Invalid author format';
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded">
          <h2 className="text-2xl font-bold mb-4">Error Loading Details</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main>
      <section className="relative flex items-center justify-center h-[35vh] md:h-[45vh] bg-cover bg-center">
        <div className="absolute inset-0 bg-[url('/images/hero-bg3.png')] bg-cover bg-center opacity-50" />
        <div className="relative z-10 text-center p-6 md:p-8 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {formatPublicationType(publicationType)}
          </h1>
          <p className="text-base md:text-lg text-gray-800">
            Explore our detailed collection of {formatPublicationType(publicationType)}.
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 py-4">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <nav className="text-sm md:text-base font-medium text-gray-800 mb-2 md:mb-0">
            <ol className="list-reset flex items-center space-x-2">
              <li>
                <Link href="/home" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">Home</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/home/publication_research" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">Publication/Research</Link>
              </li>
              <li>/</li>
              <li className="text-gray-600">[{formatPublicationType(publicationType)}]</li>
            </ol>
          </nav>
        </div>
      </section>

      <section className="py-8 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4">
          <article className="bg-white shadow rounded p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {formatPublicationType(publicationType)}
                <span className="text-blue-600 ml-2">({publications.length})</span>
              </h2>
              <Link 
                href="/home/publication_research" 
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mt-4 md:mt-0"
              >
                ← Back to Summary
              </Link>
            </div>

            {publications.length > 0 ? (
              <div className="overflow-x-auto border border-gray-300 rounded">
                <table className="min-w-full table-auto border-collapse">
                  <thead className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                    <tr>
                      <th className="py-3 px-4 text-center border w-12">#</th>
                      <th className="py-3 px-4 text-left border min-w-[350px]">Title</th>
                      <th className="py-3 px-4 text-center border w-24">Year</th>
                      <th className="py-3 px-4 text-left border min-w-[300px]">Authors</th>
                      <th className="py-3 px-4 text-left border w-48">Published Date</th>
                      <th className="py-3 px-4 text-center border w-20">Link</th>
                      <th className="py-3 px-4 text-center border w-24">Document</th>
                      <th className="py-3 px-4 text-center border w-56">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800">
                    {publications.map((pub, index) => (
                      <tr 
                        key={index} 
                        className={index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100'}
                      >
                        <td className="py-3 px-4 border text-center font-medium">{index + 1}</td>
                        <td className="py-3 px-4 border font-medium">{pub.title}</td>
                        <td className="py-3 px-4 border text-center">{pub.publishing_year}</td>
                        <td className="py-3 px-4 border">{formatAuthors(pub.authors)}</td>
                        <td className="py-3 px-4 border">{formatDate(pub.published_date)}</td>
                        <td className="py-3 px-4 border text-center">
                          {pub.link ? (
                            <a 
                              href={pub.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="External Link"
                            >
                              <FaExternalLinkAlt className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 border text-center">
                          {pub.document_path ? (
                            <a 
                              href={pub.document_path} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="View Document"
                            >
                              <FaFilePdf className="w-5 h-5" />
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2 border text-center">
                          <div className={`inline-flex items-center py-1.5 px-2 rounded-full text-xs font-bold uppercase tracking-wide ${
                          getStatus(pub.approval_status) === 'On-Going' 
                            ? 'bg-gradient-to-r from-rose-500 via-red-600 to-red-700 text-white shadow-md'
                            : 'bg-gradient-to-r from-green-500 via-green-600 to-emerald-500 text-white shadow-md'
                          }`}>
                            {getStatus(pub.approval_status)}
                            <span className="ml-2">
                              {getStatus(pub.approval_status) === 'On-Going' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border border-gray-300 rounded bg-gray-50">
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Publication/Research Found</h3>
                <p className="text-gray-500">No data available for {formatPublicationType(publicationType)}.</p>
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
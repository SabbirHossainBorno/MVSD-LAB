// app/home/publication_research/details/page.js
'use client';
import React, { Suspense } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ScrollToTop from '../../../components/ScrollToTop';
import LoadingSpinner from '../../../components/LoadingSpinner';
import PublicationDetailsContent from './PublicationDetailsContent';

export default function PublicationDetails() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <PublicationDetailsContent />
      </Suspense>
      <ScrollToTop />
      <Footer />
    </div>
  );
}
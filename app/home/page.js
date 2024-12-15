//app/home/page.js
'use client'; // Ensure this directive is at the top

import { useState } from 'react'; // Import useState from React
import Navbar from '../components/Navbar'; // Adjust the path as needed
import ScrollToTop from '../components/ScrollToTop';
import Footer from '../components/Footer';
import HomeHero from "../components/home_hero";
import HomeTestimonial from "../components/home_testimonial";
import HomeFeature from "../components/home_feature";
import HomeAbout from "../components/home_about";
import HomeLatestResearch from "../components/home_latestResearch";
import HomeStats from "../components/home_stats";
import HomeFAQ from "../components/home_faq";
import HomeClients from "../components/home_clients";
import HomeContactUs from "../components/home_contactUS";


export default function Home() {
  // Set a fixed height for the navbar
  const navbarHeight = '00px'; // Change this to your actual navbar height
  
  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen">
      <Navbar />

        {/* -------MAIN------- */}
      <main style={{ paddingTop: navbarHeight }}> {/* Set padding-top directly */}

        {/* -------HERO SECTION------- */}
        <HomeHero />

        {/* ------- ABOUT SECTION------- */}
        <HomeAbout />

        {/* ------- LATEST RESEARCHES------- */}
        <HomeLatestResearch />

        {/* -------FEATURES------- */}
        <HomeFeature />

        {/* -------STATE------- */}
        <HomeStats />

        {/* -------FAQ------- */}
        <HomeFAQ />

        {/* -------TESTIMONIAL------- */}
        <HomeTestimonial />

        {/* -------CLIENTS------- */}
        <HomeClients />

        {/* -------CONTACT US------- */}
        <HomeContactUs />

      </main>
      <ScrollToTop />
      <Footer />
    </div>
  );
}
  
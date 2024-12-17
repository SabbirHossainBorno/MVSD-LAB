// app/element/page.js
'use client'; // Ensure this directive is at the top

import Navbar from '../components/Navbar'; // Adjust the path as needed
import ScrollToTop from '../components/ScrollToTop';
import Footer from '../components/Footer';

// FontExamples component for showcasing fonts
export function FontExamples() {
  return (
    <div className="p-10 space-y-8">
      <h1 className="text-4xl font-bold text-[#012970]">Font Showcase</h1>

      {/* Poppins Font Example */}
      <div className="font-poppins">
        <h2 className="text-3xl font-semibold">Poppins Font</h2>
        <p>This is the Poppins font, commonly used for modern web design.</p>
      </div>

      {/* Roboto Font Example */}
      <div className="font-roboto">
        <h2 className="text-3xl font-semibold">Roboto Font</h2>
        <p>Roboto is a popular sans-serif font that is highly readable.</p>
      </div>

      {/* Montserrat Font Example */}
      <div className="font-montserrat">
        <h2 className="text-3xl font-semibold">Montserrat Font</h2>
        <p>Montserrat is great for headlines and titles, offering a modern feel.</p>
      </div>

      {/* Lato Font Example */}
      <div className="font-lato">
        <h2 className="text-3xl font-semibold">Lato Font</h2>
        <p>Lato is a sans-serif font that's ideal for body text and content.</p>
      </div>

      {/* Open Sans Font Example */}
      <div className="font-openSans">
        <h2 className="text-3xl font-semibold">Open Sans Font</h2>
        <p>Open Sans is known for its legibility and neutrality.</p>
      </div>

      {/* Raleway Font Example */}
      <div className="font-raleway">
        <h2 className="text-3xl font-semibold">Raleway Font</h2>
        <p>Raleway is a sans-serif typeface with a modern touch.</p>
      </div>

      {/* Playfair Display Font Example */}
      <div className="font-playfairDisplay">
        <h2 className="text-3xl font-semibold">Playfair Display Font</h2>
        <p>Playfair Display is a serif font that adds elegance and sophistication.</p>
      </div>

      {/* Oswald Font Example */}
      <div className="font-oswald">
        <h2 className="text-3xl font-semibold">Oswald Font</h2>
        <p>Oswald is a reworking of the classic gothic typeface.</p>
      </div>

      {/* Inter Font Example */}
      <div className="font-inter">
        <h2 className="text-3xl font-semibold">Inter Font</h2>
        <p>Inter is a modern sans-serif font designed for digital screens.</p>
      </div>

      {/* Source Sans Pro Font Example */}
      <div className="font-sourceSansPro">
        <h2 className="text-3xl font-semibold">Source Sans Pro Font</h2>
        <p>Source Sans Pro is a clean and versatile sans-serif font.</p>
      </div>
    </div>
  );
}

// Main Home Component
export default function Home() {

  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen">
      <Navbar /> {/* Navbar component */}

      {/* -------MAIN------- */}
      <main style={{ paddingTop: navbarHeight }}> {/* Adjust the padding-top dynamically */}
        <FontExamples /> {/* Rendering the FontExamples component */}
      </main>

      <ScrollToTop /> {/* ScrollToTop button */}
      <Footer /> {/* Footer component */}
    </div>
  );
}

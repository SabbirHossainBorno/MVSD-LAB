"use client";

import '../app/globals.css';
import ScrollToTop from './components/ScrollToTop';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <ScrollToTop />
      </body>
    </html>
  );
}
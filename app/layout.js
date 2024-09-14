"use client";

import Navbar from './components/Navbar';
import '../app/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
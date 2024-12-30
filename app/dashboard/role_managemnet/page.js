//app/dashboard/role_managemnet/page.js
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../components/withAuth'; 
import LoadingSpinner from '../../components/LoadingSpinner'; 

function RoleManagement() {

  const [loading, setLoading] = useState(true);

  

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8 lg:p-10">
      <h1 className="text-4xl font-bold mb-6 text-gray-300">Role Management</h1>
      <div className="bg-gray-800 p-6 rounded shadow-lg mb-6">
        
        <Link href="/dashboard" className="block mt-6 text-center text-blue-400 hover:text-blue-500 text-sm sm:text-base">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default withAuth(RoleManagement);
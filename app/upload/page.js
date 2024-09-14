//UPLOAD PAGE

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/check-auth');
        const result = await res.json();
        console.log('Auth check result:', result); // Debug log
        if (!result.authenticated) {
          router.push('/login');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error); // Debug log
      }
    }
    checkAuth();
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Upload Page</h1>
      <p>Welcome to the upload page. You can upload files here.</p>
      {/* Upload functionality goes here */}
    </div>
  );
}

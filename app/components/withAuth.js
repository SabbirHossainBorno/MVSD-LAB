// app/components/withAuth.js
'use client'; // Ensure this file is treated as a client-side component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Updated import
import Cookies from 'js-cookie';
import LoadingSpinner from '../components/LoadingSpinner'; // Add a loading spinner component

// Higher Order Component for Authentication
const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true); // Define loading state
    const router = useRouter();

    useEffect(() => {
      setIsClient(true);

      const checkAuth = async () => {
        try {
          const response = await fetch('/api/check-auth');
          if (!response.ok) throw new Error('Failed to fetch auth status');
          const result = await response.json();
          if (!result.authenticated) {
            router.push('/login');
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
          router.push('/login');
        } finally {
          setLoading(false); // End loading
        }
      };

      if (isClient) {
        checkAuth();

        const handleActivity = () => {
          Cookies.set('lastActivity', new Date().toISOString());
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);

        const interval = setInterval(() => {
          const lastActivity = Cookies.get('lastActivity');
          if (lastActivity) {
            const now = new Date();
            const lastActivityDate = new Date(lastActivity);
            const diff = now - lastActivityDate;
            if (diff > 10 * 60 * 1000) { // 10 minutes
              Cookies.remove('email');
              Cookies.remove('sessionId');
              router.push('/login');
            }
          }
        }, 1000);

        return () => {
          clearInterval(interval);
          window.removeEventListener('mousemove', handleActivity);
          window.removeEventListener('keydown', handleActivity);
        };
      }
    }, [isClient, router]);

    if (loading) return <LoadingSpinner />;

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
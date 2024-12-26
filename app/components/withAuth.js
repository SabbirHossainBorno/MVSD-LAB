// app/components/withAuth.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { handleSessionExpiration } from '../../lib/sessionUtils'; // Import the utility function

const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const hasShownUnauthorizedToast = useRef(false); // Ref to track if the toast has been shown

    // Memoize handleUnauthorizedAccess
    const handleUnauthorizedAccess = useCallback(async () => {
      if (!hasShownUnauthorizedToast.current) {
        hasShownUnauthorizedToast.current = true; // Prevent duplicate toasts
        toast.error('Authentication Required! Need To Login.');
        router.push('/login?authRequired=true');
      }
    }, [router]);

    // Memoized checkAuth function
    const checkAuth = useCallback(async () => {
      try {
        const response = await fetch('/api/check-auth');
        if (!response.ok) throw new Error('Failed to fetch auth status');

        const result = await response.json();
        if (result.authenticated) {
          setIsAuthenticated(true);
        } else {
          await handleUnauthorizedAccess();
        }
      } catch (error) {
        console.error('Authentication Check Failed:', error);
        toast.error('Failed to check authentication');
        await handleUnauthorizedAccess();
      } finally {
        setLoading(false);
      }
    }, [handleUnauthorizedAccess]);

    // Track user activity and manage session timeout
    useEffect(() => {
      setIsClient(true);

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
            handleSessionExpiration(router);
          }
        }
      }, 60000); // Check every minute

      return () => {
        clearInterval(interval);
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
      };
    }, [router]);

    // Check authentication status when component mounts
    useEffect(() => {
      if (isClient) {
        checkAuth();
      }
    }, [isClient, checkAuth]);

    // Display session expired message if URL query indicates so
    useEffect(() => {
      if (router.query?.sessionExpired) {
        toast.error('Session Expired! Please Login Again.');
      }
    }, [router.query]);

    // Loading spinner until authentication check is complete
    if (loading) return <LoadingSpinner />;

    return <WrappedComponent {...props} isAuthenticated={isAuthenticated} />;
  };

  return Wrapper;
};

export default withAuth;

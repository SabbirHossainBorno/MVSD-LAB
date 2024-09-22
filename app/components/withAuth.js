// app/components/withAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const handleSessionExpiration = async () => {
      const email = Cookies.get('email');
      const sessionId = Cookies.get('sessionId');
      Cookies.remove('email');
      Cookies.remove('sessionId');
      toast.error('Session Expired! Please Login Again.');
      await axios.post('/api/log-and-alert', { message: 'MVSD LAB DASHBOARD\n------------------------------------\nSession Expired!\nPlease Login Again.', sessionId, details: { email } });
      router.push('/login?sessionExpired=true');
    };

    const handleUnauthorizedAccess = async () => {
      toast.error('Authentication Required! Need To Login.');
      router.push('/login?authRequired=true');
    };

    useEffect(() => {
      setIsClient(true);

      const checkAuth = async () => {
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
      };

      if (isClient) {
        checkAuth();

        const handleActivity = () => {
          Cookies.set('lastActivity', new Date().toISOString());
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);

        const interval = setInterval(async () => {
          const lastActivity = Cookies.get('lastActivity');
          if (lastActivity) {
            const now = new Date();
            const lastActivityDate = new Date(lastActivity);
            const diff = now - lastActivityDate;
            if (diff > 10 * 60 * 1000) { // 10 minutes
              await handleSessionExpiration();
            }
          }
        }, 60000); // Check every minute

        return () => {
          clearInterval(interval);
          window.removeEventListener('mousemove', handleActivity);
          window.removeEventListener('keydown', handleActivity);
        };
      }
    }, [isClient, router]);

    useEffect(() => {
      if (router.query && router.query.sessionExpired) {
        toast.error('Session Expired! Please Login Again.');
      }
    }, [router.query]);

    if (loading) return <LoadingSpinner />;

    return <WrappedComponent {...props} isAuthenticated={isAuthenticated} />;
  };

  return Wrapper;
};

export default withAuth;

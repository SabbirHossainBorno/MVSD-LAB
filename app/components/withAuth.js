// app/components/withAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

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
        }
      };

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
    }, [router]);

    if (!isClient) {
      return null; // Return nothing or a loader until client-side check is done
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

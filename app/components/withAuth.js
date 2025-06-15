// app/components/withAuth.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { handleSessionExpiration } from '../../lib/sessionUtils';

const withAuth = (WrappedComponent, requiredRole) => {
  const Wrapper = (props) => {
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [unauthorized, setUnauthorized] = useState(false); // State to handle unauthorized access
    const router = useRouter();
    const hasShownUnauthorizedToast = useRef(false);
    const TIMEOUT_DURATION = 1 * 60 * 1000; // 1 minute
    let globalListenersAdded = false;

    const handleUnauthorizedAccess = useCallback(async () => {
      if (!hasShownUnauthorizedToast.current) {
        hasShownUnauthorizedToast.current = true;
        toast.error('Authentication Required! Need To Login.');
        router.push('/login?authRequired=true');
      }
    }, [router]);

    const checkAuth = useCallback(async () => {
      try {
        const response = await fetch('/api/check-auth');
        if (!response.ok) throw new Error('Failed to fetch auth status');
        const result = await response.json();
        if (result.authenticated) {
          setIsAuthenticated(true);
          setUserRole(result.role); // Set the user's role
          hasShownUnauthorizedToast.current = false; // Reset the flag on successful authentication
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

    useEffect(() => {
      setIsClient(true);
      
      // Only setup global listeners once
      if (!globalListenersAdded) {
        globalListenersAdded = true;
        
        const handleActivity = () => {
          Cookies.set('lastActivity', new Date().toISOString());
        };

        // Add event listeners
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);

        // Setup session checker
        const interval = setInterval(() => {
          const lastActivity = Cookies.get('lastActivity');
          if (lastActivity) {
            const now = new Date();
            const lastActivityDate = new Date(lastActivity);
            const diff = now - lastActivityDate;
            if (diff > 10 * 60 * 1000) {
              handleSessionExpiration(router);
            }
          }
        }, 60000);

        return () => {
          clearInterval(interval);
          window.removeEventListener('mousemove', handleActivity);
          window.removeEventListener('keydown', handleActivity);
          globalListenersAdded = false;
        };
      }
    }, [router]);

    useEffect(() => {
      if (isClient) {
        checkAuth();
      }
    }, [isClient, checkAuth]);


    useEffect(() => {
      if (isAuthenticated && requiredRole) {
        const validRoles = {
          admin: ['admin'],
          member: ['PhD Candidate', 'Masters'],
          director: ['Director']
        };

        if (requiredRole === 'director' && !validRoles.director.includes(userRole)) {
          setUnauthorized(true);
        }
      }
    }, [isAuthenticated, userRole, requiredRole]);

    useEffect(() => {
      if (unauthorized) {
        if (!hasShownUnauthorizedToast.current) {
          hasShownUnauthorizedToast.current = true;
          toast.error('Access Denied! You do not have permission to view this page.');
          
          // Redirect based on required role
          const redirectPath = requiredRole === 'admin' 
            ? '/member_dashboard?accessDenied=true'
            : '/login?authRequired=true';
            
          router.push(redirectPath);
        }
      }
    }, [unauthorized, router, requiredRole]);

    if (loading) return <LoadingSpinner />;

    return <WrappedComponent {...props} isAuthenticated={isAuthenticated} />;
  };

  return Wrapper;
};

export default withAuth;
// lib/sessionUtils.js
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

export const handleSessionExpiration = async (router = null) => {
  const email = Cookies.get('email');
  const sessionId = Cookies.get('sessionId');
  
  console.log(`Session expired: email=${email}, sessionId=${sessionId}`);

  // Remove session-related cookies
  Cookies.remove('email');
  Cookies.remove('sessionId');
  Cookies.remove('lastActivity'); // Remove lastActivity cookie

  // Ensure toast notifications are only shown in the browser
  if (typeof window !== 'undefined') {
    toast.error('Session Expired! Please Login Again.');
  } else {
    console.warn('Toast notifications are not available in this environment.');
  }

  // Ensure redirection happens only in the browser with the router available
  if (typeof window !== 'undefined' && router) {
    router.push('/login?sessionExpired=true');
  } else {
    console.warn('Router is not available or this is not a browser environment. Skipping redirection.');
  }
};
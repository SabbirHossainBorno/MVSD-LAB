// lib/sessionUtils.js
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import axios from 'axios';

export const handleSessionExpiration = async (router = null) => {
  const email = Cookies.get('email');
  const sessionId = Cookies.get('sessionId');
  
  // Remove session-related cookies
  Cookies.remove('email');
  Cookies.remove('sessionId');
  
  // Debugging toast import
  console.log(toast); // Should output an object
  console.log(toast.error); // Should be a function

  // Show toast notification
  if (typeof window !== 'undefined') {
    toast.error('Session Expired! Please Login Again.');
  } else {
    console.warn('Toast notifications are not available in this environment.');
  }

  // Log and alert the session expiration
  try {
    await axios.post('/api/log-and-alert', {
      message: 'MVSD LAB DASHBOARD\n------------------------------------\nSession Expired!\nPlease Login Again.',
      sessionId,
      details: { email },
    });
  } catch (error) {
    console.error('Error sending log and alert:', error);
  }

  // Redirect user to login page if router is provided
  if (router) {
    router.push('/login?sessionExpired=true');
  } else {
    console.warn('Router is not available. Skipping redirection.');
  }
};

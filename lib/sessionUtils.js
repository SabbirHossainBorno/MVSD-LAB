// lib/sessionUtils.js
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

// Define cookie names as constants or environment variables
const EMAIL_COOKIE = process.env.NEXT_PUBLIC_EMAIL_COOKIE || 'email';
const SESSION_ID_COOKIE = process.env.NEXT_PUBLIC_SESSION_ID_COOKIE || 'sessionId';
const LAST_ACTIVITY_COOKIE = process.env.NEXT_PUBLIC_LAST_ACTIVITY_COOKIE || 'lastActivity';

const removeCookies = () => {
  const email = Cookies.get(EMAIL_COOKIE);
  const sessionId = Cookies.get(SESSION_ID_COOKIE);

  if (email) Cookies.remove(EMAIL_COOKIE);
  if (sessionId) Cookies.remove(SESSION_ID_COOKIE);
  Cookies.remove(LAST_ACTIVITY_COOKIE);
};

const showToastNotification = () => {
  if (typeof window !== 'undefined') {
    toast.error('Session Expired! Please Login Again.');
  } else {
    console.warn('Toast notifications are not available in this environment.');
  }
};

const redirectToLogin = async (router) => {
  if (typeof window !== 'undefined' && router) {
    await router.push('/login?sessionExpired=true');
  } else {
    console.warn('Router is not available or this is not a browser environment. Skipping redirection.');
  }
};

export const handleSessionExpiration = async (router = null) => {
  try {
    removeCookies();
    showToastNotification();
    await redirectToLogin(router);
  } catch (error) {
    console.error('Error handling session expiration:', error);
  }
};
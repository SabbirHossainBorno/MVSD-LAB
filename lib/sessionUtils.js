// lib/sessionUtils.js
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
let isHandlingSession = false;

const removeCookies = () => {
  console.log('[SessionUtils] Removing session cookies');
  
  const cookies = [
    process.env.NEXT_PUBLIC_EMAIL_COOKIE || 'email',
    process.env.NEXT_PUBLIC_SESSION_ID_COOKIE || 'sessionId',
    process.env.NEXT_PUBLIC_LAST_ACTIVITY_COOKIE || 'lastActivity',
    'eid',
    'id',
    'type',
    'redirect'
  ];

  cookies.forEach(cookie => {
    Cookies.remove(cookie, {
      path: '/',
      domain: window.location.hostname
    });
  });
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
  console.log('[SessionUtils] Handling session expiration');
  if (isHandlingSession) {
    console.log('[SessionUtils] Session expiration already being handled');
    return;
  }
  
  isHandlingSession = true;
  try {
    console.log('[SessionUtils] Calling logout API with session timeout reason');
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'session_timeout' }),
    });

    if (!response.ok) {
      throw new Error(`Logout API failed with status ${response.status}`);
    }
    
    console.log('[SessionUtils] Logout API succeeded');
    removeCookies();
    showToastNotification();
    await redirectToLogin(router);
  } catch (error) {
    console.error('[SessionUtils] Error handling session expiration:', error);
    console.warn('[SessionUtils] Falling back to client-side cleanup');
    removeCookies();
    showToastNotification();
    await redirectToLogin(router);
  } finally {
    isHandlingSession = false;
  }
};
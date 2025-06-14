// lib/sessionUtils.js
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

// Constants
const SESSION_TIMEOUT = 1 * 60 * 1000; // 30 minutes in milliseconds
const EMAIL_COOKIE = process.env.NEXT_PUBLIC_EMAIL_COOKIE || 'email';
const SESSION_ID_COOKIE = process.env.NEXT_PUBLIC_SESSION_ID_COOKIE || 'sessionId';
const LAST_ACTIVITY_COOKIE = process.env.NEXT_PUBLIC_LAST_ACTIVITY_COOKIE || 'lastActivity';

// Remove client-side cookies
const removeCookies = () => {
  console.log('[SessionUtils] Removing client-side cookies');
  
  const email = Cookies.get(EMAIL_COOKIE);
  const sessionId = Cookies.get(SESSION_ID_COOKIE);

  if (email) {
    Cookies.remove(EMAIL_COOKIE);
    console.log(`[SessionUtils] Removed email cookie: ${email}`);
  }
  
  if (sessionId) {
    Cookies.remove(SESSION_ID_COOKIE);
    console.log(`[SessionUtils] Removed session ID cookie: ${sessionId}`);
  }
  
  Cookies.remove(LAST_ACTIVITY_COOKIE);
  console.log('[SessionUtils] Removed lastActivity cookie');
  
  // Clear additional cookies
  ['eid', 'id', 'redirect'].forEach(cookie => {
    Cookies.remove(cookie);
    console.log(`[SessionUtils] Removed ${cookie} cookie`);
  });
};

// Show toast notification
const showToastNotification = () => {
  console.log('[SessionUtils] Showing session expired toast');
  
  if (typeof window !== 'undefined') {
    toast.error('Session Expired! Please Login Again.', {
      autoClose: 5000,
      position: 'top-right'
    });
  } else {
    console.warn('[SessionUtils] Toast notifications not available in SSR');
  }
};

// Redirect to login page
const redirectToLogin = async (router) => {
  console.log('[SessionUtils] Redirecting to login');
  
  if (typeof window !== 'undefined' && router) {
    await router.push('/login?sessionExpired=true');
    console.log('[SessionUtils] Redirected to login page');
  } else {
    console.warn('[SessionUtils] Router not available or not in browser environment');
  }
};

// Notify server about session expiration
const notifyServerAboutSessionExpiration = async () => {
  console.log('[SessionUtils] Notifying server about session expiration');
  
  try {
    const email = Cookies.get(EMAIL_COOKIE);
    
    if (!email) {
      console.warn('[SessionUtils] No email found for session expiration notification');
      return;
    }
    
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Expired': 'true'
      }
    });

    if (response.ok) {
      console.log('[SessionUtils] Server notified about session expiration');
    } else {
      console.error('[SessionUtils] Server returned error for session expiration notification:', response.status);
    }
  } catch (error) {
    console.error('[SessionUtils] Failed to notify server about session expiration:', error);
  }
};

// Main session expiration handler
export const handleSessionExpiration = async (router = null) => {
  console.log('[SessionUtils] Handling session expiration');
  
  try {
    // Notify server first
    await notifyServerAboutSessionExpiration();
    
    // Client-side cleanup
    removeCookies();
    showToastNotification();
    await redirectToLogin(router);
  } catch (error) {
    console.error('[SessionUtils] Error handling session expiration:', error);
    
    // Fallback cleanup
    removeCookies();
    showToastNotification();
    await redirectToLogin(router);
  }
};

// Activity tracker initialization
export const initSessionActivityTracker = (router) => {
  console.log('[SessionUtils] Initializing session activity tracker');
  
  if (typeof window === 'undefined') return;
  
  // Update last activity time on any user interaction
  const updateLastActivity = () => {
    const now = new Date().getTime();
    Cookies.set(LAST_ACTIVITY_COOKIE, now.toString(), {
      expires: 7, // days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax'
    });
  };
  
  // Set initial activity time
  updateLastActivity();
  
  // Add event listeners
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  events.forEach(event => {
    window.addEventListener(event, updateLastActivity);
  });
  
  // Check session periodically
  const sessionChecker = setInterval(() => {
    const lastActivity = Cookies.get(LAST_ACTIVITY_COOKIE);
    const currentTime = new Date().getTime();
    
    if (!lastActivity) {
      console.log('[SessionUtils] No last activity found - new session?');
      updateLastActivity();
      return;
    }
    
    const timeDiff = currentTime - parseInt(lastActivity, 10);
    console.log(`[SessionUtils] Session check - Last activity: ${lastActivity}, Current: ${currentTime}, Diff: ${timeDiff}ms`);
    
    if (timeDiff > SESSION_TIMEOUT) {
      console.log('[SessionUtils] Session timeout detected');
      clearInterval(sessionChecker);
      handleSessionExpiration(router);
    }
  }, 60000); // Check every minute
  
  console.log('[SessionUtils] Session activity tracker initialized');
  
  // Return cleanup function
  return () => {
    events.forEach(event => {
      window.removeEventListener(event, updateLastActivity);
    });
    clearInterval(sessionChecker);
  };
};
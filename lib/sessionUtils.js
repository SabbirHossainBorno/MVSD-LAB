// lib/sessionUtils.js
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

// Define cookie names
const EMAIL_COOKIE = process.env.NEXT_PUBLIC_EMAIL_COOKIE || 'email';
const SESSION_ID_COOKIE = process.env.NEXT_PUBLIC_SESSION_ID_COOKIE || 'sessionId';
const LAST_ACTIVITY_COOKIE = process.env.NEXT_PUBLIC_LAST_ACTIVITY_COOKIE || 'lastActivity';

// Session lock to prevent duplicate handling
let sessionLock = false;

/**
 * Remove all session-related cookies with proper domain/path
 */
const removeCookies = () => {
  console.log('[SessionUtils] Removing session cookies...');
  
  try {
    const domain = window.location.hostname;
    const cookies = [
      EMAIL_COOKIE,
      SESSION_ID_COOKIE,
      LAST_ACTIVITY_COOKIE,
      'eid',
      'id',
      'type',
      'redirect'
    ];

    cookies.forEach(cookie => {
      if (Cookies.get(cookie)) {
        Cookies.remove(cookie, {
          path: '/',
          domain,
          secure: process.env.NODE_ENV === 'production'
        });
        console.log(`[SessionUtils] Removed cookie: ${cookie}`);
      }
    });
    
    console.log('[SessionUtils] All session cookies removed successfully');
  } catch (error) {
    console.error('[SessionUtils] Error removing cookies:', error);
  }
};

/**
 * Show session expired notification
 */
const showToastNotification = () => {
  if (typeof window !== 'undefined') {
    console.log('[SessionUtils] Showing session expired toast');
    toast.error('Session Expired! Please Login Again.', {
      toastId: 'session-expired', // Prevent duplicate toasts
      autoClose: 5000
    });
  } else {
    console.warn('[SessionUtils] Toast not available in non-browser environment');
  }
};

/**
 * Redirect to login page
 */
const redirectToLogin = async (router) => {
  if (typeof window !== 'undefined' && router) {
    try {
      console.log('[SessionUtils] Redirecting to login page');
      await router.push('/login?sessionExpired=true');
      console.log('[SessionUtils] Redirect completed');
    } catch (error) {
      console.error('[SessionUtils] Redirect error:', error);
    }
  } else {
    console.warn('[SessionUtils] Skipping redirect - router unavailable');
  }
};

/**
 * Handle session expiration with locking and retry logic
 */
export const handleSessionExpiration = async (router = null) => {
  // Check if already handling session
  if (sessionLock) {
    console.warn('[SessionUtils] Session expiration already being handled - skipping');
    return;
  }

  try {
    // Acquire session lock
    sessionLock = true;
    console.log('[SessionUtils] === SESSION EXPIRATION HANDLER STARTED ===');
    
    // Step 1: Call logout API
    console.log('[SessionUtils] Calling logout API with session_timeout reason');
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'session_timeout' }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Logout API failed: ${response.status} ${response.statusText}`);
      }
      console.log('[SessionUtils] Logout API succeeded');
    } catch (apiError) {
      console.error('[SessionUtils] Logout API error:', apiError);
      console.warn('[SessionUtils] Proceeding with client-side cleanup');
    }

    // Step 2: Client-side cleanup
    console.log('[SessionUtils] Performing client-side cleanup');
    removeCookies();
    showToastNotification();
    
    // Step 3: Redirect
    console.log('[SessionUtils] Initiating redirect to login');
    await redirectToLogin(router);
    
    console.log('[SessionUtils] === SESSION EXPIRATION HANDLER COMPLETED ===');
  } catch (error) {
    console.error('[SessionUtils] CRITICAL ERROR in session handler:', error);
  } finally {
    // Release session lock after delay
    setTimeout(() => {
      sessionLock = false;
      console.log('[SessionUtils] Session lock released');
    }, 3000); // 3-second cooldown period
  }
};

/**
 * Reset activity timer
 */
export const resetActivityTimer = () => {
  if (typeof window !== 'undefined') {
    try {
      console.log('[SessionUtils] Resetting activity timer');
      Cookies.set(LAST_ACTIVITY_COOKIE, new Date().toISOString(), {
        expires: 1, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      });
    } catch (error) {
      console.error('[SessionUtils] Error resetting activity timer:', error);
    }
  }
};

/**
 * Initialize session activity tracking
 */
export const initSessionActivityTracking = (router) => {
  if (typeof window === 'undefined') return;
  
  console.log('[SessionUtils] Initializing session activity tracking');
  
  // Activity detection with debouncing
  const handleActivity = () => {
    resetActivityTimer();
  };
  
  // Debounced activity handler
  const debouncedActivity = debounce(handleActivity, 1000);
  
  // Add event listeners
  window.addEventListener('mousemove', debouncedActivity);
  window.addEventListener('keydown', debouncedActivity);
  window.addEventListener('scroll', debouncedActivity);
  window.addEventListener('click', debouncedActivity);
  window.addEventListener('touchstart', debouncedActivity);
  
  // Session check interval
  const checkInterval = setInterval(() => {
    const lastActivity = Cookies.get(LAST_ACTIVITY_COOKIE);
    if (!lastActivity) return;
    
    const now = new Date();
    const lastActivityDate = new Date(lastActivity);
    const diff = now - lastActivityDate;
    const timeout = 1 * 60 * 1000; // 1 min for testing
    
    console.log(`[SessionUtils] Session check - Last activity: ${lastActivityDate.toLocaleTimeString()} (${Math.round(diff/1000)}s ago)`);
    
    if (diff > timeout) {
      console.warn(`[SessionUtils] Session timeout detected (${Math.round(diff/1000)}s inactivity)`);
      handleSessionExpiration(router);
    }
  }, 30000); // Check every 30 seconds
  
  // Cleanup function
  return () => {
    console.log('[SessionUtils] Cleaning up session activity tracking');
    clearInterval(checkInterval);
    window.removeEventListener('mousemove', debouncedActivity);
    window.removeEventListener('keydown', debouncedActivity);
    window.removeEventListener('scroll', debouncedActivity);
    window.removeEventListener('click', debouncedActivity);
    window.removeEventListener('touchstart', debouncedActivity);
  };
};

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
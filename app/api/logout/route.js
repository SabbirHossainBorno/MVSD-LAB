// app/api/logout/route.js
import { NextResponse } from 'next/server';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import { query } from '../../../lib/db';

// Helper function to format Telegram alert message
const formatAlertMessage = (userType, title, email, ipAddress, additionalInfo = '', isSessionExpired = false) => {
  // Determine header based on user type
  let header;
  if (userType === 'admin') {
    header = "MVSD LAB ADMIN DASHBOARD\n------------------------------------\n";
  } else if (userType === 'director') {
    header = "MVSD LAB DIRECTOR DASHBOARD\n------------------------------------\n";
  } else {
    header = "MVSD LAB MEMBER DASHBOARD\n------------------------------------\n";
  }
  
  const sessionType = isSessionExpired ? "SESSION TIMEOUT" : "LOGOUT";
  return `${header}${title}\nType: ${sessionType}\nEmail: ${email}\nIP: ${ipAddress}${additionalInfo}`;
};

// Unified logout processing function
const processLogout = async (request, isSessionExpired = false) => {
  const email = request.cookies.get('email')?.value;
  const sessionId = request.cookies.get('sessionId')?.value;
  const eid = request.cookies.get('eid')?.value;
  const id = request.cookies.get('id')?.value;
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';

  console.log(`[LogoutAPI] Starting logout process for: ${email || 'unknown'}`, {
    sessionId,
    eid,
    id,
    ipAddress,
    isSessionExpired
  });

  if (!email) {
    console.warn('[LogoutAPI] No email found in cookies');
    throw new Error('No email found in cookies');
  }

  // Determine user type
  let userType;
  let additionalInfo = '';
  
  if (email.endsWith('@mvsdlab.com')) {
    userType = 'admin';
    console.log(`[LogoutAPI] Identified as admin: ${email}`);
  } else if (id && id.startsWith('D')) {
    userType = 'director';
    additionalInfo = `\nDirectorID: ${id}`;
    console.log(`[LogoutAPI] Identified as director: ${id}`);
  } else {
    userType = 'member';
    additionalInfo = `\nMemberID: ${eid?.split('-')[0] || 'N/A'}`;
    console.log(`[LogoutAPI] Identified as member: ${eid}`);
  }

  // Update appropriate login tracker
  console.log(`[LogoutAPI] Updating login tracker for ${userType}: ${email}`);
  
  if (userType === 'admin') {
    await query(
      `UPDATE admin SET status = 'Idle', last_logout_time = NOW() 
       WHERE email = $1`,
      [email]
    );
  } else if (userType === 'director') {
    await query(
      `UPDATE director_login_info_tracker 
       SET last_logout_time = NOW(), 
           login_state = 'Idle' 
       WHERE email = $1`,
      [email]
    );
  } else {
    await query(
      `UPDATE member_login_info_tracker 
       SET last_logout_time = NOW(), 
           login_state = 'Idle' 
       WHERE email = $1`,
      [email]
    );
  }

  console.log(`[LogoutAPI] Database updated for ${userType}: ${email}`);

  // Send Telegram alert
  const title = isSessionExpired 
    ? 'Session Timeout: Auto Logout' 
    : 'Logged Out Successfully!';
  
  const alertMessage = formatAlertMessage(
    userType,
    title,
    email,
    ipAddress,
    additionalInfo,
    isSessionExpired
  );
  
  console.log(`[LogoutAPI] Sending Telegram alert: ${alertMessage}`);
  await sendTelegramAlert(alertMessage);

  // Log to file-based logger
  logger.info(`Logout processed for ${userType}`, {
    meta: {
      email,
      id,
      eid,
      sessionId,
      ipAddress,
      taskName: 'Logout',
      sessionExpired: isSessionExpired,
      details: `${userType} logout processed successfully`
    }
  });

  console.log(`[LogoutAPI] Logout completed for ${userType}: ${email}`);
  
  return userType;
};

export async function POST(request) {
  console.log('[LogoutAPI] Received logout request');
  
  try {
    const isSessionExpired = request.headers.get('x-session-expired') === 'true';
    const userType = await processLogout(request, isSessionExpired);

    // Clear cookies
    const response = NextResponse.json({ 
      success: true,
      message: isSessionExpired 
        ? 'Session expired and logged out' 
        : 'Logout successful' 
    });
    
    const cookiesToClear = ['email', 'sessionId', 'eid', 'id', 'lastActivity', 'redirect'];
    console.log(`[LogoutAPI] Clearing cookies: ${cookiesToClear.join(', ')}`);
    
    cookiesToClear.forEach(cookie => {
      response.cookies.set(cookie, '', { maxAge: 0 });
    });

    console.log('[LogoutAPI] Response prepared');
    return response;

  } catch (error) {
    console.error('[LogoutAPI] ERROR:', error);
    
    logger.error('Logout failed', {
      meta: {
        taskName: 'LogoutError',
        error: error.message,
        stack: error.stack
      }
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Logout Failed',
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}
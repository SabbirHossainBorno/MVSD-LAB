// app/api/logout/route.js
import { NextResponse } from 'next/server';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import { query } from '../../../lib/db';

// Format alert message for Telegram
const formatAlertMessage = (userType, email, ipAddress, idValue, userAgent, timeString) => {
  const getTitle = () => {
    switch (userType) {
      case 'admin':
        return '🔐 MVSD LAB ADMIN LOGOUT 🔐';
      case 'director':
        return '🧑‍💼 MVSD LAB DIRECTOR LOGOUT 🧑‍💼';
      default:
        return '👤 MVSD LAB MEMBER LOGOUT 👤';
    }
  };

  return `${getTitle()}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
         `Email       : ${email}\n` +
         `IP Address  : ${ipAddress}\n` +
         `Device Info : ${userAgent}\n` +
         `EID         : ${idValue || 'N/A'}\n` +
         `Time        : ${timeString}`+
         `Status      : Successful\n`;
};

// Update status for each user type
const updateAdminLogoutDetails = async (email) => {
  await query(
    `UPDATE admin SET status = 'Idle', last_logout_time = NOW() WHERE email = $1`,
    [email]
  );
};

const updateMemberLogoutDetails = async (email) => {
  await query(
    `UPDATE member_login_info_tracker 
     SET last_logout_time = NOW(), 
         login_state = 'Idle' 
     WHERE email = $1`,
    [email]
  );
};

const updateDirectorLogoutDetails = async (email) => {
  await query(
    `UPDATE director_login_info_tracker 
     SET last_logout_time = NOW(), 
         login_state = 'Idle' 
     WHERE email = $1`,
    [email]
  );
};

// Main logout API
export async function POST(request) {
  let email = '';
  let userType = 'member';
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown Device';

  // Format time in America/New_York with AM/PM
  const timeString = new Date().toLocaleString('en-GB', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).replace(',', '') + ' (America/New_York)';

  try {
    // Read cookies
    email = request.cookies.get('email')?.value;
    const sessionId = request.cookies.get('sessionId')?.value;
    const eid = request.cookies.get('eid')?.value;
    const id = request.cookies.get('id')?.value;

    // Determine user type
    if (id && id.startsWith('D')) {
      userType = 'director';
    } else if (email && email.endsWith('@mvsdlab.com')) {
      userType = 'admin';
    } else {
      userType = 'member';
    }

    // Update DB based on role
    if (userType === 'admin') {
      await updateAdminLogoutDetails(email);
    } else if (userType === 'director') {
      await updateDirectorLogoutDetails(email);
    } else {
      await updateMemberLogoutDetails(email);
    }

    // Prepare ID or EID for alert
    let idValue = 'N/A';
    if (userType === 'admin') {
      idValue = eid || 'N/A';
    } else if (userType === 'director') {
      idValue = id || 'N/A';
    } else {
      idValue = eid ? eid.split('-')[0] : 'N/A';
    }

    // Send Telegram alert
    const alertMessage = formatAlertMessage(
      userType,
      email,
      ipAddress,
      idValue,
      userAgent,
      timeString
    );
    await sendTelegramAlert(`\`\`\`\n${alertMessage}\n\`\`\``);

    // Logging
    logger.info(`${userType} logout processed`, {
      meta: {
        userType,
        email,
        sessionId,
        id: idValue,
        ipAddress,
        taskName: 'Logout',
        details: `Successful logout at ${timeString}`,
        logoutTime: new Date().toISOString()
      }
    });

    // Clear all session cookies
    const response = NextResponse.json({ message: 'Logout Successful' });
    ['email', 'sessionId', 'eid', 'lastActivity', 'redirect'].forEach(cookie => {
      response.cookies.set(cookie, '', { maxAge: 0 });
    });

    return response;

  } catch (error) {
    // Log errors with full detail
    logger.error('Logout processing failed', {
      meta: {
        userType,
        email,
        ipAddress,
        taskName: 'LogoutError',
        details: error.message,
        errorTime: new Date().toISOString(),
        stackTrace: error.stack
      }
    });

    return NextResponse.json(
      { message: 'Logout Failed' },
      { status: 500 }
    );
  }
}

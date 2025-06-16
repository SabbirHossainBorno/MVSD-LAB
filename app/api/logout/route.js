// app/api/logout/route.js
import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import { query } from '../../../lib/db';

// Format alert message for Telegram
const formatAlertMessage = (userType, email, ipAddress, idValue, eidValue, userAgent, timeString, reason) => {
  const getTitle = () => {
    switch (userType) {
      case 'admin':
        return '🟥 [ MVSD LAB | ADMIN LOGOUT ]';
      case 'director':
        return '🟥 [ MVSD LAB | DIRECTOR LOGOUT ]';
      default:
        return '🟥 [ MVSD LAB | MEMBER LOGOUT ]';
    }
  };

  let idLine = '';
  if (userType === 'director') {
    idLine = `🆔 Director ID : ${idValue || 'N/A'}\n`;
  } else if (userType === 'member') {
    idLine = `🆔 Member ID   : ${idValue || 'N/A'}\n`;
  }
  // For admin, no ID line

  let message = `${getTitle()}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📧 Email       : ${email || 'N/A'}\n` +
    `${idLine}` +
    `🌐 IP Address  : ${ipAddress}\n` +
    `🖥️ Device Info : ${userAgent}\n` +
    `🔖 EID         : ${eidValue || 'N/A'}\n` +
    `🕒 Time        : ${timeString}\n` +
    `📌 Status      : Successful`;
    
  // Add session timeout note
  if (reason === 'session_timeout') {
    message += '\n\nN:B: Session Time Out';
  }

  return message;
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
  let reason = 'normal';

  // Format time in America/New_York (EST/EDT)
  const now = DateTime.now().setZone('America/New_York');
  const timeString = `${now.toFormat("yyyy-LL-dd hh:mm:ss a")} (${now.offsetNameShort})`;

  try {
    // Parse request body for logout reason
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const body = await request.json();
      reason = body.reason || 'normal';
    }
    // Read cookies BEFORE clearing
    email = request.cookies.get('email')?.value || '';
    const sessionId = request.cookies.get('sessionId')?.value || '';
    const eid = request.cookies.get('eid')?.value || '';
    const id = request.cookies.get('id')?.value || '';

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

    // Prepare ID value for alert message
    // Admin: idValue = 'N/A'
    // Director and Member: idValue = id cookie
    let idValue = 'N/A';
    if (userType === 'director' || userType === 'member') {
      idValue = id || 'N/A';
    }

    // EID always full eid cookie (or N/A)
    const eidValue = eid || 'N/A';

    // Send Telegram alert
    const alertMessage = formatAlertMessage(
      userType,
      email,
      ipAddress,
      idValue,
      eidValue,
      userAgent,
      timeString,
      reason
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
    ['email', 'sessionId', 'eid', 'id', 'lastActivity', 'redirect'].forEach(cookie => {
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

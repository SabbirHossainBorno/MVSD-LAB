// app/api/logout/route.js
import { NextResponse } from 'next/server';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import { query } from '../../../lib/db';

const formatAlertMessage = (userType, title, email, ipAddress, additionalInfo = '') => {
  const header = userType === 'admin' 
    ? "MVSD LAB DASHBOARD\n------------------------------------\n"
    : "MVSD LAB MEMBER DASHBOARD\n--------------------------------------------------\n";
  return `${header}${title}\nEmail : ${email}\nIP : ${ipAddress}${additionalInfo}`;
};

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

export async function POST(request) {
  let email = '';
  let userType = 'member';
  try {
    email = request.cookies.get('email')?.value;
    const sessionId = request.cookies.get('sessionId')?.value;
    const eid = request.cookies.get('eid')?.value;
    const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';

    // Determine user type
    userType = email.endsWith('@mvsdlab.com') ? 'admin' : 'member';

    // Update appropriate table
    if (userType === 'admin') {
      await updateAdminLogoutDetails(email);
    } else {
      await updateMemberLogoutDetails(email);
    }

    logger.info(`${userType} logged out`, {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Logout',
        details: `${userType} ${email} logged out from ${ipAddress}`
      }
    });

    const additionalInfo = userType === 'member' ? `\nMemberID : ${eid?.split('-')[0]}` : '';
    await sendTelegramAlert(formatAlertMessage(
      userType,
      'Logged Out Successfully!',
      email,
      ipAddress,
      additionalInfo
    ));

    // Clear cookies
    const response = NextResponse.json({ message: 'Logout Successful' });
    ['email', 'sessionId', 'eid', 'lastActivity', 'redirect'].forEach(cookie => {
      response.cookies.set(cookie, '', { maxAge: 0 });
    });

    return response;

  } catch (error) {
    logger.error('Logout failed', {
      meta: {
        userType,
        email,
        taskName: 'LogoutError',
        details: error.message
      }
    });
    
    return NextResponse.json(
      { message: 'Logout Failed' }, 
      { status: 500 }
    );
  }
}
//app/api/logout/route.js

import { NextResponse } from 'next/server';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, email, ipAddress, additionalInfo = '') => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\nEmail : ${email}\nIP : ${ipAddress}${additionalInfo}`;
};

export async function POST(req) {
  try {
    // Retrieve cookies from the request
    const email = req.cookies.get('email')?.value;
    const sessionId = req.cookies.get('sessionId')?.value;
    const ipAddress = req.headers.get('x-forwarded-for') || req.connection.remoteAddress;

    // Log the logout event
    logger.info('User logged out successfully', {
      meta: {
        eid: '',
        sid: sessionId,
        taskName: 'Logout',
        details: `User ${email} logged out successfully from IP ${ipAddress}`
      }
    });

    // Send the Telegram alert
    const logoutMessage = formatAlertMessage('Logged Out Successfully!', email, ipAddress);
    await sendTelegramAlert(logoutMessage);

    // Clear cookies
    const response = NextResponse.json({ message: 'Logout Successful' });
    response.cookies.set('email', '', { maxAge: 0 });
    response.cookies.set('sessionId', '', { maxAge: 0 });
    response.cookies.set('lastActivity', '', { maxAge: 0 });

    return response;
  } catch (error) {
    logger.error('Logout failed', {
      meta: {
        eid: '',
        sid: '',
        taskName: 'Logout',
        details: `Logout failed for user ${email}: ${error.message}`
      }
    });
    return NextResponse.json({ message: 'Logout Failed' }, { status: 500 });
  }
}
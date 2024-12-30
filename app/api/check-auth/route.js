// app/api/check-auth/route.js
import { NextResponse } from 'next/server';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import { handleSessionExpiration } from '../../../lib/sessionUtils';

const formatAlertMessage = (title, email, ipAddress, additionalInfo = '') => {
  return `MVSD LAB AUTH-CHECKER\n----------------------------------------\n${title}\nEmail : ${email}\nIP : ${ipAddress}${additionalInfo}`;
};

const validateSession = (request) => {
  const sessionId = request.cookies.get('sessionId')?.value;
  const eid = request.cookies.get('eid')?.value || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr');
  const userAgent = request.headers.get('user-agent');
  const emailCookie = request.cookies.get('email');
  const email = emailCookie ? emailCookie.value : null;

  return { sessionId, eid, ip, userAgent, email };
};

export async function GET(request) {
  const { sessionId, eid, ip, userAgent, email } = validateSession(request);

  if (!email || !sessionId) {
    const alertMessage = formatAlertMessage('Unauthorized Access Attempt!', email, ip);
    await sendTelegramAlert(alertMessage);

    logger.warn('Unauthorized access attempt', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Auth Check',
        details: `Unauthorized access attempt from IP ${ip} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({ authenticated: false });
  }

  try {
    const now = new Date();
    const lastActivity = request.cookies.get('lastActivity')?.value;
    const lastActivityDate = new Date(lastActivity);
    const diff = now - lastActivityDate;

    if (diff > 10 * 60 * 1000) { // 10 minutes
      await handleSessionExpiration(); // Remove router argument
      return NextResponse.json({ authenticated: false, message: 'Session expired' });
    }

    const alertMessage = formatAlertMessage('Authentication Check Successful', email, ip);
    await sendTelegramAlert(alertMessage);

    logger.info('Authentication check successful', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Auth Check',
        details: `Authentication check successful for ${email} from IP ${ip} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    const alertMessage = formatAlertMessage('Error during authentication check', email, ip, `\nError: ${error.message}`);
    await sendTelegramAlert(alertMessage);

    logger.error('Error during authentication check', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Auth Check',
        details: `Error during authentication check for ${email}: ${error.message} from IP ${ip} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({ authenticated: false, message: 'Internal server error' });
  }
}
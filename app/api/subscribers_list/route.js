// /app/api/subscribers_list/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

export async function GET(request) {
  const sessionId = request.cookies.get('sessionId') || 'Unknown Session';
  const eid = request.cookies.get('eid') || 'Unknown EID';
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const queryText = 'SELECT id, email, date FROM subscriber';
    const result = await query(queryText);

    const successMessage = formatAlertMessage('Subscribers List API Called Successfully', `IP: ${ipAddress}\nUser-Agent: ${userAgent}\nStatus: 200`);
    await sendTelegramAlert(successMessage);

    logger.info('Subscribers list fetched successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Subscribers List',
        details: `Fetched subscribers list successfully from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({ subscribers: result.rows });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Fetching Subscribers List', `IP: ${ipAddress}\nUser-Agent: ${userAgent}\nError: ${error.message}\nStatus: 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching subscribers list', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Subscribers List',
        details: `Error fetching subscribers list from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
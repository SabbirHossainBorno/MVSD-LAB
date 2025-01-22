// /app/api/message/route.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

export async function GET(request) {
  const sessionId = uuidv4();
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  logger.info('Received message fetch request', {
    meta: {
      eid: '',
      sid: sessionId,
      taskName: 'Fetch Messages',
      details: `Fetch messages request from IP ${ipAddress} with User-Agent ${userAgent}`
    }
  });

  try {
    const { searchParams } = new URL(request.url);
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const queryText = `SELECT id, name, email, subject, message, date FROM home_contact_us ORDER BY date ${sortOrder.toUpperCase()}`;
    const result = await query(queryText);

    logger.info('Fetched messages successfully', {
      meta: {
        eid: '',
        sid: sessionId,
        taskName: 'Fetch Messages',
        details: `Fetched ${result.rows.length} messages from database`
      }
    });

    return NextResponse.json({ message: result.rows });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error fetching messages', `IP: ${ipAddress}\nError: ${error.message}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching messages', {
      meta: {
        eid: '',
        sid: sessionId,
        taskName: 'Fetch Messages',
        details: `Error fetching messages: ${error.message}`
      }
    });

    return NextResponse.json({ message: 'Failed to fetch messages' }, { status: 500 });
  }
}
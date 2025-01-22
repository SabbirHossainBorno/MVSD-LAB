// app/api/subscribe/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB HOME\n--------------------------\n${title}\n${details}`;
};

const generateSubscriberId = async () => {
  try {
    const result = await query('SELECT MAX(id) AS max_id FROM subscriber');
    const maxId = result.rows[0]?.max_id || 'SUB00MVSD';
    const numericPart = parseInt(maxId.substring(3, 5), 10) || 0;
    const nextId = numericPart + 1;
    const formattedId = `SUB${String(nextId).padStart(2, '0')}MVSD`;
    return formattedId;
  } catch (error) {
    throw new Error(`Error generating Subscriber ID: ${error.message}`);
  }
};

export async function POST(request) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const { email } = await request.json();

    if (!email) {
      const message = 'Email is required';
      await sendTelegramAlert(formatAlertMessage('Subscription Error', `IP: ${ipAddress}\nError: ${message}`));
      logger.warn('Subscription error', {
        meta: {
          eid: '',
          sid: '',
          taskName: 'Home - Subscribe',
          details: `Subscription error: ${message} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    const checkResult = await query('SELECT email FROM subscriber WHERE email = $1', [email]);

    if (checkResult.rows.length > 0) {
      const logMessage = `You are already a subscriber. \nEmail : ${email}`;
      const userMessage = 'You are already a subscriber.';
      await sendTelegramAlert(formatAlertMessage('Subscription Error', `IP : ${ipAddress}\nError : ${logMessage}`));
      logger.warn('Subscription error', {
        meta: {
          eid: '',
          sid: '',
          taskName: 'Home - Subscribe',
          details: `Subscription error : ${logMessage} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
      return NextResponse.json({ success: false, message: userMessage }, { status: 400 });
    }

    const subscriberId = await generateSubscriberId();
    const result = await query(
      'INSERT INTO subscriber (id, email, date) VALUES ($1, $2, NOW()) RETURNING serial',
      [subscriberId, email]
    );

    const { serial } = result.rows[0];
    const notificationTitle = `MVSD LAB Got New Subscriber [${subscriberId}]`;
    const notificationStatus = 'Unread';
    await query('INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3)', [subscriberId, notificationTitle, notificationStatus]);

    await sendTelegramAlert(formatAlertMessage('New Subscriber', `ID : ${subscriberId}\nEmail : ${email}`));
    logger.info('New subscriber added', {
      meta: {
        eid: '',
        sid: '',
        taskName: 'Home - Subscribe',
        details: `New subscriber added with ID ${subscriberId} and email ${email} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({ success: true, message: 'Subscription Successful!', serial });
  } catch (error) {
    const errorMessage = `Database error: ${error.message}`;
    await sendTelegramAlert(formatAlertMessage('Subscription Error', `IP : ${ipAddress}\nError : ${errorMessage}`));
    logger.error('Database error', {
      meta: {
        eid: '',
        sid: '',
        taskName: 'Home - Subscribe',
        details: `Database error: ${error.message} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });
    return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
  }
}
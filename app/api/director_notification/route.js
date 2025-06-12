// app/api/director_notification/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DIRECTOR DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

export async function GET(request) {
  const sid = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const notificationsQuery = `
      SELECT serial, title, status, created_at
      FROM director_notification_details 
      ORDER BY created_at DESC
    `;
    const result = await query(notificationsQuery);
    
    logger.info('Fetched director notifications successfully', {
      meta: {
        eid,
        sid,
        taskName: 'Fetch Director Notifications',
        details: `Fetched ${result.rows.length} notifications from IP ${ipAddress}`
      }
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    const errorMessage = formatAlertMessage('DIRECTOR NOTIFICATION FETCH ERROR', `Error: ${error.message}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching director notifications', {
      meta: {
        eid,
        sid,
        taskName: 'Fetch Director Notifications',
        details: `IP ${ipAddress}: ${error.message}`
      }
    });

    return NextResponse.json(
      { message: 'Failed to fetch director notifications' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const sid = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const body = await request.json();
    const { notificationSerial, notificationSerials, status } = body;

    // Single notification update
    if (notificationSerial) {
      const updateQuery = `
        UPDATE director_notification_details 
        SET status = $1 
        WHERE serial = $2
        RETURNING serial
      `;
      const result = await query(updateQuery, [status, notificationSerial]);
      
      if (result.rowCount === 0) {
        throw new Error(`Notification with serial ${notificationSerial} not found`);
      }
    } 
    // Multiple notifications update
    else if (notificationSerials?.length > 0) {
      const placeholders = notificationSerials.map((_, i) => `$${i+2}`).join(',');
      const updateQuery = `
        UPDATE director_notification_details 
        SET status = $1 
        WHERE serial IN (${placeholders})
        RETURNING serial
      `;
      const result = await query(updateQuery, [status, ...notificationSerials]);
      
      if (result.rowCount === 0) {
        throw new Error(`No notifications found with provided serials`);
      }
    } else {
      return NextResponse.json(
        { message: 'Invalid request parameters' }, 
        { status: 400 }
      );
    }

    const successMessage = formatAlertMessage(
      'DIRECTOR NOTIFICATION UPDATED', 
      `Status: ${status}\nSerials: ${notificationSerial || notificationSerials.join(', ')}`
    );
    await sendTelegramAlert(successMessage);

    logger.info('Updated director notification status', {
      meta: {
        eid,
        sid,
        taskName: 'Update Director Notification',
        details: `Updated status to ${status} from IP ${ipAddress}`
      }
    });

    return NextResponse.json({ message: 'Notification status updated successfully' });
  } catch (error) {
    const errorMessage = formatAlertMessage('DIRECTOR NOTIFICATION UPDATE ERROR', `Error: ${error.message}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error updating director notification', {
      meta: {
        eid,
        sid,
        taskName: 'Update Director Notification',
        details: `IP ${ipAddress}: ${error.message}`
      }
    });

    return NextResponse.json(
      { message: error.message || 'Failed to update notification status' }, 
      { status: 500 }
    );
  }
}
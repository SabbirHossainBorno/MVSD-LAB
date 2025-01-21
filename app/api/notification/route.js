// app/api/notification/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

export async function GET(request) {
  const sid = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const notificationsQuery = 'SELECT * FROM notification_details ORDER BY created_at DESC';
    const notifications = await query(notificationsQuery);

    logger.info('Fetched notifications successfully', {
      meta: {
        eid,
        sid,
        taskName: 'Fetch Notifications',
        details: `Fetched notifications from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json(notifications.rows);
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Fetching Notifications', `Error: ${error.message}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching notifications', {
      meta: {
        eid,
        sid,
        taskName: 'Fetch Notifications',
        details: `Error fetching notifications from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request) {
  const sid = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const { notificationId, status } = await request.json();
    const updateQuery = 'UPDATE notification_details SET status = $1 WHERE id = $2';
    await query(updateQuery, [status, notificationId]);

    const successMessage = formatAlertMessage('Notification Status Updated', `Notification ID : ${notificationId}, \nStatus : ${status}`);
    await sendTelegramAlert(successMessage);

    logger.info('Updated notification status successfully', {
      meta: {
        eid,
        sid,
        taskName: 'Update Notification Status',
        details: `Updated notification ID ${notificationId} to status ${status} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({ message: 'Notification status updated successfully' });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Updating Notification Status', `Error: ${error.message}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error updating notification status', {
      meta: {
        eid,
        sid,
        taskName: 'Update Notification Status',
        details: `Error updating notification ID ${notificationId} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: 'Failed to update notification status' }, { status: 500 });
  }
}
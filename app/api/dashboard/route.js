// app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger'; // Import the logger
import sendTelegramAlert from '../../../lib/telegramAlert'; // Import the Telegram alert function

const formatAlertMessage = (title, email, ipAddress, userAgent, additionalInfo = '') => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\nEmail : ${email}\nIP : ${ipAddress}\nDevice INFO : ${userAgent}${additionalInfo}`;
};

const validateSession = (request) => {
  const sessionId = request.cookies.get('sessionId')?.value;
  const eid = request.cookies.get('eid')?.value || ''; // Retrieve EID from cookies
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr');
  const userAgent = request.headers.get('user-agent');
  const emailCookie = request.cookies.get('email');
  const email = emailCookie ? emailCookie.value : null;

  return { sessionId, eid, ip, userAgent, email };
};

export async function GET(request) {
  try {
    const { sessionId, eid, ip, userAgent, email } = validateSession(request);

    const loginAttemptMessage = formatAlertMessage('Fetching Dashboard Data', email, ip, userAgent);
    await sendTelegramAlert(loginAttemptMessage);

    logger.info('Fetching dashboard data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Dashboard Data',
        details: `Fetching dashboard data for ${email} from IP ${ip} with User-Agent ${userAgent}`
      }
    });

    const subscriberCountQuery = 'SELECT COUNT(*) FROM subscriber';
    const userDetailsQuery = 'SELECT * FROM users';
    const professorDetailsQuery = 'SELECT COUNT(*) AS count FROM professor_basic_info';
    const messageDetailsQuery = 'SELECT COUNT(*) AS count FROM home_contact_us';
    const recentProfessorsQuery = 'SELECT id, first_name, last_name, phone, dob, email, short_bio, joining_date, leaving_date, photo, status, type FROM professor_basic_info ORDER BY id DESC LIMIT 5';
    const recentSubscribersQuery = 'SELECT * FROM subscriber ORDER BY date DESC LIMIT 7';
    const recentUsersQuery = 'SELECT * FROM users WHERE status = \'approved\' ORDER BY id DESC LIMIT 5';

    const [subscriberCount, userDetails, professorDetails, messageDetails, recentSubscribers, recentUsers, recentProfessors] = await Promise.all([
      query(subscriberCountQuery),
      query(userDetailsQuery),
      query(professorDetailsQuery),
      query(messageDetailsQuery),
      query(recentSubscribersQuery),
      query(recentUsersQuery),
      query(recentProfessorsQuery),
    ]);

    const successMessage = formatAlertMessage('Dashboard Data Fetched Successfully', email, ip, userAgent);
    await sendTelegramAlert(successMessage);

    logger.info('Dashboard data fetched successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Dashboard Data',
        details: `Dashboard data fetched successfully for ${email} from IP ${ip} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({
      subscribers: subscriberCount.rows[0].count,
      users: userDetails.rows,
      professorCount: professorDetails.rows[0].count,
      messageCount: messageDetails.rows[0].count,
      recentSubscribers: recentSubscribers.rows,
      recentUsers: recentUsers.rows,
      recentProfessors: recentProfessors.rows,
    });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Fetching Dashboard Data', email, ip, userAgent, `\nError: ${error.message}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching dashboard data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Dashboard Data',
        details: `Error fetching dashboard data for ${email}: ${error.message} from IP ${ip} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({ message: 'Failed To Fetch Data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { sessionId, eid, ip, userAgent, email } = validateSession(request);
    const { userId, newStatus } = await request.json();

    const updateAttemptMessage = formatAlertMessage('Updating User Status', email, ip, userAgent, `\nUSER ID: ${userId} to ${newStatus}`);
    await sendTelegramAlert(updateAttemptMessage);

    logger.info('Updating user status', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Update User Status',
        details: `Updating status for user ${userId} to ${newStatus} by ${email} from IP ${ip} with User-Agent ${userAgent}`
      }
    });

    const updateStatusQuery = 'UPDATE users SET status = $1 WHERE id = $2 RETURNING *';
    const updatedUser = await query(updateStatusQuery, [newStatus, userId]);

    const successMessage = formatAlertMessage('User Status Updated Successfully', email, ip, userAgent, `\nUSER ID: ${userId}`);
    await sendTelegramAlert(successMessage);

    logger.info('User status updated successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Update User Status',
        details: `User status updated successfully for ${userId} by ${email} from IP ${ip} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({
      message: 'User Status Updated Successfully',
      user: updatedUser.rows[0],
    });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Updating User Status', email, ip, userAgent, `\nError: ${error.message}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error updating user status', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Update User Status',
        details: `Error updating user status for ${userId} by ${email}: ${error.message} from IP ${ip} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({ message: 'Failed to update user status' }, { status: 500 });
  }
}
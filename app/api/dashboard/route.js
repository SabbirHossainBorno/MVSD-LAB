// app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger'; // Import the logger
import sendTelegramAlert from '../../../lib/telegramAlert'; // Import the Telegram alert function

const formatAlertMessage = (title, email, ipAddress) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\nEmail : ${email}\nIP : ${ipAddress}`;
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
  const { sessionId, eid, ip, userAgent, email } = validateSession(request);

  if (!email || !sessionId) {
    const alertMessage = formatAlertMessage('Unauthorized Access Attempt!', email, ip);
    await sendTelegramAlert(alertMessage);

    logger.warn('Unauthorized access attempt', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Dashboard Data',
        details: `Unauthorized access attempt from IP ${ip} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({ authenticated: false });
  }

  try {
    // Log and alert fetching dashboard data
    const fetchAttemptMessage = formatAlertMessage('Fetching Dashboard Data', email, ip);
    await sendTelegramAlert(fetchAttemptMessage);

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
    const adminDetailsQuery = 'SELECT * FROM admin'; // Add query for admin data
    const currentLoginCountQuery = 'SELECT COUNT(*) AS count FROM admin WHERE status = \'Active\''; // Add query for current login count

    const [subscriberCount, userDetails, professorDetails, messageDetails, recentSubscribers, recentUsers, recentProfessors, adminDetails, currentLoginCount] = await Promise.all([
      query(subscriberCountQuery),
      query(userDetailsQuery),
      query(professorDetailsQuery),
      query(messageDetailsQuery),
      query(recentSubscribersQuery),
      query(recentUsersQuery),
      query(recentProfessorsQuery),
      query(adminDetailsQuery), // Fetch admin data
      query(currentLoginCountQuery), // Fetch current login count
    ]);

    // Log and alert successful data fetch
    const successMessage = formatAlertMessage('Dashboard Data Fetched Successfully', email, ip);
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
      admins: adminDetails.rows, // Include admin data in the response
      currentLoginCount: currentLoginCount.rows[0].count, // Include current login count in the response
    });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Fetching Dashboard Data', email, ip, `\nError: ${error.message}`);
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
  const { sessionId, eid, ip, userAgent, email } = validateSession(request);
  const { userId, newStatus } = await request.json();

  if (!email || !sessionId) {
    const alertMessage = formatAlertMessage('Unauthorized Access Attempt!', email, ip);
    await sendTelegramAlert(alertMessage);

    logger.warn('Unauthorized access attempt', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Update User Status',
        details: `Unauthorized access attempt from IP ${ip} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({ authenticated: false });
  }

  try {
    // Log and alert updating user status
    const updateAttemptMessage = formatAlertMessage('Updating User Status', email, ip, `\nUSER ID: ${userId} to ${newStatus}`);
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

    // Log and alert successful status update
    const successMessage = formatAlertMessage('User Status Updated Successfully', email, ip, `\nUSER ID: ${userId}`);
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
    const errorMessage = formatAlertMessage('Error Updating User Status', email, ip, `\nError: ${error.message}`);
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
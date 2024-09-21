// app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const logAndAlert = async (message, sessionId, details = {}) => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await axios.post(`${siteUrl}/api/log-and-alert`, { message, sessionId, details });
  } catch (error) {
    console.error('Failed to log and send alert:', error);
  }
};

const validateSession = (request) => {
  const sessionId = uuidv4();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr');
  const userAgent = request.headers.get('user-agent');
  const email = request.cookies.get('email')?.value;
  const lastActivity = request.cookies.get('lastActivity')?.value;

  if (!email || !sessionId) {
    logAndAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nUnauthorized Access Attempt!`, sessionId, { ip, userAgent });
    throw new Error('Unauthorized');
  }

  const now = new Date();
  const lastActivityDate = new Date(lastActivity);
  const diff = now - lastActivityDate;

  if (diff > 10 * 60 * 1000) { // 10 minutes
    logAndAlert(`MVSD LAB DASHBOARD\n------------------------------------\nSession Expired!-dashboard\nEmail : ${email}`, sessionId, { ip, userAgent });
    throw new Error('Session Expired!');
  }

  return { sessionId, ip, userAgent, email };
};

export async function GET(request) {
  let client;
  try {
    const { sessionId, ip, userAgent, email } = validateSession(request);
    client = await pool.connect();

    logAndAlert(`MVSD LAB DASHBOARD\n------------------------------------\nFetching Dashboard Data.\nEmail : ${email}`, sessionId, { ip, userAgent });

    const subscriberCountQuery = 'SELECT COUNT(*) FROM subscriber';
    const userDetailsQuery = 'SELECT * FROM users';
    const professorDetailsQuery = 'SELECT COUNT(*) AS count FROM professor_basic_info';
    const recentProfessorsQuery = 'SELECT id, first_name, last_name, phone, dob, email, short_bio, joining_date, leaving_date, photo, status, type FROM professor_basic_info ORDER BY id DESC LIMIT 5';
    const recentSubscribersQuery = 'SELECT * FROM subscriber ORDER BY date DESC LIMIT 7';
    const recentUsersQuery = 'SELECT * FROM users WHERE status = \'approved\' ORDER BY id DESC LIMIT 5';

    const [subscriberCount, userDetails, professorDetails, recentSubscribers, recentUsers, recentProfessors] = await Promise.all([
      client.query(subscriberCountQuery),
      client.query(userDetailsQuery),
      client.query(professorDetailsQuery),
      client.query(recentSubscribersQuery),
      client.query(recentUsersQuery),
      client.query(recentProfessorsQuery),
    ]);

    logAndAlert(`MVSD LAB DASHBOARD\n------------------------------------\nDashboard Data Fetched Successfully.\nEmail : ${email}`, sessionId);
    return NextResponse.json({
      subscribers: subscriberCount.rows[0].count,
      users: userDetails.rows,
      professorCount: professorDetails.rows[0].count,
      recentSubscribers: recentSubscribers.rows,
      recentUsers: recentUsers.rows,
      recentProfessors: recentProfessors.rows,
    });
  } catch (error) {
    logAndAlert(`MVSD LAB DASHBOARD\n------------------------------------\nError Fetching Dashboard Data - ${error.message}`, sessionId);
    return NextResponse.json({ message: 'Failed To Fetch Data' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

export async function POST(request) {
  let client;
  try {
    const { sessionId, ip, userAgent, email } = validateSession(request);
    const { userId, newStatus } = await request.json();

    client = await pool.connect();
    logAndAlert(`MVSD LAB DASHBOARD\n------------------------------------\nUpdating User Status.\nUSER ID : ${userId} To ${newStatus}\nBy Email : ${email}`, sessionId, { ip, userAgent });

    const updateStatusQuery = 'UPDATE users SET status = $1 WHERE id = $2 RETURNING *';
    const updatedUser = await client.query(updateStatusQuery, [newStatus, userId]);

    logAndAlert(`MVSD LAB DASHBOARD\n------------------------------------\nUser Status Updated Successfully.\nUSER ID : ${userId}\nBy Email : ${email}`, sessionId);
    return NextResponse.json({
      message: 'User Status Updated Successfully',
      user: updatedUser.rows[0],
    });
  } catch (error) {
    logAndAlert(`MVSD LAB DASHBOARD\n------------------------------------\nError Updating User Status - ${error.message}`, sessionId);
    return NextResponse.json({ message: 'Failed to update user status' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

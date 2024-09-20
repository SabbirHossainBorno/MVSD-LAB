//app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const logFilePath = path.join('/home/mvsd-lab/Log', 'mvsd_lab.log');

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

if (!TELEGRAM_API_KEY || !TELEGRAM_GROUP_ID || !process.env.DATABASE_URL) {
  throw new Error('Missing necessary environment variables');
}

const log = (message, sessionId, details = {}) => {
  const logMessage = `${new Date().toISOString()} [Session ID: ${sessionId}] ${message} ${JSON.stringify(details)}\n`;
  fs.appendFileSync(logFilePath, logMessage);
};

const sendTelegramAlert = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_GROUP_ID,
      text: message,
    });
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
  }
};

const validateSession = (request) => {
  const sessionId = uuidv4();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr');
  const userAgent = request.headers.get('user-agent');
  const email = request.cookies.get('email')?.value;
  const lastActivity = request.cookies.get('lastActivity')?.value;

  if (!email || !sessionId) {
    log(`Unauthorized access attempt`, sessionId, { ip, userAgent });
    sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nUnauthorized Access Attempt`);
    throw new Error('Unauthorized');
  }

  const now = new Date();
  const lastActivityDate = new Date(lastActivity);
  const diff = now - lastActivityDate;

  if (diff > 10 * 60 * 1000) { // 10 minutes
    log(`Session expired for email: ${email}`, sessionId, { ip, userAgent });
    sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nSession Expired.\nPlease Login Again.\nEmail : ${email}`);
    throw new Error('Session Expired');
  }

  return { sessionId, ip, userAgent, email };
};

export async function GET(request) {
  let client;
  try {
    const { sessionId, ip, userAgent, email } = validateSession(request);
    client = await pool.connect();

    log(`Fetching dashboard data for email: ${email}`, sessionId, { ip, userAgent });

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

    log(`Dashboard data fetched successfully for email: ${email}`, sessionId);
    sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nDashboard Data Fetched Successfully.\nEmail : ${email}`);

    return NextResponse.json({
      subscribers: subscriberCount.rows[0].count,
      users: userDetails.rows,
      professorCount: professorDetails.rows[0].count,
      recentSubscribers: recentSubscribers.rows,
      recentUsers: recentUsers.rows,
      recentProfessors: recentProfessors.rows,
    });
  } catch (error) {
    log(`Error fetching dashboard data - ${error.message}`, sessionId);
    sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nError Fetching Dashboard Data - ${error.message}`);
    return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
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
    log(`Updating user status for userId: ${userId} to ${newStatus} by email: ${email}`, sessionId, { ip, userAgent });

    const updateStatusQuery = 'UPDATE users SET status = $1 WHERE id = $2 RETURNING *';
    const updatedUser = await client.query(updateStatusQuery, [newStatus, userId]);

    log(`User status updated successfully for userId: ${userId} by email: ${email}`, sessionId);
    sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nUser Status Updated Successfully.\nUser ID : ${userId} \nBy Email : ${email}`);

    return NextResponse.json({
      message: 'User status updated successfully',
      user: updatedUser.rows[0],
    });
  } catch (error) {
    log(`Error updating user status - ${error.message}`, sessionId);
    sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nError Updating User Status - ${error.message}`);
    return NextResponse.json({ message: 'Failed to update user status' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

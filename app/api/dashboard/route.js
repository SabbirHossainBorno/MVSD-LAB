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

export async function GET(request) {
  const sessionId = uuidv4(); // Generate a unique session ID for this request
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr');
  const userAgent = request.headers.get('user-agent');
  const email = request.cookies.get('email')?.value;
  const lastActivity = request.cookies.get('lastActivity')?.value;

  if (!email || !sessionId) {
    log(`Unauthorized access attempt to dashboard`, sessionId, { ip, userAgent });
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nUnauthorized Access Attempt To Dashboard`);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const lastActivityDate = new Date(lastActivity);
  const diff = now - lastActivityDate;

  if (diff > 10 * 60 * 1000) { // 10 minutes
    log(`Session expired for email: ${email}`, sessionId, { ip, userAgent });
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nSession Expired.\nEmail : ${email}`);
    return NextResponse.json({ message: 'Session expired' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    log(`Fetching dashboard data for email: ${email}`, sessionId, { ip, userAgent });

    const subscriberCountQuery = 'SELECT COUNT(*) FROM subscriber';
    const userDetailsQuery = 'SELECT * FROM users';
    const professorDetailsQuery = 'SELECT COUNT(*) AS count FROM professor_basic_info'; // Total professors count
    const recentProfessorsQuery = 'SELECT id, first_name, last_name, phone, dob, email, short_bio, joining_date, leaving_date, photo, status, type FROM professor_basic_info ORDER BY id DESC LIMIT 5';
    const recentSubscribersQuery = 'SELECT * FROM subscriber ORDER BY date DESC LIMIT 7';
    const recentUsersQuery = 'SELECT * FROM users WHERE status = \'approved\' ORDER BY id DESC LIMIT 5';

    const subscriberCount = await client.query(subscriberCountQuery);
    const userDetails = await client.query(userDetailsQuery);
    const professorDetails = await client.query(professorDetailsQuery);
    const recentSubscribers = await client.query(recentSubscribersQuery);
    const recentUsers = await client.query(recentUsersQuery);
    const recentProfessors = await client.query(recentProfessorsQuery);

    log(`Dashboard data fetched successfully for email: ${email}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nDashboard Data Fetched Successfully.\nEmail : ${email}`);

    return NextResponse.json({
      subscribers: subscriberCount.rows[0].count,
      users: userDetails.rows,
      professorCount: professorDetails.rows[0].count, // Total professor count
      recentSubscribers: recentSubscribers.rows,
      recentUsers: recentUsers.rows,
      recentProfessors: recentProfessors.rows, // Recent professors
    });
  } catch (error) {
    log(`Error fetching dashboard data for email: ${email} - ${error.message}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nError Fetching Dashboard Data.\nEmail : ${email} - ${error.message}`);
    return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(request) {
  const sessionId = uuidv4(); // Generate a unique session ID for this request
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr');
  const userAgent = request.headers.get('user-agent');
  const email = request.cookies.get('email')?.value;
  const lastActivity = request.cookies.get('lastActivity')?.value;

  if (!email || !sessionId) {
    log(`Unauthorized access attempt to update user status`, sessionId, { ip, userAgent });
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nUnauthorized Access Attempt To Update User Status.`);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { userId, newStatus } = await request.json();
  const client = await pool.connect();
  try {
    log(`Updating user status for userId: ${userId} to ${newStatus} by email: ${email}`, sessionId, { ip, userAgent });

    const updateStatusQuery = 'UPDATE users SET status = $1 WHERE id = $2 RETURNING *';
    const updatedUser = await client.query(updateStatusQuery, [newStatus, userId]);

    log(`User status updated successfully for userId: ${userId} by email: ${email}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nUser Status Updated Successfully.\nUser ID : ${userId} \nBy Email : ${email}`);

    return NextResponse.json({
      message: 'User status updated successfully',
      user: updatedUser.rows[0],
    });
  } catch (error) {
    log(`Error updating user status for userId: ${userId} by email: ${email} - ${error.message}`, sessionId);
    await sendTelegramAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nError Updating User Status.\nUser ID : ${userId} \nBy Email : ${email} - ${error.message}`);
    return NextResponse.json({ message: 'Failed to update user status' }, { status: 500 });
  } finally {
    client.release();
  }
}

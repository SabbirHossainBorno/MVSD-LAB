// app/api/subscribe/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this is correct
});

// Helper function to call logAndAlert API
const logAndAlert = async (message, sessionId, details = {}) => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await axios.post(`${siteUrl}/api/log-and-alert`, { message, sessionId, details });
  } catch (error) {
    console.error('Failed to log and send alert:', error);
  }
};

// Helper function to generate the next Subscriber ID
const generateSubscriberId = async () => {
  const client = await pool.connect();
  try {
    await logAndAlert('Initiating Subscriber ID generation...', 'SYSTEM');
    const result = await client.query('SELECT MAX(id) AS max_id FROM subscriber');
    const maxId = result.rows[0]?.max_id || 'SUB00MVSD';
    const numericPart = parseInt(maxId.substring(1, 3), 10) || 0;
    const nextId = numericPart + 1;
    const formattedId = `SUB${String(nextId).padStart(2, '0')}MVSD`;
    await logAndAlert(`Subscriber ID generated successfully: ${formattedId}`, 'SYSTEM');
    return formattedId;
  } catch (error) {
    await logAndAlert(`Error occurred during Subscriber ID generation: ${error.message}`, 'SYSTEM');
    throw error;
  } finally {
    client.release();
  }
};

    const subscriberId = await generateSubscriberId();
    await logAndAlert(`New Subscriber ID generated: ${subscriberId}`, 'SYSTEM');

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
      await logAndAlert('Email is required', 'SYSTEM');
    }

    const client = await pool.connect();
    try {
      // Check if the email already exists
      const checkResult = await client.query(
        'SELECT email FROM subscriber WHERE email = $1',
        [email]
      );

      if (checkResult.rows.length > 0) {
        return NextResponse.json({ success: false, message: 'You are already a subscriber.' }, { status: 400 });
      }

      // Insert new subscriber with current date
      const result = await client.query(
        'INSERT INTO subscriber (id, email, date) VALUES ($1, $2, NOW()) RETURNING serial',
        [email]
      );
      
      // Insert notification
      const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
      const Id = `${subscriberId}`; 
      const notificationTitle = `MVDS LAB GOT NEW SUBSCRIBER [${subscriberId}]`;
      const notificationStatus = 'Unread';
      const notificationInsertResult = await client.query(insertNotificationQuery, [Id, notificationTitle, notificationStatus]);
      await logAndAlert('Notification inserted successfully.', 'SYSTEM');



      

      const { serial } = result.rows[0];

      return NextResponse.json({ success: true, message: 'Subscription successful!', serial });
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}

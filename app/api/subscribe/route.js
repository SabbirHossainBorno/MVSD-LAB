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
    const numericPart = parseInt(maxId.substring(3, 5), 10) || 0;
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

// Main POST function
export async function POST(request) {
  const sessionId = 'SYSTEM'; // Replace with actual session ID if available
  try {
    const { email } = await request.json();

    // Validate email input
    if (!email) {
      const message = 'Email is required';
      await logAndAlert(message, sessionId);
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Log the email check process
      await logAndAlert(`Checking if email already exists: ${email}`, sessionId);

      // Check if the email already exists
      const checkResult = await client.query('SELECT email FROM subscriber WHERE email = $1', [email]);

      if (checkResult.rows.length > 0) {
        const message = 'You are already a subscriber.';
        await logAndAlert(message, sessionId);
        return NextResponse.json({ success: false, message }, { status: 400 });
      }

      // Generate the new Subscriber ID
      const subscriberId = await generateSubscriberId();
      await logAndAlert(`Generated Subscriber ID: ${subscriberId} for email: ${email}`, sessionId);

      // Insert the new subscriber with the current timestamp
      const result = await client.query(
        'INSERT INTO subscriber (id, email, date) VALUES ($1, $2, NOW()) RETURNING serial',
        [subscriberId, email]
      );
      
      const { serial } = result.rows[0];
      await logAndAlert(`Subscriber inserted with Serial: ${serial}`, sessionId);

      // Insert notification for the new subscriber
      const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
      const notificationTitle = `MVSD LAB Got New Subscriber [${subscriberId}]`;
      const notificationStatus = 'Unread';
      const notificationInsertResult = await client.query(insertNotificationQuery, [subscriberId, notificationTitle, notificationStatus]);

      await logAndAlert(`MVSD LAB - SYSTEM\n-----------------------------\nMVSD LAB GOT NEW SUBSCRIBER.\nID : ${subscriberId}`, 'SYSTEM');

      if (notificationInsertResult.rowCount > 0) {
        await logAndAlert(`Notification inserted successfully for Subscriber ID: ${subscriberId}`, sessionId);
      } else {
        await logAndAlert(`Failed to insert notification for Subscriber ID: ${subscriberId}`, sessionId);
      }

      // Return success response
      return NextResponse.json({ success: true, message: 'Subscription Successful!', serial });
      
    } catch (error) {
      const errorMessage = `Database error: ${error.message}`;
      console.error(errorMessage);
      await logAndAlert(errorMessage, sessionId);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    const errorMessage = `Request error: ${error.message}`;
    console.error(errorMessage);
    await logAndAlert(errorMessage, sessionId);
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}
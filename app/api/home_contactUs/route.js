// app/api/home_contactUs/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
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

// Helper function to generate the next Contact Us ID
const generateContactUsId = async () => {
  const client = await pool.connect();
  try {
    await logAndAlert('Initiating Contact Us ID generation...', 'SYSTEM');
    const result = await client.query('SELECT MAX(id) AS max_id FROM home_contact_us');
    const maxId = result.rows[0]?.max_id || 'CONUS00MVSD';
    const numericPart = parseInt(maxId.substring(5, 7), 10) || 0;
    const nextId = numericPart + 1;
    const formattedId = `CONUS${String(nextId).padStart(2, '0')}MVSD`;
    await logAndAlert(`Contact Us ID generated successfully: ${formattedId}`, 'SYSTEM');
    return formattedId;
  } catch (error) {
    await logAndAlert(`Error occurred during Contact Us ID generation: ${error.message}`, 'SYSTEM');
    throw error;
  } finally {
    client.release();
  }
};

// Main POST function
export async function POST(request) {
  const sessionId = 'SYSTEM'; // Replace with actual session ID if available
  try {
    const { name, email, subject, message } = await request.json();

    // Validate input
    if (!name || !email || !subject || !message) {
      const message = 'All fields are required';
      await logAndAlert(message, sessionId);
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Generate the new Contact Us ID
      const contactUsId = await generateContactUsId();
      await logAndAlert(`Generated Contact Us ID: ${contactUsId} for email: ${email}`, sessionId);

      // Insert the new contact us entry with the current timestamp
      const result = await client.query(
        'INSERT INTO home_contact_us (id, name, email, subject, message, date) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING serial',
        [contactUsId, name, email, subject, message]
      );

      const { serial } = result.rows[0];
      await logAndAlert(`Contact Us entry inserted with Serial: ${serial}`, sessionId);

      // Insert notification for the new contact us
      const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
      const notificationTitle = `MVSD LAB Got New Message [${contactUsId}]`;
      const notificationStatus = 'Unread';
      const notificationInsertResult = await client.query(insertNotificationQuery, [contactUsId, notificationTitle, notificationStatus]);

      await logAndAlert(`MVSD LAB - SYSTEM\n-------------------------------\nMVSD LAB GOT NEW MESSAGE.\nID : ${contactUsId}`, 'SYSTEM');

      if (notificationInsertResult.rowCount > 0) {
        await logAndAlert(`Notification inserted successfully for Contact Us ID: ${contactUsId}`, sessionId);
      } else {
        await logAndAlert(`Failed to insert notification for Contact Us ID: ${contactUsId}`, sessionId);
      }

      // Return success response
      return NextResponse.json({ success: true, message: 'Message Sent Successfully!', serial });

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
// app/api/home_contactUs/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB HOME\n---------------------------\n${title}\n${details}`;
};

// Helper function to generate the next Contact Us ID
const generateContactUsId = async () => {
  try {
    const result = await query('SELECT MAX(id) AS max_id FROM home_contact_us');
    const maxId = result.rows[0]?.max_id || 'CONUS00MVSD';
    const numericPart = parseInt(maxId.substring(5, 7), 10) || 0;
    const nextId = numericPart + 1;
    const formattedId = `CONUS${String(nextId).padStart(2, '0')}MVSD`;
    return formattedId;
  } catch (error) {
    throw new Error(`Error generating Contact Us ID: ${error.message}`);
  }
};

// Main POST function
export async function POST(request) {
  const sessionId = ''; // Public page, no session ID
  const eid = ''; // Public page, no execution ID
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const { name, email, subject, message } = await request.json();

    // Validate input
    if (!name || !email || !subject || !message) {
      const errorMessage = 'All fields are required';
      logger.warn(errorMessage, {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Home - Contact Us',
          details: `Validation failed from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
      return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
    }

    try {
      // Generate the new Contact Us ID
      const contactUsId = await generateContactUsId();

      // Insert the new contact us entry with the current timestamp
      const result = await query(
        'INSERT INTO home_contact_us (id, name, email, subject, message, date) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING serial',
        [contactUsId, name, email, subject, message]
      );

      const { serial } = result.rows[0];

      // Insert notification for the new contact us
      const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
      const notificationTitle = `MVSD LAB Got New Message [${contactUsId}]`;
      const notificationStatus = 'Unread';
      await query(insertNotificationQuery, [contactUsId, notificationTitle, notificationStatus]);

      const successMessage = formatAlertMessage(`MVSD LAB GOT NEW MESSAGE.\nID : ${contactUsId}`);
      await sendTelegramAlert(successMessage);

      logger.info('Contact Us entry inserted successfully', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Home - Contact Us',
          details: `Contact Us entry inserted with ID ${contactUsId} and Serial ${serial} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });

      // Return success response
      return NextResponse.json({ success: true, message: 'Message Sent Successfully!', serial });

    } catch (error) {
      const errorMessage = `Database error: ${error.message}`;
      logger.error(errorMessage, {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Home - Contact Us',
          details: `Database error from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
        }
      });
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = `Request error: ${error.message}`;
    logger.error(errorMessage, {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Home - Contact Us',
        details: `Request error from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}
// app/api/home_stats/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title) => {
  return `MVSD LAB HOME\n--------------------------\n${title}`;
};

// Handler for the GET request to fetch stats
export async function GET(request) {
  const sessionId = ''; // Public page, no session ID
  const eid = ''; // Public page, no execution ID
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    // Log that the stats request has been initiated
    const logMessage = 'Fetching stats data [home_stats]';
    logger.info(logMessage, {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Home - Stats',
        details: `Request initiated from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    // Query to fetch the active professor count
    const professorResult = await query(
      "SELECT count(*) FROM professor_basic_info WHERE status = 'Active'"
    );
    const professorCount = professorResult.rows[0]?.count || 0;

    // Log the successful query and the fetched data
    const successMessage = `Successfully fetched professor count [home_stats]: ${professorCount}`;
    logger.info(successMessage, {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Home - Stats',
        details: `Fetched professor count from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    // Send a Telegram alert for successful data fetch
    const alertMessage = formatAlertMessage('Stats Data Fetched Successfully');
    await sendTelegramAlert(alertMessage);

    // Return the fetched data as a JSON response
    return NextResponse.json({
      professorCount,
      // You can add more stats here in the future
    }, { status: 200 });

  } catch (error) {
    const errorMessage = `Error fetching stats data: ${error.message}`;
    logger.error(errorMessage, {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Home - Stats',
        details: `Error fetching stats data from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    // Log the error and send a Telegram alert
    const alertMessage = formatAlertMessage('Error Fetching Stats Data');
    await sendTelegramAlert(alertMessage);

    // If any error occurs, send an error response
    return NextResponse.json({ error: 'Failed to fetch stats data' }, { status: 500 });
  }
}
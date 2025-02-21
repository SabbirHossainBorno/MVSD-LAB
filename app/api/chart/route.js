// app/api/messages_chart/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

// Helper function to fetch messages for chart
const getMessagesChartData = async (days) => {
  try {
    const queryText = `
      SELECT 
        DATE(date) AS date, 
        COUNT(id) AS count
      FROM 
        home_contact_us 
      WHERE 
        date >= NOW() - INTERVAL '${days} days'
      GROUP BY 
        DATE(date)
      ORDER BY 
        DATE(date) ASC
    `;
    const result = await query(queryText);
    return result.rows;
  } catch (error) {
    throw new Error('Failed to fetch chart data');
  }
};

// Helper function to fetch total messages for a given period
const getTotalMessages = async (days) => {
  try {
    const queryText = `
      SELECT 
        COUNT(id) AS count
      FROM 
        home_contact_us 
      WHERE 
        date >= NOW() - INTERVAL '${days} days'
    `;
    const result = await query(queryText);
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    throw new Error('Failed to fetch total messages');
  }
};

// Helper function to fetch all-time total messages
const getAllTimeTotalMessages = async () => {
  try {
    const queryText = `
      SELECT 
        COUNT(id) AS count
      FROM 
        home_contact_us
    `;
    const result = await query(queryText);
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    throw new Error('Failed to fetch all-time total messages');
  }
};

// API handler
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days')) || 7; // Default to 7 days if no parameter is provided

  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const currentData = await getMessagesChartData(days);
    const previousData = await getMessagesChartData(days * 2); // Fetch data for the previous period
    const allTimeTotal = await getAllTimeTotalMessages(); // Fetch all-time total messages

    const currentTotal = currentData.reduce((sum, item) => sum + parseInt(item.count, 10), 0);
    const previousTotal = previousData.reduce((sum, item) => sum + parseInt(item.count, 10), 0);

    const percentageChange = previousTotal === 0 ? 0 : ((currentTotal - previousTotal) / previousTotal) * 100;

    logger.info('Fetched messages chart data successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Messages Chart Data',
        details: `Fetched messages chart data for the past ${days} days from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({ data: currentData, totalMessages: currentTotal, percentageChange, allTimeTotal });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Fetching Messages Chart Data', `Error: ${error.message}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching messages chart data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Messages Chart Data',
        details: `Error fetching messages chart data from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
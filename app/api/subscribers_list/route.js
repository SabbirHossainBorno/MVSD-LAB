// /app/api/subscribers_list/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, ipAddress, status) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\nIP : ${ipAddress}\nStatus : ${status}`;
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    // Get query parameters
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    const dateRange = searchParams.get('dateRange') || '';

    let queryText = `
      SELECT id, email, date 
      FROM subscriber
      WHERE 1=1
    `;
    const params = [];

    // Add search filter
    if (search) {
      queryText += `
        AND (
          email ILIKE $${params.length + 1}
          OR id::TEXT ILIKE $${params.length + 1}
        )
      `;
      params.push(`%${search}%`);
    }

    // Add date filter
    if (dateRange) {
      const [startDate, endDate] = dateRange.split('_');
      queryText += `
        AND date BETWEEN $${params.length + 1} AND $${params.length + 2}
      `;
      params.push(startDate, endDate);
    }

    // Add sorting
    const validSortFields = ['id', 'email', 'date'];
    const safeSortField = validSortFields.includes(sortField) ? sortField : 'date';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    queryText += `
      ORDER BY ${safeSortField} ${safeSortOrder}
    `;

    const result = await query(queryText, params);

    const successMessage = formatAlertMessage('Subscribers List - API', ipAddress, 200);
    await sendTelegramAlert(successMessage);

    logger.info('Subscribers list fetched successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Subscribers List',
        details: `Fetched ${result.rowCount} subscribers with filters: ${JSON.stringify({
          search,
          sortField,
          sortOrder,
          dateRange
        })}`
      }
    });

    return NextResponse.json({ subscribers: result.rows });
  } catch (error) {
    const errorMessage = formatAlertMessage('Subscribers List - API', ipAddress, 500);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching subscribers list', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Subscribers List',
        details: `Error: ${error.message}`
      }
    });

    return NextResponse.json(
      { message: 'Failed to fetch subscribers' }, 
      { status: 500 }
    );
  }
}
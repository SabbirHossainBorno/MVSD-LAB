// app/api/alumni_list/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

export const dynamic = 'force-dynamic';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

export async function GET(req) {
  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page'), 10) || 1;
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';
    const resultsPerPage = 9;
    const offset = (page - 1) * resultsPerPage;

    // Base query
    let searchQuery = `
      SELECT 
        id, first_name, last_name, email, photo, type, 
        completion_date, alumni_status
      FROM phd_candidate_basic_info
      WHERE alumni_status = 'Valid'
    `;

    let countQuery = `
      SELECT COUNT(*) 
      FROM phd_candidate_basic_info 
      WHERE alumni_status = 'Valid'
    `;

    const queryParams = [];
    
    if (search) {
      searchQuery += ` AND (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`;
      countQuery += ` AND (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`;
      queryParams.push(`%${search}%`);
    }

    searchQuery += `
      ORDER BY substring(id from '[0-9]+')::int ${sortOrder}, id ${sortOrder}
      LIMIT $${queryParams.length + 1} 
      OFFSET $${queryParams.length + 2}
    `;

    // Execute count query
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / resultsPerPage);

    // Execute search query
    queryParams.push(resultsPerPage, offset);
    const alumniResult = await query(searchQuery, queryParams);

    const apiCallMessage = formatAlertMessage('Alumni List - API', `IP : ${ipAddress}\nStatus : 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Fetched alumni list successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Alumni List',
        details: `Fetched alumni list from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({
      alumni: alumniResult.rows,
      totalPages,
    });
  } catch (error) {
    const errorMessage = formatAlertMessage('Alumni List - API', `IP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching alumni list', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Alumni List',
        details: `Error from IP ${ipAddress}: ${error.message}`,
        stack: error.stack
      }
    });

    return NextResponse.json({ message: 'Error fetching alumni' }, { status: 500 });
  }
}
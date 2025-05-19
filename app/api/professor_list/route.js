// app/api/professor_list/route.js
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
    const filter = url.searchParams.get('filter') || 'all';
    const page = parseInt(url.searchParams.get('page'), 10) || 1;
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'; 
    const resultsPerPage = 12;
    const offset = (page - 1) * resultsPerPage;

    // Fetch total counts for all professors
    const totalCountsQuery = `
      SELECT COUNT(*) AS total, 
             COUNT(*) FILTER (WHERE status ILIKE 'Active') AS active_count,
             COUNT(*) FILTER (WHERE status ILIKE 'Inactive') AS inactive_count,
             COUNT(*) FILTER (WHERE status ILIKE 'Emeritus') AS emeritus_count
      FROM professor_basic_info
    `;
    const totalCountsResult = await query(totalCountsQuery);
    const totalProfessors = parseInt(totalCountsResult.rows[0].total, 10);
    const activeProfessors = parseInt(totalCountsResult.rows[0].active_count, 10);
    const inactiveProfessors = parseInt(totalCountsResult.rows[0].inactive_count, 10);
    const emeritusProfessors = parseInt(totalCountsResult.rows[0].emeritus_count, 10);

    // Fetch filtered list of professors
    let searchQuery = `
      SELECT * FROM professor_basic_info
      WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
    `;
    const queryParams = [`%${search}%`];

    if (filter !== 'all') {
      searchQuery += ` AND status ILIKE $2`;
      queryParams.push(filter);
    }

    searchQuery += ` ORDER BY id ${sortOrder} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(resultsPerPage, offset);

    const professorsResult = await query(searchQuery, queryParams);
    const totalPages = Math.ceil(totalProfessors / resultsPerPage);

    const apiCallMessage = formatAlertMessage('Professor List - API', `IP : ${ipAddress}\nStatus : 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Fetched professors list successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Professors List',
        details: `Fetched professors list successfully from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({
      professors: professorsResult.rows,
      totalProfessors,
      activeProfessors,
      inactiveProfessors,
      emeritusProfessors,
      totalPages,
    });
  } catch (error) {
    const errorMessage = formatAlertMessage('Professor List - API', `IP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching professors list', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Professors List',
        details: `Error fetching professors list from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`,
        stack: error.stack
      }
    });

    return NextResponse.json({ message: 'Error fetching professors' }, { status: 500 });
  }
}

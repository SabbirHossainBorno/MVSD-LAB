// app/api/member_list/phd_candidate_list/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendTelegramAlert from '../../../../lib/telegramAlert';

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
    const resultsPerPage = 12; // Set to 12 results per page
    const offset = (page - 1) * resultsPerPage;

    let searchQuery = `
      SELECT * FROM phd_candidate_basic_info
      WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
    `;
    let countQuery = `
      SELECT COUNT(*) FROM phd_candidate_basic_info
      WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
    `;

    const searchValue = `%${search}%`;
    let queryParams = [searchValue];

    if (filter !== 'all') {
      searchQuery += ` AND status ILIKE $2`;
      countQuery += ` AND status ILIKE $2`;
      queryParams.push(filter); // Add filter to params
    }

    // Add ordering and pagination
    searchQuery += ` ORDER BY substring(id from '[0-9]+')::int ${sortOrder}, id ${sortOrder} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(resultsPerPage, offset); // Add pagination parameters

    // Execute queries
    const phd_candidatesResult = await query(searchQuery, queryParams);
    const countResult = await query(countQuery, queryParams.slice(0, filter !== 'all' ? 2 : 1));

    const totalPhd_candidates = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalPhd_candidates / resultsPerPage);

    const apiCallMessage = formatAlertMessage('PhD Candidate List - API', `IP : ${ipAddress}\nStatus : 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Fetched PhD candidates list successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch PhD Candidates List',
        details: `Fetched PhD candidates list successfully from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({
      phd_candidates: phd_candidatesResult.rows,
      totalPages,
    });
  } catch (error) {
    const errorMessage = formatAlertMessage('PhD Candidate List - API', `IP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching PhD candidates list', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch PhD Candidates List',
        details: `Error fetching PhD candidates list from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: 'Error fetching PhD candidates' }, { status: 500 });
  }
}
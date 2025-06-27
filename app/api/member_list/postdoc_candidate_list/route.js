// app/api/member_list/postdoc_candidate_list/route.js
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

    // Fetch total counts for all Postdoc candidates
    const totalCountsQuery = `
      SELECT COUNT(*) AS total, 
             COUNT(*) FILTER (WHERE status ILIKE 'Active') AS active_count,
             COUNT(*) FILTER (WHERE status ILIKE 'Inactive') AS inactive_count,
             COUNT(*) FILTER (WHERE status ILIKE 'Graduate') AS graduate_count
      FROM postdoc_candidate_basic_info
    `;
    const totalCountsResult = await query(totalCountsQuery);
    const totalPostdocCandidates = parseInt(totalCountsResult.rows[0].total, 10);
    const activePostdocCandidates = parseInt(totalCountsResult.rows[0].active_count, 10);
    const inactivePostdocCandidates = parseInt(totalCountsResult.rows[0].inactive_count, 10);
    const graduatePostdocCandidates = parseInt(totalCountsResult.rows[0].graduate_count, 10);

    // Fetch filtered list of Post Doc candidates
    let searchQuery = `
      SELECT * FROM postdoc_candidate_basic_info
      WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
    `;
    const queryParams = [`%${search}%`];

    if (filter !== 'all') {
      searchQuery += ` AND status ILIKE $2`;
      queryParams.push(filter);
    }

    searchQuery += ` ORDER BY substring(id from '[0-9]+')::int ${sortOrder}, id ${sortOrder} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(resultsPerPage, offset); // Add pagination parameters

    // Execute queries
    const postdocCandidatesResult = await query(searchQuery, queryParams);
    const totalPages = Math.ceil(totalPostdocCandidates / resultsPerPage);

    const apiCallMessage = formatAlertMessage('Post Doc Candidate List - API', `IP : ${ipAddress}\nStatus : 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Fetched Post Doc candidates list successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Post Doc Candidates List',
        details: `Fetched Post Doc candidates list successfully from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json({
      postdoc_candidates: postdocCandidatesResult.rows,
      totalPostdocCandidates,
      activePostdocCandidates,
      inactivePostdocCandidates,
      graduatePostdocCandidates,
      totalPages,
    });
  } catch (error) {
    const errorMessage = formatAlertMessage('Post Doc Candidate List - API', `IP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching Post Doc candidates list', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Post Doc Candidates List',
        details: `Error fetching Post Doc candidates list from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`,
        stack: error.stack
      }
    });

    return NextResponse.json({ message: 'Error fetching Post Doc candidates' }, { status: 500 });
  }
}
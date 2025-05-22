// app/api/alumni_list/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

export const dynamic = 'force-dynamic';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB ALUMNI SYSTEM\n-----------------------------\n${title}\n${details}`;
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = request.headers.get('x-forwarded-for') || request.ip || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown UA';

  try {
    const page = parseInt(searchParams.get('page')) || 1;
    const searchTerm = searchParams.get('search') || '';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const resultsPerPage = 12;
    const offset = (page - 1) * resultsPerPage;

    console.log(`🔍 Fetching alumni list - Page: ${page}, Search: "${searchTerm}"`);

    // Total Count Query
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM phd_candidate_basic_info 
      WHERE alumni_status = 'Valid'
      AND (
        first_name ILIKE $1 OR 
        last_name ILIKE $1 OR 
        email ILIKE $1 OR 
        phone::text ILIKE $1
      )
    `;
    const countResult = await query(countQuery, [`%${searchTerm}%`]);
    const totalAlumni = Number(countResult.rows[0].total);

    // Pagination Query
    const dataQuery = `
      SELECT 
        id, first_name, last_name, photo, 
        TO_CHAR(completion_date, 'YYYY-MM-DD') as completion_date,
        email, phone
      FROM phd_candidate_basic_info
      WHERE alumni_status = 'Valid'
      AND (
        first_name ILIKE $1 OR 
        last_name ILIKE $1 OR 
        email ILIKE $1 OR 
        phone::text ILIKE $1
      )
      ORDER BY completion_date ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $2 OFFSET $3
    `;

    const alumniData = await query(dataQuery, [
      `%${searchTerm}%`,
      resultsPerPage,
      offset
    ]);

    console.log(`✅ Fetched ${alumniData.rows.length} of ${totalAlumni} alumni`);

    // Logging
    logger.info('Alumni list fetched', {
      meta: {
        eid,
        sid: sessionId,
        task: 'FETCH_ALUMNI_LIST',
        details: {
          ip: ipAddress,
          page,
          searchTerm,
          totalAlumni,
          returned: alumniData.rows.length
        }
      }
    });

    await sendTelegramAlert(
      formatAlertMessage(
        'Alumni List Access',
        `IP: ${ipAddress}\nPage: ${page}\nResults: ${alumniData.rows.length}/${totalAlumni}`
      )
    );

    return NextResponse.json({
      success: true,
      alumni: alumniData.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalAlumni / resultsPerPage),
        totalAlumni
      }
    });

  } catch (error) {
    console.error('❌ Alumni list error:', error);
    logger.error('Alumni list fetch failed', {
      meta: {
        eid,
        sid: sessionId,
        task: 'FETCH_ALUMNI_LIST',
        error: {
          message: error.message,
          stack: error.stack,
          ip: ipAddress
        }
      }
    });

    await sendTelegramAlert(
      formatAlertMessage(
        'Alumni List Error',
        `IP: ${ipAddress}\nError: ${error.message.slice(0, 100)}`
      )
    );

    return NextResponse.json(
      { success: false, message: 'Failed to fetch alumni list' },
      { status: 500 }
    );
  }
}
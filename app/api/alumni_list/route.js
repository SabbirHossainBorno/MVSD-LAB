// app/api/alumni_list/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

export const dynamic = 'force-dynamic';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB ALUMNI SYSTEM\n-----------------------------\n${title}\n${details}`;
};

export async function GET(request, { params }) {
  const { searchParams } = new URL(request.url);
  const sessionId = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = request.headers.get('x-forwarded-for') || request.ip || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown UA';

  try {
    // Handle individual alumni detail request
    if (params?.id) {
      return handleAlumniDetail(params.id, sessionId, eid, ipAddress, userAgent);
    }

    // Handle alumni list request
    const page = parseInt(searchParams.get('page')) || 1;
    const searchTerm = searchParams.get('search') || '';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const resultsPerPage = 12;
    const offset = (page - 1) * resultsPerPage;

    // Base SQL query
    let baseQuery = `
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
    `;

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) AS total`;
    const countResult = await query(countQuery, [`%${searchTerm}%`]);
    const totalAlumni = Number(countResult.rows[0].count);

    // Get paginated results
    const dataQuery = `
      ${baseQuery}
      ORDER BY completion_date ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $2 OFFSET $3
    `;

    const alumniData = await query(dataQuery, [
      `%${searchTerm}%`,
      resultsPerPage,
      offset
    ]);

    // Log successful request
    logger.info('Alumni list fetched successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'FETCH_ALUMNI_LIST',
        details: {
          ip: ipAddress,
          userAgent,
          page,
          searchTerm,
          results: alumniData.rows.length
        }
      }
    });

    await sendTelegramAlert(
      formatAlertMessage(
        'Alumni List Accessed',
        `IP: ${ipAddress}\nPage: ${page}\nResults: ${alumniData.rows.length}`
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
    // Error handling
    const errorMessage = `ALUMNI_LIST_ERROR: ${error.message}`;
    
    logger.error(errorMessage, {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'FETCH_ALUMNI_LIST',
        error: {
          message: error.message,
          stack: error.stack,
          ip: ipAddress,
          userAgent
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

async function handleAlumniDetail(id, sessionId, eid, ipAddress, userAgent) {
  try {
    // Validate ID format
    if (!/^PHDC\d{2}MVSD$/.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid alumni ID format' },
        { status: 400 }
      );
    }

    const detailQuery = `
      SELECT 
        b.*,
        COALESCE(json_agg(s) FILTER (WHERE s.serial IS NOT NULL), '[]') AS social_media,
        COALESCE(json_agg(e) FILTER (WHERE e.serial IS NOT NULL), '[]') AS education,
        COALESCE(json_agg(c) FILTER (WHERE c.serial IS NOT NULL), '[]') AS career
      FROM phd_candidate_basic_info b
      LEFT JOIN phd_candidate_socialmedia_info s ON b.id = s.phd_candidate_id
      LEFT JOIN phd_candidate_education_info e ON b.id = e.phd_candidate_id
      LEFT JOIN phd_candidate_career_info c ON b.id = c.phd_candidate_id
      WHERE b.id = $1
      GROUP BY b.id
    `;

    const result = await query(detailQuery, [id]);

    if (result.rows.length === 0) {
      logger.warn('Alumni not found', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'FETCH_ALUMNI_DETAIL',
          details: { requestedId: id }
        }
      });

      return NextResponse.json(
        { success: false, message: 'Alumni not found' },
        { status: 404 }
      );
    }

    const alumni = result.rows[0];
    
    // Transform data for easier consumption
    const transformed = {
      ...alumni,
      socialMedia: alumni.social_media,
      education: alumni.education,
      career: alumni.career,
      completion_date: alumni.completion_date ?
        new Date(alumni.completion_date).toISOString() : null,
      admission_date: alumni.admission_date ?
        new Date(alumni.admission_date).toISOString() : null,
      dob: alumni.dob ? new Date(alumni.dob).toISOString() : null
    };

    // Remove unnecessary fields
    delete transformed.social_media;
    delete transformed.education;
    delete transformed.career;

    // Log detail access
    logger.info('Alumni details fetched', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'FETCH_ALUMNI_DETAIL',
        details: {
          id,
          ip: ipAddress,
          userAgent
        }
      }
    });

    return NextResponse.json({
      success: true,
      alumni: transformed
    });

  } catch (error) {
    const errorMessage = `ALUMNI_DETAIL_ERROR: ${error.message}`;
    
    logger.error(errorMessage, {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'FETCH_ALUMNI_DETAIL',
        error: {
          message: error.message,
          stack: error.stack,
          ip: ipAddress,
          userAgent
        }
      }
    });

    await sendTelegramAlert(
      formatAlertMessage(
        'Alumni Detail Error',
        `ID: ${id}\nError: ${error.message.slice(0, 100)}`
      )
    );

    return NextResponse.json(
      { success: false, message: 'Failed to fetch alumni details' },
      { status: 500 }
    );
  }
}
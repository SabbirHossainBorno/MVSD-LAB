import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = request.cookies.get('sessionId')?.value || 'unknown-session';
  const directorId = request.cookies.get('id')?.value || 'unknown-director';

  try {
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClauses = [];
    let queryParams = [];

    if (search) {
      whereClauses.push(`(title ILIKE $${queryParams.length + 1} OR 
                          pub_res_id ILIKE $${queryParams.length + 1} OR 
                          phd_candidate_id ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${search}%`);
    }

    if (status) {
      whereClauses.push(`approval_status = $${queryParams.length + 1}`);
      queryParams.push(status);
    }

    if (type) {
      whereClauses.push(`type = $${queryParams.length + 1}`);
      queryParams.push(type);
    }

    const whereClause = whereClauses.length > 0 
      ? `WHERE ${whereClauses.join(' AND ')}` 
      : '';

    // Fetch publications
    const publicationsQuery = `
      SELECT 
        pub_res_id, 
        phd_candidate_id, 
        type, 
        title, 
        publishing_year, 
        published_date, 
        authors, 
        link, 
        document_path, 
        approval_status, 
        created_at, 
        updated_at,
        feedback
      FROM phd_candidate_pub_res_info
      ${whereClause}
      ORDER BY 
        CASE WHEN approval_status = 'Pending' THEN 1 ELSE 2 END,
        created_at DESC
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2}
    `;
    const publicationsParams = [...queryParams, limit, offset];
    const publicationsResult = await query(publicationsQuery, publicationsParams);

    // Fetch total count
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM phd_candidate_pub_res_info
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Fetch stats
    const statsQuery = `
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE approval_status = 'Pending') AS pending,
        COUNT(*) FILTER (WHERE approval_status = 'Approved') AS approved,
        COUNT(*) FILTER (WHERE approval_status = 'Rejected') AS rejected
      FROM phd_candidate_pub_res_info
      ${whereClause}
    `;
    const statsResult = await query(statsQuery, queryParams);
    const stats = statsResult.rows[0];

    return NextResponse.json({
      success: true,
      publications: publicationsResult.rows,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    logger.error('Approval Panel API Error', {
      meta: {
        sid: sessionId,
        directorId,
        taskName: 'ApprovalPanel',
        error: error.message,
        stack: error.stack
      }
    });
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch data', error: error.message },
      { status: 500 }
    );
  }
}
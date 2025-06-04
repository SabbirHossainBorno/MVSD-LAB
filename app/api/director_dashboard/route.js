import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';

export async function GET(request) {
  const sessionId = request.cookies.get('sessionId')?.value || 'unknown-session';
  const directorId = request.cookies.get('id')?.value || 'unknown-director';
  
  console.log(`[DirectorDashboard][${sessionId}] Starting data fetch for director: ${directorId}`);
  
  try {
    logger.info('Fetching director dashboard data', {
      meta: {
        sid: sessionId,
        directorId,
        taskName: 'DirectorDashboard'
      }
    });
    
    // 1. Fetch director info
    console.log(`[DirectorDashboard][${sessionId}] Fetching director info...`);
    const directorQuery = `
      SELECT id, email, photo, first_name, last_name
      FROM director_basic_info
      WHERE id = $1
    `;
    const directorResult = await query(directorQuery, [directorId]);
    
    if (directorResult.rows.length === 0) {
      throw new Error('Director not found');
    }
    
    const directorInfo = directorResult.rows[0];
    console.log(`[DirectorDashboard][${sessionId}] Director info fetched:`, JSON.stringify(directorInfo));

    // 2. Fetch last login time from tracker table
    console.log(`[DirectorDashboard][${sessionId}] Fetching last login time...`);
    const loginQuery = `
      SELECT last_login_time 
      FROM director_login_info_tracker
      WHERE email = $1
      ORDER BY last_login_time DESC
      LIMIT 1
    `;
    const loginResult = await query(loginQuery, [directorInfo.email]);
    const lastLoginTime = loginResult.rows[0]?.last_login_time || null;

    // 3. Fetch publication statistics
    console.log(`[DirectorDashboard][${sessionId}] Fetching publication statistics...`);
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE approval_status = 'Pending') AS pending,
        COUNT(*) FILTER (WHERE approval_status = 'Approved') AS approved,
        COUNT(*) FILTER (WHERE approval_status = 'Rejected') AS rejected
      FROM phd_candidate_pub_res_info;
    `;
    const statsResult = await query(statsQuery);
    const stats = statsResult.rows[0];
    
    // 4. Fetch pending publications
    console.log(`[DirectorDashboard][${sessionId}] Fetching pending publications...`);
    const publicationsQuery = `
      SELECT pub_res_id, phd_candidate_id, type, title, publishing_year, 
             published_date, authors, link, document_path, created_at
      FROM phd_candidate_pub_res_info
      WHERE approval_status = 'Pending'
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    const publicationsResult = await query(publicationsQuery);
    console.log(`[DirectorDashboard][${sessionId}] Publications results: ${publicationsResult.rowCount} items found`);
    
    // 5. Format combined response
    const responseData = {
      success: true,
      director: {
        id: directorInfo.id,
        email: directorInfo.email,
        photo: directorInfo.photo,
        firstName: directorInfo.first_name,
        lastName: directorInfo.last_name,
        fullName: `${directorInfo.first_name} ${directorInfo.last_name}`,
        lastLogin: lastLoginTime  // Add this property
      },
      pendingPublications: publicationsResult.rows,
      stats: {
        pending: stats.pending,
        approved: stats.approved,
        rejected: stats.rejected
      }
    };
    
    console.log(`[DirectorDashboard][${sessionId}] Data fetch completed successfully`);
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error(`[DirectorDashboard][${sessionId}] ERROR:`, error);
    
    logger.error('Director dashboard data fetch failed', {
      meta: {
        sid: sessionId,
        directorId,
        taskName: 'DirectorDashboard',
        error: error.message,
        stack: error.stack
      }
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch dashboard data',
        error: error.message
      },
      { status: 500 }
    );
  }
}
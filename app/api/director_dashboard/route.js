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

    // Get total count of pending publications
    const totalCountQuery = `
      SELECT COUNT(*) AS total 
      FROM phd_candidate_pub_res_info 
      WHERE approval_status = 'Pending'
    `;
    const totalCountResult = await query(totalCountQuery);
    const totalPendingCount = totalCountResult.rows[0].total;
  
    // 2. Fetch pending publications
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
    
    // 3. Format combined response
    const responseData = {
      success: true,
      director: {
        id: directorInfo.id,
        email: directorInfo.email,
        photo: directorInfo.photo,
        firstName: directorInfo.first_name,
        lastName: directorInfo.last_name,
        fullName: `${directorInfo.first_name} ${directorInfo.last_name}`,
        pendingPublications: publicationsResult.rows,
      totalPendingCount: totalPendingCount
      },
      pendingPublications: publicationsResult.rows
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
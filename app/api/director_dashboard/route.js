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
  
    
    // 5. Format response data
    const responseData = {
      success: true,
      director: {
        id: directorInfo.id,
        email: directorInfo.email,
        photo: directorInfo.photo,
        firstName: directorInfo.first_name,
        lastName: directorInfo.last_name,
        fullName: `${directorInfo.first_name} ${directorInfo.last_name}`
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
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
    
    // 1. Fetch dashboard stats
    console.log(`[DirectorDashboard][${sessionId}] Fetching dashboard stats...`);
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM research_proposals WHERE status = 'pending') AS pending_proposals,
        (SELECT COUNT(*) FROM budget_requests WHERE status = 'pending') AS pending_budgets,
        (SELECT COUNT(*) FROM publication_requests WHERE status = 'pending') AS pending_publications,
        (SELECT COUNT(*) FROM member WHERE status = 'Active') AS active_members
    `;
    
    const statsResult = await query(statsQuery);
    console.log(`[DirectorDashboard][${sessionId}] Stats query results:`, JSON.stringify(statsResult.rows[0]));
    
    // 2. Fetch recent activity
    console.log(`[DirectorDashboard][${sessionId}] Fetching recent activity for director: ${directorId}...`);
    const activityQuery = `
      SELECT id, activity_type, description, timestamp 
      FROM director_activity_log
      WHERE director_id = $1
      ORDER BY timestamp DESC
      LIMIT 5
    `;
    
    const activityResult = await query(activityQuery, [directorId]);
    console.log(`[DirectorDashboard][${sessionId}] Activity results: ${activityResult.rowCount} items found`);
    
    // 3. Fetch pending approvals
    console.log(`[DirectorDashboard][${sessionId}] Fetching pending approvals...`);
    const approvalsQuery = `
      SELECT id, request_type, requester_name, submitted_at
      FROM approval_requests
      WHERE status = 'pending'
      ORDER BY submitted_at DESC
      LIMIT 5
    `;
    
    const approvalsResult = await query(approvalsQuery);
    console.log(`[DirectorDashboard][${sessionId}] Approvals results: ${approvalsResult.rowCount} items found`);
    
    // 4. Format response data
    const responseData = {
      success: true,
      stats: statsResult.rows[0],
      recentActivity: activityResult.rows.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp).toISOString()
      })),
      pendingApprovals: approvalsResult.rows.map(item => ({
        ...item,
        submitted_at: new Date(item.submitted_at).toISOString()
      }))
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
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';

export async function GET(request) {
  const sessionId = request.cookies.get('sessionId')?.value;
  const directorId = request.cookies.get('id')?.value;
  
  try {
    logger.info('Fetching director dashboard data', {
      meta: {
        sid: sessionId,
        directorId,
        taskName: 'DirectorDashboard'
      }
    });
    
    // Fetch dashboard stats
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM research_proposals WHERE status = 'pending') AS pending_proposals,
        (SELECT COUNT(*) FROM budget_requests WHERE status = 'pending') AS pending_budgets,
        (SELECT COUNT(*) FROM publication_requests WHERE status = 'pending') AS pending_publications
    `;
    
    const statsResult = await query(statsQuery);
    
    // Fetch recent activity
    const activityQuery = `
      SELECT activity_type, description, timestamp 
      FROM director_activity_log
      WHERE director_id = $1
      ORDER BY timestamp DESC
      LIMIT 5
    `;
    
    const activityResult = await query(activityQuery, [directorId]);
    
    // Fetch pending approvals
    const approvalsQuery = `
      SELECT id, request_type, requester_name, submitted_at
      FROM approval_requests
      WHERE status = 'pending'
      ORDER BY submitted_at DESC
      LIMIT 5
    `;
    
    const approvalsResult = await query(approvalsQuery);
    
    return NextResponse.json({
      success: true,
      stats: statsResult.rows[0],
      recentActivity: activityResult.rows,
      pendingApprovals: approvalsResult.rows
    });
    
  } catch (error) {
    logger.error('Director dashboard data fetch failed', {
      meta: {
        sid: sessionId,
        directorId,
        taskName: 'DirectorDashboard',
        error: error.message
      }
    });
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
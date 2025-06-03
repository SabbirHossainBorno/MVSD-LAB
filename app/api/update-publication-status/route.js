
//app/api/update-publication-status/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';

export async function POST(request) {
  const { pub_res_id, status, feedback } = await request.json();
  
  try {
    // Update the publication status and feedback
    const updateQuery = `
      UPDATE phd_candidate_pub_res_info
      SET approval_status = $1, feedback = $2, updated_at = NOW()
      WHERE pub_res_id = $3
      RETURNING *;
    `;
    
    const result = await query(updateQuery, [status, feedback, pub_res_id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, message: 'Publication not found' }, { status: 404 });
    }
    
    // Log activity
    const activityQuery = `
      INSERT INTO director_activity_log (director_id, activity_type, description)
      VALUES ($1, $2, $3)
    `;
    
    const activityDescription = `Publication "${result.rows[0].title.substring(0, 20)}..." ${status.toLowerCase()}`;
    await query(activityQuery, [
      'D01MVSD', // Replace with actual director ID from session
      status === 'Approved' ? 'Publication Approved' : 'Publication Rejected',
      activityDescription
    ]);
    
    return NextResponse.json({ success: true, updatedPublication: result.rows[0] });
    
  } catch (error) {
    logger.error('Error updating publication status', {
      meta: {
        pub_res_id,
        error: error.message,
        stack: error.stack
      }
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update publication status',
        error: error.message
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB HOME\n--------------------------\n${title}\n${details}`;
};

export async function GET(request) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    logger.info('Fetching member details', {
      meta: {
        eid: '',
        sid: '',
        taskName: 'Home - Member',
        details: `Fetching member details from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    const memberResult = await query(`
      SELECT 
        m.*, 
        COALESCE(sm.socialmedia, '[]') AS socialmedia,
        COALESCE(
          p.alumni_status, 
          mc.alumni_status, 
          pc.alumni_status,
          'Invalid'
        ) AS alumni_status
      FROM 
        member m
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object('socialmedia_name', s.socialmedia_name, 'link', s.link)) AS socialmedia
        FROM (
          SELECT socialmedia_name, link FROM professor_socialmedia_info WHERE professor_id = m.id
          UNION ALL
          SELECT socialmedia_name, link FROM director_socialmedia_info WHERE director_id = m.id
          UNION ALL
          SELECT socialmedia_name, link FROM phd_candidate_socialmedia_info WHERE phd_candidate_id = m.id
          UNION ALL
          SELECT socialmedia_name, link FROM masters_candidate_socialmedia_info WHERE masters_candidate_id = m.id
          UNION ALL
          SELECT socialmedia_name, link FROM postdoc_candidate_socialmedia_info WHERE postdoc_candidate_id = m.id
          UNION ALL
          SELECT socialmedia_name, link FROM staff_member_socialmedia_info WHERE staff_member_id = m.id
        ) s
      ) sm ON TRUE
      LEFT JOIN phd_candidate_basic_info p ON m.id = p.id
      LEFT JOIN masters_candidate_basic_info mc ON m.id = mc.id
      LEFT JOIN postdoc_candidate_basic_info pc ON m.id = pc.id
      WHERE 
        m.status = 'Active'
      ORDER BY 
        CASE 
          WHEN m.type = 'Director' THEN 1
          WHEN m.type = 'Professor' THEN 2
          WHEN m.type = 'PhD Candidate' THEN 3
          WHEN m.type = 'Master''s Candidate' THEN 4
          WHEN m.type = 'Post Doc Candidate' THEN 5
          WHEN m.type = 'Staff Member' THEN 6
          ELSE 7
        END,
        m.id;
    `);
    
    const members = memberResult.rows;

    logger.info('Successfully fetched member details', {
      meta: {
        eid: '',
        sid: '',
        taskName: 'Home - Member',
        details: `Successfully fetched member details from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json(members);
  } catch (error) {
    const errorMessage = `Error fetching member details: ${error.message}`;
    await sendTelegramAlert(formatAlertMessage('Error Fetching Member Details', `IP: ${ipAddress}\nError: ${errorMessage}`));
    logger.error('Error fetching member details', {
      meta: {
        eid: '',
        sid: '',
        taskName: 'Home - Member',
        details: `Error fetching member details from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ error: 'Failed to fetch member details' }, { status: 500 });
  }
}
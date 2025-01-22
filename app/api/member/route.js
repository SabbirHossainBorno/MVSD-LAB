///app/api/member/route.js
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

    const memberResult = await query(
      `SELECT m.*, json_agg(json_build_object('socialmedia_name', s.socialmedia_name, 'link', s.link)) AS socialmedia
       FROM member m
       LEFT JOIN professor_socialmedia_info s ON m.id = s.professor_id
       WHERE m.status = 'Active'
       GROUP BY m.id
       ORDER BY m.id`
    );
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
// app/api/alumni_list/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendTelegramAlert from '../../../../lib/telegramAlert';

export const dynamic = 'force-dynamic';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

// Correct parameter handling for Next.js 15+
export async function GET(request, context) {
  const { id } = await context.params;

  const sessionId = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const queryText = `
      SELECT 
        b.*,
        (
          SELECT json_agg(s.*) 
          FROM phd_candidate_socialmedia_info s 
          WHERE s.phd_candidate_id = b.id
        ) AS social_media,
        (
          SELECT json_agg(e.*) 
          FROM phd_candidate_education_info e 
          WHERE e.phd_candidate_id = b.id
        ) AS education,
        (
          SELECT json_agg(c.*) 
          FROM phd_candidate_career_info c 
          WHERE c.phd_candidate_id = b.id
        ) AS career
      FROM phd_candidate_basic_info b
      WHERE b.id = $1
    `;

    const result = await query(queryText, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Alumni not found' }, { status: 404 });
    }

    const apiCallMessage = formatAlertMessage('Alumni Details - API', `IP : ${ipAddress}\nStatus : 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Fetched alumni details successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Alumni Details',
        details: `Fetched details for ${id} from IP ${ipAddress}`
      }
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    const errorMessage = formatAlertMessage('Alumni Details - API', `IP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching alumni details', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Alumni Details',
        details: `Error fetching ${id}: ${error.message}`,
        stack: error.stack
      }
    });

    return NextResponse.json({ message: 'Error fetching alumni details' }, { status: 500 });
  }
}
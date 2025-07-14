// app/api/home/publication_research/details/route.js
import { query } from '../../../../../lib/db';
import logger from '../../../../../lib/logger';
import sendTelegramAlert from '../../../../../lib/telegramAlert';
import { NextResponse } from 'next/server';
import cookie from 'cookie';

const validTypes = [
  'Conference Paper',
  'Journal Paper',
  'Book/Chapter',
  'Patent',
  'Project'
];

const formatAlertMessage = (title, details) => {
  return `MVSD LAB PUBLICATION DETAILS\n--------------------------\n${title}\n${details}`;
};

export async function GET(request) {
  const cookies = cookie.parse(request.headers.get('cookie') || '');
  const eid = cookies.eid || '';
  const sid = cookies.sid || '';
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (!type || !validTypes.includes(type)) {
      throw new Error(`Invalid publication type: ${type}`);
    }

    logger.info('Fetching publication details', {
      meta: {
        eid,
        sid,
        taskName: 'Publication - Details',
        details: `Fetching ${type} publications`
      }
    });

    // Consolidated query for all tables
    const queryText = `
      (SELECT 
        title,
        publishing_year,
        authors,
        published_date,
        link,
        document_path,
        approval_status,
        created_at
      FROM phd_candidate_pub_res_info
      WHERE type = $1)
      
      UNION ALL
      
      (SELECT 
        title,
        publishing_year,
        authors,
        published_date,
        link,
        document_path,
        approval_status,
        created_at
      FROM masters_candidate_pub_res_info
      WHERE type = $1)
      
      UNION ALL
      
      (SELECT 
        title,
        publishing_year,
        authors,
        published_date,
        link,
        document_path,
        approval_status,
        created_at
      FROM postdoc_candidate_pub_res_info
      WHERE type = $1)
      
      ORDER BY created_at DESC
    `;

    const { rows } = await query(queryText, [type]);

    logger.info('Successfully fetched publication details', {
      meta: {
        eid,
        sid,
        taskName: 'Publication - Details',
        details: `Fetched ${rows.length} publications of type ${type}`
      }
    });

    return NextResponse.json(rows);

  } catch (error) {
    const errorMessage = `Error fetching publication details: ${error.message}`;

    await sendTelegramAlert(
      formatAlertMessage(
        'Error Fetching Publication Details',
        `Type: ${searchParams.get('type')}\nIP: ${ipAddress}\nError: ${errorMessage}`
      )
    );

    logger.error(errorMessage, {
      meta: {
        eid,
        sid,
        taskName: 'Publication - Details',
        details: `IP: ${ipAddress} | User-Agent: ${userAgent}`
      }
    });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
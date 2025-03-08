// app/api/member_publication_list/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB MEMBER DASHBOARD\n--------------------------------------------------\n${title}\n${details}`;
};

const securityHeaders = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

export async function GET(request) {
  const sessionId = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';
  const memberId = request.cookies.get('id')?.value;
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown UA';

  try {
    // Validate authentication
    if (!memberId) {
      logger.warn('Unauthorized publication list access', {
        meta: {
          sid: sessionId,
          eid,
          taskName: 'PublicationListAuth',
          details: 'Missing member ID cookie',
          severity: 'HIGH'
        }
      });
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401, headers: securityHeaders }
      );
    }

    // Verify member exists and is PhD Candidate
    const memberCheck = await query(
      `SELECT type FROM member WHERE id = $1`,
      [memberId]
    );

    if (memberCheck.rows.length === 0) {
      logger.error('Member not found', {
        meta: {
          sid: sessionId,
          eid,
          taskName: 'PublicationList',
          details: `Member ID: ${memberId}`,
          severity: 'MEDIUM'
        }
      });
      return NextResponse.json(
        { error: 'Member not found' }, 
        { status: 404, headers: securityHeaders }
      );
    }

    if (memberCheck.rows[0].type !== 'PhD Candidate') {
      logger.warn('Unauthorized access attempt', {
        meta: {
          sid: sessionId,
          eid,
          taskName: 'PublicationList',
          details: `Non-PhD member tried accessing publications: ${memberId}`,
          severity: 'HIGH'
        }
      });
      return NextResponse.json(
        { error: 'Access restricted to PhD Candidates' }, 
        { status: 403, headers: securityHeaders }
      );
    }

    // Fetch publications
    const result = await query(
      `SELECT 
        id, title, type, year, 
        journal_name AS "journalName",
        conference_name AS "conferenceName",
        authors, volume, issue, 
        page_count AS "pageCount",
        published_date AS "publishedDate",
        impact_factor AS "impactFactor",
        document_path AS "documentPath",
        approval_status AS "approvalStatus",
        created_at AS "createdAt"
      FROM phd_candidate_publication_info
      WHERE phd_candidate_id = $1
      ORDER BY created_at DESC`,
      [memberId]
    );

    // Log successful access
    logger.info('Publications fetched successfully', {
      meta: {
        sid: sessionId,
        eid,
        taskName: 'PublicationList',
        details: `Fetched ${result.rows.length} publications for ${memberId}`,
        severity: 'LOW'
      }
    });

    // Send Telegram alert for security monitoring
    await sendTelegramAlert(formatAlertMessage(
      'Publication List Accessed',
      `Member: ${memberId}\nIP: ${ipAddress}\nCount: ${result.rows.length}`
    ));

    return NextResponse.json(result.rows, { headers: securityHeaders });

  } catch (error) {
    // Error handling
    logger.error('Publication list fetch failed', {
      meta: {
        sid: sessionId,
        eid,
        taskName: 'PublicationList',
        details: error.message,
        severity: 'CRITICAL'
      }
    });

    await sendTelegramAlert(formatAlertMessage(
      'Publication List Error',
      `Member: ${memberId}\nError: ${error.message}\nIP: ${ipAddress}`
    ));

    return NextResponse.json(
      { error: 'Failed to fetch publications' },
      { status: 500, headers: securityHeaders }
    );
  }
}
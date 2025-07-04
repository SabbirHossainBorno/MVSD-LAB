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
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'"
};

export async function GET(request) {
  const sessionId = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';
  const memberId = request.cookies.get('id')?.value;
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown UA';

  const baseMeta = {
    sid: sessionId,
    eid,
    memberId,
    ip: ipAddress,
    ua: userAgent,
    taskName: 'PublicationList'
  };

  try {
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: securityHeaders });
    }

    // Get publications
    const publicationsQuery = await query(
      `SELECT 
        pub_res_id AS id,
        type,
        title,
        publishing_year AS year,
        authors,
        published_date AS "publishedDate",
        link,
        document_path AS "documentPath",
        approval_status AS "approvalStatus",
        created_at AS "createdAt",
        feedback
      FROM phd_candidate_pub_res_info
      WHERE phd_candidate_id = $1
      ORDER BY created_at DESC`,
      [memberId]
    );

    // Get statistics
    const statsQuery = await query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN approval_status = 'Approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN approval_status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN approval_status = 'Rejected' THEN 1 ELSE 0 END) AS rejected
      FROM phd_candidate_pub_res_info
      WHERE phd_candidate_id = $1`,
      [memberId]
    );

    const stats = statsQuery.rows[0];
    const publications = publicationsQuery.rows.map(pub => ({
      ...pub,
      authors: Array.isArray(pub.authors) ? pub.authors : JSON.parse(pub.authors || '[]'),
      createdAt: new Date(pub.createdAt).toISOString(),
      publishedDate: pub.publishedDate ? new Date(pub.publishedDate).toISOString() : null
    }));

    await sendTelegramAlert(formatAlertMessage(
      'Publication Data Accessed',
      `Member: ${memberId}\nIP: ${ipAddress}\nPublications: ${publications.length}`
    ));

    return NextResponse.json({ publications, stats }, { headers: securityHeaders });

  } catch (error) {
    logger.error('Publication data fetch failed', {
      meta: { ...baseMeta, details: error.message, stack: error.stack, severity: 'CRITICAL' }
    });

    await sendTelegramAlert(formatAlertMessage(
      'Publication Data Error',
      `Member: ${memberId}\nError: ${error.message}\nIP: ${ipAddress}`
    ));

    return NextResponse.json(
      { error: 'Failed to fetch publication data' },
      { status: 500, headers: securityHeaders }
    );
  }
}
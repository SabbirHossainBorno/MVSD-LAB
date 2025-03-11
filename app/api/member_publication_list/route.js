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

  // Base metadata for all logs
  const baseMeta = {
    sid: sessionId,
    eid,
    memberId,
    ip: ipAddress,
    ua: userAgent,
    taskName: 'PublicationList'
  };

  try {
    logger.debug('Publication list request initiated', {
      meta: {
        ...baseMeta,
        details: 'Starting publication list fetch process',
        severity: 'LOW'
      }
    });

    // Validate authentication
    if (!memberId) {
      logger.warn('Unauthorized publication list access attempt', {
        meta: {
          ...baseMeta,
          details: 'Missing member ID cookie',
          severity: 'HIGH'
        }
      });
      
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401, headers: securityHeaders }
      );
    }

    logger.debug('Member ID validation passed', {
      meta: {
        ...baseMeta,
        details: `Processing member ID: ${memberId}`,
        severity: 'LOW'
      }
    });

    // Verify member exists and is PhD Candidate
    const memberCheck = await query(
      `SELECT type FROM member WHERE id = $1`,
      [memberId]
    );

    logger.debug('Member check query executed', {
      meta: {
        ...baseMeta,
        details: `Query returned ${memberCheck.rows.length} rows`,
        severity: 'DEBUG'
      }
    });

    if (memberCheck.rows.length === 0) {
      logger.error('Member not found in database', {
        meta: {
          ...baseMeta,
          details: `Database lookup failed for member ID: ${memberId}`,
          severity: 'MEDIUM'
        }
      });
      
      return NextResponse.json(
        { error: 'Member not found' }, 
        { status: 404, headers: securityHeaders }
      );
    }

    const memberType = memberCheck.rows[0].type;
    if (memberType !== 'PhD Candidate') {
      logger.warn('Unauthorized access attempt by non-PhD member', {
        meta: {
          ...baseMeta,
          details: `Member type: ${memberType}`,
          severity: 'HIGH'
        }
      });
      
      return NextResponse.json(
        { error: 'Access restricted to PhD Candidates' }, 
        { status: 403, headers: securityHeaders }
      );
    }

    logger.debug('PhD candidate validation successful', {
      meta: {
        ...baseMeta,
        details: 'User confirmed as PhD candidate',
        severity: 'LOW'
      }
    });

    // Fetch publications
    logger.debug('Initiating publications fetch query', {
      meta: {
        ...baseMeta,
        details: 'Executing SQL query for publications',
        severity: 'DEBUG'
      }
    });

    const result = await query(
      `SELECT 
        id, 
        title, 
        type, 
        year, 
        journal_name AS "journalName",
        conference_name AS "conferenceName",
        authors,
        volume, 
        issue, 
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

    logger.debug('Publications query completed', {
      meta: {
        ...baseMeta,
        details: `Found ${result.rows.length} publications`,
        severity: 'DEBUG'
      }
    });

    // Validate and parse authors data
    const validatedPublications = result.rows.map(pub => {
      try {
        return {
          ...pub,
          authors: Array.isArray(pub.authors) 
            ? pub.authors 
            : JSON.parse(pub.authors || '[]'),
          createdAt: new Date(pub.createdAt).toISOString(),
          publishedDate: pub.publishedDate 
            ? new Date(pub.publishedDate).toISOString() 
            : null
        };
      } catch (e) {
        logger.error('Publication data parsing failed', {
          meta: {
            ...baseMeta,
            details: `Publication ID: ${pub.id} - ${e.message}`,
            severity: 'MEDIUM'
          }
        });
        return null;
      }
    }).filter(Boolean);

    logger.info('Publications processed successfully', {
      meta: {
        ...baseMeta,
        details: `Returning ${validatedPublications.length} valid publications`,
        severity: 'LOW'
      }
    });

    // Security alert
    await sendTelegramAlert(formatAlertMessage(
      'Publication List Accessed',
      `Member: ${memberId}\nIP: ${ipAddress}\nCount: ${validatedPublications.length}`
    ));

    return NextResponse.json(validatedPublications, { headers: securityHeaders });

  } catch (error) {
    // Enhanced error logging
    logger.error('Publication list fetch failure', {
      meta: {
        ...baseMeta,
        details: `Error: ${error.message}\nStack: ${error.stack}`,
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
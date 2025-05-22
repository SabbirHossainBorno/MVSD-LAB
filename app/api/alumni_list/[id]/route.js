import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendTelegramAlert from '../../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB ALUMNI SYSTEM\n-----------------------------\n${title}\n${details}`;
};

export async function GET(request, { params }) {
  const { id } = params;
  const sessionId = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = request.headers.get('x-forwarded-for') || request.ip || 'Unknown IP';

  try {
    console.log(`🔍 Fetching alumni details for ID: ${id}`);

    // Validate ID format
    if (!/^PHDC\d{2}MVSD$/.test(id)) {
      console.warn(`⚠️ Invalid ID format: ${id}`);
      return NextResponse.json(
        { success: false, message: 'Invalid alumni ID format' },
        { status: 400 }
      );
    }

    // Detail Query with Relationships
    const detailQuery = `
      SELECT 
        b.*,
        COALESCE(json_agg(s) FILTER (WHERE s.serial IS NOT NULL), '[]') AS social_media,
        COALESCE(json_agg(e) FILTER (WHERE e.serial IS NOT NULL), '[]') AS education,
        COALESCE(json_agg(c) FILTER (WHERE c.serial IS NOT NULL), '[]') AS career
      FROM phd_candidate_basic_info b
      LEFT JOIN phd_candidate_socialmedia_info s ON b.id = s.phd_candidate_id
      LEFT JOIN phd_candidate_education_info e ON b.id = e.phd_candidate_id
      LEFT JOIN phd_candidate_career_info c ON b.id = c.phd_candidate_id
      WHERE b.id = $1
      GROUP BY b.id
    `;

    const result = await query(detailQuery, [id]);

    // Handle not found
    if (result.rows.length === 0) {
      console.warn(`❌ Alumni not found: ${id}`);
      logger.warn('Alumni not found', {
        meta: {
          eid,
          sid: sessionId,
          task: 'FETCH_ALUMNI_DETAIL',
          requestedId: id
        }
      });

      return NextResponse.json(
        { success: false, message: 'Alumni not found' },
        { status: 404 }
      );
    }

    // Transform response
    const alumni = result.rows[0];
    const transformedData = {
      ...alumni,
      socialMedia: alumni.social_media,
      education: alumni.education,
      career: alumni.career
    };
    
    delete transformedData.social_media;
    delete transformedData.education;
    delete transformedData.career;

    console.log(`✅ Found alumni: ${transformedData.first_name} ${transformedData.last_name}`);

    logger.info('Alumni details fetched', {
      meta: {
        eid,
        sid: sessionId,
        task: 'FETCH_ALUMNI_DETAIL',
        details: {
          id,
          name: `${transformedData.first_name} ${transformedData.last_name}`
        }
      }
    });

    return NextResponse.json({
      success: true,
      alumni: transformedData
    });

  } catch (error) {
    console.error(`❌ Alumni detail error for ${id}:`, error);
    logger.error('Alumni detail fetch failed', {
      meta: {
        eid,
        sid: sessionId,
        task: 'FETCH_ALUMNI_DETAIL',
        error: {
          message: error.message,
          stack: error.stack,
          id,
          ip: ipAddress
        }
      }
    });

    await sendTelegramAlert(
      formatAlertMessage(
        'Alumni Detail Error',
        `ID: ${id}\nError: ${error.message.slice(0, 100)}`
      )
    );

    return NextResponse.json(
      { success: false, message: 'Failed to fetch alumni details' },
      { status: 500 }
    );
  }
}
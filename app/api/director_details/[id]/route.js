//api/director_details/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendTelegramAlert from '../../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

export async function GET(req, { params }) {
  const { id } = await params;

  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const apiCallMessage = formatAlertMessage('Director Details - API', `IP : ${ipAddress}\nStatus : 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Fetching details for director', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Director Details',
        details: `Fetching details for director ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    // Fetch director basic info
    const directorBasicInfoQuery = `SELECT * FROM director_basic_info WHERE id = $1;`;
    const directorBasicInfoResult = await query(directorBasicInfoQuery, [id]);

    // Fetch director education info
    const directorEducationQuery = `SELECT * FROM director_education_info WHERE director_id = $1;`;
    const directorEducationResult = await query(directorEducationQuery, [id]);

    // Fetch director career info
    const directorCareerQuery = `SELECT * FROM director_career_info WHERE director_id = $1;`;
    const directorCareerResult = await query(directorCareerQuery, [id]);

    // Fetch director Research Paper
    const directorResearchQuery = `SELECT * FROM director_research_info WHERE director_id = $1;`;
    const directorResearchResult = await query(directorResearchQuery, [id]);

    // Fetch director awards
    const directorAwardsQuery = `SELECT * FROM director_award_info WHERE director_id = $1;`;
    const directorAwardsResult = await query(directorAwardsQuery, [id]);

    // Fetch director social media info
    const directorSocialMediaQuery = `SELECT * FROM director_socialmedia_info WHERE director_id = $1;`;
    const directorSocialMediaResult = await query(directorSocialMediaQuery, [id]);

    const directorDetails = {
      basicInfo: directorBasicInfoResult.rows[0],
      education: directorEducationResult.rows,
      career: directorCareerResult.rows,
      researches: directorResearchResult.rows,
      awards: directorAwardsResult.rows,
      socialMedia: directorSocialMediaResult.rows,
    };

    const successMessage = formatAlertMessage('Successfully Fetched Director Details', `ID : ${id}`);
    await sendTelegramAlert(successMessage);

    logger.info('Successfully fetched details for director', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Director Details',
        details: `Successfully fetched details for director ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json(directorDetails, { status: 200 });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Fetching Director Details', `ID : ${id}\nError: ${error.message}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching director details', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Director Details',
        details: `Error fetching details for director ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: `Failed to fetch director details: ${error.message}` }, { status: 500 });
  }
}
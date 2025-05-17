//api/professor_details/[id]/route.js
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
    const apiCallMessage = formatAlertMessage('Professor Details - API', `IP : ${ipAddress}\nStatus : 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Fetching details for professor', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Professor Details',
        details: `Fetching details for professor ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    // Fetch professor basic info
    const professorBasicInfoQuery = `SELECT * FROM professor_basic_info WHERE id = $1;`;
    const professorBasicInfoResult = await query(professorBasicInfoQuery, [id]);

    // Fetch professor education info
    const professorEducationQuery = `SELECT * FROM professor_education_info WHERE professor_id = $1;`;
    const professorEducationResult = await query(professorEducationQuery, [id]);

    // Fetch professor career info
    const professorCareerQuery = `SELECT * FROM professor_career_info WHERE professor_id = $1;`;
    const professorCareerResult = await query(professorCareerQuery, [id]);

    // Fetch professor Research Paper
    const professorResearchQuery = `SELECT * FROM professor_research_info WHERE professor_id = $1;`;
    const professorResearchResult = await query(professorResearchQuery, [id]);

    // Fetch professor awards
    const professorAwardsQuery = `SELECT * FROM professor_award_info WHERE professor_id = $1;`;
    const professorAwardsResult = await query(professorAwardsQuery, [id]);

    // Fetch professor social media info
    const professorSocialMediaQuery = `SELECT * FROM professor_socialmedia_info WHERE professor_id = $1;`;
    const professorSocialMediaResult = await query(professorSocialMediaQuery, [id]);

    const professorDetails = {
      basicInfo: professorBasicInfoResult.rows[0],
      education: professorEducationResult.rows,
      career: professorCareerResult.rows,
      researches: professorResearchResult.rows,
      awards: professorAwardsResult.rows,
      socialMedia: professorSocialMediaResult.rows,
    };

    const successMessage = formatAlertMessage('Successfully Fetched Professor Details', `ID : ${id}`);
    await sendTelegramAlert(successMessage);

    logger.info('Successfully fetched details for professor', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Professor Details',
        details: `Successfully fetched details for professor ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json(professorDetails, { status: 200 });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Fetching Professor Details', `ID : ${id}\nError: ${error.message}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching professor details', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Professor Details',
        details: `Error fetching details for professor ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: `Failed to fetch professor details: ${error.message}` }, { status: 500 });
  }
}
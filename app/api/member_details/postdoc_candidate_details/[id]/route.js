// api/member_details/postdoc_candidate_details/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import logger from '../../../../../lib/logger';
import sendTelegramAlert from '../../../../../lib/telegramAlert';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

export async function GET(req, context) {
  const { params } = context;
  const { id } = await params; // Await the params object

  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const apiCallMessage = formatAlertMessage('Post Doc Candidate Details - API', `IP : ${ipAddress}\nStatus : 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Fetching details for Post Doc candidate', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Post Doc Candidate Details',
        details: `Fetching details for Post Doc candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    // Fetch Post Doc candidate basic info
    const postdocCandidateBasicInfoQuery = `SELECT * FROM postdoc_candidate_basic_info WHERE id = $1;`;
    const postdocCandidateBasicInfoResult = await query(postdocCandidateBasicInfoQuery, [id]);
  
    // Fetch Post Doc candidate education info
    const postdocCandidateEducationQuery = `SELECT * FROM postdoc_candidate_education_info WHERE postdoc_candidate_id = $1;`;
    const postdocCandidateEducationResult = await query(postdocCandidateEducationQuery, [id]);
  
    // Fetch Post Doc candidate career info
    const postdocCandidateCareerQuery = `SELECT * FROM postdoc_candidate_career_info WHERE postdoc_candidate_id = $1;`;
    const postdocCandidateCareerResult = await query(postdocCandidateCareerQuery, [id]);

    // Fetch Post Doc candidate social media info
    const postdocCandidateSocialMediaQuery = `SELECT * FROM postdoc_candidate_socialMedia_info WHERE postdoc_candidate_id = $1;`;
    const postdocCandidateSocialMediaResult = await query(postdocCandidateSocialMediaQuery, [id]);
  
    const postdocCandidateDetails = {
      basicInfo: postdocCandidateBasicInfoResult.rows[0],
      education: postdocCandidateEducationResult.rows,
      career: postdocCandidateCareerResult.rows,
      socialMedia: postdocCandidateSocialMediaResult.rows,
    };

    const successMessage = formatAlertMessage('Successfully Fetched Post Doc Candidate Details', `ID : ${id}`);
    await sendTelegramAlert(successMessage);

    logger.info('Successfully fetched details for Post Doc Candidate', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Post Doc Candidate Details',
        details: `Successfully fetched details for Post Doc Candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json(postdocCandidateDetails, { status: 200 });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Fetching Post Doc Candidate Details', `ID : ${id}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching Post Doc candidate details', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch Post Doc Candidate Details',
        details: `Error fetching details for Post Doc candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: 'Failed to fetch Post Doc candidate details' }, { status: 500 });
  }
}
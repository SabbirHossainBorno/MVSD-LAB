// api/member_details/phd_candidate_details/[id]/route.js
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
    const apiCallMessage = formatAlertMessage('PhD Candidate Details - API', `IP : ${ipAddress}\nStatus : 200`);
    await sendTelegramAlert(apiCallMessage);

    logger.info('Fetching details for PhD candidate', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch PhD Candidate Details',
        details: `Fetching details for PhD candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    // Fetch PhD candidate basic info
    const phdCandidateBasicInfoQuery = `SELECT * FROM phd_candidate_basic_info WHERE id = $1;`;
    const phdCandidateBasicInfoResult = await query(phdCandidateBasicInfoQuery, [id]);
  
    // Fetch PhD candidate education info
    const phdCandidateEducationQuery = `SELECT * FROM phd_candidate_education_info WHERE phd_candidate_id = $1;`;
    const phdCandidateEducationResult = await query(phdCandidateEducationQuery, [id]);
  
    // Fetch PhD candidate career info
    const phdCandidateCareerQuery = `SELECT * FROM phd_candidate_career_info WHERE phd_candidate_id = $1;`;
    const phdCandidateCareerResult = await query(phdCandidateCareerQuery, [id]);
  
    // Fetch PhD candidate documents
    const phdCandidateDocumentsQuery = `SELECT * FROM phd_candidate_document_info WHERE phd_candidate_id = $1;`;
    const phdCandidateDocumentsResult = await query(phdCandidateDocumentsQuery, [id]);
  
    // Fetch PhD candidate social media info
    const phdCandidateSocialMediaQuery = `SELECT * FROM phd_candidate_socialMedia_info WHERE phd_candidate_id = $1;`;
    const phdCandidateSocialMediaResult = await query(phdCandidateSocialMediaQuery, [id]);
  
    const phdCandidateDetails = {
      basicInfo: phdCandidateBasicInfoResult.rows[0],
      education: phdCandidateEducationResult.rows,
      career: phdCandidateCareerResult.rows,
      documents: phdCandidateDocumentsResult.rows,
      socialMedia: phdCandidateSocialMediaResult.rows,
    };

    const successMessage = formatAlertMessage('Successfully Fetched PhD Candidate Details', `ID : ${id}`);
    await sendTelegramAlert(successMessage);

    logger.info('Successfully fetched details for PhD Candidate', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch PhD Candidate Details',
        details: `Successfully fetched details for PhD Candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json(phdCandidateDetails, { status: 200 });
  } catch (error) {
    const errorMessage = formatAlertMessage('Error Fetching PhD Candidate Details', `ID : ${id}`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error fetching PhD candidate details', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch PhD Candidate Details',
        details: `Error fetching details for PhD candidate ID: ${id} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: 'Failed to fetch PhD candidate details' }, { status: 500 });
  }
}
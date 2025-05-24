// app/api/member_publication_add/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB MEMBER DASHBOARD\n--------------------------------------------------\n${title}\n${details}`;
};

const generatePublicationId = async () => {
  const result = await query(
    'SELECT pub_res_id FROM phd_candidate_pub_res_info ORDER BY pub_res_id DESC LIMIT 1'
  );

  let lastNumber = 0;
  if (result.rows.length > 0) {
    const lastId = result.rows[0].pub_res_id;
    const match = lastId.match(/PUB(\d+)RESMVSD/);
    if (match) lastNumber = parseInt(match[1]);
  }

  const newNumber = lastNumber + 1;
  return `PUB${newNumber.toString().padStart(2, '0')}RESMVSD`;
};

const savePublicationDocument = async (file, pubResId) => {
  if (!file) return null;
  
  const allowedTypes = ['application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PDF files are allowed');
  }

  const filename = `${pubResId}${path.extname(file.name)}`;
  const targetPath = path.join(
    '/home/mvsd-lab/public/Storage/Documents/PhD_Candidate',
    filename
  );

  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    return `/Storage/Documents/PhD_Candidate/${filename}`;
  } catch (error) {
    throw new Error(`Failed to save document: ${error.message}`);
  }
};

export async function POST(req) {
  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const memberId = req.cookies.get('id')?.value;
  const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown IP';

  console.log(`[${new Date().toISOString()}] Starting publication submission process for member: ${memberId}`);
  console.log(`[Request Metadata] IP: ${ipAddress}, Session: ${sessionId}, EID: ${eid}`);

  try {
    // Validate authentication
    if (!memberId) {
      console.error('[Auth Error] No member ID found in cookies');
      return NextResponse.json(
        { success: false, message: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Verify member is PhD Candidate
    console.log(`[Member Verification] Checking member status for: ${memberId}`);
    const memberCheck = await query(
      `SELECT type FROM member WHERE id = $1`,
      [memberId]
    );

    if (memberCheck.rows.length === 0 || memberCheck.rows[0].type !== 'PhD Candidate') {
      console.warn(`[Authorization Failed] Member ${memberId} is not a PhD candidate`);
      return NextResponse.json(
        { success: false, message: 'Publications can only be added by PhD Candidates' },
        { status: 403 }
      );
    }

    // Generate publication ID
    console.log('[ID Generation] Generating new publication ID');
    const pubResId = await generatePublicationId();
    console.log(`[ID Generated] New PUB_RES_ID: ${pubResId}`);

    // Process form data
    console.log('[Form Processing] Parsing form data');
    const formData = await req.formData();
    
    // Handle document upload
    let documentPath = null;
    const documentFile = formData.get('document');
    if (documentFile) {
      console.log(`[File Upload] Processing document upload - File name: ${documentFile.name}, Size: ${documentFile.size} bytes`);
      try {
        documentPath = await savePublicationDocument(documentFile, pubResId);
        console.log(`[File Upload Success] Document stored at: ${documentPath}`);
      } catch (error) {
        console.error('[File Upload Failed]', error.message);
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        );
      }
    } else {
      console.log('[File Upload] No document provided, proceeding without file upload');
    }

    // Prepare publication data
    console.log('[Data Preparation] Parsing and validating form data');
    const publicationData = {
      pub_res_id: pubResId,
      phd_candidate_id: memberId,
      type: formData.get('type'),
      title: formData.get('title'),
      publishing_year: formData.get('publishing_year'),
      authors: JSON.parse(formData.get('authors')),
      published_date: formData.get('publishedDate') || null,
      link: formData.get('link'),
      document_path: documentPath
    };

    console.log('[Publication Data]', {
      type: publicationData.type,
      title: publicationData.title.substring(0, 50) + '...',
      year: publicationData.publishing_year,
      authorCount: publicationData.authors.length,
      hasDocument: !!documentPath
    });

    // Validate required fields
    console.log('[Validation] Checking required fields');
    const requiredFields = {
      type: 'Publication type',
      title: 'Title',
      publishing_year: 'Publishing year',
      authors: 'Authors',
      link: 'Link'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !publicationData[key])
      .map(([, name]) => name);

    if (missingFields.length > 0) {
      console.error('[Validation Failed] Missing fields:', missingFields);
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate year format
    if (isNaN(publicationData.publishing_year) || 
        publicationData.publishing_year < 1900 || 
        publicationData.publishing_year > new Date().getFullYear()) {
      console.error(`[Validation Failed] Invalid year: ${publicationData.publishing_year}`);
      return NextResponse.json(
        { success: false, message: 'Invalid publication year' },
        { status: 400 }
      );
    }

    // Database transaction
    console.log('[Database] Starting transaction');
    await query('BEGIN');

    try {
      // Insert publication
      console.log('[Database] Executing publication insert');
      const insertQuery = `
        INSERT INTO phd_candidate_pub_res_info (
          pub_res_id,
          phd_candidate_id,
          type,
          title,
          publishing_year,
          authors,
          published_date,
          link,
          document_path,
          approval_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending')
        RETURNING pub_res_id;
      `;

      const result = await query(insertQuery, [
        publicationData.pub_res_id,
        publicationData.phd_candidate_id,
        publicationData.type,
        publicationData.title,
        publicationData.publishing_year,
        JSON.stringify(publicationData.authors),
        publicationData.published_date,
        publicationData.link,
        publicationData.document_path
      ]);

      console.log(`[Database] Insert successful for PUB_RES_ID: ${result.rows[0].pub_res_id}`);

      // Create notification
      console.log('[Notification] Creating notification entry');
      const notificationQuery = `
        INSERT INTO notification_details (
          id,
          title,
          status
        ) VALUES ($1, $2, $3)
      `;

      await query(notificationQuery, [
        pubResId,
        `New Publication/Research Submitted: ${publicationData.title.substring(0, 30)}...`,
        'Unread'
      ]);

      console.log('[Notification] Notification created successfully');

      await query('COMMIT');
      console.log('[Database] Transaction committed successfully');

    } catch (dbError) {
      console.error('[Database Error] Rolling back transaction:', dbError.message);
      await query('ROLLBACK');
      throw dbError;
    }

    // Log success
    console.log(`[Success] Publication submitted successfully - PUB_RES_ID: ${pubResId}`);
    logger.info('Publication submitted successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Add Publication',
        details: `PUB_RES_ID: ${pubResId}, Member: ${memberId}`
      }
    });

    // Send Telegram alert
    const successMessage = formatAlertMessage(
      'New Publication/Research Submission',
      `PUB_RES_ID: ${pubResId}\nMember: ${memberId}\nType: ${publicationData.type}`
    );
    await sendTelegramAlert(successMessage);

    return NextResponse.json({
      success: true,
      message: 'Publication/Research submitted successfully',
      pub_res_id: pubResId
    });

  } catch (error) {
    console.error('[System Error]', error);
    await query('ROLLBACK');
    
    logger.error('Publication submission failed', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Add Publication',
        details: `Error: ${error.message}\nStack: ${error.stack}`
      }
    });

    const errorMessage = formatAlertMessage(
      'Submission Failed',
      `Error: ${error.message}\nIP: ${ipAddress}\nStack: ${error.stack.substring(0, 200)}...`
    );
    await sendTelegramAlert(errorMessage);

    return NextResponse.json(
      { success: false, message: `Submission failed: ${error.message}` },
      { status: 500 }
    );
  }
}
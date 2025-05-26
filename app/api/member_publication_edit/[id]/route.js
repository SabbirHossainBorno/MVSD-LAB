// app/api/member_publication_edit/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendTelegramAlert from '../../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';

// Constants
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
  'Cache-Control': 'no-store, max-age=0'
};

const ID_REGEX = /^PUB\d{2,}RESMVSD$/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formatAlertMessage = (title, details) => {
  return `MVSD LAB ALERT\n====================\n${title}\n${details}\nIP: ${details.ip}\nTime: ${new Date().toISOString()}`;
};

// Helper Functions
const safeParseJSON = (str, fallback = []) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error(`JSON parse failed for string: ${str}`);
    return fallback;
  }
};

const validateFilename = (filename) => {
  return /^[\w\-\.]+$/.test(filename) && path.extname(filename) === '.pdf';
};

const savePublicationDocument = async (file, pubResId, existingPath) => {
  try {
    console.log(`Starting document processing for ${pubResId}`);
    
    if (!file || file.size > MAX_FILE_SIZE) {
      throw new Error('Invalid file or size exceeds 5MB limit');
    }

    if (!validateFilename(file.name)) {
      throw new Error('Invalid filename format');
    }

    // Remove existing file
    if (existingPath) {
      const fullPath = path.join('/home/mvsd-lab/public', existingPath);
      console.log(`Removing existing document at ${fullPath}`);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Create new file
    const filename = `${pubResId}${path.extname(file.name)}`;
    const targetPath = path.join(
      '/home/mvsd-lab/public/Storage/Documents/PhD_Candidate',
      filename
    );

    console.log(`Saving new document to ${targetPath}`);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    
    return `/Storage/Documents/PhD_Candidate/${filename}`;
  } catch (error) {
    console.error('Document processing failed:', error.message);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

// API Handlers
export async function GET(req, { params }) {
  const { id } = params;
  console.log(`[GET] Received request for publication ${id}`);

  try {
    // Validate ID format
    if (!ID_REGEX.test(id)) {
      console.error(`Invalid ID format: ${id}`);
      return NextResponse.json(
        { error: 'Invalid publication ID format' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Database query
    console.log(`Querying database for ${id}`);
    const result = await query(
      `SELECT 
        pub_res_id AS id,
        type,
        title,
        publishing_year AS year,
        authors,
        published_date AS "publishedDate",
        link,
        document_path AS "documentPath",
        approval_status AS "approvalStatus"
      FROM phd_candidate_pub_res_info
      WHERE pub_res_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      console.log(`Publication ${id} not found`);
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    // Process result
    const rawData = result.rows[0];
    console.log(`Raw database response:`, JSON.stringify(rawData, null, 2));

    const publication = {
      ...rawData,
      authors: safeParseJSON(rawData.authors, []),
      publishedDate: rawData.publishedDate ? new Date(rawData.publishedDate).toISOString() : null
    };

    console.log(`Successfully fetched ${id}`);
    return NextResponse.json({ publication }, { headers: SECURITY_HEADERS });

  } catch (error) {
    console.error(`GET failed for ${id}:`, error);
    logger.error('Publication fetch failed', {
      meta: {
        id,
        error: error.message,
        stack: error.stack,
        severity: 'CRITICAL'
      }
    });

    await sendTelegramAlert(formatAlertMessage(
      'Publication Fetch Failure',
      `ID: ${id}\nError: ${error.message}`
    ));

    return NextResponse.json(
      { error: 'Failed to fetch publication' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown';
  const eid = req.cookies.get('eid')?.value || 'Unknown';
  const memberId = req.cookies.get('id')?.value;
  const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown';

  console.log(`[PUT] Starting update for ${id} by ${memberId}`);

  try {
    // Validate inputs
    if (!memberId || !/^\d+$/.test(memberId)) {
      console.error(`Invalid member ID: ${memberId}`);
      return NextResponse.json(
        { success: false, message: 'Authentication required' }, 
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    if (!ID_REGEX.test(id)) {
      console.error(`Invalid publication ID: ${id}`);
      return NextResponse.json(
        { success: false, message: 'Invalid publication ID' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Check publication status
    console.log(`Checking status for ${id}`);
    const statusCheck = await query(
      `SELECT approval_status FROM phd_candidate_pub_res_info
       WHERE pub_res_id = $1 AND phd_candidate_id = $2`,
      [id, memberId]
    );

    if (statusCheck.rows.length === 0) {
      console.log(`No publication found for ${id} and member ${memberId}`);
      return NextResponse.json(
        { success: false, message: 'Publication not found' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    if (statusCheck.rows[0].approval_status === 'Approved') {
      console.log(`Attempt to modify approved publication ${id}`);
      return NextResponse.json(
        { success: false, message: 'Approved publications cannot be modified' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    // Process form data
    console.log(`Parsing form data for ${id}`);
    const formData = await req.formData();
    const existingDocument = formData.get('existingDocument');
    const documentFile = formData.get('document');

    // Handle document upload
    let documentPath = existingDocument;
    if (documentFile && documentFile.size > 0) {
      console.log(`Processing document upload for ${id}`);
      documentPath = await savePublicationDocument(documentFile, id, existingDocument);
      console.log(`New document path: ${documentPath}`);
    }

    // Validate and parse form data
    console.log(`Validating form data for ${id}`);
    const updateData = {
      type: formData.get('type'),
      title: formData.get('title')?.trim(),
      publishing_year: Number(formData.get('publishing_year')),
      authors: safeParseJSON(formData.get('authors')),
      published_date: (() => {
        const date = formData.get('published_date');
        return date && !isNaN(new Date(date)) ? new Date(date).toISOString() : null;
      })(),
      link: formData.get('link')?.trim(),
      document_path: documentPath
    };

    // Validate required fields
    if (!updateData.type || !updateData.title || !updateData.publishing_year || 
        !updateData.authors?.length || !updateData.link) {
      console.error('Missing required fields:', updateData);
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Database transaction
    console.log(`Starting database transaction for ${id}`);
    await query('BEGIN');

    try {
      console.log(`Updating publication ${id}`);
      await query(
        `UPDATE phd_candidate_pub_res_info
         SET type = $1, title = $2, publishing_year = $3,
             authors = $4, published_date = $5, link = $6,
             document_path = $7, approval_status = 'Pending', updated_at = NOW()
         WHERE pub_res_id = $8`,
        [
          updateData.type,
          updateData.title,
          updateData.publishing_year,
          JSON.stringify(updateData.authors),
          updateData.published_date,
          updateData.link,
          updateData.document_path,
          id
        ]
      );

      console.log(`Updating notifications for ${id}`);
      await query(
        `UPDATE notification_details
         SET title = $1, status = 'Unread', created_at = NOW()
         WHERE id = $2`,
        [`Updated: ${updateData.title.substring(0, 30)}...`, id]
      );

      await query('COMMIT');
      console.log(`Transaction committed for ${id}`);

    } catch (dbError) {
      await query('ROLLBACK');
      console.error(`Database error for ${id}:`, dbError);
      throw dbError;
    }

    // Log success
    console.log(`Successfully updated ${id}`);
    logger.info('Publication updated', {
      meta: {
        id,
        memberId,
        sessionId,
        eid,
        ip: ipAddress
      }
    });

    await sendTelegramAlert(formatAlertMessage(
      'Publication Updated',
      `ID: ${id}\nMember: ${memberId}`
    ));

    return NextResponse.json(
      { success: true, message: 'Publication updated successfully' },
      { headers: SECURITY_HEADERS }
    );

  } catch (error) {
    console.error(`Update failed for ${id}:`, error);
    logger.error('Publication update failed', {
      meta: {
        id,
        memberId,
        error: error.message,
        stack: error.stack,
        sessionId,
        eid,
        ip: ipAddress
      }
    });

    await sendTelegramAlert(formatAlertMessage(
      'Update Failed',
      `ID: ${id}\nError: ${error.message}`
    ));

    return NextResponse.json(
      { success: false, message: `Update failed: ${error.message}` },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
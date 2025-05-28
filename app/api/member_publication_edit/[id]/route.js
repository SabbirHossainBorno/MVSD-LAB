// app/api/member_publication_edit/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendTelegramAlert from '../../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';

// Security headers configuration
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
  'Cache-Control': 'no-store, max-age=0'
};

// Constants
const ID_REGEX = /^PUB\d{2,}RESMVSD$/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Telegram alert formatter
const formatAlertMessage = (title, details) => {
  return `MVSD LAB ALERT\n====================\n${title}\n${details}\nIP: ${details.ip}\nTime: ${new Date().toISOString()}`;
};

// Helper: Safe JSON parsing
const safeParseJSON = (str, fallback = []) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error(`[JSON PARSE ERROR] Failed for string: ${str}`, e.stack);
    return fallback;
  }
};

// Helper: Validate filename
const validateFilename = (filename) => {
  return /^[\w\-\.]+$/.test(filename) && path.extname(filename) === '.pdf';
};

// Helper: Save publication document with detailed logging
const savePublicationDocument = async (file, pubResId, existingPath) => {
  try {
    console.log(`[DOCUMENT PROCESSING] Starting for ${pubResId}`);
    console.log(`File info: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);
    
    if (!file || file.size > MAX_FILE_SIZE) {
      throw new Error(`Invalid file or size exceeds 5MB limit (${(file.size/1024/1024).toFixed(2)}MB)`);
    }

    if (!validateFilename(file.name)) {
      throw new Error(`Invalid filename format: ${file.name}`);
    }

    // Remove existing file if exists
    if (existingPath) {
      const fullPath = path.join('/home/mvsd-lab/public', existingPath);
      console.log(`[REMOVE EXISTING] Attempting to remove: ${fullPath}`);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`[REMOVED] Successfully deleted: ${fullPath}`);
      } else {
        console.warn(`[REMOVE WARNING] File not found: ${fullPath}`);
      }
    }

    // Create new file
    const filename = `${pubResId}${path.extname(file.name)}`;
    const targetPath = path.join(
      '/home/mvsd-lab/public/Storage/Documents/PhD_Candidate',
      filename
    );

    console.log(`[SAVING DOCUMENT] Path: ${targetPath}`);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    
    console.log(`[DOCUMENT SAVED] Successfully saved: ${filename}`);
    return `/Storage/Documents/PhD_Candidate/${filename}`;
    
  } catch (error) {
    console.error(`[DOCUMENT ERROR] Processing failed: ${error.message}`);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

// GET Handler: Fetch publication data
export async function GET(request, { params }) {
  const { id } = params;
  console.log(`[GET START] Received request for publication ID: ${id}`);
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';

  try {
    // Validate ID format
    if (!ID_REGEX.test(id)) {
      console.error(`[INVALID ID] Format: ${id}`);
      return NextResponse.json(
        { error: 'Invalid publication ID format' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Database query
    console.log(`[DATABASE QUERY] Fetching publication: ${id}`);
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
      console.log(`[NOT FOUND] Publication not found: ${id}`);
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    // Process result
    const rawData = result.rows[0];
    console.log(`[DATABASE RESPONSE] Raw data:`, JSON.stringify(rawData, null, 2));

    const publication = {
      ...rawData,
      authors: Array.isArray(rawData.authors) 
        ? rawData.authors 
        : safeParseJSON(rawData.authors || '[]', []),
      publishedDate: rawData.publishedDate ? new Date(rawData.publishedDate).toISOString() : null
    };

    console.log(`[GET SUCCESS] Retrieved publication: ${publication.title}`);
    return NextResponse.json({ publication }, { headers: SECURITY_HEADERS });

  } catch (error) {
    console.error(`[GET FAILED] ID: ${id}`, error.stack);
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

// PUT Handler: Update publication
export async function PUT(request, { params }) {
  const { id } = params;
  const sessionId = request.cookies.get('sessionId')?.value || 'Unknown';
  const eid = request.cookies.get('eid')?.value || 'Unknown';
  const memberId = request.cookies.get('id')?.value;
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';

  console.log(`[PUT START] Update request for ID: ${id} by member: ${memberId}`);
  console.log(`Session: ${sessionId}, EID: ${eid}, IP: ${ipAddress}`);

  try {
    // Validate authentication - FIXED MEMBER ID VALIDATION
    if (!memberId) {
      console.error(`[AUTH ERROR] Member ID not found: ${memberId}`);
      return NextResponse.json(
        { success: false, message: 'Authentication required' }, 
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Validate ID format
    if (!ID_REGEX.test(id)) {
      console.error(`[INVALID ID] Format: ${id}`);
      return NextResponse.json(
        { success: false, message: 'Invalid publication ID' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Check publication status
    console.log(`[STATUS CHECK] Verifying publication status: ${id}`);
    const statusCheck = await query(
      `SELECT approval_status, document_path 
       FROM phd_candidate_pub_res_info
       WHERE pub_res_id = $1 AND phd_candidate_id = $2`,
      [id, memberId]
    );

    if (statusCheck.rows.length === 0) {
      console.log(`[NOT FOUND] Publication not found: ${id}`);
      return NextResponse.json(
        { success: false, message: 'Publication not found' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const existingDocumentPath = statusCheck.rows[0].document_path;
    if (statusCheck.rows[0].approval_status === 'Approved') {
      console.log(`[APPROVAL ERROR] Attempt to modify approved publication: ${id}`);
      return NextResponse.json(
        { success: false, message: 'Approved publications cannot be modified' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    // Process form data
    console.log(`[FORM DATA] Parsing form data`);
    const formData = await request.formData();
    const removeDocument = formData.get('removeDocument') === 'true';
    const documentFile = formData.get('document');
    
    console.log(`Document operations - Remove: ${removeDocument}, New file: ${documentFile ? 'Yes' : 'No'}`);

    // Handle document operations
    let documentPath = existingDocumentPath || null;
    
    if (removeDocument) {
      console.log(`[DOCUMENT REMOVAL] Requested for ID: ${id}`);
      if (documentPath) {
        const fullPath = path.join('/home/mvsd-lab/public', documentPath);
        console.log(`[REMOVING] Attempting to remove: ${fullPath}`);
        
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`[REMOVED] Successfully deleted: ${fullPath}`);
        }
        documentPath = null;
      }
    } 
    
    if (documentFile && documentFile.size > 0) {
      console.log(`[DOCUMENT UPLOAD] Processing new file`);
      try {
        documentPath = await savePublicationDocument(
          documentFile, 
          id, 
          removeDocument ? null : existingDocumentPath
        );
      } catch (fileError) {
        console.error(`[UPLOAD ERROR] ${fileError.message}`);
        return NextResponse.json(
          { success: false, message: fileError.message },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }
    }

    // Validate and parse form data
    console.log(`[DATA VALIDATION] Processing form fields`);
    const updateData = {
      type: formData.get('type'),
      title: formData.get('title')?.trim(),
      publishing_year: Number(formData.get('publishing_year')),
      authors: safeParseJSON(formData.get('authors')),
      published_date: formData.get('published_date') || null,
      link: formData.get('link')?.trim(),
    };

    // Validate required fields
    const missingFields = [];
    if (!updateData.type) missingFields.push('type');
    if (!updateData.title) missingFields.push('title');
    if (!updateData.publishing_year) missingFields.push('year');
    if (!updateData.authors?.length) missingFields.push('authors');
    if (!updateData.link) missingFields.push('link');
    
    if (missingFields.length > 0) {
      console.error(`[VALIDATION ERROR] Missing fields: ${missingFields.join(', ')}`);
      return NextResponse.json(
        { success: false, message: 'Missing required fields', missingFields },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Database transaction
    console.log(`[TRANSACTION START] Beginning database update`);
    await query('BEGIN');

    try {
      console.log(`[DATABASE UPDATE] Executing update query`);
      const updateQuery = `
        UPDATE phd_candidate_pub_res_info
        SET
          type = $1,
          title = $2,
          publishing_year = $3,
          authors = $4,
          published_date = $5,
          link = $6,
          document_path = $7,
          approval_status = 'Pending',
          updated_at = NOW()
        WHERE pub_res_id = $8
        RETURNING *`;
      
      const result = await query(updateQuery, [
        updateData.type,
        updateData.title,
        updateData.publishing_year,
        JSON.stringify(updateData.authors),
        updateData.published_date,
        updateData.link,
        documentPath,
        id
      ]);

      console.log(`[UPDATE SUCCESS] Affected rows: ${result.rowCount}`);
      console.log(`Updated data:`, JSON.stringify(result.rows[0], null, 2));

      // Update notification
      console.log(`[NOTIFICATION UPDATE] Creating notification`);
      await query(
        `UPDATE notification_details
         SET title = $1, status = 'Unread', created_at = NOW()
         WHERE id = $2`,
        [`Updated: ${updateData.title.substring(0, 30)}...`, id]
      );

      await query('COMMIT');
      console.log(`[TRANSACTION COMPLETE] Update committed`);

    } catch (dbError) {
      await query('ROLLBACK');
      console.error(`[DATABASE ERROR] Rollback initiated: ${dbError.message}`);
      throw new Error(`Database operation failed: ${dbError.message}`);
    }

    // Log success
    console.log(`[UPDATE COMPLETE] Successfully updated ID: ${id}`);
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
      `ID: ${id}\nMember: ${memberId}\nTitle: ${updateData.title}`
    ));

    return NextResponse.json(
      { success: true, message: 'Publication updated successfully' },
      { headers: SECURITY_HEADERS }
    );

  } catch (error) {
    console.error(`[UPDATE FAILED] ID: ${id}`, error.stack);
    logger.error('Publication update failed', {
      meta: {
        id,
        memberId,
        error: error.message,
        stack: error.stack,
        sessionId,
        eid,
        ip: ipAddress,
        severity: 'CRITICAL'
      }
    });

    await sendTelegramAlert(formatAlertMessage(
      'Publication Update Failed',
      `ID: ${id}\nError: ${error.message}`
    ));

    return NextResponse.json(
      { success: false, message: `Update failed: ${error.message}` },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
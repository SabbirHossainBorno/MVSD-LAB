// app/api/member_publication_edit/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendTelegramAlert from '../../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';

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

// Helper: Save publication document with enhanced validation
const savePublicationDocument = async (file, pubResId, existingPath) => {
  try {
    console.log(`[DOCUMENT PROCESSING] Starting for ${pubResId}`);
    
    // Validate file exists
    if (!file) {
      throw new Error('No file provided for upload');
    }
    
    console.log(`File info: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 5MB limit (${(file.size/1024/1024).toFixed(2)}MB)`);
    }

    // Validate file type
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF files are allowed');
    }

    // Get file extension
    const extension = path.extname(file.name).toLowerCase();
    if (extension !== '.pdf') {
      throw new Error('File must have .pdf extension');
    }

    // Remove existing file if exists
    if (existingPath) {
      const fullPath = path.join('/home/mvsd-lab/public', existingPath);
      console.log(`[REMOVE EXISTING] Attempting to remove: ${fullPath}`);
      
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`[REMOVED] Successfully deleted: ${fullPath}`);
        } catch (removeError) {
          console.error(`[REMOVE ERROR] Failed to delete: ${fullPath}`, removeError);
          throw new Error(`Failed to remove existing document: ${removeError.message}`);
        }
      } else {
        console.warn(`[REMOVE WARNING] File not found: ${fullPath}`);
      }
    }

    // Create new filename
    const filename = `${pubResId}${extension}`;
    const targetPath = path.join(
      '/home/mvsd-lab/public/Storage/Documents/PhD_Candidate',
      filename
    );

    console.log(`[SAVING DOCUMENT] Path: ${targetPath}`);
    
    try {
      // Convert file to buffer and save
      const buffer = await file.arrayBuffer();
      fs.writeFileSync(targetPath, Buffer.from(buffer));
      console.log(`[DOCUMENT SAVED] Successfully saved: ${filename}`);
      
      return `/Storage/Documents/PhD_Candidate/${filename}`;
    } catch (writeError) {
      console.error(`[SAVE ERROR] Failed to write file: ${writeError.message}`);
      throw new Error(`Failed to save document: ${writeError.message}`);
    }
    
  } catch (error) {
    console.error(`[DOCUMENT PROCESSING ERROR] ${error.message}`);
    throw error; // Rethrow to preserve original error
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
    // Validate authentication
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
      console.log(`[DOCUMENT UPLOAD] Processing new file: ${documentFile.name} (${(documentFile.size/1024/1024).toFixed(2)}MB)`);
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
        [`A Publication/Research Re-Submitted: ${updateData.title.substring(0, 30)}...`, id]
      );

      await query('COMMIT');
      console.log(`[TRANSACTION COMPLETE] Update committed`);

      // EMAIL NOTIFICATION SECTION
      try {
        console.log('[Email Notification] Preparing to send notifications');
        
        // 1. Get director's email
        const directorResult = await query(
          `SELECT email FROM director_basic_info WHERE id = 'D01MVSD'`
        );
        const directorEmail = directorResult.rows[0]?.email;
        
        // 2. Get member's email
        const memberResult = await query(
          `SELECT email FROM member WHERE id = $1`,
          [memberId]
        );
        const memberEmail = memberResult.rows[0]?.email;
        
        if (directorEmail || memberEmail) {
          // Create email transporter
          const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: true,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          });

          // Prepare emails
          const emails = [];
          
          // Director notification
if (directorEmail) {
  const directorEmailHTML = `
    <p>Dear Director,</p>
    
    <p>A Publication/Research has been updated by <strong>${memberId}</strong> (${memberEmail}).</p>
    
    <p>Publication Details:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Publication/Research ID</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${id}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Title</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${updateData.title}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${updateData.type}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Publishing Year</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${updateData.publishing_year}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Authors</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${updateData.authors.join(', ')}</td>
      </tr>
    </table>
    
    <p>This updated version is now pending your review and approval in the <a href="https://www.mvsdlab.com/login">MVSD LAB Director Portal</a>.</p>
    
    <p>Sincerely,<br>
    <strong>MVSD LAB</strong></p>
    
    <p style="margin-top: 20px; font-size: 12px; color: #666;">
      <strong>Quick Action:</strong> <a href="https://www.mvsdlab.com/login">Review Publication/Research Now</a>
    </p>
  `;

  emails.push({
    from: process.env.EMAIL_FROM,
    to: directorEmail,
    subject: `Publication Updated - ${id}`,
    html: directorEmailHTML
  });
}
          
          // Member confirmation (HTML version)
    if (memberEmail) {
      const memberEmailContentHTML = `
        <p>Dear Researcher,</p>
        
        <p>Your Publication/Research has been successfully updated:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Publication/Research ID</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Title</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${updateData.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${updateData.type}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Publishing Year</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${updateData.publishing_year}</td>
          </tr>
        </table>
        
        <p>The updated version is now pending review by the director. You'll be notified once it's approved.</p>
        
        <p>Thank you for your contribution to MVSD LAB's Publication/Research.</p>
        
        <p>Best Regards,<br>
        <strong>MVSD LAB</strong></p>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          You can view your submissions at : <a href="https://www.mvsdlab.com/login">MVSD LAB Member Dashboard</a>
        </p>
      `;

      emails.push({
        from: process.env.EMAIL_FROM,
        to: memberEmail,
        subject: `Publication Updated Successfully - ${id}`,
        html: memberEmailContentHTML
      });
    }
          
          // Send all emails
          await Promise.all(emails.map(email => transporter.sendMail(email)));
          console.log(`[Email] Sent ${emails.length} notifications`);
        } else {
          console.log('[Email] No valid email addresses found for notifications');
        }
      } catch (emailError) {
        console.error('[Email Error]', emailError.message);
        logger.error('Email sending failed after publication update', {
          meta: {
            id,
            memberId,
            error: emailError.message
          }
        });
      }
      // END EMAIL NOTIFICATION SECTION

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
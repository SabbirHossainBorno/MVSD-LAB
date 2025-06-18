// app/api/member_add/postdoc_candidate_add/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import logger from '../../../../lib/logger';
import sendTelegramAlert from '../../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

const generatePostDocCandidateId = async () => {
  try {
    const result = await query('SELECT MAX(id) AS max_id FROM postdoc_candidate_basic_info');
    const maxId = result.rows[0]?.max_id || 'POSTDC00MVSD';
    const numericPart = parseInt(maxId.substring(6, maxId.length - 4), 10) || 0;
    const nextId = numericPart + 1;
    const newId = `POSTDC${String(nextId).padStart(2, '0')}MVSD`;
    return newId;
  } catch (error) {
    throw new Error(`Error generating Post Doc Candidate ID: ${error.message}`);
  }
};

const saveProfilePhoto = async (file, postdocCandidateId) => {
  const filename = `${postdocCandidateId}_DP${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Postdoc_Candidate', filename);
  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    return `/Storage/Images/Postdoc_Candidate/${filename}`;
  } catch (error) {
    throw new Error(`Failed to save profile photo: ${error.message}`);
  }
};


export async function POST(req) {
  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const adminEmail = req.cookies.get('email')?.value || 'Unknown Email';
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const formData = await req.formData();
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const phone = formData.get('phone');
    const gender = formData.get('gender');
    const bloodGroup = formData.get('bloodGroup');
    const country = formData.get('country');
    const idNumber = formData.get('idNumber');
    const passport_number = formData.get('passport_number');
    const dob = formData.get('dob');
    const email = formData.get('email');
    const otherEmails = JSON.parse(formData.get('otherEmails') || []);
    const password = formData.get('password');
    const short_bio = formData.get('short_bio');
    const admission_date = formData.get('admission_date');
    const completion_date = formData.get('completion_date') || null;
    const type = formData.get('type') || 'Post Doc Candidate';
    const socialMedia = JSON.parse(formData.get('socialMedia') || '[]');
    const education = JSON.parse(formData.get('education') || '[]');
    const career = JSON.parse(formData.get('career') || '[]');

    // Validation
    if (!first_name || !last_name || !phone || !gender || !bloodGroup || !country || !idNumber || !passport_number || !dob || !email || !password || !short_bio || !admission_date) {
      return NextResponse.json({ message: 'All required fields must be filled.' }, { status: 400 });
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-])[A-Za-z\d!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Validation failed: Invalid primary email format');
      return NextResponse.json({ message: 'Primary email format is invalid' }, { status: 400 });
    }

    if (otherEmails.some(e => !emailRegex.test(e))) {
      console.error('Validation failed: Invalid secondary email(s)');
      return NextResponse.json({ message: 'One or more secondary emails have invalid format' }, { status: 400 });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Age validation
    const currentDate = new Date();
    const dobDate = new Date(dob);
    let age = currentDate.getFullYear() - dobDate.getFullYear();
    const monthDifference = currentDate.getMonth() - dobDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return NextResponse.json({ message: 'Post Doc Candidate must be at least 18 years old.' }, { status: 400 });
    }

    // Admission date validation
    const admissionYear = new Date(admission_date).getFullYear();
    if (admissionYear > currentDate.getFullYear()) {
      return NextResponse.json({ message: 'Admission date cannot be greater than the current year.' }, { status: 400 });
    }

    // Education and Career Year validation
    const validateYear = (year) => year <= currentDate.getFullYear();
    if (!education.every(edu => validateYear(edu.passing_year))) {
      return NextResponse.json({ message: 'Passing year cannot be greater than the current year.' }, { status: 400 });
    }
    if (!career.every(car => validateYear(car.joining_year) && (!car.leaving_year || validateYear(car.leaving_year)))) {
      return NextResponse.json({ message: 'Joining year and leaving year cannot be greater than the current year.' }, { status: 400 });
    }


    // Check for existing email, phone, ID number, and passport number
    const emailCheckQuery = `
      SELECT id, email, other_emails 
      FROM (
        SELECT id, email, ARRAY[]::TEXT[] AS other_emails FROM member
        UNION ALL
        SELECT id, email, COALESCE(other_emails, ARRAY[]::TEXT[]) FROM postdoc_candidate_basic_info
      ) AS combined
      WHERE 
        email = $1 
        OR email = ANY($2::TEXT[])
        OR $1 = ANY(other_emails)
        OR other_emails && $2::TEXT[]
    `;

    const emailCheckResult = await query(emailCheckQuery, [email, otherEmails || []]);

    if (emailCheckResult.rows.length > 0) {
      // Analyze conflict type
      let emailConflict = false;
      let otherEmailConflict = false;
      
      const conflictingEntries = emailCheckResult.rows.map(row => {
        const conflict = {
          id: row.id,
          reasons: []
        };

        // Check primary email match
        if (row.email === email) {
          emailConflict = true;
          conflict.reasons.push(`primary email (${email})`);
        }

        // Check other emails match
        const conflictOtherEmails = [];
        if (row.other_emails.some(e => [email, ...(otherEmails || [])].includes(e))) {
          conflictOtherEmails.push(...row.other_emails.filter(e => [email, ...(otherEmails || [])].includes(e)));
        }

        if (conflictOtherEmails.length > 0) {
          otherEmailConflict = true;
          conflict.reasons.push(`other emails: ${conflictOtherEmails.join(', ')}`);
        }

        return conflict;
      });

      // Build error message
      let errorMessage;
      if (emailConflict && otherEmailConflict) {
        errorMessage = 'Email and other emails already exist in our system.';
      } else if (emailConflict) {
        errorMessage = 'Email already exists. Please use a different primary email.';
      } else {
        errorMessage = 'One or more alternative emails already exist in our system.';
      }

      logger.warn('Validation Error: Email conflict detected', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Post Doc Candidate',
          details: {
            message: errorMessage,
            attemptedEmail: email,
            attemptedOtherEmails: otherEmails,
            conflictingEntries
          }
        }
      });

      return NextResponse.json({ 
        success: false, 
        message: errorMessage 
      }, { status: 400 });
    }

    const phoneCheckResult = await query('SELECT id FROM member WHERE phone = $1', [phone]);
    if (phoneCheckResult.rows.length > 0) {
      logger.warn('Validation Error: Phone number already exists', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Post Doc Candidate',
          details: `Attempt to add Post Doc Candidate failed - Phone No : ${phone} already exists.`
        }
      });

      return NextResponse.json({ 
        success: false, 
        message: 'Phone No already exists. Please try with a different phone no.' 
      }, { status: 400 });
    }

    const idNumberCheckResult = await query('SELECT id FROM member WHERE id_number = $1', [idNumber]);
    if (idNumberCheckResult.rows.length > 0) {
      logger.warn('Validation Error: ID number already exists', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Post Doc Candidate',
          details: `Attempt to add Post Doc Candidate failed - ID number ${idNumber} already exists.`
        }
      });

      return NextResponse.json({ 
        success: false, 
        message: 'ID number already exists. Please try with a different ID number.' 
      }, { status: 400 });
    }

    const passportNumberCheckResult = await query('SELECT id FROM member WHERE passport_number = $1', [passport_number]);
    if (passportNumberCheckResult.rows.length > 0) {
      logger.warn('Validation Error: Passport number already exists', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Post Doc Candidate',
          details: `Attempt to add Post Doc Candidate failed - Passport number ${passport_number} already exists.`
        }
      });

      return NextResponse.json({ 
        success: false, 
        message: 'Passport number already exists. Please try with a different passport number.' 
      }, { status: 400 });
    }

      
    const postdocCandidateId = await generatePostDocCandidateId();

    // Save profile photo
    let photoUrl = null;
    const photoFile = formData.get('photo');
    if (photoFile) {
      try {
        photoUrl = await saveProfilePhoto(photoFile, postdocCandidateId);
      } catch (error) {
        return NextResponse.json({ message: `Failed to save profile photo: ${error.message}` }, { status: 500 });
      }
    }

    // Prepare other emails (convert empty array to NULL)
    const finalOtherEmails = otherEmails.length > 0 ? otherEmails : null;
    console.log('Final other emails:', finalOtherEmails);


    
    // Database transaction
    console.log('Starting database transaction...');

    try {
      await query('BEGIN');

      const insertPostDocCandidateQuery = `
        INSERT INTO postdoc_candidate_basic_info 
        (id, first_name, last_name, phone, gender, "blood_group", country, dob, email, password, short_bio, admission_date, completion_date, photo, status, type, passport_number, "id_number", other_emails)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Active', $15, $16, $17, $18)
        RETURNING *;
      `;

      await query(insertPostDocCandidateQuery, [
        postdocCandidateId,
        first_name,
        last_name,
        phone,
        gender,
        bloodGroup,
        country,
        dob,
        email,
        hashedPassword,
        short_bio,
        admission_date,
        completion_date,
        photoUrl,
        type,
        passport_number,
        idNumber,
        finalOtherEmails
      ]);

      // Insert into postdoc_candidate_socialmedia_info
      const insertSocialMediaQuery = `INSERT INTO postdoc_candidate_socialmedia_info (postdoc_candidate_id, socialMedia_name, link) VALUES ($1, $2, $3) RETURNING *;`;
      for (const sm of socialMedia) {
        await query(insertSocialMediaQuery, [postdocCandidateId, sm.socialMedia_name, sm.link]);
      }

      const insertMemberQuery = `
        INSERT INTO member (id, first_name, last_name, phone, gender, "blood_group", country, dob, passport_number, email, password, short_bio, joining_date, leaving_date, photo, status, type, "id_number")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'Active', $16, $17)
        RETURNING *;
      `;
      await query(insertMemberQuery, [
        postdocCandidateId,  
        first_name,      
        last_name,       
        phone,           
        gender,          
        bloodGroup,      
        country,         
        dob,             
        passport_number, 
        email,           
        hashedPassword,        
        short_bio,       
        admission_date,  
        completion_date,  // Insert completion_date into leaving_date
        photoUrl,         
        type,
        idNumber
      ]);

      // Insert into postdoc_candidate_education_info
      const insertEducationQuery = `INSERT INTO postdoc_candidate_education_info (postdoc_candidate_id, degree, institution, passing_year) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const edu of education) {
        await query(insertEducationQuery, [postdocCandidateId, edu.degree, edu.institution, edu.passing_year]);
      }

      // Insert into postdoc_candidate_career_info
      const insertCareerQuery = `INSERT INTO postdoc_candidate_career_info (postdoc_candidate_id, position, organization_name, joining_year, leaving_year) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (const car of career) {
        await query(insertCareerQuery, [postdocCandidateId, car.position, car.organization_name, car.joining_year, car.leaving_year]);
      }

      const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
      const Id = `${postdocCandidateId}`; 
      const notificationTitle = `A New Post Doc Candidate Added [${postdocCandidateId}] By ${adminEmail}`;
      const notificationStatus = 'Unread';
      await query(insertNotificationQuery, [Id, notificationTitle, notificationStatus]);

      await query('COMMIT');

      // Send Telegram alert for success
      const successMessage = formatAlertMessage('A New Post Doc Candidate Added Successfully', `ID : ${postdocCandidateId}\nAdded By : ${adminEmail}\nDate : ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
      await sendTelegramAlert(successMessage);

      // Log success
      logger.info('Post Doc Candidate Added Successfully', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Post Doc Candidate',
          details: `A new Post Doc Candidate added successfully with ID ${postdocCandidateId} by ${adminEmail} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });

      return NextResponse.json({ message: 'Post Doc Candidate information added successfully' }, { status: 200 });

    } catch (error) {
      await query('ROLLBACK');

      const errorMessage = formatAlertMessage('Error Adding Post Doc Candidate', `ID : ${postdocCandidateId}\nIP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
      await sendTelegramAlert(errorMessage);

      logger.error('Error Adding Post Doc Candidate', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Post Doc Candidate',
          details: `Error adding Post Doc Candidate with ID ${postdocCandidateId} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
        }
      });

      return NextResponse.json({ message: `Error adding Post Doc Candidate: ${error.message}` }, { status: 500 });
    }

  } catch (error) {
    const errorMessage = formatAlertMessage('Error Handling Post Doc Candidate Request', `IP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error Processing Form Data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Add Post Doc Candidate',
        details: `Error processing form data from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}
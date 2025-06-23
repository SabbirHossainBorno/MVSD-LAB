// app/api/member_add/masters_candidate_add/route.js
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

const generateMastersCandidateId = async () => {
    try {
    const result = await query('SELECT MAX(id) AS max_id FROM masters_candidate_basic_info');
    const maxId = result.rows[0]?.max_id || 'MASTC00MVSD';
    const numericPart = parseInt(maxId.substring(5, maxId.length - 4), 10) || 0;
    const nextId = numericPart + 1;
    const newId = `MASTC${String(nextId).padStart(2, '0')}MVSD`;
    return newId;
  } catch (error) {
    throw new Error(`Error generating Master's Candidate ID: ${error.message}`);
  }
};

const saveProfilePhoto = async (file, mastersCandidateId) => {
  const filename = `${mastersCandidateId}_DP${path.extname(file.name)}`;
  const targetPath = path.join("/home/mvsd-lab/public/Storage/Images/Master's_Candidate", filename);
  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    return `/Storage/Images/Master's_Candidate/${filename}`;
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
    const rawPassport = formData.get('passport_number');
    const passport_number = rawPassport && rawPassport.trim() !== '' ? rawPassport : null;
    const dob = formData.get('dob');
    const email = formData.get('email');
    const otherEmails = JSON.parse(formData.get('otherEmails') || []);
    const password = formData.get('password');
    const short_bio = formData.get('short_bio');
    const admission_date = formData.get('admission_date');
    const completion_date = formData.get('completion_date') || null;
    const type = formData.get('type') || "Master's Candidate";
    const socialMedia = JSON.parse(formData.get('socialMedia') || '[]');
    const education = JSON.parse(formData.get('education') || '[]');
    const career = JSON.parse(formData.get('career') || '[]');

    // Validation
    if (!first_name || !last_name || !phone || !gender || !country || !idNumber || !dob || !email || !password || !short_bio || !admission_date) {
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

    if (completion_date && new Date(completion_date) < new Date(admission_date)) {
      return NextResponse.json({ 
        success: false,
        message: 'Graduation date cannot be before enrollment date' 
      }, { status: 400 });
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
      return NextResponse.json({ message: "Master's Candidate must be at least 18 years old." }, { status: 400 });
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
        SELECT id, email, COALESCE(other_emails, ARRAY[]::TEXT[]) FROM masters_candidate_basic_info
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
          taskName: "Add Master's Candidate",
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
          taskName: "Add Master's Candidate",
          details: `Attempt to add Master's Candidate failed - Phone No : ${phone} already exists.`,
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
          taskName: "Add Master's Candidate",
          details: `Attempt to add Master's Candidate failed - ID number ${idNumber} already exists.`
        }
      });

      return NextResponse.json({ 
        success: false, 
        message: 'ID number already exists. Please try with a different ID number.' 
      }, { status: 400 });
    }

    if (passport_number && passport_number.trim() !== '') {
      const passportNumberCheckResult = await query(
        'SELECT id FROM member WHERE passport_number = $1', 
        [passport_number]
      );

      if (passportNumberCheckResult.rows.length > 0) {
        logger.warn('Validation Error: Passport number already exists', {
          meta: {
            eid,
            sid: sessionId,
            taskName: "Add Master's Candidate",
            details: `Attempt to add Master's Candidate failed - Passport number ${passport_number} already exists.`
          }
        });

        return NextResponse.json({ 
          success: false, 
          message: 'Passport number already exists. Please try with a different passport number.' 
        }, { status: 400 });
      }
    }

    const mastersCandidateId = await generateMastersCandidateId();

    // Save profile photo
    let photoUrl = '/Storage/Images/default_DP.png'; // Default photo path
    const photoFile = formData.get('photo');

    // Only process if a valid file is uploaded
    if (photoFile && photoFile.size > 0) {
      try {
        // Maintain your existing validation logic
        if (photoFile.size > 5 * 1024 * 1024) {
          return NextResponse.json({ message: 'File size exceeds 5 MB.' }, { status: 400 });
        }
        
        if (!['image/jpeg', 'image/png'].includes(photoFile.type)) {
          return NextResponse.json({ message: 'Invalid file type. Only JPG, JPEG, and PNG are allowed.' }, { status: 400 });
        }
        
        // Save using your existing function
        photoUrl = await saveProfilePhoto(photoFile, mastersCandidateId);
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

      const insertMastersCandidateQuery = `
        INSERT INTO masters_candidate_basic_info 
        (id, first_name, last_name, phone, gender, "blood_group", country, dob, email, password, short_bio, admission_date, completion_date, photo, status, type, passport_number, "id_number", other_emails)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Active', $15, $16, $17, $18)
        RETURNING *;
      `;

      await query(insertMastersCandidateQuery, [
        mastersCandidateId,
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

      // Insert into masters_candidate_socialmedia_info
      const insertSocialMediaQuery = `
          INSERT INTO masters_candidate_socialmedia_info 
          (id, masters_candidate_id, socialmedia_name, link)
          VALUES (nextval('masters_candidate_socialmedia_info_id_seq'), $1, $2, $3)
          ON CONFLICT (masters_candidate_id, socialmedia_name, link) DO NOTHING
      `;

      for (const sm of socialMedia) {
          // Only insert if both fields are filled
          if (sm.socialMedia_name && sm.link && sm.socialMedia_name.trim() !== '' && sm.link.trim() !== '') {
              await query(insertSocialMediaQuery, [mastersCandidateId, sm.socialMedia_name, sm.link]);
          }
      }

      const insertMemberQuery = `
        INSERT INTO member (id, first_name, last_name, phone, gender, "blood_group", country, dob, passport_number, email, password, short_bio, joining_date, leaving_date, photo, status, type, "id_number")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'Active', $16, $17)
        RETURNING *;
      `;
      await query(insertMemberQuery, [
        mastersCandidateId,  
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

      // Insert into masters_candidate_education_info
      const insertEducationQuery = `INSERT INTO masters_candidate_education_info (masters_candidate_id, degree, institution, passing_year) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const edu of education) {
        await query(insertEducationQuery, [mastersCandidateId, edu.degree, edu.institution, edu.passing_year]);
      }

      // Insert into masters_candidate_career_info
      const insertCareerQuery = `INSERT INTO masters_candidate_career_info (masters_candidate_id, position, organization_name, joining_year, leaving_year) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (const car of career) {
        await query(insertCareerQuery, [mastersCandidateId, car.position, car.organization_name, car.joining_year, car.leaving_year]);
      }

      const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
      const Id = `${mastersCandidateId}`; 
      const notificationTitle = `A New Master's Candidate Added [${mastersCandidateId}] By ${adminEmail}`;
      const notificationStatus = 'Unread';
      await query(insertNotificationQuery, [Id, notificationTitle, notificationStatus]);

      // Insert into director_notification_details
      console.log('[DIRECTOR NOTIFICATION] Creating notification entry');
      const directorNotificationQuery = `
        INSERT INTO director_notification_details (
          mvsdlab_id,
          masters_candidate_id,
          title
        ) VALUES ($1, $2, $3)
      `;

      await query(directorNotificationQuery, [
        adminEmail, // Who added the candidate
        mastersCandidateId, // New candidate ID
        `New Master's Candidate Added: ${first_name} ${last_name} (${mastersCandidateId}) By ${adminEmail}`
      ]);

      await query('COMMIT');

      // Email notification section
      try {
        console.log('[Email Notification] Preparing to send notifications');
        
        // 1. Get director's email
        const directorResult = await query(
          `SELECT email FROM director_basic_info`
        );
        const directorEmails = directorResult.rows.map(row => row.email);
        
        // 2. New candidate's email
        const candidateEmail = email;

        if (directorEmails.length === 0 && !candidateEmail) {
          console.log('[Email Notification] No emails to send');
        } else {
          // Create email transporter
          const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: true,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const emailPromises = [];

          // Director emails
          if (directorEmails.length > 0) {
            const directorEmailHTML = `
              <p>Dear Director,</p>
              
              <p>A <strong>new Master's Candidate</strong> has been onboarded by <strong>${adminEmail}</strong>.</p>
              
              <p>Candidate Details:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Candidate ID</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${mastersCandidateId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${first_name} ${last_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Admission Date</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${new Date(admission_date).toLocaleDateString()}</td>
                </tr>
              </table>
              
              <p>You can view the candidate's profile in the <a href="https://www.mvsdlab.com/login">MVSD LAB Director Portal</a>.</p>
              
              <p>Sincerely,<br>
              <strong>MVSD LAB</strong></p>
            `;

            directorEmails.forEach(directorEmail => {
              emailPromises.push(
                transporter.sendMail({
                  from: process.env.EMAIL_FROM,
                  to: directorEmail,
                  subject: `New Master's Candidate Onboarded - ${mastersCandidateId}`,
                  html: directorEmailHTML
                })
              );
            });
          }

          // New candidate welcome email
          if (candidateEmail) {
            const candidateEmailHTML = `
              <p>Dear ${first_name} ${last_name},</p>
              
              <p>Welcome to MVSD LAB! Your Master's candidate account has been successfully created.</p>
              
              <p>Your account details:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Candidate ID</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${mastersCandidateId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Password</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${password} (temporary)</td>
                </tr>
              </table>
              
              <p>Please log in to the <a href="https://www.mvsdlab.com/login">MVSD LAB Portal</a> and change your password immediately.</p>
              
              <p>Best Regards,<br>
              <strong>MVSD LAB</strong></p>
              
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                <strong>Security Note:</strong> This email contains sensitive information. Do not share your credentials.
              </p>
            `;
            
            emailPromises.push(
              transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: candidateEmail,
                subject: `Welcome to MVSD LAB - ${mastersCandidateId}`,
                html: candidateEmailHTML
              })
            );
          }

          // Send all emails
          await Promise.all(emailPromises);
          console.log('[Email Notification] Emails sent successfully');
        }
      } catch (emailError) {
        console.error('[Email Notification Failed]', emailError.message);
        logger.error('Email sending failed', {
          meta: {
            mastersCandidateId,
            error: emailError.message,
            taskName: "Add Master's Candidate Email"
          }
        });
      }

      // Send Telegram alert for success
      const successMessage = formatAlertMessage(
        "A New Master's Candidate Added Successfully",
        `ID : ${mastersCandidateId}\nAdded By : ${adminEmail}\nDate : ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
      );

      await sendTelegramAlert(successMessage);

      // Log success
      logger.info("Master's Candidate Added Successfully", {
        meta: {
          eid,
          sid: sessionId,
          taskName: "Add Master's Candidate",
          details: `A new Master's Candidate added successfully with ID ${mastersCandidateId} by ${adminEmail} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });

      return NextResponse.json(
        { message: "Master's Candidate information added successfully" },
        { status: 200 }
      );

    } catch (error) {
      await query('ROLLBACK');

      const errorMessage = formatAlertMessage(
        "Error Adding Master's Candidate",
        `ID : ${mastersCandidateId}\nIP : ${ipAddress}\nError : ${error.message}\nStatus : 500`
      );

      await sendTelegramAlert(errorMessage);

      logger.error("Error Adding Master's Candidate", {
        meta: {
          eid,
          sid: sessionId,
          taskName: "Add Master's Candidate",
          details: `Error adding Master's Candidate with ID ${mastersCandidateId} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
        }
      });

      return NextResponse.json({ message: `Error adding Master's Candidate: ${error.message}` }, { status: 500 });
    }

  } catch (error) {
    const errorMessage = formatAlertMessage("Error Handling Master's Candidate Request", `IP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error Processing Form Data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: "Add Master's Candidate",
        details: `Error processing form data from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}
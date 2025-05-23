// app/api/director_add/route.js
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

const generateDirectorId = async () => {
  try {
    const result = await query('SELECT MAX(id) AS max_id FROM director_basic_info');
    const maxId = result.rows[0]?.max_id || 'D00MVSD';
    const numericPart = parseInt(maxId.substring(1, 3), 10) || 0;
    const nextId = numericPart + 1;
    return `D${String(nextId).padStart(2, '0')}MVSD`;
  } catch (error) {
    throw new Error(`Error generating Director ID: ${error.message}`);
  }
};

const saveProfilePhoto = async (file, directorId) => {
  const filename = `${directorId}_DP${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Director', filename);

  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    return `/Storage/Images/Director/${filename}`;
  } catch (error) {
    throw new Error(`Failed to save profile photo: ${error.message}`);
  }
};


const saveAwardPhoto = async (file, directorId, index) => {
  const filename = `${directorId}_Award_${index}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Director', filename);

  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    return `/Storage/Images/Director/${filename}`;
  } catch (error) {
    throw new Error(`Failed to save award photo: ${error.message}`);
  }
};

export async function POST(req) {
  const sessionId = req.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = req.cookies.get('eid')?.value || 'Unknown EID';
  const adminEmail = req.cookies.get('email')?.value || 'Unknown Email'; // Renamed to adminEmail
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

  try {
    const formData = await req.formData();

    console.log('Form data received');

    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const phone = formData.get('phone');
    const gender = formData.get('gender');
    const bloodGroup = formData.get('bloodGroup');
    const country = formData.get('country');
    const bannerID = formData.get('bannerID');
    const passport_number = formData.get('passport_number');
    const dob = formData.get('dob');
    const email = formData.get('email'); // This is the director's email
    const otherEmails = JSON.parse(formData.get('otherEmails') || []);
    const password = formData.get('password');
    const short_bio = formData.get('short_bio');
    const joining_date = formData.get('joining_date');
    const leaving_date = formData.get('leaving_date') || null;
    const type = formData.get('type') || 'Director';
    const socialMedia = JSON.parse(formData.get('socialMedia') || '[]');
    const education = JSON.parse(formData.get('education') || '[]');
    const career = JSON.parse(formData.get('career') || '[]');
    const researches = JSON.parse(formData.get('researches') || '[]');
    const awards = [];
    for (let i = 0; formData.has(`awards[${i}][title]`); i++) {
      awards.push({
        title: formData.get(`awards[${i}][title]`),
        year: formData.get(`awards[${i}][year]`),
        details: formData.get(`awards[${i}][details]`),
        awardPhoto: formData.get(`awards[${i}][awardPhoto]`),
      });
    }

    console.log('Parsed form values:', {
      first_name, last_name, email, otherEmails, phone, bannerID,
      passport_number, socialMediaCount: socialMedia.length,
      educationCount: education.length, careerCount: career.length,
      researchCount: researches.length, awardsCount: awards.length
    });

    
    

    // Validation
    if (!first_name || !last_name || !phone || !gender || !bloodGroup || !country || !bannerID || !passport_number || !dob || !email || !password || !short_bio || !joining_date) {
      return NextResponse.json({ message: 'All required fields must be filled.' }, { status: 400 });
    }  

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

    const currentDate = new Date();
    const dobDate = new Date(dob);
    let age = currentDate.getFullYear() - dobDate.getFullYear();
    const monthDifference = currentDate.getMonth() - dobDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return NextResponse.json({ message: 'Director must be at least 18 years old.' }, { status: 400 });
    }

    const joiningYear = new Date(joining_date).getFullYear();
    if (joiningYear > currentDate.getFullYear()) {
      return NextResponse.json({ message: 'Joining date cannot be greater than the current year.' }, { status: 400 });
    }

    const validateYear = (year) => year <= currentDate.getFullYear();

    if (!education.every(edu => validateYear(edu.passing_year))) {
      return NextResponse.json({ message: 'Passing year cannot be greater than the current year.' }, { status: 400 });
    }

    if (!career.every(car => validateYear(car.joining_year) && (!car.leaving_year || validateYear(car.leaving_year)))) {
      return NextResponse.json({ message: 'Joining year and leaving year cannot be greater than the current year.' }, { status: 400 });
    }

    if (!awards.every(award => validateYear(award.year))) {
      return NextResponse.json({ message: 'Award year cannot be greater than the current year.' }, { status: 400 });
    }

    

    // Check for existing emails
    console.log('Checking for existing emails...');
    const emailCheckQuery = `
    SELECT id, email, other_emails 
    FROM (
      SELECT id, email, ARRAY[]::TEXT[] AS other_emails FROM member
      UNION ALL
      SELECT id, email, COALESCE(other_emails, ARRAY[]::TEXT[]) FROM director_basic_info
    ) AS combined
    WHERE 
      email = $1 
      OR email = ANY($2::TEXT[])
      OR $1 = ANY(other_emails)
      OR other_emails && $2::TEXT[]
  `;
    
    // Email conflict check
    const emailCheckResult = await query(emailCheckQuery, [email, otherEmails]);
    if (emailCheckResult.rows.length > 0) {
      const conflict = emailCheckResult.rows[0];
      let message = 'Email conflict detected';
      let errorType = 'EMAIL_CONFLICT';
      
      const conflictEmails = conflict.other_emails || [];
      
      if (conflict.email === email) {
        message = 'Primary email already exists';
        errorType = 'PRIMARY_EMAIL_CONFLICT';
      } else if (conflictEmails.includes(email)) {
        message = 'Primary email exists in another profile';
        errorType = 'SECONDARY_EMAIL_CONFLICT';
      } else {
        message = 'One of the secondary emails already exists';
        errorType = 'SECONDARY_EMAIL_EXISTS';
      }

      logger.warn(`Validation Error: ${errorType}`, {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Director',
          details: message
        }
      });

      return NextResponse.json(
        { 
          success: false,
          message,
          errorType
        }, 
        { status: 400 }
      );
    }

    // Phone conflict check
    const phoneCheckResult = await query('SELECT id FROM member WHERE phone = $1', [phone]);
    if (phoneCheckResult.rows.length > 0) {
      logger.warn('Validation Error: Phone conflict', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Director',
          details: `Phone number ${phone} already exists`
        }
      });

      return NextResponse.json(
        { 
          success: false,
          message: 'Phone number already registered',
          errorType: 'PHONE_CONFLICT'
        }, 
        { status: 400 }
      );
    }

    // ID conflict check
    const idNumberCheckResult = await query('SELECT id FROM member WHERE id_number = $1', [bannerID]);
    if (idNumberCheckResult.rows.length > 0) {
      logger.warn('Validation Error: ID conflict', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Director',
          details: `Banner ID ${bannerID} already exists`
        }
      });

      return NextResponse.json(
        { 
          success: false,
          message: 'Banner ID already registered',
          errorType: 'ID_CONFLICT'
        }, 
        { status: 400 }
      );
    }

    // Passport conflict check
    const passportNumberCheckResult = await query('SELECT id FROM member WHERE passport_number = $1', [passport_number]);
    if (passportNumberCheckResult.rows.length > 0) {
      logger.warn('Validation Error: Passport conflict', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Director',
          details: `Passport number ${passport_number} already exists`
        }
      });

      return NextResponse.json(
        { 
          success: false,
          message: 'Passport number already registered',
          errorType: 'PASSPORT_CONFLICT'
        }, 
        { status: 400 }
      );
    }

    const directorId = await generateDirectorId();

    let photoUrl = null;
    const photoFile = formData.get('photo');
    if (photoFile) {
      photoUrl = await saveProfilePhoto(photoFile, directorId);
    }

    const awardUrls = [];
    if (awards.length > 0) {
      for (let i = 0; i < awards.length; i++) {
        const awardFile = awards[i].awardPhoto;
        if (awardFile) {
          const awardUrl = await saveAwardPhoto(awardFile, directorId, i + 1);
          awardUrls.push(awardUrl);
        } else {
          throw new Error('Award photo is missing');
        }
      }
    }

    // Prepare other emails (convert empty array to NULL)
    const finalOtherEmails = otherEmails.length > 0 ? otherEmails : null;
    console.log('Final other emails:', finalOtherEmails);


    
    // Database transaction
    console.log('Starting database transaction...');
    try {
      await query('BEGIN');
      console.log('Transaction started');


      // Insert director basic info
      console.log('Inserting basic info...');
      const insertDirectorQuery = `
        INSERT INTO director_basic_info 
          (id, first_name, last_name, phone, dob, email, password, short_bio, 
          joining_date, leaving_date, photo, status, type, gender, "blood_group", 
          country, passport_number, "banner_id", other_emails) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12, $13, $14, $15, $16, $17, $18)
        RETURNING *;
      `;

      const hashedPassword = await bcrypt.hash(password, 10);

      // Update query parameters array
      await query(insertDirectorQuery, [
        directorId, first_name, last_name, phone, dob, email, hashedPassword, short_bio, 
        joining_date, leaving_date, photoUrl, type, gender, bloodGroup, country, 
        passport_number, bannerID, finalOtherEmails  // Add otherEmails as last parameter
      ]);

      const insertSocialMediaQuery = `INSERT INTO director_socialMedia_info (director_id, socialMedia_name, link) VALUES ($1, $2, $3) RETURNING *;`;
      for (const sm of socialMedia) {
        await query(insertSocialMediaQuery, [directorId, sm.socialMedia_name, sm.link]);
      }

      const insertMemberQuery = `
        INSERT INTO member 
          (id, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photo, status, type, gender, "blood_group", country, passport_number, "id_number") 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12, $13, $14, $15, $16, $17)
        RETURNING *;
      `;
      await query(insertMemberQuery, [
        directorId, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photoUrl, type, gender, bloodGroup, country, passport_number, bannerID,
      ]);

      const insertEducationQuery = `INSERT INTO director_education_info (director_id, degree, institution, passing_year) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const edu of education) {
        await query(insertEducationQuery, [directorId, edu.degree, edu.institution, parseInt(edu.passing_year)]);
      }

      const insertCareerQuery = `INSERT INTO director_career_info (director_id, position, organization_name, joining_year, leaving_year) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (const car of career) {
        await query(insertCareerQuery, [
          directorId, car.position, car.organization, parseInt(car.joining_year), parseInt(car.leaving_year),
        ]);
      }


      // Insert research
      console.log('Inserting research...');

      const insertResearchQuery = `INSERT INTO director_research_info (director_id, title, link, "research_type") VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const research of researches) {
        await query(insertResearchQuery, [directorId, research.title, research.link, research.researchType]);
      }

      const insertAwardsQuery = `INSERT INTO director_award_info (director_id, title, year, details, award_photo) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (let i = 0; i < awards.length; i++) {
        const award = awards[i];
        const awardUrl = awardUrls[i]; // Get the URL of the saved award photo

        if (!awardUrl) {
          throw new Error('Award URL is null');
        }

        await query(insertAwardsQuery, [
          directorId, award.title, parseInt(award.year), award.details, awardUrl,
        ]);
      }

      const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
      const Id = `${directorId}`; 
      const notificationTitle = `A New Director Added [${directorId}] By ${adminEmail}`;
      const notificationStatus = 'Unread';
      await query(insertNotificationQuery, [Id, notificationTitle, notificationStatus]);

      await query('COMMIT');

      const apiCallMessage = formatAlertMessage('Director Add - API', `IP : ${ipAddress}\nStatus : 200`);
      await sendTelegramAlert(apiCallMessage);

      const successMessage = formatAlertMessage('A New Director Added Successfully', `ID : ${directorId}\nAdded By : ${adminEmail}\nDate : ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
      await sendTelegramAlert(successMessage);

      logger.info('A New Director Added Successfully', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Director',
          details: `A new director added successfully with ID ${directorId} by ${adminEmail}`
        }
      });

      // In the successful commit block:
      return NextResponse.json({ 
        message: 'Director information added successfully!',
        directorId: directorId  // Add this line to include the ID in response
      }, { status: 200 });

    } catch (error) {
      await query('ROLLBACK');
      console.error('Database transaction failed:', error);

      const errorMessage = formatAlertMessage('Director Add - API', `ID : ${directorId}\nIP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
      await sendTelegramAlert(errorMessage);

      logger.error('Error Adding Director', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Director',
          details: `Error adding director with ID ${directorId}. ERROR : ${error.message}`
        }
      });

      return NextResponse.json({ message: `Execution failed: ${error.message}` }, { status: 500 });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = formatAlertMessage('Director Add - API', `IP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error Processing Form Data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Add Director',
        details: `Error processing form dat. ERROR : ${error.message}`
      }
    });

    return NextResponse.json({ message: `Failed to process form data: ${error.message}` }, { status: 500 });
  }
}
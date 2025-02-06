// app/api/member_add/phd_candidate_add/route.js
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

const generatePhdCandidateId = async () => {
  try {
    const result = await query('SELECT MAX(id) AS max_id FROM phd_candidate_basic_info');
    const maxId = result.rows[0]?.max_id || 'PHDC00MVSD';
    const numericPart = parseInt(maxId.substring(4, maxId.length - 4), 10) || 0;
    const nextId = numericPart + 1;
    const newId = `PHDC${String(nextId).padStart(2, '0')}MVSD`;
    return newId;
  } catch (error) {
    throw new Error(`Error generating PhD Candidate ID: ${error.message}`);
  }
};

const saveProfilePhoto = async (file, phdCandidateId) => {
  const filename = `${phdCandidateId}_DP${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/PhD_Candidate', filename);
  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    return `/Storage/Images/PhD_Candidate/${filename}`;
  } catch (error) {
    throw new Error(`Failed to save profile photo: ${error.message}`);
  }
};

const saveDocumentPhoto = async (file, phdCandidateId, index, documentType) => {
  const filename = `${phdCandidateId}_Document_${documentType}_${index}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/PhD_Candidate', filename);
  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    return `/Storage/Images/PhD_Candidate/${filename}`;
  } catch (error) {
    throw new Error(`Failed to save document photo: ${error.message}`);
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
    const password = formData.get('password');
    const short_bio = formData.get('short_bio');
    const admission_date = formData.get('admission_date');
    const completion_date = formData.get('completion_date') || null;
    const type = formData.get('type') || 'PhD Candidate';
    const socialMedia = JSON.parse(formData.get('socialMedia') || '[]');
    const education = JSON.parse(formData.get('education') || '[]');
    const career = JSON.parse(formData.get('career') || '[]');
    const documents = [];

    for (let i = 0; formData.has(`documents[${i}][title]`); i++) {
      documents.push({
        title: formData.get(`documents[${i}][title]`),
        documentType: formData.get(`documents[${i}][documentType]`),
        documentsPhoto: formData.get(`documents[${i}][documentsPhoto]`),
      });
    }

    // Validation
    if (!first_name || !last_name || !phone || !gender || !bloodGroup || !country || !idNumber || !passport_number || !dob || !email || !password || !short_bio || !admission_date) {
      return NextResponse.json({ message: 'All required fields must be filled.' }, { status: 400 });
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-])[A-Za-z\d!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.' }, { status: 400 });
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
      return NextResponse.json({ message: 'PhD Candidate must be at least 18 years old.' }, { status: 400 });
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
    const emailCheckResult = await query('SELECT id FROM member WHERE email = $1', [email]);
    if (emailCheckResult.rows.length > 0) {
      logger.warn('Validation Error: Email already exists', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add PhD Candidate',
          details: `Attempt to add PhD Candidate failed - Email ${email} already exists.`
        }
      });

      return NextResponse.json({ 
        success: false, 
        message: 'Email already exists. Please try with a different email.' 
      }, { status: 400 });
    }

    const phoneCheckResult = await query('SELECT id FROM member WHERE phone = $1', [phone]);
    if (phoneCheckResult.rows.length > 0) {
      logger.warn('Validation Error: Phone number already exists', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add PhD Candidate',
          details: `Attempt to add PhD Candidate failed - Phone No : ${phone} already exists.`
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
          taskName: 'Add PhD Candidate',
          details: `Attempt to add PhD Candidate failed - ID number ${idNumber} already exists.`
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
          taskName: 'Add PhD Candidate',
          details: `Attempt to add PhD Candidate failed - Passport number ${passport_number} already exists.`
        }
      });

      return NextResponse.json({ 
        success: false, 
        message: 'Passport number already exists. Please try with a different passport number.' 
      }, { status: 400 });
    }

      
    const phdCandidateId = await generatePhdCandidateId();

    // Save profile photo
    let photoUrl = null;
    const photoFile = formData.get('photo');
    if (photoFile) {
      try {
        photoUrl = await saveProfilePhoto(photoFile, phdCandidateId);
      } catch (error) {
        return NextResponse.json({ message: `Failed to save profile photo: ${error.message}` }, { status: 500 });
      }
    }

    // Save document photos
    const documentUrls = [];
    if (documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const documentFile = documents[i].documentsPhoto;
        if (documentFile) {
          try {
            const documentUrl = await saveDocumentPhoto(documentFile, phdCandidateId, i, documents[i].documentType);
            documentUrls.push(documentUrl);
          } catch (error) {
            return NextResponse.json({ message: `Failed to save document photo: ${error.message}` }, { status: 500 });
          }
        } else {
          return NextResponse.json({ message: 'PhD Candidate document photo is missing' }, { status: 400 });
        }
      }
    }

    try {
      await query('BEGIN');

      const insertPhdCandidateQuery = `
        INSERT INTO phd_candidate_basic_info 
        (id, first_name, last_name, phone, gender, "blood_group", country, dob, email, password, short_bio, admission_date, completion_date, photo, status, type, passport_number, "id_number")
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Active', $15, $16, $17)
        RETURNING *;
      `;

      await query(insertPhdCandidateQuery, [
        phdCandidateId,
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
        idNumber
      ]);

      // Insert into phd_candidate_socialmedia_info
      const insertSocialMediaQuery = `INSERT INTO phd_candidate_socialmedia_info (phd_candidate_id, socialMedia_name, link) VALUES ($1, $2, $3) RETURNING *;`;
      for (const sm of socialMedia) {
        await query(insertSocialMediaQuery, [phdCandidateId, sm.socialMedia_name, sm.link]);
      }

      const insertMemberQuery = `
        INSERT INTO member (id, first_name, last_name, phone, gender, "blood_group", country, dob, passport_number, email, password, short_bio, joining_date, leaving_date, photo, status, type, "id_number")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'Active', $16, $17)
        RETURNING *;
      `;
      await query(insertMemberQuery, [
        phdCandidateId,  
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

      // Insert into phd_candidate_education_info
      const insertEducationQuery = `INSERT INTO phd_candidate_education_info (phd_candidate_id, degree, institution, passing_year) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const edu of education) {
        await query(insertEducationQuery, [phdCandidateId, edu.degree, edu.institution, edu.passing_year]);
      }

      // Insert into phd_candidate_career_info
      const insertCareerQuery = `INSERT INTO phd_candidate_career_info (phd_candidate_id, position, organization_name, joining_year, leaving_year) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (const car of career) {
        await query(insertCareerQuery, [phdCandidateId, car.position, car.organization_name, car.joining_year, car.leaving_year]);
      }

      // Insert into phd_candidate_documents_info
      const insertDocumentsQuery = `INSERT INTO phd_candidate_document_info ("phd_candidate_id", "title", "documentType", "document_photo") VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (let i = 0; i < documents.length; i++) {
        const document = documents[i];
        const documentUrl = documentUrls[i]; // Get the URL of the saved document photo

        if (!documentUrl) {
          throw new Error('Document URL is null');
        }

        await query(insertDocumentsQuery, [
          phdCandidateId, document.title, document.documentType, documentUrl,
        ]);
      }

      const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
      const Id = `${phdCandidateId}`; 
      const notificationTitle = `A New PhD Candidate Added [${phdCandidateId}] By ${adminEmail}`;
      const notificationStatus = 'Unread';
      await query(insertNotificationQuery, [Id, notificationTitle, notificationStatus]);

      await query('COMMIT');

      // Send Telegram alert for success
      const successMessage = formatAlertMessage('A New PhD Candidate Added Successfully', `ID : ${phdCandidateId}\nAdded By : ${adminEmail}\nDate : ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
      await sendTelegramAlert(successMessage);

      // Log success
      logger.info('PhD Candidate Added Successfully', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add PhD Candidate',
          details: `A new PhD Candidate added successfully with ID ${phdCandidateId} by ${adminEmail} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });

      return NextResponse.json({ message: 'PhD Candidate information added successfully' }, { status: 200 });

    } catch (error) {
      await query('ROLLBACK');

      const errorMessage = formatAlertMessage('Error Adding PhD Candidate', `ID : ${phdCandidateId}\nIP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
      await sendTelegramAlert(errorMessage);

      logger.error('Error Adding PhD Candidate', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add PhD Candidate',
          details: `Error adding PhD Candidate with ID ${phdCandidateId} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
        }
      });

      return NextResponse.json({ message: `Error adding PhD Candidate: ${error.message}` }, { status: 500 });
    }

  } catch (error) {
    const errorMessage = formatAlertMessage('Error Handling PhD Candidate Request', `IP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error Processing Form Data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Add PhD Candidate',
        details: `Error processing form data from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}
// app/api/professor_add/route.js
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

const generateProfessorId = async () => {
  try {
    const result = await query('SELECT MAX(id) AS max_id FROM professor_basic_info');
    const maxId = result.rows[0]?.max_id || 'P00MVSD';
    const numericPart = parseInt(maxId.substring(1, 3), 10) || 0;
    const nextId = numericPart + 1;
    return `P${String(nextId).padStart(2, '0')}MVSD`;
  } catch (error) {
    throw new Error(`Error generating Professor ID: ${error.message}`);
  }
};

const saveProfilePhoto = async (file, professorId) => {
  const filename = `${professorId}_DP${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Professor', filename);

  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    return `/Storage/Images/Professor/${filename}`;
  } catch (error) {
    throw new Error(`Failed to save profile photo: ${error.message}`);
  }
};

const saveDocumentPhoto = async (file, professorId, index, documentType) => {
  const filename = `${professorId}_Document_${documentType}_${index}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Professor', filename);
  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    return `/Storage/Images/Professor/${filename}`;
  } catch (error) {
    throw new Error(`Failed to save document photo: ${error.message}`);
  }
};

const saveAwardPhoto = async (file, professorId, index) => {
  const filename = `${professorId}_Award_${index}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Professor', filename);

  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    return `/Storage/Images/Professor/${filename}`;
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

    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const phone = formData.get('phone');
    const gender = formData.get('gender');
    const bloodGroup = formData.get('bloodGroup');
    const country = formData.get('country');
    const idNumber = formData.get('idNumber');
    const passport_number = formData.get('passport_number');
    const dob = formData.get('dob');
    const email = formData.get('email'); // This is the professor's email
    const password = formData.get('password');
    const short_bio = formData.get('short_bio');
    const joining_date = formData.get('joining_date');
    const leaving_date = formData.get('leaving_date') || null;
    const type = formData.get('type') || 'Professor';
    const socialMedia = JSON.parse(formData.get('socialMedia') || '[]');
    const education = JSON.parse(formData.get('education') || '[]');
    const career = JSON.parse(formData.get('career') || '[]');
    const citations = JSON.parse(formData.get('citations') || '[]');
    const documents = [];

    for (let i = 0; formData.has(`documents[${i}][title]`); i++) {
      documents.push({
        title: formData.get(`documents[${i}][title]`),
        documentType: formData.get(`documents[${i}][documentType]`),
        documentsPhoto: formData.get(`documents[${i}][documentsPhoto]`),
      });
    }
    const awards = [];
    for (let i = 0; formData.has(`awards[${i}][title]`); i++) {
      awards.push({
        title: formData.get(`awards[${i}][title]`),
        year: formData.get(`awards[${i}][year]`),
        details: formData.get(`awards[${i}][details]`),
        awardPhoto: formData.get(`awards[${i}][awardPhoto]`),
      });
    }

    // Validation
    if (!first_name || !last_name || !phone || !gender || !bloodGroup || !country || !idNumber || !passport_number || !dob || !email || !password || !short_bio || !joining_date) {
      return NextResponse.json({ message: 'All required fields must be filled.' }, { status: 400 });
    }
    

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-])[A-Za-z\d!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.' }, { status: 400 });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const currentDate = new Date();
    const dobDate = new Date(dob);
    let age = currentDate.getFullYear() - dobDate.getFullYear();
    const monthDifference = currentDate.getMonth() - dobDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return NextResponse.json({ message: 'Professor must be at least 18 years old.' }, { status: 400 });
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

    // Check for existing email, phone, ID number, and passport number
    const emailCheckResult = await query('SELECT id FROM member WHERE email = $1', [email]);
    if (emailCheckResult.rows.length > 0) {
      logger.warn('Validation Error: Email already exists', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Professor',
          details: `Attempt to add Professor failed - Email ${email} already exists.`
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
          taskName: 'Add Professor',
          details: `Attempt to add Professor failed - Phone No : ${phone} already exists.`
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
          taskName: 'Add Professor',
          details: `Attempt to add Professor failed - ID number ${idNumber} already exists.`
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
          taskName: 'Add Professor',
          details: `Attempt to add Professor failed - Passport number ${passport_number} already exists.`
        }
      });

      return NextResponse.json({ 
        success: false, 
        message: 'Passport number already exists. Please try with a different passport number.' 
      }, { status: 400 });
    }

    const professorId = await generateProfessorId();

    let photoUrl = null;
    const photoFile = formData.get('photo');
    if (photoFile) {
      photoUrl = await saveProfilePhoto(photoFile, professorId);
    }

    // Save document photos
    const documentUrls = [];
    if (documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const documentFile = documents[i].documentsPhoto;
        if (documentFile) {
          try {
            const documentUrl = await saveDocumentPhoto(documentFile, professorId, i, documents[i].documentType);
            documentUrls.push(documentUrl);
          } catch (error) {
            return NextResponse.json({ message: `Failed to save document photo: ${error.message}` }, { status: 500 });
          }
        } else {
          return NextResponse.json({ message: 'Professor document photo is missing' }, { status: 400 });
        }
      }
    }

    const awardUrls = [];
    if (awards.length > 0) {
      for (let i = 0; i < awards.length; i++) {
        const awardFile = awards[i].awardPhoto;
        if (awardFile) {
          const awardUrl = await saveAwardPhoto(awardFile, professorId, i + 1);
          awardUrls.push(awardUrl);
        } else {
          throw new Error('Award photo is missing');
        }
      }
    }

    try {
      await query('BEGIN');

      const insertProfessorQuery = `
        INSERT INTO professor_basic_info 
          (id, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photo, status, type, gender, "blood_group", country, passport_number, "id_number") 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12, $13, $14, $15, $16, $17)
        RETURNING *;
      `;
      await query(insertProfessorQuery, [
        professorId, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photoUrl, type, gender, bloodGroup, country, passport_number, idNumber,
      ]);

      const insertSocialMediaQuery = `INSERT INTO professor_socialMedia_info (professor_id, socialMedia_name, link) VALUES ($1, $2, $3) RETURNING *;`;
      for (const sm of socialMedia) {
        await query(insertSocialMediaQuery, [professorId, sm.socialMedia_name, sm.link]);
      }

      const insertMemberQuery = `
        INSERT INTO member 
          (id, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photo, status, type, gender, "blood_group", country, passport_number, "id_number") 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12, $13, $14, $15, $16, $17)
        RETURNING *;
      `;
      await query(insertMemberQuery, [
        professorId, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photoUrl, type, gender, bloodGroup, country, passport_number, idNumber,
      ]);

      const insertEducationQuery = `INSERT INTO professor_education_info (professor_id, degree, institution, passing_year) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const edu of education) {
        await query(insertEducationQuery, [professorId, edu.degree, edu.institution, parseInt(edu.passing_year)]);
      }

      const insertCareerQuery = `INSERT INTO professor_career_info (professor_id, position, organization_name, joining_year, leaving_year) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (const car of career) {
        await query(insertCareerQuery, [
          professorId, car.position, car.organization, parseInt(car.joining_year), parseInt(car.leaving_year),
        ]);
      }

      const insertCitationQuery = `INSERT INTO professor_citations_info (professor_id, title, link, organization_name) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const citation of citations) {
        await query(insertCitationQuery, [professorId, citation.title, citation.link, citation.organization]);
      }

      // Insert into professor_documents_info
      const insertDocumentsQuery = `INSERT INTO professor_document_info ("professor_id", "title", "document_type", "document_photo") VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (let i = 0; i < documents.length; i++) {
        const document = documents[i];
        const documentUrl = documentUrls[i]; // Get the URL of the saved document photo

        if (!documentUrl) {
          throw new Error('Document URL is null');
        }

        await query(insertDocumentsQuery, [
          professorId, document.title, document.documentType, documentUrl,
        ]);
      }

      const insertAwardsQuery = `INSERT INTO professor_award_info (professor_id, title, year, details, award_photo) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (let i = 0; i < awards.length; i++) {
        const award = awards[i];
        const awardUrl = awardUrls[i]; // Get the URL of the saved award photo

        if (!awardUrl) {
          throw new Error('Award URL is null');
        }

        await query(insertAwardsQuery, [
          professorId, award.title, parseInt(award.year), award.details, awardUrl,
        ]);
      }

      const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
      const Id = `${professorId}`; 
      const notificationTitle = `A New Professor Added [${professorId}] By ${adminEmail}`;
      const notificationStatus = 'Unread';
      await query(insertNotificationQuery, [Id, notificationTitle, notificationStatus]);

      await query('COMMIT');

      const apiCallMessage = formatAlertMessage('Professor Add - API', `IP : ${ipAddress}\nStatus : 200`);
      await sendTelegramAlert(apiCallMessage);

      const successMessage = formatAlertMessage('A New Professor Added Successfully', `ID : ${professorId}\nAdded By : ${adminEmail}\nDate : ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
      await sendTelegramAlert(successMessage);

      logger.info('A New Professor Added Successfully', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Professor',
          details: `A new professor added successfully with ID ${professorId} by ${adminEmail} from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });

      return NextResponse.json({ message: 'Professor information added successfully!' }, { status: 200 });

    } catch (error) {
      await query('ROLLBACK');

      const errorMessage = formatAlertMessage('Professor Add - API', `ID : ${professorId}\nIP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
      await sendTelegramAlert(errorMessage);

      logger.error('Error Adding Professor', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'Add Professor',
          details: `Error adding professor with ID ${professorId} from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
        }
      });

      return NextResponse.json({ message: `Execution failed: ${error.message}` }, { status: 500 });
    }

  } catch (error) {
    const errorMessage = formatAlertMessage('Professor Add - API', `IP : ${ipAddress}\nError : ${error.message}\nStatus : 500`);
    await sendTelegramAlert(errorMessage);

    logger.error('Error Processing Form Data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Add Professor',
        details: `Error processing form data from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json({ message: `Failed to process form data: ${error.message}` }, { status: 500 });
  }
}
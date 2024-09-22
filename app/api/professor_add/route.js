// app/api/professor_add/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to call logAndAlert API
const logAndAlert = async (message, sessionId, details = {}) => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await axios.post(`${siteUrl}/api/log-and-alert`, { message, sessionId, details });
  } catch (error) {
    console.error('Failed to log and send alert:', error);
  }
};

// Helper function to generate the next Professor ID
const generateProfessorId = async () => {
  const client = await pool.connect();
  try {
    await logAndAlert('Initiating Professor ID generation...', 'SYSTEM');
    const result = await client.query('SELECT MAX(id) AS max_id FROM professor_basic_info');
    const maxId = result.rows[0]?.max_id || 'P00MVSD';
    const numericPart = parseInt(maxId.substring(1, 3), 10) || 0;
    const nextId = numericPart + 1;
    const formattedId = `P${String(nextId).padStart(2, '0')}MVSD`;
    await logAndAlert(`Professor ID generated successfully: ${formattedId}`, 'SYSTEM');
    return formattedId;
  } catch (error) {
    await logAndAlert(`Error occurred during Professor ID generation: ${error.message}`, 'SYSTEM');
    throw error;
  } finally {
    client.release();
  }
};

// Helper function to save profile photo
const saveProfilePhoto = async (file, professorId) => {
  const filename = `${professorId}_DP${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Professor', filename);

  try {
    await logAndAlert(`Saving profile photo with filename: ${filename} at path: ${targetPath}`, 'SYSTEM');
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    await logAndAlert(`Profile photo saved successfully at path: ${targetPath}`, 'SYSTEM');
    return `/Storage/Images/Professor/${filename}`;
  } catch (error) {
    await logAndAlert(`Error occurred while saving profile photo: ${error.message}`, 'SYSTEM');
    throw new Error(`Failed to save profile photo: ${error.message}`);
  }
};

// Helper function to save award photo
const saveAwardPhoto = async (file, professorId, index) => {
  const filename = `${professorId}_Award_${index}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Professor', filename);

  try {
    await logAndAlert(`Saving award photo with filename: ${filename} at path: ${targetPath}`, 'SYSTEM');
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    await logAndAlert(`Award photo saved successfully at path: ${targetPath}`, 'SYSTEM');
    return `/Storage/Images/Professor/${filename}`;
  } catch (error) {
    await logAndAlert(`Error occurred while saving award photo: ${error.message}`, 'SYSTEM');
    throw new Error(`Failed to save award photo: ${error.message}`);
  }
};

// Main function to handle the POST request
export async function POST(req) {
  const client = await pool.connect();
  try {
    await logAndAlert('Receiving form data...', 'SYSTEM');
    const formData = await req.formData();

    // Extract form data
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const phone = formData.get('phone');
    const dob = formData.get('dob');
    const email = formData.get('email');
    const password = formData.get('password');
    const short_bio = formData.get('short_bio');
    const joining_date = formData.get('joining_date');
    const leaving_date = formData.get('leaving_date') || null;
    const type = formData.get('type') || 'Professor';
    const socialMedia = JSON.parse(formData.get('socialMedia') || '[]');
    const education = JSON.parse(formData.get('education') || '[]');
    const career = JSON.parse(formData.get('career') || '[]');
    const citations = JSON.parse(formData.get('citations') || '[]');
    const awards = [];
    for (let i = 0; formData.has(`awards[${i}][title]`); i++) {
      awards.push({
        title: formData.get(`awards[${i}][title]`),
        year: formData.get(`awards[${i}][year]`),
        details: formData.get(`awards[${i}][details]`),
        awardPhoto: formData.get(`awards[${i}][awardPhoto]`),
      });
    }

    // Password validation
    await logAndAlert('Validating password...', 'SYSTEM');
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-])[A-Za-z\d!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-]{8,}$/;
    if (!passwordRegex.test(password)) {
      await logAndAlert('Password validation failed', 'SYSTEM');
      return NextResponse.json({ message: 'Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.' }, { status: 400 });
    }

    // Date of Birth validation
    await logAndAlert(`Validating date of birth (${dob})...`, 'SYSTEM');
    const currentDate = new Date();
    const dobDate = new Date(dob);
    let age = currentDate.getFullYear() - dobDate.getFullYear();
    const monthDifference = currentDate.getMonth() - dobDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 18) {
      await logAndAlert(`Date of birth validation failed: Age is ${age}, which is less than 18`, 'SYSTEM');
      return NextResponse.json({ message: 'Professor must be at least 18 years old.' }, { status: 400 });
    }

    // Joining Date validation
    await logAndAlert(`Validating joining date (${joining_date})...`, 'SYSTEM');
    const joiningYear = new Date(joining_date).getFullYear();
    if (joiningYear > currentDate.getFullYear()) {
      await logAndAlert(`Joining date validation failed: Joining year (${joiningYear}) is greater than the current year (${currentDate.getFullYear()})`, 'SYSTEM');
      return NextResponse.json({ message: 'Joining date cannot be greater than the current year.' }, { status: 400 });
    }

    // Year validations for education, career, and awards
    const validateYear = (year) => year <= currentDate.getFullYear();

    await logAndAlert('Validating education years...', 'SYSTEM');
    if (!education.every(edu => validateYear(edu.passing_year))) {
      await logAndAlert('Education year validation failed: Passing year is greater than the current year', 'SYSTEM');
      return NextResponse.json({ message: 'Passing year cannot be greater than the current year.' }, { status: 400 });
    }

    await logAndAlert('Validating career years...', 'SYSTEM');
    if (!career.every(car => validateYear(car.joining_year) && (!car.leaving_year || validateYear(car.leaving_year)))) {
      await logAndAlert('Career year validation failed: Joining year or leaving year is greater than the current year', 'SYSTEM');
      return NextResponse.json({ message: 'Joining year and leaving year cannot be greater than the current year.' }, { status: 400 });
    }

    await logAndAlert('Validating award years...', 'SYSTEM');
    if (!awards.every(award => validateYear(award.year))) {
      await logAndAlert('Award year validation failed: Award year is greater than the current year', 'SYSTEM');
      return NextResponse.json({ message: 'Award year cannot be greater than the current year.' }, { status: 400 });
    }

    // Check if email or phone already exists
    await logAndAlert(`Checking if email (${email}) or phone (${phone}) already exists in the database...`, 'SYSTEM');
    const emailCheckResult = await client.query('SELECT id FROM member WHERE email = $1', [email]);
    if (emailCheckResult.rows.length > 0) {
      await logAndAlert(`Email already exists in the database: ${email}`, 'SYSTEM');
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }

    const phoneCheckResult = await client.query('SELECT id FROM member WHERE phone = $1', [phone]);
    if (phoneCheckResult.rows.length > 0) {
      await logAndAlert(`Phone number already exists in the database: ${phone}`, 'SYSTEM');
      return NextResponse.json({ message: 'Phone Number already exists' }, { status: 400 });
    }

    const professorId = await generateProfessorId();
    await logAndAlert(`New Professor ID generated: ${professorId}`, 'SYSTEM');

    // Save profile photo if available
    let photoUrl = null;
    const photoFile = formData.get('photo');
    if (photoFile) {
      photoUrl = await saveProfilePhoto(photoFile, professorId);
      await logAndAlert(`Profile photo URL generated successfully: ${photoUrl}`, 'SYSTEM');
    }

    // Handle awards processing
    const awardUrls = [];
    if (awards.length > 0) {
      for (let i = 0; i < awards.length; i++) {
        const awardFile = awards[i].awardPhoto;
        if (awardFile) {
          const awardUrl = await saveAwardPhoto(awardFile, professorId, i + 1);
          awardUrls.push(awardUrl);
        } else {
          await logAndAlert(`Award photo is missing for award: ${awards[i].title}`, 'SYSTEM');
          throw new Error('Award photo is missing');
        }
      }
    }

    try {
      // Begin Execution
      await client.query('BEGIN');
      await logAndAlert('A New Professor Adding Process Execution Started...', 'SYSTEM');

      // Insert professor info
      const insertProfessorQuery = `
        INSERT INTO professor_basic_info 
          (id, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photo, status, type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12)
        RETURNING *;
      `;
      const professorInsertResult = await client.query(insertProfessorQuery, [
        professorId, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photoUrl, type,
      ]);
      await logAndAlert('Professor information inserted successfully.', 'SYSTEM');

      // Insert social media info
      const insertSocialMediaQuery = `INSERT INTO professor_socialMedia_info (id, socialMedia_name, link) VALUES ($1, $2, $3) RETURNING *;`;
      for (const sm of socialMedia) {
        const smInsertResult = await client.query(insertSocialMediaQuery, [professorId, sm.socialMedia_name, sm.link]);
        await logAndAlert('Social media information inserted successfully.', 'SYSTEM');
      }

      // Insert member info
      const insertMemberQuery = `
        INSERT INTO member 
          (id, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photo, status, type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12)
        RETURNING *;
      `;
      const memberInsertResult = await client.query(insertMemberQuery, [
        professorId, first_name, last_name, phone, dob, email, password, short_bio, joining_date, leaving_date, photoUrl, type,
      ]);
      await logAndAlert('Member information inserted successfully.', 'SYSTEM');

      // Insert education info
      const insertEducationQuery = `INSERT INTO professor_education_info (professor_id, degree, institution, passing_year) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const edu of education) {
        const eduInsertResult = await client.query(insertEducationQuery, [professorId, edu.degree, edu.institution, parseInt(edu.passing_year)]);
        await logAndAlert('Education information inserted successfully.', 'SYSTEM');
      }

      // Insert career info
      const insertCareerQuery = `INSERT INTO professor_career_info (professor_id, position, organization_name, joining_year, leaving_year) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (const car of career) {
        const carInsertResult = await client.query(insertCareerQuery, [
          professorId, car.position, car.organization, parseInt(car.joining_year), parseInt(car.leaving_year),
        ]);
        await logAndAlert('Career information inserted successfully.', 'SYSTEM');
      }

      // Insert citation info
      const insertCitationQuery = `INSERT INTO professor_citations_info (professor_id, title, link, organization_name) VALUES ($1, $2, $3, $4) RETURNING *;`;
      for (const citation of citations) {
        const citationInsertResult = await client.query(insertCitationQuery, [professorId, citation.title, citation.link, citation.organization]);
        await logAndAlert('Citation information inserted successfully.', 'SYSTEM');
      }

      // Insert awards info
      const insertAwardsQuery = `INSERT INTO professor_award_info (professor_id, title, year, details, award_photo) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
      for (let i = 0; i < awards.length; i++) {
        const award = awards[i];
        const awardUrl = awardUrls[i]; // Get the URL of the saved award photo

        if (!awardUrl) {
          await logAndAlert(`Award URL is null for award: ${award.title}`, 'SYSTEM');
          throw new Error('Award URL is null');
        }

        try {
          const awardInsertResult = await client.query(insertAwardsQuery, [
            professorId, award.title, parseInt(award.year), award.details, awardUrl,
          ]);
          await logAndAlert('Award information inserted successfully.', 'SYSTEM');
        } catch (error) {
          await logAndAlert(`Error inserting award information for award: ${award.title}, Error: ${error.message}`, 'SYSTEM');
          throw error; // Throw error to trigger rollback
        }
      }

      // Insert notification
      const insertNotificationQuery = `INSERT INTO notification_details (id, title, status) VALUES ($1, $2, $3) RETURNING *;`;
      const Id = `${professorId}`; 
      const notificationTitle = `A New Professor Added [${professorId}]`;
      const notificationStatus = 'Unread';
      const notificationInsertResult = await client.query(insertNotificationQuery, [Id, notificationTitle, notificationStatus]);
      await logAndAlert('Notification inserted successfully.', 'SYSTEM');

      // Commit Execution
      await client.query('COMMIT');
      await logAndAlert('Execution committed successfully.', 'SYSTEM');
      await logAndAlert(`A New Professor Added Successfully ID : ${professorId}`, 'SYSTEM');
      await logAndAlert(`MVSD LAB DASHBOARD\n-------------------------------------\nA New Professor Added.\nID : ${professorId}`, 'SYSTEM');
      return NextResponse.json({ message: 'Professor information added successfully!' }, { status: 200 });

    } catch (error) {
      await logAndAlert(`Error during execution: ${error.message}`, 'SYSTEM');
      await client.query('ROLLBACK');
      return NextResponse.json({ message: `Execution failed: ${error.message}` }, { status: 500 });
    }

  } catch (error) {
    await logAndAlert(`Error processing form data: ${error.message}`, 'SYSTEM');
    return NextResponse.json({ message: `Failed to process form data: ${error.message}` }, { status: 500 });
  } finally {
    client.release();
  }
}

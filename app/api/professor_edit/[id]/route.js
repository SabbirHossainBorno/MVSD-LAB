//app/api/professor_edit/[id]/route.js
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

// Helper function to save profile photo
const saveProfilePhoto = async (file, professorId) => {
  const filename = `${professorId}_DP${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Professor', filename);

  try {
    console.log(`Saving profile photo with filename: ${filename} at path: ${targetPath}`);
    await logAndAlert(`Saving profile photo with filename: ${filename} at path: ${targetPath}`, 'SYSTEM');
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    console.log(`Profile photo saved successfully at path: ${targetPath}`);
    await logAndAlert(`Profile photo saved successfully at path: ${targetPath}`, 'SYSTEM');
    return `/Storage/Images/Professor/${filename}`;
  } catch (error) {
    console.error(`Error occurred while saving profile photo: ${error.message}`);
    await logAndAlert(`Error occurred while saving profile photo: ${error.message}`, 'SYSTEM');
    throw new Error(`Failed to save profile photo: ${error.message}`);
  }
};

const saveAwardPhoto = async (file, professorId, index) => {
  if (!file) {
    throw new Error('No file provided for award photo');
  }

  const filename = `${professorId}_Award_${index}${path.extname(file.name)}`;
  const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Professor', filename);

  try {
    console.log(`Saving award photo with filename: ${filename} at path: ${targetPath}`);
    await logAndAlert(`Saving award photo with filename: ${filename} at path: ${targetPath}`, 'SYSTEM');
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    console.log(`Award photo saved successfully at path: ${targetPath}`);
    await logAndAlert(`Award photo saved successfully at path: ${targetPath}`, 'SYSTEM');
    return `/Storage/Images/Professor/${filename}`;
  } catch (error) {
    console.error(`Error occurred while saving award photo: ${error.message}`);
    await logAndAlert(`Error occurred while saving award photo: ${error.message}`, 'SYSTEM');
    throw new Error(`Failed to save award photo: ${error.message}`);
  }
};

// Main function to handle the GET request
export async function GET(req, { params }) {
  const client = await pool.connect();
  const { id } = params;

  try {
    console.log(`Fetching professor data for ID: ${id}`);
    await logAndAlert(`Fetching professor data for ID: ${id}`, 'SYSTEM');
    const professorQuery = `
      SELECT * FROM professor_basic_info WHERE id = $1;
    `;
    const professorResult = await client.query(professorQuery, [id]);

    if (professorResult.rows.length === 0) {
      console.log(`No professor found with ID: ${id}`);
      await logAndAlert(`No professor found with ID: ${id}`, 'SYSTEM');
      return NextResponse.json({ message: 'Professor not found' }, { status: 404 });
    }

    const professor = professorResult.rows[0];

    const socialMediaQuery = `
      SELECT * FROM professor_socialmedia_info WHERE professor_id = $1;
    `;
    const socialMediaResult = await client.query(socialMediaQuery, [id]);

    const educationQuery = `
      SELECT * FROM professor_education_info WHERE professor_id = $1;
    `;
    const educationResult = await client.query(educationQuery, [id]);

    const careerQuery = `
      SELECT * FROM professor_career_info WHERE professor_id = $1;
    `;
    const careerResult = await client.query(careerQuery, [id]);

    const citationsQuery = `
      SELECT * FROM professor_citations_info WHERE professor_id = $1;
    `;
    const citationsResult = await client.query(citationsQuery, [id]);

    const awardsQuery = `
      SELECT * FROM professor_award_info WHERE professor_id = $1;
    `;
    const awardsResult = await client.query(awardsQuery, [id]);

    const responseData = {
      ...professor,
      socialMedia: socialMediaResult.rows,
      education: educationResult.rows,
      career: careerResult.rows,
      citations: citationsResult.rows,
      awards: awardsResult.rows.map(award => ({ ...award, existing: true })),
    };

    console.log(`Professor data fetched successfully for ID: ${id}`);
    await logAndAlert(`Professor data fetched successfully for ID: ${id}`, 'SYSTEM');
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(`Error fetching professor data: ${error.message}`);
    await logAndAlert(`Error fetching professor data: ${error.message}`, 'SYSTEM');
    return NextResponse.json({ message: `Failed to fetch professor data: ${error.message}` }, { status: 500 });
  } finally {
    client.release();
  }
}

// Main function to handle the POST request
export async function POST(req, { params }) {
  const client = await pool.connect();
  const { id } = params;

  try {
    console.log('Receiving form data...');
    await logAndAlert('Receiving form data...', 'SYSTEM');
    const formData = await req.formData();

    // Extract form data
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const phone = formData.get('phone');
    const short_bio = formData.get('short_bio');
    const status = formData.get('status');
    const leaving_date = formData.get('leaving_date');
    const photo = formData.get('photo');
    const socialMedia = JSON.parse(formData.get('socialMedia') || '[]');
    const education = JSON.parse(formData.get('education') || '[]');
    const career = JSON.parse(formData.get('career') || '[]');
    const citations = JSON.parse(formData.get('citations') || '[]');
    const awards = JSON.parse(formData.get('awards') || '[]');
    const password = formData.get('password');

    await client.query('BEGIN');

    // Update profile photo
    if (photo) {
      console.log('Updating profile photo...');
      await logAndAlert('Updating profile photo...', 'SYSTEM');
      const photoUrl = await saveProfilePhoto(photo, id);
      const updatePhotoQuery = `
        UPDATE professor_basic_info
        SET photo = $1
        WHERE id = $2
      `;
      await client.query(updatePhotoQuery, [photoUrl, id]);

      const updateMemberPhotoQuery = `
        UPDATE member
        SET photo = $1
        WHERE id = $2
      `;
      await client.query(updateMemberPhotoQuery, [photoUrl, id]);
    }

    // Update basic info
    if (first_name || last_name || phone || short_bio || status || leaving_date) {
      console.log('Updating basic info...');
      await logAndAlert('Updating basic info...', 'SYSTEM');

      // Log incoming parameters for debugging
      console.log('Parameters:', {
        first_name,
        last_name,
        phone,
        short_bio,
        status,
        leaving_date,
        id
      });

      // Prepare leaving_date parameter
      const leavingDateParam = leaving_date === undefined || leaving_date === 'null' ? null : leaving_date;

      console.log('leavingDateParam:', leavingDateParam); // Log the processed leaving_date parameter

      const updateBasicInfoQuery = `
        UPDATE professor_basic_info
        SET first_name = $1, last_name = $2, phone = $3, short_bio = $4, status = $5, leaving_date = $6
        WHERE id = $7
      `;

      try {
        await client.query(updateBasicInfoQuery, [first_name, last_name, phone, short_bio, status, leavingDateParam, id]);
      } catch (error) {
        console.error('Error executing updateBasicInfoQuery:', error);
        throw error; // Re-throw error to be handled later if needed
      }

      const updateMemberQuery = `
        UPDATE member
        SET first_name = $1, last_name = $2, phone = $3, short_bio = $4, status = $5, leaving_date = $6, updated_at = NOW()
        WHERE id = $7
      `;

      try {
        await client.query(updateMemberQuery, [first_name, last_name, phone, short_bio, status, leavingDateParam, id]);
      } catch (error) {
        console.error('Error executing updateMemberQuery:', error);
        throw error; // Re-throw error to be handled later if needed
      }
    }

    // Update social media
    if (socialMedia.length > 0) {
      console.log('Updating social media...');
      await logAndAlert('Updating social media...', 'SYSTEM');
      const deleteSocialMediaQuery = `
        DELETE FROM professor_socialmedia_info
        WHERE professor_id = $1
      `;
      await client.query(deleteSocialMediaQuery, [id]);

      const insertSocialMediaQuery = `
        INSERT INTO professor_socialmedia_info (professor_id, socialmedia_name, link)
        VALUES ($1, $2, $3)
      `;
      for (const sm of socialMedia) {
        await client.query(insertSocialMediaQuery, [id, sm.socialmedia_name, sm.link]);
      }
    }

    // Update education
    if (education.length > 0) {
      console.log('Updating education...');
      await logAndAlert('Updating education...', 'SYSTEM');
      const deleteEducationQuery = `
        DELETE FROM professor_education_info
        WHERE professor_id = $1
      `;
      await client.query(deleteEducationQuery, [id]);

      const insertEducationQuery = `
        INSERT INTO professor_education_info (professor_id, degree, institution, passing_year)
        VALUES ($1, $2, $3, $4)
      `;
      for (const edu of education) {
        await client.query(insertEducationQuery, [id, edu.degree, edu.institution, edu.passing_year]);
      }
    }

    // Update career
    if (career.length > 0) {
      console.log('Updating career...');
      await logAndAlert('Updating career...', 'SYSTEM');
      const deleteCareerQuery = `
        DELETE FROM professor_career_info
        WHERE professor_id = $1
      `;
      await client.query(deleteCareerQuery, [id]);

      const insertCareerQuery = `
        INSERT INTO professor_career_info (professor_id, position, organization_name, joining_year, leaving_year)
        VALUES ($1, $2, $3, $4, $5)
      `;
      for (const job of career) {
        await client.query(insertCareerQuery, [id, job.position, job.organization, job.joining_year, job.leaving_year]);
      }
    }

    // Update citations
    if (citations.length > 0) {
      console.log('Updating citations...');
      await logAndAlert('Updating citations...', 'SYSTEM');
      const deleteCitationsQuery = `
        DELETE FROM professor_citations_info
        WHERE professor_id = $1
      `;
      await client.query(deleteCitationsQuery, [id]);

      const insertCitationsQuery = `
        INSERT INTO professor_citations_info (professor_id, title, link, organization_name)
        VALUES ($1, $2, $3, $4)
      `;
      for (const citation of citations) {
        await client.query(insertCitationsQuery, [id, citation.title, citation.link, citation.organization_name]);
      }
    }

    // Update awards
    if (awards.length > 0) {
      console.log('Updating awards...');
      await logAndAlert('Updating awards...', 'SYSTEM');

      // Filter new awards
      const newAwards = awards.filter(award => !award.existing);

      const insertAwardsQuery = `
        INSERT INTO professor_award_info (professor_id, title, year, details, award_photo)
        VALUES ($1, $2, $3, $4, $5)
      `;
      for (let i = 0; i < newAwards.length; i++) {
        const award = newAwards[i];
        let awardUrl = null;
        if (award.awardPhoto) {
          awardUrl = await saveAwardPhoto(award.awardPhoto, id, i + 1);
        }
        await client.query(insertAwardsQuery, [id, award.title, award.year, award.details, awardUrl]);
      }
    }

    // Update password
    if (password) {
      console.log('Updating password...');
      await logAndAlert('Updating password...', 'SYSTEM');
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-])[A-Za-z\d!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-]{8,}$/;
      if (!passwordRegex.test(password)) {
        console.log('Password validation failed');
        await logAndAlert('Password validation failed', 'SYSTEM');
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.' }, { status: 400 });
      }
      const updatePasswordQuery = `
        UPDATE professor_basic_info
        SET password = $1
        WHERE id = $2
      `;
      await client.query(updatePasswordQuery, [password, id]);

      const updateMemberPasswordQuery = `
        UPDATE member
        SET password = $1
        WHERE id = $2
      `;
      await client.query(updateMemberPasswordQuery, [password, id]);
    }

    await client.query('COMMIT');
    console.log(`Professor information updated successfully for ID: ${id}`);
    await logAndAlert(`Professor information updated successfully for ID: ${id}`, 'SYSTEM');
    return NextResponse.json({ message: 'Professor information updated successfully!' }, { status: 200 });

  } catch (error) {
    console.error(`Error during execution: ${error.message}`);
    await logAndAlert(`Error during execution: ${error.message}`, 'SYSTEM');
    await client.query('ROLLBACK');
    return NextResponse.json({ message: `Execution failed: ${error.message}` }, { status: 500 });
  } finally {
    client.release();
  }
}

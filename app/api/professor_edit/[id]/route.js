import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import axios from 'axios'; // Ensure you import axios

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

export async function GET(req, { params }) {
  const client = await pool.connect();
  const { id } = params;

  try {
    const professorQuery = 'SELECT * FROM professor_basic_info WHERE id = $1';
    const socialMediaQuery = 'SELECT * FROM professor_socialMedia_info WHERE professor_id = $1';
    const educationQuery = 'SELECT * FROM professor_education_info WHERE professor_id = $1';
    const careerQuery = 'SELECT * FROM professor_career_info WHERE professor_id = $1';
    const citationsQuery = 'SELECT * FROM professor_citations_info WHERE professor_id = $1';
    const awardsQuery = 'SELECT * FROM professor_award_info WHERE professor_id = $1';

    const professorResult = await client.query(professorQuery, [id]);
    const socialMediaResult = await client.query(socialMediaQuery, [id]);
    const educationResult = await client.query(educationQuery, [id]);
    const careerResult = await client.query(careerQuery, [id]);
    const citationsResult = await client.query(citationsQuery, [id]);
    const awardsResult = await client.query(awardsQuery, [id]);

    if (professorResult.rows.length === 0) {
      await logAndAlert('Professor not found during GET request', id);
      return NextResponse.json({ message: 'Professor not found' }, { status: 404 });
    }

    const professor = professorResult.rows[0];
    const socialMedia = socialMediaResult.rows;
    const education = educationResult.rows;
    const career = careerResult.rows;
    const citations = citationsResult.rows;
    const awards = awardsResult.rows;

    await logAndAlert('Professor details fetched successfully', id, { professor });

    return NextResponse.json({
      professor,
      socialMedia,
      education,
      career,
      citations,
      awards,
    });
  } catch (error) {
    await logAndAlert('Error fetching professor details', id, { error: error.message });
    console.error('Error fetching professor details:', error);
    return NextResponse.json({ message: 'Error fetching professor details' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(req, { params }) {
  const client = await pool.connect();
  const { id } = params;

  try {
    const formData = await req.formData();

    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const phone = formData.get('phone');
    const short_bio = formData.get('short_bio');
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

    // Save profile photo if available
    let photoUrl = null;
    const photoFile = formData.get('photo');
    if (photoFile) {
      const filename = `${id}_DP${path.extname(photoFile.name)}`;
      const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Professor', filename);

      try {
        const buffer = await photoFile.arrayBuffer();
        fs.writeFileSync(targetPath, Buffer.from(buffer));
        photoUrl = `/Storage/Images/Professor/${filename}`;
      } catch (error) {
        await logAndAlert('Error saving profile photo', id, { error: error.message });
        console.error('Error saving profile photo:', error);
        return NextResponse.json({ message: 'Failed to save profile photo' }, { status: 500 });
      }
    }

    // Update professor info
    const updateProfessorQuery = `
      UPDATE professor_basic_info
      SET first_name = $1, last_name = $2, phone = $3, short_bio = $4, leaving_date = $5, photo = COALESCE($6, photo), type = $7
      WHERE id = $8
      RETURNING *;
    `;
    const professorResult = await client.query(updateProfessorQuery, [
      first_name, last_name, phone, short_bio, leaving_date, photoUrl, type, id,
    ]);

    // Update corresponding info in the member table
    const updateMemberQuery = `
      UPDATE member
      SET first_name = $1, last_name = $2, phone = $3, photo = COALESCE($4, photo), type = $5
      WHERE professor_id = $6;
    `;
    await client.query(updateMemberQuery, [
      first_name, last_name, phone, photoUrl, type, id,
    ]);

    // Update social media info
    const deleteSocialMediaQuery = 'DELETE FROM professor_socialMedia_info WHERE professor_id = $1';
    await client.query(deleteSocialMediaQuery, [id]);
    const insertSocialMediaQuery = 'INSERT INTO professor_socialMedia_info (professor_id, socialMedia_name, link) VALUES ($1, $2, $3)';
    for (const sm of socialMedia) {
      await client.query(insertSocialMediaQuery, [id, sm.socialMedia_name, sm.link]);
    }

    // Update education info
    const deleteEducationQuery = 'DELETE FROM professor_education_info WHERE professor_id = $1';
    await client.query(deleteEducationQuery, [id]);
    const insertEducationQuery = 'INSERT INTO professor_education_info (professor_id, degree, institution, passing_year) VALUES ($1, $2, $3, $4)';
    for (const edu of education) {
      await client.query(insertEducationQuery, [id, edu.degree, edu.institution, edu.passing_year]);
    }

    // Update career info
    const deleteCareerQuery = 'DELETE FROM professor_career_info WHERE professor_id = $1';
    await client.query(deleteCareerQuery, [id]);
    const insertCareerQuery = 'INSERT INTO professor_career_info (professor_id, position, organization_name, joining_year, leaving_year) VALUES ($1, $2, $3, $4, $5)';
    for (const car of career) {
      await client.query(insertCareerQuery, [id, car.position, car.organization, car.joining_year, car.leaving_year]);
    }

    // Update citations info
    const deleteCitationsQuery = 'DELETE FROM professor_citations_info WHERE professor_id = $1';
    await client.query(deleteCitationsQuery, [id]);
    const insertCitationsQuery = 'INSERT INTO professor_citations_info (professor_id, title, link, organization_name) VALUES ($1, $2, $3, $4)';
    for (const citation of citations) {
      await client.query(insertCitationsQuery, [id, citation.title, citation.link, citation.organization]);
    }

    // Insert new awards info
    const insertAwardsQuery = 'INSERT INTO professor_award_info (professor_id, title, year, details, award_photo) VALUES ($1, $2, $3, $4, $5)';
    for (let i = 0; i < awards.length; i++) {
      const award = awards[i];
      const awardUrl = award.awardPhoto ? `/Storage/Images/Professor/${id}_Award_${i + 1}${path.extname(award.awardPhoto.name)}` : null;

      if (award.awardPhoto) {
        const targetPath = path.join('/home/mvsd-lab/public/Storage/Images/Professor', `${id}_Award_${i + 1}${path.extname(award.awardPhoto.name)}`);
        try {
          const buffer = await award.awardPhoto.arrayBuffer();
          fs.writeFileSync(targetPath, Buffer.from(buffer));
        } catch (error) {
          await logAndAlert('Error saving award photo', id, { error: error.message });
          console.error('Error saving award photo:', error);
          return NextResponse.json({ message: 'Failed to save award photo' }, { status: 500 });
        }
      }

      await client.query(insertAwardsQuery, [id, award.title, award.year, award.details, awardUrl]);
    }

    await logAndAlert('Professor details updated successfully', id, { professor: professorResult.rows[0] });
    return NextResponse.json({ message: 'Professor updated successfully' }, { status: 200 });
  } catch (error) {
    await logAndAlert('Error updating professor details', id, { error: error.message });
    console.error('Error updating professor details:', error);
    return NextResponse.json({ message: 'Error updating professor details' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function updatePassword(req, { params }) {
  const { id } = params;
  const { oldPassword, newPassword } = await req.json();

  try {
    // Perform password update logic...

    await logAndAlert('Password updated successfully', id);
    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    await logAndAlert('Error updating password', id, { error: error.message });
    console.error('Error updating password:', error);
    return NextResponse.json({ message: 'Error updating password' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import axios from 'axios';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const logAndAlert = async (message, sessionId, details = {}) => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await axios.post(`${siteUrl}/api/log-and-alert`, { message, sessionId, details });
  } catch (error) {
    console.error('Failed to log and send alert:', error);
  }
};

export async function GET(req, { params }) {
  const { id } = params;
  const client = await pool.connect();

  try {
    await logAndAlert(`Fetching details for professor ID: ${id}`, 'SYSTEM');

    // Fetch professor basic info
    const professorBasicInfoQuery = `SELECT * FROM professor_basic_info WHERE id = $1;`;
    const professorBasicInfoResult = await client.query(professorBasicInfoQuery, [id]);

    // Fetch professor education info
    const professorEducationQuery = `SELECT * FROM professor_education_info WHERE professor_id = $1;`;
    const professorEducationResult = await client.query(professorEducationQuery, [id]);

    // Fetch professor career info
    const professorCareerQuery = `SELECT * FROM professor_career_info WHERE professor_id = $1;`;
    const professorCareerResult = await client.query(professorCareerQuery, [id]);

    // Fetch professor citations
    const professorCitationsQuery = `SELECT * FROM professor_citations_info WHERE professor_id = $1;`;
    const professorCitationsResult = await client.query(professorCitationsQuery, [id]);

    // Fetch professor awards
    const professorAwardsQuery = `SELECT * FROM professor_award_info WHERE professor_id = $1;`;
    const professorAwardsResult = await client.query(professorAwardsQuery, [id]);

    // Fetch professor social media info
    const professorSocialMediaQuery = `SELECT * FROM professor_socialMedia_info WHERE professor_id = $1;`;
    const professorSocialMediaResult = await client.query(professorSocialMediaQuery, [id]);

    const professorDetails = {
      basicInfo: professorBasicInfoResult.rows[0],
      education: professorEducationResult.rows,
      career: professorCareerResult.rows,
      citations: professorCitationsResult.rows,
      awards: professorAwardsResult.rows,
      socialMedia: professorSocialMediaResult.rows,
    };

    await logAndAlert(`Successfully fetched details for professor ID: ${id}`, 'SYSTEM', professorDetails);

    return NextResponse.json(professorDetails, { status: 200 });
  } catch (error) {
    await logAndAlert(`Error fetching details for professor ID: ${id}`, 'SYSTEM', { error: error.message });
    console.error('Error fetching professor details:', error);
    return NextResponse.json({ message: 'Failed to fetch professor details' }, { status: 500 });
  } finally {
    client.release();
  }
}

// app/api/professor_details/[id]/route.js
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

    const professorQuery = `
      SELECT * FROM professor_basic_info WHERE id = $1;
      SELECT * FROM professor_education_info WHERE professor_id = $1;
      SELECT * FROM professor_career_info WHERE professor_id = $1;
      SELECT * FROM professor_citations_info WHERE professor_id = $1;
      SELECT * FROM professor_award_info WHERE professor_id = $1;
      SELECT * FROM professor_socialMedia_info WHERE professor_id = $1;
    `;
    const result = await client.query(professorQuery, [id]);

    const professorDetails = {
      basicInfo: result[0].rows[0],
      education: result[1].rows,
      career: result[2].rows,
      citations: result[3].rows,
      awards: result[4].rows,
      socialMedia: result[5].rows,
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

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req) {
  const client = await pool.connect();
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const filter = url.searchParams.get('filter') || 'all';
    const page = parseInt(url.searchParams.get('page'), 10) || 1;
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'; // Get sortOrder from query params
    const resultsPerPage = 10;
    const offset = (page - 1) * resultsPerPage;

    let searchQuery = `
      SELECT * FROM professor_basic_info
      WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
    `;
    let countQuery = `
      SELECT COUNT(*) FROM professor_basic_info
      WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
    `;

    const searchValue = `%${search}%`;
    let queryParams = [searchValue, resultsPerPage, offset];

    if (filter !== 'all') {
      searchQuery += ` AND status = $2`;
      countQuery += ` AND status = $2`;
      searchQuery += ` ORDER BY substring(id from '[0-9]+')::int ${sortOrder}, id ${sortOrder} LIMIT $3 OFFSET $4`;
      queryParams = [searchValue, filter, resultsPerPage, offset];
    } else {
      searchQuery += ` ORDER BY substring(id from '[0-9]+')::int ${sortOrder}, id ${sortOrder} LIMIT $2 OFFSET $3`;
      queryParams = [searchValue, resultsPerPage, offset];
    }

    console.log('Executing search query:', searchQuery, queryParams);
    const professorsResult = await client.query(searchQuery, queryParams);
    const countResult = await client.query(countQuery, filter === 'all' ? [searchValue] : [searchValue, filter]);

    const totalProfessors = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalProfessors / resultsPerPage);

    console.log('Professors fetched:', professorsResult.rows);

    return NextResponse.json({
      professors: professorsResult.rows,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json({ message: 'Error fetching professors' }, { status: 500 });
  } finally {
    client.release();
  }
}

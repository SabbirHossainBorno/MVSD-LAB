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
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'; 
    const resultsPerPage = 12; // Set to 12 results per page
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
    let queryParams = [searchValue];

    if (filter !== 'all') {
      searchQuery += ` AND status ILIKE $2`;
      countQuery += ` AND status ILIKE $2`;
      queryParams.push(filter); // Add filter to params
    }

    // Add ordering and pagination
    searchQuery += ` ORDER BY substring(id from '[0-9]+')::int ${sortOrder}, id ${sortOrder} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(resultsPerPage, offset); // Add pagination parameters

    // Log the search query and parameters
    console.log('Search Query:', searchQuery);
    console.log('Query Params:', queryParams);

    // Execute queries
    const professorsResult = await client.query(searchQuery, queryParams);
    const countResult = await client.query(countQuery, queryParams.slice(0, filter !== 'all' ? 2 : 1));

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

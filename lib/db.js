// lib/db.js
import { Pool } from 'pg';

let pool;

// Create and export the database connection pool
export const getDbConnection = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false, // Disable SSL
      max: 20, // Max number of clients in the pool, adjust as needed
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Wait 2 seconds for a new connection before timing out
    });
    console.log('Database connection pool created.');
  }
  return pool;
};

// Function to query the database with the provided SQL text and params
export const query = async (text, params) => {
  const client = await getDbConnection().connect(); // Get a client from the pool
  try {
    const res = await client.query(text, params); // Execute the query
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database query failed: ' + error.message);
  } finally {
    client.release(); // Release the client back to the pool
  }
};

// Function to close the pool when the application shuts down
export const closeDbConnectionPool = async () => {
  if (pool) {
    await pool.end();
    console.log('Database connection pool closed.');
  }
};

// Graceful shutdown example
process.on('SIGINT', async () => {
  await closeDbConnectionPool();
  process.exit(0); // Ensure the app exits gracefully
});
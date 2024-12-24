// lib/db.js
import { Pool } from 'pg';

let pool;

// Create and export the database connection pool
export const getDbConnection = () => {
  if (!pool) {
    console.log('Initializing a new database connection pool...');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false,  // Disable SSL connection
      max: 20, // Max number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Wait 2 seconds for a new connection before timing out
    });
  } else {
    console.log('Reusing existing database connection pool...');
  }
  return pool;
};

/**
 * Function to query the database with the provided SQL text and params.
 * @param {string} text - The SQL query text.
 * @param {array} params - The parameters for the query.
 * @returns {object} - Query result.
 */
export const query = async (text, params) => {
  const client = await getDbConnection().connect(); // Get a client from the pool
  try {
    console.log(`[QUERY] Executing: ${text} | Params: ${JSON.stringify(params)}`);
    const res = await client.query(text, params); // Execute the query
    return res;
  } catch (error) {
    console.error(`[ERROR] Database query failed:`, {
      query: text,
      params,
      error: error.message,
    });

    // Enhanced error handling
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Database connection refused. Please check if the database server is running.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Database query timed out. Please check your database connection.');
    } else {
      throw new Error('Database query failed: ' + error.message);
    }
  } finally {
    client.release(); // Release the client back to the pool
    console.log(`[QUERY] Client released.`);
  }
};

/**
 * Function to close the pool when the application shuts down.
 */
export const closeDbConnectionPool = async () => {
  if (pool) {
    await pool.end();
    console.log('Database connection pool closed.');
  }
};

/**
 * Graceful shutdown handler.
 */
process.on('SIGINT', async () => {
  console.log('Application is shutting down. Closing database connection pool...');
  await closeDbConnectionPool();
  process.exit(0); // Ensure the app exits gracefully
});

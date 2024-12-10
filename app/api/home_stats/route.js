//app/api/home_stats/route.js

import { Pool } from "pg";
import axios from "axios";

// Initialize the PostgreSQL database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this is set correctly in environment variables
});

// Helper function to call the logAndAlert API
const logAndAlert = async (message, sessionId, details = {}) => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await axios.post(`${siteUrl}/api/log-and-alert`, { message, sessionId, details });
  } catch (error) {
    console.error('Failed to log and send alert:', error);
  }
};

// Handler for the GET request to fetch stats
export async function GET(request) {
  const sessionId = 'SYSTEM'; // A sessionId to track system actions
  try {
    // Log that the stats request has been initiated
    await logAndAlert("Fetching stats data [home_stats]", sessionId, { endpoint: "/api/home_stats" });

    // Connect to the database
    const client = await pool.connect();
    
    // Query to fetch the active professor count
    const professorResult = await client.query(
      "SELECT count(*) FROM professor_basic_info WHERE status = 'Active'"
    );
    const professorCount = professorResult.rows[0]?.count || 0;

    // Log the successful query and the fetched data
    await logAndAlert("Successfully fetched professor count [home_stats]", sessionId, { professorCount });

    // Return the fetched data as a JSON response
    return new Response(
      JSON.stringify({
        professorCount,
        // You can add more stats here in the future
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching stats data:", error);

    // Log the error
    await logAndAlert(`Error fetching stats data: ${error.message}`, sessionId, { error: error.message });

    // If any error occurs, send an error response
    return new Response(
      JSON.stringify({ error: "Failed to fetch stats data" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

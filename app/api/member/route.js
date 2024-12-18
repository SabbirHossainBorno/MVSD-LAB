///app/api/member/route.js

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

// Handler for the GET request to fetch professor details
export async function GET(request) {
  const sessionId = 'SYSTEM'; // A sessionId to track system actions
  try {
    // Log that the request has been initiated
    await logAndAlert("Fetching professor details [member]", sessionId, { endpoint: "/api/member" });

    // Connect to the database
    const client = await pool.connect();
    
    // Query to fetch professor details
    const professorResult = await client.query(
      "SELECT * FROM member WHERE type = 'Professor' AND status = 'Active'"
    );
    const professors = professorResult.rows;

    // Log the successful query and the fetched data
    await logAndAlert("Successfully fetched professor details [member]", sessionId, { professors });

    // Return the fetched data as a JSON response
    return new Response(
      JSON.stringify(professors),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching professor details:", error);

    // Log the error
    await logAndAlert(`Error fetching professor details: ${error.message}`, sessionId, { error: error.message });

    // If any error occurs, send an error response
    return new Response(
      JSON.stringify({ error: "Failed to fetch professor details" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
//app/api/home/publication_research/summary/route.js

import { query } from '../../../../../lib/db';
import logger from '../../../../../lib/logger';
import sendTelegramAlert from '../../../../../lib/telegramAlert';
import { NextResponse } from 'next/server';

const formatAlertMessage = (title, details) => {
  return `MVSD LAB PUBLICATION SUMMARY\n--------------------------\n${title}\n${details}`;
};

// Valid publication types for filtering
const validTypes = [
  'Conference Paper',
  'Journal Paper',
  'Book/Chapter',
  'Patent',
  'Project'
];

export async function GET(request) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';
  
  try {
    logger.info('Fetching publication summary data', {
      meta: {
        eid: '',
        sid: '',
        taskName: 'Publication - Summary',
        details: `Fetching publication summary from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    const tables = [
      'phd_candidate_pub_res_info',
      'masters_candidate_pub_res_info',
      'postdoc_candidate_pub_res_info'
    ];

    // Calculate time periods
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    
    const lastYear = new Date(now);
    lastYear.setFullYear(now.getFullYear() - 1);
    
    const last5Years = new Date(now);
    last5Years.setFullYear(now.getFullYear() - 5);

    // Initialize result structure
    const result = {
      lastWeek: { 'Conference Paper': 0, 'Journal Paper': 0, 'Book/Chapter': 0, 'Patent': 0, 'Project': 0 },
      lastMonth: { 'Conference Paper': 0, 'Journal Paper': 0, 'Book/Chapter': 0, 'Patent': 0, 'Project': 0 },
      lastYear: { 'Conference Paper': 0, 'Journal Paper': 0, 'Book/Chapter': 0, 'Patent': 0, 'Project': 0 },
      last5Years: { 'Conference Paper': 0, 'Journal Paper': 0, 'Book/Chapter': 0, 'Patent': 0, 'Project': 0 },
      overall: { 'Conference Paper': 0, 'Journal Paper': 0, 'Book/Chapter': 0, 'Patent': 0, 'Project': 0 },
      chartData: {
        labels: ['Conference Paper', 'Journal Paper', 'Book/Chapter', 'Patent', 'Project'],
        datasets: []
      },
      trendData: {
        labels: [],
        datasets: []
      }
    };

    // Process each table sequentially
    for (const table of tables) {
      const queryText = `
        SELECT 
          type,
          COUNT(*) AS count,
          COUNT(CASE WHEN created_at >= $1 THEN 1 END) AS last_week,
          COUNT(CASE WHEN created_at >= $2 THEN 1 END) AS last_month,
          COUNT(CASE WHEN created_at >= $3 THEN 1 END) AS last_year,
          COUNT(CASE WHEN created_at >= $4 THEN 1 END) AS last_5_years
        FROM ${table}
        WHERE type = ANY($5)
        GROUP BY type
      `;

      const params = [
        lastWeek.toISOString(),
        lastMonth.toISOString(),
        lastYear.toISOString(),
        last5Years.toISOString(),
        validTypes
      ];

      const { rows } = await query(queryText, params);
      
      // Aggregate results
      for (const row of rows) {
        const { type, count, last_week, last_month, last_year, last_5_years } = row;
        
        if (result.overall[type] !== undefined) {
          result.overall[type] += count;
          result.lastWeek[type] += last_week;
          result.lastMonth[type] += last_month;
          result.lastYear[type] += last_year;
          result.last5Years[type] += last_5_years;
        }
      }
    }

    // Prepare bar chart data
    const chartColors = [
      'rgba(54, 162, 235, 0.8)',   // Conference Paper - blue
      'rgba(75, 192, 192, 0.8)',   // Journal Paper - teal
      'rgba(153, 102, 255, 0.8)',  // Book/Chapter - purple
      'rgba(255, 159, 64, 0.8)',   // Patent - orange
      'rgba(255, 99, 132, 0.8)'    // Project - red
    ];
    
    const hoverColors = [
      'rgba(54, 162, 235, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(255, 99, 132, 1)'
    ];
    
    // Add datasets for each time period
    result.chartData.datasets = [
      {
        label: 'Last Week',
        data: [
          result.lastWeek['Conference Paper'],
          result.lastWeek['Journal Paper'],
          result.lastWeek['Book/Chapter'],
          result.lastWeek['Patent'],
          result.lastWeek['Project']
        ],
        backgroundColor: chartColors,
        borderColor: hoverColors,
        borderWidth: 1,
        barPercentage: 0.7,
        categoryPercentage: 0.6
      },
      {
        label: 'Last Month',
        data: [
          result.lastMonth['Conference Paper'],
          result.lastMonth['Journal Paper'],
          result.lastMonth['Book/Chapter'],
          result.lastMonth['Patent'],
          result.lastMonth['Project']
        ],
        backgroundColor: chartColors,
        borderColor: hoverColors,
        borderWidth: 1,
        barPercentage: 0.7,
        categoryPercentage: 0.6
      },
      {
        label: 'Last Year',
        data: [
          result.lastYear['Conference Paper'],
          result.lastYear['Journal Paper'],
          result.lastYear['Book/Chapter'],
          result.lastYear['Patent'],
          result.lastYear['Project']
        ],
        backgroundColor: chartColors,
        borderColor: hoverColors,
        borderWidth: 1,
        barPercentage: 0.7,
        categoryPercentage: 0.6
      },
      {
        label: 'Last 5 Years',
        data: [
          result.last5Years['Conference Paper'],
          result.last5Years['Journal Paper'],
          result.last5Years['Book/Chapter'],
          result.last5Years['Patent'],
          result.last5Years['Project']
        ],
        backgroundColor: chartColors,
        borderColor: hoverColors,
        borderWidth: 1,
        barPercentage: 0.7,
        categoryPercentage: 0.6
      },
      {
        label: 'Overall',
        data: [
          result.overall['Conference Paper'],
          result.overall['Journal Paper'],
          result.overall['Book/Chapter'],
          result.overall['Patent'],
          result.overall['Project']
        ],
        backgroundColor: chartColors,
        borderColor: hoverColors,
        borderWidth: 1,
        barPercentage: 0.7,
        categoryPercentage: 0.6
      }
    ];

    // Prepare trend data (last 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i).reverse();
    result.trendData.labels = years.map(year => year.toString());
    
    // Initialize yearly data
    const yearlyData = {
      'Conference Paper': Array(5).fill(0),
      'Journal Paper': Array(5).fill(0),
      'Book/Chapter': Array(5).fill(0),
      'Patent': Array(5).fill(0),
      'Project': Array(5).fill(0)
    };

    // Fetch yearly data
    for (const table of tables) {
      const trendQuery = `
        SELECT 
          EXTRACT(YEAR FROM created_at)::INTEGER AS year,
          type,
          COUNT(*) AS count
        FROM ${table}
        WHERE EXTRACT(YEAR FROM created_at) BETWEEN $1 AND $2
          AND type = ANY($3)
        GROUP BY year, type
      `;

      const trendParams = [
        currentYear - 4,
        currentYear,
        validTypes
      ];

      const { rows: trendRows } = await query(trendQuery, trendParams);
      
      // Aggregate yearly data
      for (const row of trendRows) {
        const { year, type, count } = row;
        const yearIndex = years.indexOf(year);
        if (yearIndex !== -1 && yearlyData[type]) {
          yearlyData[type][yearIndex] += count;
        }
      }
    }

    // Prepare trend datasets
    result.trendData.datasets = [
      {
        label: 'Conference Paper',
        data: yearlyData['Conference Paper'],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
        fill: false
      },
      {
        label: 'Journal Paper',
        data: yearlyData['Journal Paper'],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        fill: false
      },
      {
        label: 'Book/Chapter',
        data: yearlyData['Book/Chapter'],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.3,
        fill: false
      },
      {
        label: 'Patent',
        data: yearlyData['Patent'],
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.3,
        fill: false
      },
      {
        label: 'Project',
        data: yearlyData['Project'],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3,
        fill: false
      }
    ];

    logger.info('Successfully fetched publication summary data', {
      meta: {
        eid: '',
        sid: '',
        taskName: 'Publication - Summary',
        details: `Successfully fetched publication summary from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    return NextResponse.json(result);

  } catch (error) {
    const errorMessage = `Error fetching publication summary: ${error.message}`;
    
    await sendTelegramAlert(
      formatAlertMessage(
        'Error Fetching Publication Summary', 
        `IP: ${ipAddress}\nError: ${errorMessage}`
      )
    );
    
    logger.error('Error fetching publication summary', {
      meta: {
        eid: '',
        sid: '',
        taskName: 'Publication - Summary',
        details: `Error fetching publication summary from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });

    return NextResponse.json(
      { error: 'Failed to fetch publication summary data' },
      { status: 500 }
    );
  }
}
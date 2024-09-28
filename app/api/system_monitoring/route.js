import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import os from 'os';
import axios from 'axios';

// Helper function to call logAndAlert API
const logAndAlert = async (message, sessionId, details = {}) => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    await axios.post(`${siteUrl}/api/log-and-alert`, { message, sessionId, details });
  } catch (error) {
    console.error('Failed to log and send alert:', error);
  }
};

// Fetch system info
const getSystemInfo = () => {
  return new Promise((resolve, reject) => {
    exec('top -b -n1 | head -n 10', (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

// Fetch log monitoring data
const getLogMonitoring = () => {
  return new Promise((resolve, reject) => {
    exec('tail -n 100 /home/mvsd-lab/Log/mvsd_lab.log', (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

// Fetch current login info
const getCurrentLoginInfo = () => {
  return new Promise((resolve, reject) => {
    exec('who', (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

// Fetch system uptime
const getUptime = () => {
  return new Promise((resolve, reject) => {
    exec('uptime -p', (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

// Fetch network statistics
const getNetworkStats = () => {
  return new Promise((resolve, reject) => {
    exec('ifstat -q 1 1', (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

// Set up an interval for sending alerts every 5 minutes (300000 ms)
let logInterval = null;

export async function GET() {
  try {
    // Check if the interval is already running
    if (!logInterval) {
      logInterval = setInterval(async () => {
        console.log('Sending periodic system monitoring log every 5 minutes...');
        await logAndAlert('Periodic system monitoring log', 'SYSTEM');
      }, 300000); // 5 minutes in milliseconds
    }

    console.log('Fetching system monitoring data...');
    await logAndAlert('Fetching system monitoring data...', 'SYSTEM');

    const cpuUsage = os.loadavg(); // Gets 1, 5, and 15 minute load averages
    const ramUsage = {
      total: os.totalmem(),
      free: os.freemem(),
    };

    const storage = await new Promise((resolve, reject) => {
      exec('df -h', (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });

    const network = await getNetworkStats();
    const uptime = await getUptime();
    const topCommand = await getSystemInfo();
    const currentLoginInfo = await getCurrentLoginInfo();

    return NextResponse.json({
      cpuUsage,
      ramUsage,
      storage,
      network,
      uptime,
      topCommand,
      currentLoginInfo,
    });
  } catch (error) {
    console.error('Error fetching system monitoring data:', error);
    return NextResponse.error();
  }
}

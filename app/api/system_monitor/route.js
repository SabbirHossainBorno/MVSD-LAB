// app/api/system_monitor/route.js
import { NextResponse } from 'next/server';
import os from 'os';
import fs from 'fs';
import { exec } from 'child_process';
import { query } from '../../../lib/db';
import logger from '../../../lib/logger';
import sendTelegramAlert from '../../../lib/telegramAlert';

let cpuAlertSent = false;
let ramAlertSent = false;
let firstAccessAlertSent = false;
let cpuHighUsageStartTime = null;
let ramHighUsageStartTime = null;

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

const formatAlertMessage = (title, details) => {
  return `MVSD LAB DASHBOARD\n------------------------------------\n${title}\n${details}`;
};

const checkUsageAndSendAlert = async (usage, type, threshold, alertSentFlag, startTime, ipAddress) => {
  const currentTime = new Date().getTime();
  if (usage > threshold) {
    if (!startTime) {
      startTime = currentTime;
    }
    const elapsedTime = currentTime - startTime;
    if (elapsedTime >= 300000 && !alertSentFlag) { // 5 minutes in milliseconds
      const message = `${type} usage is over ${threshold}% for more than 5 minutes.`;
      await sendTelegramAlert(formatAlertMessage('System Monitor Alert', `IP: ${ipAddress}\n${message}`));
      logger.warn('System Monitor Alert', {
        meta: {
          eid: '',
          sid: '',
          taskName: 'System Monitor',
          details: `${message} from IP ${ipAddress}`
        }
      });
      if (type === 'CPU') cpuAlertSent = true;
      if (type === 'RAM') ramAlertSent = true;
    }
  } else {
    startTime = null;
    if (type === 'CPU') cpuAlertSent = false;
    if (type === 'RAM') ramAlertSent = false;
  }
  return startTime;
};

export async function GET(request) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'Unknown IP';
  const userAgent = request.headers.get('user-agent') || 'Unknown User-Agent';
  const sessionId = request.cookies.get('sessionId')?.value || 'Unknown Session';
  const eid = request.cookies.get('eid')?.value || 'Unknown EID';

  const data = {};

  try {
    // CPU Usage
    const cpuUsage = os.loadavg();
    const cpuUsagePercentage = (cpuUsage[0] / os.cpus().length) * 100;
    data.cpu = {
      usage: cpuUsagePercentage,
      load: cpuUsage[0]
    };

    // RAM Usage
    const totalMemory = os.totalmem() / (1024 ** 3); // Convert to GB
    const freeMemory = os.freemem() / (1024 ** 3); // Convert to GB
    const usedMemoryPercentage = ((totalMemory - freeMemory) / totalMemory) * 100;
    data.ram = {
      total: totalMemory.toFixed(2),
      free: freeMemory.toFixed(2),
      usedPercentage: usedMemoryPercentage.toFixed(2)
    };

    // Website Live Log
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const logFilePath = `/home/mvsd-lab/logs/mvsd-lab-${currentDate}.log`;
    const logData = fs.readFileSync(logFilePath, 'utf-8');
    data.websiteLog = logData.split('\n').slice(-100); // Get last 100 log entries

    // System Process
    const processList = await execCommand('top -b -n 1');
    data.process = processList;

    // Network
    const networkStats = await execCommand('vnstat -i eth0 --json'); // Specify the interface
    const networkData = JSON.parse(networkStats);
    const interfaceStats = networkData.interfaces[0].traffic.fiveminute;
    const latestStats = interfaceStats[interfaceStats.length - 1];
    const previousStats = interfaceStats[interfaceStats.length - 2];

    const downloadSpeedKBps = (latestStats.rx - previousStats.rx) / 300; // Convert to KB/s
    const uploadSpeedKBps = (latestStats.tx - previousStats.tx) / 300; // Convert to KB/s

    const downloadSpeedMbps = (downloadSpeedKBps * 0.008).toFixed(2); // Convert to Mb/s
    const uploadSpeedMbps = (uploadSpeedKBps * 0.008).toFixed(2); // Convert to Mb/s

    data.network = {
      download: downloadSpeedMbps,
      upload: uploadSpeedMbps
    };

    // Storage
    const storageStats = await execCommand('df -h');
    data.storage = storageStats;

    // Current Login Info
    const loginInfo = await execCommand('who');
    data.loginInfo = loginInfo;

    // Uptime
    const uptime = os.uptime();
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    data.uptime = `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`;

    logger.info('Fetched system data successfully', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch System Data',
        details: `Fetched system data from IP ${ipAddress} with User-Agent ${userAgent}`
      }
    });

    if (!firstAccessAlertSent) {
      await sendTelegramAlert(formatAlertMessage('System Monitor - API', `IP : ${ipAddress}\nStatus : 200`));
      firstAccessAlertSent = true;
      logger.info('First access alert sent', {
        meta: {
          eid,
          sid: sessionId,
          taskName: 'System Monitor',
          details: `First access alert sent from IP ${ipAddress} with User-Agent ${userAgent}`
        }
      });
    }

    cpuHighUsageStartTime = await checkUsageAndSendAlert(cpuUsagePercentage, 'CPU', 80, cpuAlertSent, cpuHighUsageStartTime, ipAddress);
    ramHighUsageStartTime = await checkUsageAndSendAlert(usedMemoryPercentage, 'RAM', 80, ramAlertSent, ramHighUsageStartTime, ipAddress);

    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = `Error fetching system data: ${error.message}`;
    await sendTelegramAlert(formatAlertMessage('System Monitor Error', `IP: ${ipAddress}\nError: ${errorMessage}`));
    logger.error('Error fetching system data', {
      meta: {
        eid,
        sid: sessionId,
        taskName: 'Fetch System Data',
        details: `Error fetching system data from IP ${ipAddress} with User-Agent ${userAgent}: ${error.message}`
      }
    });
    return NextResponse.json({ message: 'Failed to fetch system data' }, { status: 500 });
  }
}
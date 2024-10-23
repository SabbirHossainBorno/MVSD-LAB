// app/api/system_monitor/route.js
import { NextResponse } from 'next/server';
import os from 'os';
import fs from 'fs';
import { exec } from 'child_process';

// Helper function to execute shell commands
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

export async function GET(request) {
  const data = {};

  try {
    // CPU Usage
    const cpuUsage = os.loadavg();
    data.cpu = {
      usage: (cpuUsage[0] / os.cpus().length) * 100,
      load: cpuUsage[0]
    };

    // RAM Usage
    const totalMemory = os.totalmem() / (1024 ** 3); // Convert to GB
    const freeMemory = os.freemem() / (1024 ** 3); // Convert to GB
    data.ram = {
      total: totalMemory.toFixed(2),
      free: freeMemory.toFixed(2)
    };

    // Website Live Log
    const logFilePath = '/home/mvsd-lab/Log/mvsd_lab.log';
    const logData = fs.readFileSync(logFilePath, 'utf-8');
    data.websiteLog = logData.split('\n').slice(-100); // Get last 10 log entries

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

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching system data:', error);
    return NextResponse.error();
  }
}

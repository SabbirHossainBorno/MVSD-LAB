import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import os from 'os';
import path from 'path';
import { Server } from 'socket.io';

// Define the log file path
const logFilePath = path.join('/Log/mvsd_lab.log');

const monitoringData = {
  cpuUsage: 0,
  ramUsage: {
    total: 0,
    free: 0,
  },
  storage: '',
  network: {
    downloadSpeed: '',
    uploadSpeed: '',
  },
  uptime: '',
  topCommand: '',
  currentLoginInfo: '',
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
        console.error(`Error executing uptime: ${stderr}`);
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout.trim());
      }
    });
  });
};

// Fetch network statistics
const getNetworkStats = () => {
  return new Promise((resolve, reject) => {
    exec('ifstat -i eth0 1 1', (error, stdout, stderr) => { // Adjust the interface name as needed
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        const lines = stdout.trim().split('\n');
        const stats = lines[lines.length - 1].trim().split(/\s+/);
        resolve({
          downloadSpeed: stats[0],
          uploadSpeed: stats[1],
        });
      }
    });
  });
};

// Continuous monitoring function
const startMonitoring = () => {
  setInterval(async () => {
    try {
      const loadAvg = os.loadavg();
      const cpuCount = os.cpus().length;
      monitoringData.cpuUsage = ((loadAvg[0] / cpuCount) * 100).toFixed(2); // CPU usage in percentage

      monitoringData.ramUsage = {
        total: (os.totalmem() / (1024 ** 3)).toFixed(2), // Total memory in GB
        free: (os.freemem() / (1024 ** 3)).toFixed(2), // Free memory in GB
      };

      monitoringData.storage = await new Promise((resolve, reject) => {
        exec('df -h', (error, stdout, stderr) => {
          if (error) {
            reject(`Error: ${stderr}`);
          } else {
            resolve(stdout);
          }
        });
      });

      monitoringData.network = await getNetworkStats();
      monitoringData.uptime = await getUptime();
      monitoringData.topCommand = await getSystemInfo();
      monitoringData.currentLoginInfo = await getCurrentLoginInfo();
    } catch (error) {
      console.error('Error fetching system monitoring data:', error);
    }
  }, 1); // Fetch data every millisecond
};

// Start monitoring when the module is loaded
startMonitoring();

// Initialize WebSocket server
const io = new Server(3000); // Ensure this matches the port used in your client-side code

io.on('connection', (socket) => {
  console.log('Client connected');

  // Use tail -f command to monitor the log file
  const tailProcess = exec(`tail -f ${logFilePath}`);

  tailProcess.stdout.on('data', (data) => {
    io.emit('log', data);
    console.log(data);
  });

  tailProcess.stderr.on('data', (data) => {
    console.error('Error tailing log file:', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    tailProcess.kill(); // Stop the tail process when the client disconnects
  });
});

export async function GET() {
  return NextResponse.json(monitoringData);
}

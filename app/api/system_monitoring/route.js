import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import os from 'os';
import path from 'path';
import { Tail } from 'tail';
import { Server } from 'socket.io';

// Define the log file path
const logFilePath = path.join('/home/mvsd-lab/Log/mvsd_lab.log');

const monitoringData = {
  cpuUsage: [],
  ramUsage: {
    total: 0,
    free: 0,
  },
  storage: '',
  network: '',
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
    exec('ip -s link', (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

// Continuous monitoring function
const startMonitoring = () => {
  setInterval(async () => {
    try {
      const loadAvg = os.loadavg();
      monitoringData.cpuUsage = loadAvg;

      monitoringData.ramUsage = {
        total: os.totalmem(),
        free: os.freemem(),
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
  }, 1000); // Adjust the interval as needed
};

// Start monitoring when the module is loaded
startMonitoring();

// Initialize the Tail instance
const tail = new Tail(logFilePath);

// Function to start tailing the log file
const startTailingLog = (io) => {
  tail.on('line', (line) => {
    io.emit('log', line);
    console.log(line);
  });

  tail.on('error', (error) => {
    console.error('Error tailing log file:', error);
  });
};

// Initialize WebSocket server
const io = new Server(3000); // Adjust the port as needed

io.on('connection', (socket) => {
  console.log('Client connected');
  startTailingLog(io);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

export async function GET() {
  return NextResponse.json(monitoringData);
}

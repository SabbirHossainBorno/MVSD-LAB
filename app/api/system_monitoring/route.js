import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import os from 'os';
import path from 'path';
import { Server } from 'socket.io';

// Define the log file path
const logFilePath = path.join('/home/mvsd-lab/Log/mvsd_lab.log');

// Monitoring data structure
const monitoringData = {
  cpuUsage: 0,
  cpuLoad: 0,
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

// Fetch CPU load
const getCpuLoad = () => {
  return new Promise((resolve, reject) => {
    exec('uptime', (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        const loadAverage = stdout.match(/load average: ([\d.]+), ([\d.]+), ([\d.]+)/);
        if (loadAverage) {
          resolve({
            oneMinute: loadAverage[1],
            fiveMinutes: loadAverage[2],
            fifteenMinutes: loadAverage[3],
          });
        } else {
          resolve({ oneMinute: 'N/A', fiveMinutes: 'N/A', fifteenMinutes: 'N/A' });
        }
      }
    });
  });
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
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout.trim());
      }
    });
  });
};

// Fetch network statistics using sar and convert to Kbps
const getNetworkStats = () => {
  return new Promise((resolve, reject) => {
    exec('sar -n DEV 1 1', (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        const lines = stdout.trim().split('\n');
        const stats = lines.slice(-1)[0].trim().split(/\s+/);

        // Assuming eth0 or a similar network interface is present
        const ethIndex = stats.indexOf('eth0');
        if (ethIndex !== -1) {
          // The RX and TX bytes per second are typically in columns 5 and 6 in sar output for network interfaces
          const rxBytesPerSec = parseFloat(stats[4]); // RX bytes
          const txBytesPerSec = parseFloat(stats[5]); // TX bytes

          // Convert to Kbps (bytes per second * 8 bits / 1000 to convert to kilobits per second)
          const downloadSpeedKbps = (rxBytesPerSec * 8) / 1000;
          const uploadSpeedKbps = (txBytesPerSec * 8) / 1000;

          resolve({
            downloadSpeed: `${downloadSpeedKbps.toFixed(2)} Kbps`, // Show to 2 decimal places
            uploadSpeed: `${uploadSpeedKbps.toFixed(2)} Kbps`,
          });
        } else {
          resolve({ downloadSpeed: 'N/A', uploadSpeed: 'N/A' });
        }
      }
    });
  });
};

// Continuous monitoring function
const startMonitoring = () => {
  setInterval(async () => {
    try {
      const loadAvg = await getCpuLoad();
      monitoringData.cpuLoad = loadAvg;

      const cpuCount = os.cpus().length;
      monitoringData.cpuUsage = ((os.loadavg()[0] / cpuCount) * 100).toFixed(2);

      monitoringData.ramUsage = {
        total: (os.totalmem() / (1024 ** 3)).toFixed(2), // GB
        free: (os.freemem() / (1024 ** 3)).toFixed(2),   // GB
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

// Initialize WebSocket server
const io = new Server(3000); // Ensure this matches the port used in your client-side code

io.on('connection', (socket) => {
  console.log('Client connected');

  // Use tail -f command to monitor the log file
  const tailProcess = exec(`tail -f ${logFilePath}`);

  tailProcess.stdout.on('data', (data) => {
    io.emit('log', data); // Send log updates to the client
    console.log('Log data emitted:', data);
  });

  tailProcess.stderr.on('data', (data) => {
    console.error('Error tailing log file:', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    tailProcess.kill(); // Stop the tail process when the client disconnects
  });
});

// HTTP GET API to send monitoring data
export async function GET() {
  return NextResponse.json(monitoringData);
}

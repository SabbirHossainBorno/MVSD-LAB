import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import os from 'os';

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

const getLogMonitoring = () => {
  return new Promise((resolve, reject) => {
    exec('tail -n 10 /home/mvsd-lab/Log/mvsd_lab.log', (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

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

const getUptime = () => {
  return new Promise((resolve, reject) => {
    exec('uptime', (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

export async function GET() {
  try {
    const cpuUsage = os.loadavg();
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
    const network = await new Promise((resolve, reject) => {
      exec('ifstat -i eth0 1 1', (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
    const logMonitoring = await getLogMonitoring();
    const topCommand = await getSystemInfo();
    const currentLoginInfo = await getCurrentLoginInfo();
    const uptime = await getUptime();

    return NextResponse.json({
      cpuUsage,
      ramUsage,
      storage,
      network,
      logMonitoring,
      topCommand,
      currentLoginInfo,
      uptime,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

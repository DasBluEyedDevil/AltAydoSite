#!/usr/bin/env node

const { exec } = require('child_process');

// Get port from command line or default to 3000
const port = process.argv[2] || 3000;

const isWindows = process.platform === 'win32';

// Command to find process using the port
const findProcessCommand = isWindows
  ? `netstat -ano | findstr :${port} | findstr LISTENING`
  : `lsof -i :${port} -t`;

exec(findProcessCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`No process found running on port ${port}`);
    return;
  }

  if (stdout) {
    const killProcess = (pid) => {
      const killCommand = isWindows ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;

      exec(killCommand, (killError, killStdout, killStderr) => {
        if (killError) {
          console.error(`Failed to kill process with PID ${pid}:`, killStderr);
        } else {
          console.log(`Successfully terminated process with PID ${pid} running on port ${port}`);
        }
      });
    };

    if (isWindows) {
      // Parse Windows netstat output to get PIDs
      const lines = stdout.trim().split('\n');
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
          const pid = parts[parts.length - 1];
          killProcess(pid);
        }
      });
    } else {
      // For Unix/Linux/Mac, lsof directly returns PIDs
      const pids = stdout.trim().split('\n');
      pids.forEach(pid => {
        if (pid) killProcess(pid);
      });
    }
  }
});

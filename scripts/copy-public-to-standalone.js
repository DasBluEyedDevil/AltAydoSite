const fs = require('fs-extra');
const path = require('path');

console.log('Starting post-build script to copy public files to standalone output...');

const publicDir = path.join(process.cwd(), 'public');
const standalonePath = path.join(process.cwd(), '.next/standalone');
const standalonePubPath = path.join(standalonePath, 'public');

// If standalone directory exists (we're in standalone output mode)
if (fs.existsSync(standalonePath)) {
  console.log('Standalone output detected - copying public directory content to standalone build');
  
  // Create public dir in standalone if it doesn't exist
  if (!fs.existsSync(standalonePubPath)) {
    fs.mkdirSync(standalonePubPath, { recursive: true });
  }
  
  // Copy entire public folder to standalone output
  try {
    fs.copySync(publicDir, standalonePubPath, { overwrite: true });
    console.log('Successfully copied public directory to standalone output');
  } catch (err) {
    console.error('Error copying public directory:', err);
  }
} else {
  console.log('Standalone output directory not found - skipping public directory copy');
}

// Also copy to the server directory for good measure
const serverPublicPath = path.join(process.cwd(), '.next/server/public');
if (!fs.existsSync(serverPublicPath)) {
  fs.mkdirSync(serverPublicPath, { recursive: true });
}

try {
  fs.copySync(publicDir, serverPublicPath, { overwrite: true });
  console.log('Successfully copied public directory to server output');
} catch (err) {
  console.error('Error copying public directory to server:', err);
}

console.log('Post-build script completed!'); 
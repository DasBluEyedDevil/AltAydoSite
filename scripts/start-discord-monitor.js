#!/usr/bin/env node

/**
 * Script to manually start the Discord Role Monitor
 * Usage: node scripts/start-discord-monitor.js
 */

const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

async function startMonitor() {
  try {
    console.log('Starting Discord Role Monitor...');
    
    // Check required environment variables
    if (!process.env.DISCORD_BOT_TOKEN) {
      console.error('Error: DISCORD_BOT_TOKEN environment variable is required');
      process.exit(1);
    }
    
    if (!process.env.DISCORD_GUILD_ID) {
      console.error('Error: DISCORD_GUILD_ID environment variable is required');
      process.exit(1);
    }
    
    // Import and start the monitor
    const { initializeDiscordRoleMonitor } = require('../src/lib/discord-role-monitor-init');
    
    // Force enable the monitor
    process.env.DISCORD_ROLE_MONITOR_ENABLED = 'true';
    
    initializeDiscordRoleMonitor();
    
    console.log('Discord Role Monitor started successfully!');
    console.log('Monitor will check roles every 10 minutes.');
    console.log('Press Ctrl+C to stop the monitor.');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\nStopping Discord Role Monitor...');
      const { cleanupDiscordRoleMonitor } = require('../src/lib/discord-role-monitor-init');
      cleanupDiscordRoleMonitor();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start Discord Role Monitor:', error);
    process.exit(1);
  }
}

startMonitor();

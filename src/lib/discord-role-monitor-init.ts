import { getDiscordRoleMonitor } from './discord-role-monitor';

// Initialize Discord Role Monitor
// This should be called when the application starts
export function initializeDiscordRoleMonitor(): void {
  // Only start in production or when explicitly enabled
  const shouldStart = process.env.NODE_ENV === 'production' || 
                     process.env.DISCORD_ROLE_MONITOR_ENABLED === 'true';

  if (!shouldStart) {
    console.log('Discord role monitor not starting (not in production and not explicitly enabled)');
    return;
  }

  // Check if Discord is configured
  const discordToken = process.env.DISCORD_BOT_TOKEN;
  const discordGuildId = process.env.DISCORD_GUILD_ID;

  if (!discordToken || !discordGuildId) {
    console.warn('Discord role monitor not starting: DISCORD_BOT_TOKEN and DISCORD_GUILD_ID environment variables required');
    return;
  }

  try {
    const monitor = getDiscordRoleMonitor();
    monitor.start();
    console.log('Discord role monitor initialized and started');
  } catch (error) {
    console.error('Failed to initialize Discord role monitor:', error);
  }
}

// Cleanup function for graceful shutdown
export function cleanupDiscordRoleMonitor(): void {
  try {
    const monitor = getDiscordRoleMonitor();
    monitor.stop();
    console.log('Discord role monitor stopped');
  } catch (error) {
    console.error('Error stopping Discord role monitor:', error);
  }
}

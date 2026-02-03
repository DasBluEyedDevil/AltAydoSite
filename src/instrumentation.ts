/**
 * Next.js Instrumentation Hook
 *
 * Runs once on server startup. Used to initialize background processes
 * like the ship sync cron scheduler.
 *
 * Next.js 15 supports instrumentation.ts in src/ without experimental flags.
 * Dynamic import is used to keep node-cron out of the Edge runtime bundle.
 */
export async function register() {
  // Only run cron scheduler on the Node.js server runtime
  // (not during build, not in Edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startShipSyncCron } = await import('./lib/ship-sync');
    startShipSyncCron();
  }
}

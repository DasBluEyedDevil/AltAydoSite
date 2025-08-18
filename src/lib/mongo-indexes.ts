import type { Db } from 'mongodb';

/**
 * Ensure commonly used indexes exist. This function is idempotent and safe to run multiple times.
 * It catches and logs errors without throwing to avoid impacting runtime behavior.
 */
export async function ensureMongoIndexes(db: Db): Promise<void> {
  try {
    const users = db.collection('users');
    // Non-unique indexes for safety (unique may fail if data already contains duplicates)
    await Promise.all([
      users.createIndex({ id: 1 }).catch(() => {}),
      users.createIndex({ email: 1 }).catch(() => {}),
      users.createIndex({ aydoHandle: 1 }).catch(() => {}),
      users.createIndex({ emailLower: 1 }).catch(() => {}),
      users.createIndex({ aydoHandleLower: 1 }).catch(() => {}),
    ]);
  } catch (err) {
    console.warn('Index setup (users) skipped or failed:', err);
  }

  try {
    const tokens = db.collection('resetTokens');
    await Promise.all([
      tokens.createIndex({ token: 1 }).catch(() => {}),
      tokens.createIndex({ expiresAt: 1 }).catch(() => {}),
      tokens.createIndex({ used: 1 }).catch(() => {}),
      // TTL index requires a Date field; add if `expiresAtDate` is present
      tokens.createIndex({ expiresAtDate: 1 }, { expireAfterSeconds: 0 }).catch(() => {}),
    ]);
  } catch (err) {
    console.warn('Index setup (resetTokens) skipped or failed:', err);
  }

  try {
    const transactions = db.collection('transactions');
    await Promise.all([
      transactions.createIndex({ submittedAt: -1 }).catch(() => {}),
      transactions.createIndex({ submittedBy: 1, submittedAt: -1 }).catch(() => {}),
    ]);
  } catch (err) {
    console.warn('Index setup (transactions) skipped or failed:', err);
  }

  try {
    const missionImages = db.collection('missionImages');
    await Promise.all([
      missionImages.createIndex({ missionId: 1 }).catch(() => {}),
      missionImages.createIndex({ uploadedAt: -1 }).catch(() => {}),
    ]);
  } catch (err) {
    console.warn('Index setup (missionImages) skipped or failed:', err);
  }

  try {
    const missions = db.collection('missions');
    await Promise.all([
      missions.createIndex({ leaderId: 1, createdAt: -1 }).catch(() => {}),
      missions.createIndex({ status: 1, plannedDateTime: -1 }).catch(() => {}),
    ]);
  } catch (err) {
    console.warn('Index setup (missions) skipped or failed:', err);
  }
}



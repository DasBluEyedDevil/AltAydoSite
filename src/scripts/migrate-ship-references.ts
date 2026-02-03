/**
 * Ship Reference Migration Script
 *
 * Converts all ship references across five entity types (users, missions,
 * operations, resources, planned missions) from name strings to FleetYards
 * UUIDs. After running this script, every ship reference in the system will
 * have a `fleetyardsId` field that resolves to a valid ship document in the
 * `ships` collection.
 *
 * Usage:
 *   npm run migrate-ships              # Live migration (writes to storage)
 *   npm run migrate-ships -- --dry-run  # Preview changes without writing
 *
 * Collections migrated:
 *   1. Users        (user-storage API -- handles MongoDB/local fallback)
 *   2. Missions     (MongoDB via connectToDatabase)
 *   3. Planned Missions (MongoDB via connectToDatabase)
 *   4. Operations   (local JSON: data/operations.json)
 *   5. Resources    (local JSON: data/resources.json)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as userStorage from '../lib/user-storage';
import { connectToDatabase } from '../lib/mongodb';
import {
  buildShipsIndex,
  resolveShipName,
  UUID_REGEX,
  ShipsIndex,
} from '../lib/ship-name-matcher';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CollectionReport {
  total: number;
  updated: number;
  skipped: number;   // already migrated or no ships
  failed: number;
}

interface MigrationMapping {
  collection: string;
  documentId: string;
  fieldPath: string;     // e.g., "ships[0].name", "participants[2].shipName"
  originalName: string;
  resolvedName: string;
  fleetyardsId: string;
  strategy: string;
}

interface UnmatchedEntry {
  collection: string;
  documentId: string;
  fieldPath: string;
  name: string;
}

interface MigrationReport {
  startedAt: string;
  completedAt?: string;
  dryRun: boolean;
  collections: Record<string, CollectionReport>;
  mappings: MigrationMapping[];
  unmatchedNames: UnmatchedEntry[];
  totalProcessed: number;
  totalUpdated: number;
  totalSkipped: number;
  totalFailed: number;
}

// ---------------------------------------------------------------------------
// User Ships Migration
// ---------------------------------------------------------------------------

async function migrateUserShips(
  index: ShipsIndex,
  report: MigrationReport,
  dryRun: boolean
): Promise<void> {
  console.log('\nMIGRATION: [users] Starting user ships migration...');

  const collectionReport: CollectionReport = {
    total: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  try {
    const users = await userStorage.getAllUsers();
    console.log(`MIGRATION: [users] Found ${users.length} users`);

    for (const user of users) {
      collectionReport.total++;

      if (!user.ships || user.ships.length === 0) {
        collectionReport.skipped++;
        continue;
      }

      let anyUpdated = false;
      const migratedShips = user.ships.map((ship, idx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shipAny = ship as any;

        // Idempotency check: skip if already migrated with valid UUID
        if (
          shipAny.fleetyardsId &&
          typeof shipAny.fleetyardsId === 'string' &&
          UUID_REGEX.test(shipAny.fleetyardsId)
        ) {
          collectionReport.skipped++;
          return ship;
        }

        const match = resolveShipName(ship.name, index);
        const fieldPath = `ships[${idx}].name`;

        if (match) {
          report.mappings.push({
            collection: 'users',
            documentId: user.id,
            fieldPath,
            originalName: ship.name,
            resolvedName: match.matchedName,
            fleetyardsId: match.fleetyardsId,
            strategy: match.strategy,
          });
          anyUpdated = true;
          return { ...ship, fleetyardsId: match.fleetyardsId };
        } else {
          report.unmatchedNames.push({
            collection: 'users',
            documentId: user.id,
            fieldPath,
            name: ship.name,
          });
          return ship;
        }
      });

      if (anyUpdated) {
        if (!dryRun) {
          try {
            await userStorage.updateUser(user.id, { ships: migratedShips as typeof user.ships });
            collectionReport.updated++;
          } catch (err) {
            console.error(`MIGRATION: [users] Failed to update user ${user.id}:`, err);
            collectionReport.failed++;
          }
        } else {
          collectionReport.updated++;
        }
      } else {
        collectionReport.skipped++;
      }
    }
  } catch (err) {
    console.error('MIGRATION: [users] Error reading users:', err);
    collectionReport.failed++;
  }

  report.collections.users = collectionReport;
  console.log(
    `MIGRATION: [users] Done -- ${collectionReport.total} total, ` +
    `${collectionReport.updated} updated, ${collectionReport.skipped} skipped, ` +
    `${collectionReport.failed} failed`
  );
}

// ---------------------------------------------------------------------------
// Missions Migration
// ---------------------------------------------------------------------------

async function migrateMissions(
  index: ShipsIndex,
  report: MigrationReport,
  dryRun: boolean
): Promise<void> {
  console.log('\nMIGRATION: [missions] Starting missions migration...');

  const collectionReport: CollectionReport = {
    total: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  try {
    const { db } = await connectToDatabase();
    const missions = await db.collection('missions').find({}).toArray();
    console.log(`MIGRATION: [missions] Found ${missions.length} missions`);

    for (const mission of missions) {
      collectionReport.total++;

      const participants = mission.participants as Array<Record<string, unknown>> | undefined;
      if (!participants || participants.length === 0) {
        collectionReport.skipped++;
        continue;
      }

      let anyUpdated = false;
      const updatedParticipants = participants.map((participant, idx) => {
        const shipName = participant.shipName as string | undefined;
        if (!shipName) {
          return participant;
        }

        // Idempotency check
        if (
          participant.fleetyardsId &&
          typeof participant.fleetyardsId === 'string' &&
          UUID_REGEX.test(participant.fleetyardsId as string)
        ) {
          collectionReport.skipped++;
          return participant;
        }

        const match = resolveShipName(shipName, index);
        const fieldPath = `participants[${idx}].shipName`;

        if (match) {
          report.mappings.push({
            collection: 'missions',
            documentId: mission.id as string,
            fieldPath,
            originalName: shipName,
            resolvedName: match.matchedName,
            fleetyardsId: match.fleetyardsId,
            strategy: match.strategy,
          });
          anyUpdated = true;
          return { ...participant, fleetyardsId: match.fleetyardsId };
        } else {
          report.unmatchedNames.push({
            collection: 'missions',
            documentId: mission.id as string,
            fieldPath,
            name: shipName,
          });
          return participant;
        }
      });

      if (anyUpdated) {
        if (!dryRun) {
          try {
            await db.collection('missions').updateOne(
              { id: mission.id },
              { $set: { participants: updatedParticipants } }
            );
            collectionReport.updated++;
          } catch (err) {
            console.error(`MIGRATION: [missions] Failed to update mission ${mission.id}:`, err);
            collectionReport.failed++;
          }
        } else {
          collectionReport.updated++;
        }
      } else {
        collectionReport.skipped++;
      }
    }
  } catch (err) {
    console.error('MIGRATION: [missions] Error:', err);
    collectionReport.failed++;
  }

  report.collections.missions = collectionReport;
  console.log(
    `MIGRATION: [missions] Done -- ${collectionReport.total} total, ` +
    `${collectionReport.updated} updated, ${collectionReport.skipped} skipped, ` +
    `${collectionReport.failed} failed`
  );
}

// ---------------------------------------------------------------------------
// Planned Missions Migration
// ---------------------------------------------------------------------------

async function migratePlannedMissions(
  index: ShipsIndex,
  report: MigrationReport,
  dryRun: boolean
): Promise<void> {
  console.log('\nMIGRATION: [planned-missions] Starting planned missions migration...');

  const collectionReport: CollectionReport = {
    total: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  try {
    const { db } = await connectToDatabase();
    const plannedMissions = await db.collection('planned-missions').find({}).toArray();
    console.log(`MIGRATION: [planned-missions] Found ${plannedMissions.length} planned missions`);

    for (const mission of plannedMissions) {
      collectionReport.total++;

      const ships = mission.ships as Array<Record<string, unknown>> | undefined;
      if (!ships || ships.length === 0) {
        collectionReport.skipped++;
        continue;
      }

      let anyUpdated = false;
      const updatedShips = ships.map((ship, idx) => {
        const shipName = ship.shipName as string | undefined;
        if (!shipName) {
          return ship;
        }

        // Idempotency check
        if (
          ship.fleetyardsId &&
          typeof ship.fleetyardsId === 'string' &&
          UUID_REGEX.test(ship.fleetyardsId as string)
        ) {
          collectionReport.skipped++;
          return ship;
        }

        const match = resolveShipName(shipName, index);
        const fieldPath = `ships[${idx}].shipName`;

        if (match) {
          report.mappings.push({
            collection: 'planned-missions',
            documentId: mission.id as string,
            fieldPath,
            originalName: shipName,
            resolvedName: match.matchedName,
            fleetyardsId: match.fleetyardsId,
            strategy: match.strategy,
          });
          anyUpdated = true;
          return { ...ship, fleetyardsId: match.fleetyardsId };
        } else {
          report.unmatchedNames.push({
            collection: 'planned-missions',
            documentId: mission.id as string,
            fieldPath,
            name: shipName,
          });
          return ship;
        }
      });

      if (anyUpdated) {
        if (!dryRun) {
          try {
            await db.collection('planned-missions').updateOne(
              { id: mission.id },
              { $set: { ships: updatedShips } }
            );
            collectionReport.updated++;
          } catch (err) {
            console.error(`MIGRATION: [planned-missions] Failed to update mission ${mission.id}:`, err);
            collectionReport.failed++;
          }
        } else {
          collectionReport.updated++;
        }
      } else {
        collectionReport.skipped++;
      }
    }
  } catch (err) {
    console.error('MIGRATION: [planned-missions] Error:', err);
    collectionReport.failed++;
  }

  report.collections.plannedMissions = collectionReport;
  console.log(
    `MIGRATION: [planned-missions] Done -- ${collectionReport.total} total, ` +
    `${collectionReport.updated} updated, ${collectionReport.skipped} skipped, ` +
    `${collectionReport.failed} failed`
  );
}

// ---------------------------------------------------------------------------
// Operations Migration (stub -- Task 2)
// ---------------------------------------------------------------------------

async function migrateOperations(
  _index: ShipsIndex,
  _report: MigrationReport,
  _dryRun: boolean
): Promise<void> {
  console.log('\nMIGRATION: [operations] -- handler pending (Task 2)');
}

// ---------------------------------------------------------------------------
// Resources Migration (stub -- Task 2)
// ---------------------------------------------------------------------------

async function migrateResources(
  _index: ShipsIndex,
  _report: MigrationReport,
  _dryRun: boolean
): Promise<void> {
  console.log('\nMIGRATION: [resources] -- handler pending (Task 2)');
}

// ---------------------------------------------------------------------------
// Report Printer (stub -- Task 2)
// ---------------------------------------------------------------------------

function printReport(_report: MigrationReport): void {
  console.log('\nMIGRATION: Report printing pending (Task 2)');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');

  if (dryRun) {
    console.log('MIGRATION: Running in DRY-RUN mode (no writes)');
  } else {
    console.log('MIGRATION: Running in LIVE mode');
  }

  // Build the ships lookup index
  const index = await buildShipsIndex();
  console.log(`MIGRATION: Loaded ${index.byName.size} ships into lookup index`);

  // Initialize report
  const report: MigrationReport = {
    startedAt: new Date().toISOString(),
    dryRun,
    collections: {},
    mappings: [],
    unmatchedNames: [],
    totalProcessed: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalFailed: 0,
  };

  // Run each collection migration sequentially
  await migrateUserShips(index, report, dryRun);
  await migrateMissions(index, report, dryRun);
  await migratePlannedMissions(index, report, dryRun);
  await migrateOperations(index, report, dryRun);
  await migrateResources(index, report, dryRun);

  // Compute totals
  report.completedAt = new Date().toISOString();
  for (const key of Object.keys(report.collections)) {
    const col = report.collections[key];
    report.totalProcessed += col.total;
    report.totalUpdated += col.updated;
    report.totalSkipped += col.skipped;
    report.totalFailed += col.failed;
  }

  // Print the report
  printReport(report);

  // Exit code: 0 if no unmatched, 1 if any unmatched
  if (report.unmatchedNames.length > 0) {
    console.log(`\nMIGRATION: Exiting with code 1 (${report.unmatchedNames.length} unmatched names)`);
    process.exit(1);
  } else {
    console.log('\nMIGRATION: Exiting with code 0 (all names matched)');
    process.exit(0);
  }
}

// ---------------------------------------------------------------------------
// Module guard
// ---------------------------------------------------------------------------

if (require.main === module) {
  main().catch((err) => {
    console.error('MIGRATION: Fatal error:', err);
    process.exit(1);
  });
}

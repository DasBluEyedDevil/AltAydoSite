import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { getDiscordService } from '@/lib/discord';
import * as userStorage from '../lib/user-storage';

/**
 * Assign a standard synchronization role ("Synced to AydoDB") to every user
 * in the database who has a Discord presence (discordId or resolvable discordName).
 *
 * Env Vars:
 *  DISCORD_BOT_TOKEN (required)
 *  DISCORD_GUILD_ID (required)
 *  DISCORD_SYNCED_ROLE_NAME (optional, default: "Synced to AydoDB")
 *  DRY_RUN=true (optional; if set, no changes are made)
 *  ROLE_ASSIGN_DELAY_MS=750 (optional pacing between assignments)
 */

// Configuration
const ROLE_NAME = process.env.DISCORD_SYNCED_ROLE_NAME || 'Synced to AydoDB';
const DRY_RUN = process.env.DRY_RUN === 'true';
const PER_USER_DELAY_MS = parseInt(process.env.ROLE_ASSIGN_DELAY_MS || '750', 10); // basic pacing

function loadEnvFiles() {
  const envFiles = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), 'env.local'),
    path.join(process.cwd(), '.env')
  ];
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      content.split('\n').forEach(line => {
        if (!line || line.startsWith('#')) return;
        const [k, ...rest] = line.split('=');
        if (k && rest.length) {
          const v = rest.join('=').trim();
          if (!process.env[k]) process.env[k] = v;
        }
      });
    }
  }
}

async function main() {
  console.log('=== Assign Synced Role Script Start ===');
  loadEnvFiles();

  if (!process.env.DISCORD_BOT_TOKEN || !process.env.DISCORD_GUILD_ID) {
    console.error('Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID env vars.');
    process.exit(1);
  }

  console.log(`Role to assign: "${ROLE_NAME}"`);
  console.log(`Dry run: ${DRY_RUN}`);
  console.log(`Per-user delay (ms): ${PER_USER_DELAY_MS}`);

  // Fetch users
  const allUsers = await userStorage.getAllUsers();
  const targetUsers = allUsers.filter(u => !!u.discordId || !!u.discordName);
  console.log(`Total users: ${allUsers.length}`);
  console.log(`Users with discordId or discordName: ${targetUsers.length}`);

  if (targetUsers.length === 0) {
    console.log('No users with Discord data found. Exiting.');
    return;
  }

  const discord = getDiscordService();
  await discord.initializeBot();

  const role = await discord.ensureRoleByName(ROLE_NAME);
  console.log(`Using role: ${role.name} (${role.id})`);

  const summary = { attempted: 0, added: 0, skippedAlreadyHas: 0, memberMissing: 0, errors: 0, resolvedIds: 0 };

  for (const user of targetUsers) {
    summary.attempted++;
    let discordId = user.discordId || undefined;
    try {
      if (!discordId && user.discordName) {
        const memberByName = await discord.getMemberByName(user.discordName);
        if (memberByName) {
          discordId = memberByName.id;
          summary.resolvedIds++;
          console.log(`Resolved missing discordId for ${user.aydoHandle}: ${discordId}`);
          if (!DRY_RUN) {
            await userStorage.updateUser(user.id, { discordId, updatedAt: new Date().toISOString() });
          }
        }
      }
      if (!discordId) {
        console.log(`Skipping ${user.aydoHandle}: no discordId.`);
        continue;
      }
      if (DRY_RUN) {
        console.log(`[DRY-RUN] Would assign role to ${user.aydoHandle}`);
      } else {
        const result = await discord.assignRoleToMember(discordId, role);
        if (result.added) {
          summary.added++;
          console.log(`Added role to ${user.aydoHandle}`);
        } else if (result.reason === 'already_has_role') {
          summary.skippedAlreadyHas++;
          console.log(`Already has role: ${user.aydoHandle}`);
        } else if (result.reason === 'member_not_found') {
          summary.memberMissing++;
          console.log(`Member not found for ${user.aydoHandle}`);
        } else {
          console.log(`No change for ${user.aydoHandle}: ${result.reason}`);
        }
      }
    } catch (e: any) {
      summary.errors++;
      console.error(`Error for ${user.aydoHandle}:`, e?.message || e);
    }
    if (!DRY_RUN && PER_USER_DELAY_MS > 0) {
      await new Promise(r => setTimeout(r, PER_USER_DELAY_MS));
    }
  }

  console.log('=== Summary ===');
  console.log(summary);
  await discord.cleanup();
  console.log('Done.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

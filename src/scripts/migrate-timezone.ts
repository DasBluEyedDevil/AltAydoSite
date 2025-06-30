/**
 * Migration script to add timezone field to existing users
 * Run this once to update all existing users with a default timezone
 */

import * as userStorage from '../lib/user-storage';

async function migrateUserTimezones() {
  console.log('🚀 Starting timezone migration...');
  
  try {
    // Get all users
    const users = await userStorage.getAllUsers();
    console.log(`📊 Found ${users.length} users to check`);
    
    let migratedCount = 0;
    let alreadyHadTimezone = 0;
    
    for (const user of users) {
      if (!user.timezone) {
        console.log(`⏰ Migrating user ${user.aydoHandle} (ID: ${user.id}) - adding default UTC timezone`);
        
        try {
          await userStorage.updateUser(user.id, {
            timezone: 'UTC'
          });
          migratedCount++;
          console.log(`✅ Successfully updated ${user.aydoHandle}`);
        } catch (error) {
          console.error(`❌ Failed to update ${user.aydoHandle}:`, error);
        }
      } else {
        console.log(`⏭️  User ${user.aydoHandle} already has timezone: ${user.timezone}`);
        alreadyHadTimezone++;
      }
    }
    
    console.log('\n📈 Migration Summary:');
    console.log(`✅ Users migrated: ${migratedCount}`);
    console.log(`⏭️  Users already had timezone: ${alreadyHadTimezone}`);
    console.log(`📊 Total users processed: ${users.length}`);
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const updatedUsers = await userStorage.getAllUsers();
    const usersWithoutTimezone = updatedUsers.filter(u => !u.timezone);
    
    if (usersWithoutTimezone.length === 0) {
      console.log('✅ Migration verification passed! All users now have timezone field.');
    } else {
      console.log(`❌ Migration verification failed! ${usersWithoutTimezone.length} users still missing timezone:`);
      usersWithoutTimezone.forEach(u => {
        console.log(`  - ${u.aydoHandle} (ID: ${u.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Test timezone persistence for a specific user
async function testTimezonePersistence(userHandle: string) {
  console.log(`\n🧪 Testing timezone persistence for user: ${userHandle}`);
  
  try {
    // Get user by handle
    const user = await userStorage.getUserByHandle(userHandle);
    if (!user) {
      console.log(`❌ User not found: ${userHandle}`);
      return;
    }
    
    console.log(`📋 Current user timezone: ${user.timezone}`);
    
    // Test timezone update
    const testTimezone = 'America/New_York';
    console.log(`🔄 Testing update to: ${testTimezone}`);
    
    const updatedUser = await userStorage.updateUser(user.id, {
      timezone: testTimezone
    });
    
    if (updatedUser && updatedUser.timezone === testTimezone) {
      console.log(`✅ Update successful! Timezone now: ${updatedUser.timezone}`);
      
      // Verify persistence by re-fetching
      const refetchedUser = await userStorage.getUserById(user.id);
      if (refetchedUser && refetchedUser.timezone === testTimezone) {
        console.log(`✅ Persistence verified! Timezone persisted as: ${refetchedUser.timezone}`);
      } else {
        console.log(`❌ Persistence failed! Expected: ${testTimezone}, Got: ${refetchedUser?.timezone}`);
      }
    } else {
      console.log(`❌ Update failed! Expected: ${testTimezone}, Got: ${updatedUser?.timezone}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === 'test') {
    const userHandle = args[1];
    if (!userHandle) {
      console.log('Usage: npm run migrate-timezone test <userHandle>');
      process.exit(1);
    }
    await testTimezonePersistence(userHandle);
  } else {
    await migrateUserTimezones();
  }
  
  console.log('\n🎉 Script completed!');
  process.exit(0);
}

// Run the migration
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

export { migrateUserTimezones, testTimezonePersistence }; 
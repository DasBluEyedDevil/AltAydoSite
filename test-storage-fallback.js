const userStorage = require('./src/lib/user-storage');

async function testStorage() {
  console.log('Testing user storage fallback...');
  try {
    const users = await userStorage.getAllUsers();
    console.log(`Successfully retrieved ${users.length} users from storage.`);
    if (userStorage.isUsingFallbackStorage()) {
      console.log('CONFIRMED: Using local fallback storage.');
    } else {
      console.log('NOTE: Connected to MongoDB (or mock was not triggered).');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStorage();

import bcrypt from 'bcrypt';

// The plaintext password to hash
const password = process.argv[2] || 'password123';

// Hash the password
async function hashPassword() {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Password Hash Generator');
    console.log('-----------------------');
    console.log(`Password: ${password}`);
    console.log(`Hashed Password: ${hashedPassword}`);
    console.log();
    console.log('For use in users.json:');
    console.log(`"passwordHash": "${hashedPassword}"`);
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

hashPassword(); 
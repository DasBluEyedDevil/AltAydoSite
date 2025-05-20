import dotenv from 'dotenv';
import path from 'path';
import { verifyEmailConfig } from '../lib/email-service';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('Verifying email configuration...');
  
  // Check required environment variables
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please check your .env.local file and add the missing variables.');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are present');
  console.log(`📧 Email configuration:
  - HOST: ${process.env.EMAIL_HOST}
  - PORT: ${process.env.EMAIL_PORT}
  - SECURE: ${process.env.EMAIL_SECURE || 'false'}
  - USER: ${process.env.EMAIL_USER}
  - PASSWORD: ${'*'.repeat(8)} (hidden)
  `);
  
  // Verify SMTP connection
  try {
    const isValid = await verifyEmailConfig();
    
    if (isValid) {
      console.log('✅ Email configuration is valid! SMTP connection successful.');
    } else {
      console.error('❌ Email configuration is invalid. Please check your settings.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error verifying email configuration:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 
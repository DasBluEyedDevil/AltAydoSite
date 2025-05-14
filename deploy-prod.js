// Production deployment checks and build script
// SECURITY NOTE: This project requires Next.js 14.2.4+ to address critical security vulnerabilities
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running pre-deployment checks...');

// Check for critical environment variables
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL'
];

// Check for security-critical package versions
const requiredVersions = {
  'next': '14.2.4' // Minimum version to address security vulnerabilities
};

// Build verification object
const verificationResults = {
  environmentVariables: {
    status: 'pending',
    details: []
  },
  securityVersions: {
    status: 'pending',
    details: []
  },
  database: {
    status: 'pending',
    details: []
  },
  build: {
    status: 'pending',
    details: []
  }
};

// Verify environment variables
console.log('✓ Checking environment variables...');
let envErrors = false;

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    verificationResults.environmentVariables.details.push(`❌ Missing ${envVar}`);
    envErrors = true;
  } else {
    verificationResults.environmentVariables.details.push(`✓ ${envVar} is set`);
  }
});

if (envErrors) {
  verificationResults.environmentVariables.status = 'failed';
  console.log('\n❌ Environment variable check failed!');
  console.log('Please set the following environment variables before deploying:');
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.log(`  - ${envVar}`);
    }
  });
} else {
  verificationResults.environmentVariables.status = 'passed';
  console.log('✓ All required environment variables are set.');
}

// Verify security-critical package versions
console.log('\n✓ Checking security-critical package versions...');
let versionErrors = false;

try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

  Object.entries(requiredVersions).forEach(([pkg, minVersion]) => {
    const currentVersion = packageJson.dependencies[pkg];
    if (!currentVersion) {
      verificationResults.securityVersions.details.push(`❌ Package ${pkg} not found in dependencies`);
      versionErrors = true;
    } else {
      // Remove any leading characters like ^ or ~ for version comparison
      const cleanVersion = currentVersion.replace(/[\^~]/, '');

      if (cleanVersion < minVersion) {
        verificationResults.securityVersions.details.push(`❌ ${pkg} version ${cleanVersion} is below minimum required version ${minVersion}`);
        versionErrors = true;
      } else {
        verificationResults.securityVersions.details.push(`✓ ${pkg} version ${cleanVersion} meets security requirements`);
      }
    }
  });

  if (versionErrors) {
    verificationResults.securityVersions.status = 'failed';
    console.log('\n❌ Security version check failed!');
    console.log('Please update the following packages to their minimum required versions:');
    Object.entries(requiredVersions).forEach(([pkg, minVersion]) => {
      console.log(`  - ${pkg}: ${minVersion}+`);
    });
  } else {
    verificationResults.securityVersions.status = 'passed';
    console.log('✓ All security-critical packages meet version requirements.');
  }
} catch (error) {
  verificationResults.securityVersions.status = 'failed';
  verificationResults.securityVersions.details.push(`❌ Error checking package versions: ${error.message}`);
  console.error('❌ Error checking package versions:', error.message);
  versionErrors = true;
}

// Verify database connection
console.log('\n✓ Checking database configuration...');
try {
  // Check if DATABASE_URL is set for AWS environment
  if (process.env.DATABASE_URL) {
    // Check if it looks like a valid Postgres URL
    if (process.env.DATABASE_URL.startsWith('postgresql://')) {
      verificationResults.database.status = 'passed';
      verificationResults.database.details.push('✓ DATABASE_URL is properly formatted');
      
      // Display AWS RDS connection reminder
      console.log('✓ DATABASE_URL is set. For AWS deployment, ensure:');
      console.log('  1. RDS security group allows connections from AWS Amplify IP range');
      console.log('  2. Use the full RDS endpoint in the DATABASE_URL');
      console.log('  3. Database user has proper permissions');
    } else {
      verificationResults.database.status = 'warning';
      verificationResults.database.details.push('⚠️ DATABASE_URL does not look like a valid PostgreSQL URL');
      console.log('⚠️ DATABASE_URL does not appear to be a valid PostgreSQL URL');
      console.log('   Format should be: postgresql://USER:PASSWORD@HOST:PORT/DATABASE');
    }
  } else {
    verificationResults.database.status = 'failed';
    verificationResults.database.details.push('❌ DATABASE_URL environment variable is not set');
    console.log('❌ DATABASE_URL environment variable is not set');
    console.log('   For AWS Amplify deployment, set DATABASE_URL in the environment variables section');
  }
} catch (error) {
  verificationResults.database.status = 'error';
  verificationResults.database.details.push(`❌ Error checking database: ${error.message}`);
  console.error('❌ Error checking database configuration:', error);
}

// Build the application
console.log('\n🔨 Building the application...');
try {
  // Run the build command
  execSync('npm run build', { stdio: 'inherit' });
  verificationResults.build.status = 'passed';
  verificationResults.build.details.push('✓ Build completed successfully');
} catch (error) {
  verificationResults.build.status = 'failed';
  verificationResults.build.details.push(`❌ Build failed: ${error.message}`);
  console.error('❌ Build failed:', error.message);
}

// Print summary
console.log('\n📋 Deployment Check Summary:');
console.log(`Environment Variables: ${verificationResults.environmentVariables.status.toUpperCase()}`);
console.log(`Security Versions: ${verificationResults.securityVersions.status.toUpperCase()}`);
console.log(`Database Configuration: ${verificationResults.database.status.toUpperCase()}`);
console.log(`Build: ${verificationResults.build.status.toUpperCase()}`);

// Exit with appropriate code
if (
  verificationResults.environmentVariables.status === 'failed' ||
  verificationResults.securityVersions.status === 'failed' ||
  verificationResults.build.status === 'failed'
) {
  console.log('\n❌ Deployment checks failed. Please fix the issues before deploying.');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed! Your application is ready for deployment.');

  // Add recommended next steps
  console.log('\n📝 Next steps:');
  console.log('1. Deploy the "out" directory to your production server');
  console.log('2. Ensure your production environment has all required environment variables set');
  console.log('3. Monitor your application for any runtime errors');
  console.log('4. Regularly check for security updates to Next.js and other dependencies');

  // Add AWS-specific deployment notes
  console.log('\n📝 AWS Amplify Deployment Notes:');
  console.log('1. In the AWS Amplify Console, navigate to Environment Variables');
  console.log('2. Ensure these variables are correctly set:');
  console.log('   - NEXTAUTH_SECRET: Your secure secret key');
  console.log('   - NEXTAUTH_URL: Your app\'s production URL (e.g., https://main.xxxxxxxxxxxx.amplifyapp.com)');
  console.log('   - DATABASE_URL: Your AWS RDS PostgreSQL connection string');
  console.log('3. For database connectivity, ensure:');
  console.log('   - RDS is in a VPC accessible to Amplify');
  console.log('   - Security groups allow traffic from Amplify IPs');
  console.log('   - Database user has sufficient permissions');

  process.exit(0);
} 

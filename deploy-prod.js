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

  process.exit(0);
} 

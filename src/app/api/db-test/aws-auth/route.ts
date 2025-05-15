import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("Testing AWS IAM auth connection...");

    // Collect diagnostic information
    const info = {
      env: {
        database_url_present: !!process.env.DATABASE_URL,
        database_url_format: 'unknown',
        aws_auth: false,
        nextauth_url_present: !!process.env.NEXTAUTH_URL,
        nextauth_secret_present: !!process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length > 10
      },
      aws: {
        region_set: !!process.env.AWS_REGION || !!process.env.AWS_DEFAULT_REGION,
        identity_available: 'unknown' as string | boolean,
        credentials_available: 'unknown' as string | boolean
      },
      connection_test: {
        status: 'not_attempted',
        error: null as string | null
      }
    };
    
    // Check DATABASE_URL format
    try {
      const dbUrl = process.env.DATABASE_URL || '';
      
      // Check for aws_auth parameter
      info.env.aws_auth = dbUrl.includes('aws_auth=true');
      
      // Log format without credentials
      const urlParts = dbUrl.split('@');
      if (urlParts.length > 1) {
        info.env.database_url_format = `${urlParts[0].split(':')[0]}://*****@${urlParts[1]}`;
      } else {
        info.env.database_url_format = "Invalid format - missing @ symbol";
      }
    } catch (err) {
      console.error("Error parsing DATABASE_URL:", err);
    }
    
    // Try loading AWS SDK to check for credentials
    try {
      // We don't actually import the SDK here, just simulate checking for it
      info.aws.credentials_available = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? 
        true : "Environment variables not set";
      
      // Check for implicit credentials via ECS/EC2 metadata
      info.aws.identity_available = process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI || 
                                    process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI ||
                                    process.env.AWS_EXECUTION_ENV?.startsWith('AWS_ECS') ||
                                    process.env.AWS_EXECUTION_ENV?.includes('Lambda') ? 
                                    true : "No metadata service detected";
    } catch (err) {
      console.error("Error checking AWS credentials:", err);
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "AWS IAM auth diagnostic completed",
      info
    });
    
  } catch (error) {
    console.error("AWS IAM auth test failed:", error);
    
    return NextResponse.json({
      success: false,
      message: 'AWS IAM auth test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
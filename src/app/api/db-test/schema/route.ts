import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  const prisma = new PrismaClient();
  
  try {
    console.log("Running schema diagnostics");
    
    // First check basic connectivity
    let connected = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      connected = true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Get list of tables in the database
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    // Check User table schema
    let userTableSchema = null;
    try {
      userTableSchema = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'User'
        ORDER BY ordinal_position;
      `;
    } catch (error) {
      console.error("Error fetching User table schema:", error);
    }
    
    // Check Profile table schema
    let profileTableSchema = null;
    try {
      profileTableSchema = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'Profile'
        ORDER BY ordinal_position;
      `;
    } catch (error) {
      console.error("Error fetching Profile table schema:", error);
    }
    
    // Get SQL definition for both tables if possible
    let userTableDefinition = null;
    try {
      const result = await prisma.$queryRaw`
        SELECT pg_get_tabledef('public."User"') AS definition;
      `;
      // Safe access with type checking
      if (Array.isArray(result) && result.length > 0 && result[0] && typeof result[0] === 'object') {
        userTableDefinition = (result[0] as { definition?: string })?.definition;
      }
    } catch (error) {
      console.error("Error getting User table definition:", error);
      try {
        // Alternative approach if pg_get_tabledef doesn't exist
        userTableDefinition = await prisma.$queryRaw`
          SELECT 
            'CREATE TABLE "' || relname || '" (' ||
            string_agg(
              column_name || ' ' || data_type || 
              CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
              CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
              ', '
            ) || ');' as definition
          FROM information_schema.columns
          JOIN pg_class ON pg_class.relname = table_name
          WHERE table_name = 'User'
          GROUP BY relname;
        `;
      } catch (innerError) {
        console.error("Alternative table definition query failed:", innerError);
      }
    }
    
    // Check table constraints
    let tableConstraints = null;
    try {
      tableConstraints = await prisma.$queryRaw`
        SELECT tc.constraint_name, tc.table_name, tc.constraint_type, 
               kcu.column_name, 
               ccu.table_name AS foreign_table_name,
               ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.table_name IN ('User', 'Profile');
      `;
    } catch (error) {
      console.error("Error fetching table constraints:", error);
    }
    
    // Check for missing migrations
    let migrationTable = false;
    try {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '_prisma_migrations'
        ) as exists;
      `;
      // Safe access with type checking
      if (Array.isArray(result) && result.length > 0 && result[0] && typeof result[0] === 'object') {
        migrationTable = Boolean((result[0] as { exists?: boolean })?.exists);
      }
    } catch (error) {
      console.error("Error checking for migrations table:", error);
    }
    
    // Close connection
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database schema retrieved',
      connected,
      tables,
      schemas: {
        User: userTableSchema,
        Profile: profileTableSchema
      },
      tableDefinitions: {
        User: userTableDefinition
      },
      constraints: tableConstraints,
      migrationTable: {
        exists: migrationTable
      }
    });
  } catch (error) {
    console.error("Schema diagnostic error:", error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Schema diagnostic failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
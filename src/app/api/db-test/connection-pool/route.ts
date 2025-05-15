import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  // Create a fresh client for this test
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn']
  });
  
  try {
    console.log("Running connection pool diagnostics");
    
    // Log DATABASE_URL format (without credentials)
    try {
      const dbUrl = process.env.DATABASE_URL || '';
      const urlParts = dbUrl.split('@');
      if (urlParts.length > 1) {
        console.log(`Database connection using: ${urlParts[0].split(':')[0]}://*****@${urlParts[1]}`);
      } else {
        console.log("Database URL format could not be logged safely");
      }
    } catch (err) {
      console.error("Error logging database URL format:", err);
    }
    
    const results = {
      stats: { success: false, data: null as any, error: null as string | null },
      connections: { success: false, data: null as any, error: null as string | null },
      sequential: { success: false, data: null as any, error: null as string | null },
      concurrent: { success: false, data: null as any, error: null as string | null },
    };
    
    // Test 1: Get database stats
    try {
      const dbStats = await prisma.$queryRaw`SELECT version(), current_timestamp, current_database()`;
      results.stats.data = dbStats;
      results.stats.success = true;
    } catch (error) {
      results.stats.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("Database stats check failed:", error);
    }

    // Test 2: Get active connections to database
    try {
      const connections = await prisma.$queryRaw`
        SELECT 
          count(*) as connection_count,
          state,
          max(EXTRACT(EPOCH FROM (current_timestamp - state_change))) as max_conn_age_seconds
        FROM 
          pg_stat_activity 
        GROUP BY 
          state 
        ORDER BY 
          count(*) DESC
      `;
      results.connections.data = connections;
      results.connections.success = true;
    } catch (error) {
      results.connections.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("Connections check failed:", error);
    }
    
    // Test 3: Sequential queries 
    try {
      console.log("Running sequential queries...");
      const start = Date.now();
      
      const queryResults = [];
      for (let i = 0; i < 5; i++) {
        const result = await prisma.$queryRaw`SELECT ${i} as iteration, pg_backend_pid() as backend_pid`;
        queryResults.push(result);
      }
      
      const end = Date.now();
      results.sequential.data = {
        time_ms: end - start,
        queries: queryResults
      };
      results.sequential.success = true;
    } catch (error) {
      results.sequential.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("Sequential queries failed:", error);
    }
    
    // Test 4: Concurrent queries (simulating multiple users)
    try {
      console.log("Running concurrent queries...");
      const start = Date.now();
      
      // Run 5 queries in parallel
      const promises = Array.from({ length: 5 }, (_, i) => {
        return prisma.$queryRaw`
          SELECT 
            ${i} as iteration, 
            pg_backend_pid() as backend_pid, 
            (SELECT count(*) FROM pg_stat_activity) as active_connections
        `;
      });
      
      const concurrentResults = await Promise.all(promises);
      
      const end = Date.now();
      results.concurrent.data = {
        time_ms: end - start,
        queries: concurrentResults
      };
      results.concurrent.success = true;
    } catch (error) {
      results.concurrent.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("Concurrent queries failed:", error);
    }
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      results,
      recommendations: [
        "Check the 'connections' data to see how many active connections your database has",
        "If 'concurrent' tests failed but 'sequential' succeeded, your database might have connection pool limits",
        "Default RDS connection limit depends on instance size - check if you're hitting it",
        "Consider using Prisma connection pooling with lower max connections"
      ]
    });
    
  } catch (error) {
    console.error("Connection pool diagnostics failed:", error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
    
    return NextResponse.json({
      success: false,
      message: 'Connection pool diagnostics failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
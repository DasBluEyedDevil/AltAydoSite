/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['s.gravatar.com'],
    unoptimized: true,
  },
  // Ensure environment variables are properly processed
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:IHateGeico1!@db.ohhnbxsbxzxyjgynxevi.supabase.co:5432/postgres",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ohhnbxsbxzxyjgynxevi.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaG5ieHNieHp4eWpneW54ZXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MTE2NTIsImV4cCI6MjA2Mjk4NzY1Mn0.HUFfJIjw_Vwv8qdGaZRVw6kZvdI2PZX7HDe3pSCyuW8",
  },
  // Use export output to create static files
  output: 'export',
  // Disable API routes during static export
  exportPathMap: async function (defaultPathMap) {
    // Filter out API routes
    const filteredPaths = {};
    for (const [path, page] of Object.entries(defaultPathMap)) {
      if (!path.startsWith('/api/')) {
        filteredPaths[path] = page;
      }
    }
    return filteredPaths;
  },
  // Skip adding trailingSlash
  trailingSlash: false,
  // Disable image optimization during static export
  experimental: {
    // Skip specific paths in static export
    staticRoutes: {
      '/api': { fallback: true }
    }
  }
}

module.exports = nextConfig 

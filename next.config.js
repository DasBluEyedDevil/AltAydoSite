/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    poweredByHeader: false,
    outputFileTracingIncludes: {
        '/**': ['./public/**/*', './public/images/**/*']
    },
    // This ensures public directory is properly copied to the
    // standalone output directory (.next/standalone/public)
    outputFileTracingRoot: process.cwd(),
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
        dangerouslyAllowSVG: true,
        remotePatterns: [],
    }
};

module.exports = nextConfig;
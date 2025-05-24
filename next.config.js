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
    // Explicitly include public directory in the build
    distDir: '.next',
    assetPrefix: undefined,
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
    },
    // Ensure all static assets are properly included
    experimental: {
        outputFileTracingExcludes: {
            '*': [
                'node_modules/@swc/core-linux-x64-gnu',
                'node_modules/@swc/core-linux-x64-musl',
                'node_modules/@esbuild/linux-x64',
            ],
        },
    },
};

module.exports = nextConfig;

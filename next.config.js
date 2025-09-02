const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    // Force Next to treat this folder as the root (avoid walking up to parent lockfiles)
    outputFileTracingRoot: __dirname,
    // Ensure problematic ESM packages are transpiled (fixes framer-motion createMotionComponent error in Next 15)
    transpilePackages: ['framer-motion'],
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: true,
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: true,
        dangerouslyAllowSVG: true,
        remotePatterns: [],
    },
    output: 'standalone',
    webpack: (config, { isServer }) => {
        // Handle discord.js and its dependencies
        if (isServer) {
            config.externals.push({
                'utf-8-validate': 'commonjs utf-8-validate',
                'bufferutil': 'commonjs bufferutil',
                'zlib-sync': 'commonjs zlib-sync'
            });
        } else {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                'zlib-sync': false,
                'utf-8-validate': false,
                'bufferutil': false
            };
        }
        return config;
    },
    async redirects() {
        return [
            {
                source: '/dashboard/operations/traderoutes',
                destination: '/dashboard/operations',
                permanent: true,
            },
        ];
    },
    async headers() {
        return [
            {
                source: '/:all*',
                headers: [
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/images/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/assets/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/fonts/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
        ];
    },
};

module.exports = nextConfig;

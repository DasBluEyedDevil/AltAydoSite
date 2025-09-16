/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    typescript: {
        // TypeScript errors will now prevent production builds
        ignoreBuildErrors: false,
    },
    eslint: {
        // ESLint errors will now prevent production builds
        ignoreDuringBuilds: false,
    },
    images: {
        unoptimized: true,
        dangerouslyAllowSVG: true,
        remotePatterns: [],
    },
    output: 'standalone',
    webpack: (config, { isServer }) => {
        // Handle discord.js and its dependencies safely
        if (isServer) {
            // Ensure externals is an array before pushing
            if (!Array.isArray(config.externals)) {
                config.externals = config.externals ? [config.externals] : [];
            }
            config.externals.push({
                'utf-8-validate': 'commonjs utf-8-validate',
                'bufferutil': 'commonjs bufferutil',
                'zlib-sync': 'commonjs zlib-sync'
            });
        } else {
            // Ensure resolve and resolve.fallback exist before spreading
            config.resolve = config.resolve || {};
            const existingFallback = (config.resolve.fallback) || {};
            config.resolve.fallback = {
                ...existingFallback,
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

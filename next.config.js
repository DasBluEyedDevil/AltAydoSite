/** @type {import('next').NextConfig} */
const assetBase = (process.env.ASSET_BASE_URL || 'https://aydocorp.space/aydo-images').replace(/\/$/, '');

const nextConfig = {
    poweredByHeader: false,
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
        remotePatterns: [
            { protocol: 'https', hostname: 'aydocorp.space' },
            { protocol: 'https', hostname: 'images.aydocorp.space' },
            {
                protocol: 'https',
                hostname: '86104e02025c4d8a71e0cfe0c4349f1c.r2.cloudflarestorage.com',
                pathname: '/aydo-images/**',
            },
        ],
    },
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/images/:path*',
                destination: `${assetBase}/:path*`,
            },
        ];
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

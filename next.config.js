/** @type {import('next').NextConfig} */
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
        remotePatterns: [],
    },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
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
};

module.exports = nextConfig;

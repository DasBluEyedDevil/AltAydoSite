/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    poweredByHeader: false,
    outputFileTracingIncludes: {
        '/**': ['./public/**/*', './public/images/**/*']
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
        dangerouslyAllowSVG: true,
        domains: [],
        formats: ['image/avif', 'image/webp'],
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    }
};

module.exports = nextConfig;
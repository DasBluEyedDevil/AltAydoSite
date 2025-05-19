/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    poweredByHeader: false,
    experimental: {
        outputFileTracingRoot: process.env.NODE_ENV === "production" ? undefined : __dirname,
    },
    outputFileTracingIncludes: {
        '/**': ['./public/**/*']
    }
};

module.exports = nextConfig;
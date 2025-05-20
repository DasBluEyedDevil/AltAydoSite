/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    poweredByHeader: false,
    outputFileTracingIncludes: {
        '/**': ['./public/**/*']
    }
};

module.exports = nextConfig;
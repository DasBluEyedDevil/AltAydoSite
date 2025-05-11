/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['s.gravatar.com', 'cdn.auth0.com'],
    unoptimized: true,
  },
}

module.exports = nextConfig 
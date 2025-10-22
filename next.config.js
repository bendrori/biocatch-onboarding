/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for @cloudflare/next-on-pages
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;


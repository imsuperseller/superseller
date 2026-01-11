/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || 'http://172.245.56.50:5678/webhook/lead-enrichment',
  },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects () {
    return [
      {
        source: '/jobs',
        destination: '/',
        permanent: false
      },
      {
        source: '/dashboard',
        destination: '/dashboard/stats',
        permanent: false
      }
    ]
  },
  images: {
    domains: ['res.cloudinary.com'],
  }
}

module.exports = nextConfig

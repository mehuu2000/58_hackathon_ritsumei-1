/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://bomu.info:8000/:path*',
      },
    ]
  },
}

module.exports = nextConfig
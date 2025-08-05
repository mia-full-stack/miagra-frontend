/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true
  },
  // Обновленная опция вместо experimental.serverComponentsExternalPackages
  serverExternalPackages: ['axios', 'socket.io-client'],
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // Added from updates
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Настройки для WebSocket (socket.io)
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    })
    return config
  },
  eslint: {
    ignoreDuringBuilds: true, // Added from updates
  },
  typescript: {
    ignoreBuildErrors: true, // Added from updates
  },
}

export default nextConfig

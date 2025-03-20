/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', 'tls', etc on the client side
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        perf_hooks: false,
        child_process: false,
        dns: false,
        path: false,
      }
    }
    return config
  },
  transpilePackages: ['postgres']
}

export default nextConfig 
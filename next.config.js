/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placehold.co', 'res.cloudinary.com'],
  },
  // Add webpack configuration to handle Node.js modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve these modules on the client to avoid errors
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        buffer: false,
        http: false,
        https: false,
        zlib: false,
        querystring: false,
        perf_hooks: false,
      };
    }
    return config;
  },
  // Disable TypeScript and ESLint checks during production build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
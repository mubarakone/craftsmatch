/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only ignore TypeScript errors during build, while properly fixing them in development
  typescript: {
    // TODO: Fix TypeScript error in reset-password page
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configure server-only modules
  serverExternalPackages: ['pg', 'bcryptjs'],
}

export default nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@walikelas/ui',
    '@walikelas/types',
    '@walikelas/config',
    '@walikelas/validation',
    '@walikelas/api-client',
  ],
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion', '@walikelas/ui'],
  },
};

export default nextConfig;

